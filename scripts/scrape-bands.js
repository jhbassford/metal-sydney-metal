#!/usr/bin/env node
/**
 * scripts/scrape-bands.js
 *
 * Scrapes band data from metalsydneymetal.com/bands (Wix), downloads band images,
 * and writes the results to data/bands.json with local image paths.
 *
 * Usage:
 *   npm run scrape:bands
 */

'use strict'

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const { URL } = require('url')

// ─── Config ──────────────────────────────────────────────────────────────────

const TARGET_URL = 'https://www.metalsydneymetal.com/bands'
const BANDS_JSON = path.resolve(__dirname, '../data/bands.json')
const IMAGES_DIR = path.resolve(__dirname, '../public/images/bands')

/** Wix repeater card selector */
const CARD_SELECTOR = 'div.wixui-repeater__item'

/** Load More button selector (Wix) */
const LOAD_MORE_SELECTOR = 'button.uDW_Qe'

/** ms to wait after each Load More click */
const LOAD_MORE_WAIT_MS = 3000

/** ms to wait for initial card render */
const INITIAL_LOAD_TIMEOUT_MS = 30000

/** Max consecutive failed Load More attempts before giving up */
const MAX_LOAD_MORE_RETRIES = 3

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
    const ext = path.extname(pathname).split('~')[0].toLowerCase() // strip Wix ~mv2 suffix
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg'
  } catch {
    return '.jpg'
  }
}

/** Scroll the full page to trigger Wix lazy-load on all images. */
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
  // Give Wix time to swap in full-res image src values
  await new Promise((r) => setTimeout(r, 2000))
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })

  console.log('🤘 Metal Sydney Metal — Band Scraper (Wix)')
  console.log(`   Target : ${TARGET_URL}`)
  console.log(`   JSON   : ${BANDS_JSON}`)
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
    console.log('🌐 Navigating to bands page…')
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 })

    // ── 2. Wait for cards ────────────────────────────────────────────────────
    console.log('⏳ Waiting for band grid…')
    try {
      await page.waitForSelector(CARD_SELECTOR, { timeout: INITIAL_LOAD_TIMEOUT_MS })
    } catch {
      console.error('✗ Could not find band cards (selector: ' + CARD_SELECTOR + ')')
      await browser.close()
      process.exit(1)
    }

    // ── 3. Click Load More until exhausted ───────────────────────────────────
    let previousCount = 0
    let retries = 0
    let clickCount = 0

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentCount = await page.$$eval(CARD_SELECTOR, (els) => els.length)
      if (clickCount === 0) console.log(`📋 Initial load: ${currentCount} band cards`)

      const loadMoreEl = await page.$(LOAD_MORE_SELECTOR)

      if (!loadMoreEl) {
        console.log('✓ No Load More button — all bands loaded.')
        break
      }

      await loadMoreEl.scrollIntoView()
      await loadMoreEl.click()
      clickCount++
      console.log(`  ↻ Clicked Load More (#${clickCount}), waiting…`)
      await new Promise((r) => setTimeout(r, LOAD_MORE_WAIT_MS))

      const newCount = await page.$$eval(CARD_SELECTOR, (els) => els.length)
      if (newCount > previousCount) {
        console.log(`  + ${newCount - previousCount} new cards (total: ${newCount})`)
        retries = 0
      } else {
        retries++
        console.log(`  ⚠ No new cards (attempt ${retries}/${MAX_LOAD_MORE_RETRIES})`)
        if (retries >= MAX_LOAD_MORE_RETRIES) {
          console.log('  Giving up on Load More.')
          break
        }
      }
      previousCount = newCount
    }

    // ── 4. Scroll to trigger lazy-loaded images ───────────────────────────────
    console.log()
    console.log('📜 Scrolling to trigger lazy-load on images…')
    await scrollToBottom(page)

    // ── 5. Extract band data ─────────────────────────────────────────────────
    console.log('🔍 Extracting band data…')

    const rawBands = await page.evaluate((cardSel) => {
      const cards = [...document.querySelectorAll(cardSel)]

      return cards.map((card) => {
        // Wix repeats each text value across multiple span elements — deduplicate.
        // Also filter out known Wix UI strings (e.g. filter widget text).
        const UI_STRINGS = new Set(['reset filter', 'filter by genre', 'filter by location', 'load more', 'show more'])
        const seen = new Set()
        const uniqueTexts = [...card.querySelectorAll('.wixui-rich-text__text')]
          .map((el) => el.textContent?.trim())
          .filter((t) => {
            if (!t) return false
            if (UI_STRINGS.has(t.toLowerCase())) return false
            if (seen.has(t)) return false
            seen.add(t)
            return true
          })

        const name = uniqueTexts[0] ?? ''
        // Genre sometimes includes location separated by "/" or "|"
        const genreRaw = uniqueTexts[1] ?? ''
        const genre = genreRaw
        const location = uniqueTexts[2] ?? 'Sydney'

        // Image — lives inside div.BI8PVQ; prefer data-src (lazy) then src
        const imgEl = card.querySelector('div.BI8PVQ img') ?? card.querySelector('img')
        const imageUrl =
          imgEl?.getAttribute('data-src') ||
          imgEl?.src ||
          null

        // Social links — match by href content
        const links = [...card.querySelectorAll('a[href]')]
        const fbEl = links.find((a) => a.href.includes('facebook.com'))
        const bcEl = links.find((a) => a.href.includes('bandcamp.com'))

        const facebookUrl = fbEl?.href && !fbEl.href.endsWith('#') ? fbEl.href : null
        const bandcampUrl = bcEl?.href && !bcEl.href.endsWith('#') ? bcEl.href : null

        return { name, genre, location, imageUrl, facebookUrl, bandcampUrl }
      })
    }, CARD_SELECTOR)

    const validBands = rawBands.filter((b) => b.name.length > 0)
    console.log(`✓ Extracted ${validBands.length} bands`)

    // ── 6. Download images ───────────────────────────────────────────────────
    console.log()
    console.log('🖼  Downloading band images…')

    const bands = []

    for (let i = 0; i < validBands.length; i++) {
      const band = validBands[i]
      const slug = slugify(band.name) || `band-${i}`
      let localImagePath = null

      if (band.imageUrl) {
        const ext = extFromUrl(band.imageUrl)
        const filename = `${slug}${ext}`
        const destPath = path.join(IMAGES_DIR, filename)

        process.stdout.write(`  [${String(i + 1).padStart(3)}/${validBands.length}] ${band.name} … `)

        if (fs.existsSync(destPath)) {
          console.log('(cached)')
          localImagePath = `/images/bands/${filename}`
        } else {
          const ok = await downloadFile(band.imageUrl, destPath)
          if (ok) {
            console.log('✓')
            localImagePath = `/images/bands/${filename}`
          } else {
            console.log('✗ (no image)')
            localImagePath = null
          }
        }
      }

      bands.push({
        id: slug || `band-${i}`,
        name: band.name,
        genre: band.genre || '',
        location: band.location || 'Sydney',
        image: localImagePath,
        facebook: band.facebookUrl,
        bandcamp: band.bandcampUrl,
      })
    }

    // ── 7. Write JSON ────────────────────────────────────────────────────────
    console.log()
    console.log(`💾 Writing ${bands.length} bands to ${BANDS_JSON}`)
    fs.writeFileSync(BANDS_JSON, JSON.stringify(bands, null, 2) + '\n', 'utf8')

    console.log()
    console.log('🤘 Done!')
    console.log(`   Bands  : ${bands.length}`)
    console.log(`   JSON   : ${BANDS_JSON}`)
    console.log(`   Images : ${IMAGES_DIR}`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
