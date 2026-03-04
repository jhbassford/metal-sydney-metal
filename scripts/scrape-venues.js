#!/usr/bin/env node
/**
 * scripts/scrape-venues.js
 *
 * Scrapes venue data from metalsydneymetal.com/venues (Wix), downloads venue images,
 * and writes the results to data/venues.json with local image paths.
 *
 * Usage:
 *   npm run scrape:venues
 */

'use strict'

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const { URL } = require('url')

// ─── Config ──────────────────────────────────────────────────────────────────

const TARGET_URL = 'https://www.metalsydneymetal.com/venues'
const VENUES_JSON = path.resolve(__dirname, '../data/venues.json')
const IMAGES_DIR = path.resolve(__dirname, '../public/images/venues')

/** Wix repeater card selector */
const CARD_SELECTOR = 'div.wixui-repeater__item'

/** px to scroll per step when triggering lazy-load */
const SCROLL_STEP = 600

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const parsed = new URL(url)
    const transport = parsed.protocol === 'https:' ? https : http

    const req = transport.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const location = res.headers.location
        if (location) { resolve(downloadFile(location, destPath)); return }
      }
      if (res.statusCode !== 200) {
        console.warn(`  ⚠ Download failed (HTTP ${res.statusCode}): ${url}`)
        resolve(false)
        return
      }
      const file = fs.createWriteStream(destPath)
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve(true) })
      file.on('error', (err) => {
        fs.unlink(destPath, () => {})
        console.warn(`  ⚠ Write error: ${err.message}`)
        resolve(false)
      })
    })
    req.on('error', (err) => { console.warn(`  ⚠ Request error: ${err.message}`); resolve(false) })
    req.on('timeout', () => { req.destroy(); console.warn(`  ⚠ Timeout: ${url}`); resolve(false) })
  })
}

function extFromUrl(url) {
  try {
    const pathname = new URL(url).pathname
    const ext = path.extname(pathname).split('~')[0].toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg'
  } catch {
    return '.jpg'
  }
}

async function scrollToBottom(page) {
  await page.evaluate(async (step) => {
    await new Promise((resolve) => {
      let y = 0
      const timer = setInterval(() => {
        window.scrollBy(0, step)
        y += step
        if (y >= document.body.scrollHeight) {
          clearInterval(timer)
          window.scrollTo(0, 0)
          resolve()
        }
      }, 120)
    })
  }, SCROLL_STEP)
  await new Promise((r) => setTimeout(r, 2000))
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })

  console.log('🤘 Metal Sydney Metal — Venue Scraper (Wix)')
  console.log(`   Target : ${TARGET_URL}`)
  console.log(`   JSON   : ${VENUES_JSON}`)
  console.log(`   Images : ${IMAGES_DIR}`)
  console.log()

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  page.on('console', () => {})
  page.on('pageerror', () => {})

  try {
    // ── 1. Navigate ──────────────────────────────────────────────────────────
    console.log('🌐 Navigating to venues page…')
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 })

    // ── 2. Wait for cards ────────────────────────────────────────────────────
    console.log('⏳ Waiting for venue cards…')
    try {
      await page.waitForSelector(CARD_SELECTOR, { timeout: 30000 })
    } catch {
      console.error('✗ Could not find venue cards (selector: ' + CARD_SELECTOR + ')')
      await browser.close()
      process.exit(1)
    }

    const count = await page.$$eval(CARD_SELECTOR, (els) => els.length)
    console.log(`📋 Found ${count} venue cards`)

    // ── 3. Scroll to trigger lazy-loaded images ───────────────────────────────
    console.log('📜 Scrolling to trigger lazy-load on images…')
    await scrollToBottom(page)

    // ── 4. Extract venue data ────────────────────────────────────────────────
    console.log('🔍 Extracting venue data…')

    const rawVenues = await page.evaluate((cardSel) => {
      const cards = [...document.querySelectorAll(cardSel)]

      return cards.map((card) => {
        // Name — Wix renders venue names as h4.font_4
        const nameEl = card.querySelector('h4') ?? card.querySelector('h3') ?? card.querySelector('h2')
        const name = nameEl?.textContent?.trim() ?? ''

        // Description — paragraphs inside wixui-rich-text, excluding empty ones
        const descEls = [...card.querySelectorAll('.wixui-rich-text p')]
        const description = descEls
          .map((p) => p.textContent?.trim())
          .filter(Boolean)
          .join(' ')

        // Image — img.lDHlrQ or any img inside the card
        const imgEl = card.querySelector('img.lDHlrQ') ?? card.querySelector('img[src]')
        const imageUrl =
          imgEl?.getAttribute('data-src') ||
          imgEl?.src ||
          null

        // Links — find Facebook and website
        const links = [...card.querySelectorAll('a[href]')]
          .filter((a) => a.href && !a.href.endsWith('#') && !a.href.includes('javascript'))

        const fbEl = links.find((a) => a.href.includes('facebook.com'))
        const facebookUrl = fbEl?.href ?? null

        // Website — any non-Facebook, non-Wix external link
        const websiteEl = links.find((a) =>
          !a.href.includes('facebook.com') &&
          !a.href.includes('wix.com') &&
          !a.href.includes('metalsydneymetal.com') &&
          (a.href.startsWith('http://') || a.href.startsWith('https://'))
        )
        const website = websiteEl?.href ?? null

        // Address — look for address-like text in rich text elements
        const allText = [...card.querySelectorAll('.wixui-rich-text__text')]
          .map((el) => el.textContent?.trim())
          .filter(Boolean)

        // Heuristic: address usually contains "NSW" or a street pattern
        const address = allText.find((t) =>
          t.includes('NSW') || t.includes('Rd') || t.includes('St') || t.includes('Ave')
        ) ?? ''

        return { name, description, imageUrl, facebookUrl, website, address }
      })
    }, CARD_SELECTOR)

    const validVenues = rawVenues.filter((v) => v.name.length > 0)
    console.log(`✓ Extracted ${validVenues.length} venues`)

    // ── 5. Download images ───────────────────────────────────────────────────
    console.log()
    console.log('🖼  Downloading venue images…')

    const venues = []

    for (let i = 0; i < validVenues.length; i++) {
      const venue = validVenues[i]
      const slug = slugify(venue.name) || `venue-${i}`
      let localImagePath = null

      if (venue.imageUrl) {
        const ext = extFromUrl(venue.imageUrl)
        const filename = `${slug}${ext}`
        const destPath = path.join(IMAGES_DIR, filename)

        process.stdout.write(`  [${String(i + 1).padStart(2)}/${validVenues.length}] ${venue.name} … `)

        if (fs.existsSync(destPath)) {
          console.log('(cached)')
          localImagePath = `/images/venues/${filename}`
        } else {
          const ok = await downloadFile(venue.imageUrl, destPath)
          if (ok) {
            console.log('✓')
            localImagePath = `/images/venues/${filename}`
          } else {
            console.log('✗ (no image)')
            localImagePath = null
          }
        }
      } else {
        process.stdout.write(`  [${String(i + 1).padStart(2)}/${validVenues.length}] ${venue.name} … `)
        console.log('(no image URL)')
      }

      venues.push({
        id: slug || `venue-${i}`,
        name: venue.name,
        address: venue.address || '',
        description: venue.description || '',
        image: localImagePath,
        bookingEmail: null,
        website: venue.website,
      })
    }

    // ── 6. Write JSON ────────────────────────────────────────────────────────
    console.log()
    console.log(`💾 Writing ${venues.length} venues to ${VENUES_JSON}`)
    fs.writeFileSync(VENUES_JSON, JSON.stringify(venues, null, 2) + '\n', 'utf8')

    console.log()
    console.log('🤘 Done!')
    console.log(`   Venues : ${venues.length}`)
    console.log(`   JSON   : ${VENUES_JSON}`)
    console.log(`   Images : ${IMAGES_DIR}`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
