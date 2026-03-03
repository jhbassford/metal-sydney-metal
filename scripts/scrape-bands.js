#!/usr/bin/env node
/**
 * scripts/scrape-bands.js
 *
 * Scrapes band data from metalsydneymetal.com/bands, downloads band images,
 * and writes the results to data/bands.json with local image paths.
 *
 * Usage:
 *   npm run scrape:bands
 *
 * Requires puppeteer:
 *   npm install --save-dev puppeteer
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

/** Milliseconds to wait after each "Load More" click before checking for new cards */
const LOAD_MORE_WAIT_MS = 2500

/** Milliseconds to wait for the initial band grid to appear */
const INITIAL_LOAD_TIMEOUT_MS = 20000

/** Maximum consecutive failed "Load More" attempts before giving up */
const MAX_LOAD_MORE_RETRIES = 3

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert a band name to a URL-safe filename slug.
 * e.g. "12 Gauge Rampage" → "12-gauge-rampage"
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')          // remove apostrophes
    .replace(/[^a-z0-9]+/g, '-')  // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '')       // trim leading/trailing hyphens
}

/**
 * Download a file from `url` and save it to `destPath`.
 * Returns a Promise that resolves to true on success, false on failure.
 */
function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const parsed = new URL(url)
    const transport = parsed.protocol === 'https:' ? https : http

    const req = transport.get(url, { timeout: 15000 }, (res) => {
      // Follow one level of redirect
      if (res.statusCode === 301 || res.statusCode === 302) {
        const location = res.headers.location
        if (location) {
          resolve(downloadFile(location, destPath))
          return
        }
      }

      if (res.statusCode !== 200) {
        console.warn(`  ⚠ Download failed (HTTP ${res.statusCode}): ${url}`)
        resolve(false)
        return
      }

      const file = fs.createWriteStream(destPath)
      res.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve(true)
      })
      file.on('error', (err) => {
        fs.unlink(destPath, () => {})
        console.warn(`  ⚠ Write error for ${destPath}: ${err.message}`)
        resolve(false)
      })
    })

    req.on('error', (err) => {
      console.warn(`  ⚠ Request error for ${url}: ${err.message}`)
      resolve(false)
    })

    req.on('timeout', () => {
      req.destroy()
      console.warn(`  ⚠ Request timed out: ${url}`)
      resolve(false)
    })
  })
}

/**
 * Derive a local file extension from a URL or default to .jpg.
 */
function extFromUrl(url) {
  try {
    const pathname = new URL(url).pathname
    const ext = path.extname(pathname).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg'
  } catch {
    return '.jpg'
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Ensure output directories exist
  fs.mkdirSync(IMAGES_DIR, { recursive: true })

  console.log('🤘 Metal Sydney Metal — Band Scraper')
  console.log(`   Target : ${TARGET_URL}`)
  console.log(`   JSON   : ${BANDS_JSON}`)
  console.log(`   Images : ${IMAGES_DIR}`)
  console.log()

  // ── 1. Launch browser ───────────────────────────────────────────────────────
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  })

  const page = await browser.newPage()

  // Reasonable desktop viewport
  await page.setViewport({ width: 1280, height: 900 })

  // Suppress noisy console output from the target page
  page.on('console', () => {})
  page.on('pageerror', () => {})

  try {
    // ── 2. Navigate ─────────────────────────────────────────────────────────
    console.log('🌐 Navigating to bands page…')
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 })

    // ── 3. Wait for band grid ───────────────────────────────────────────────
    // Try several common selectors used by Squarespace / typical band-directory layouts.
    // Adjust these if the live site uses different class names.
    const CARD_SELECTOR = [
      // Squarespace summary block items
      '.summary-item',
      // Generic fallbacks
      '[class*="band-card"]',
      '[class*="bandCard"]',
      '[class*="band-item"]',
      // Squarespace grid
      '.sqs-block-summary-v2 .summary-item',
      // Any article/li that looks like a card
      'article',
    ].join(', ')

    console.log('⏳ Waiting for band grid…')
    try {
      await page.waitForSelector(CARD_SELECTOR, {
        timeout: INITIAL_LOAD_TIMEOUT_MS,
      })
    } catch {
      console.error(
        '✗ Could not find band cards. The page structure may have changed.\n' +
          '  Try inspecting the page and updating CARD_SELECTOR in this script.'
      )
      await browser.close()
      process.exit(1)
    }

    // ── 4. Repeatedly click "Load More" ─────────────────────────────────────
    const LOAD_MORE_SELECTOR = [
      // Squarespace summary-v2 load-more
      '.summary-load-more',
      '.sqs-load-more',
      // Generic text-based match (handled in JS below)
    ].join(', ')

    let previousCount = 0
    let retries = 0
    let clickCount = 0

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentCount = await page.$$eval(
        CARD_SELECTOR,
        (els) => els.length
      )

      if (clickCount === 0) {
        console.log(`📋 Initial load: ${currentCount} band cards found`)
      }

      // Look for a "Load More" button — check both CSS and text content
      const loadMoreHandle = await page.evaluateHandle((cssSelector) => {
        // First try CSS selector
        const byCss = document.querySelector(cssSelector)
        if (byCss && byCss.offsetParent !== null) return byCss

        // Fall back to any visible button/a whose text contains "load more" / "show more"
        const candidates = [
          ...document.querySelectorAll('button, a, [role="button"]'),
        ]
        return (
          candidates.find((el) => {
            const text = el.textContent?.trim().toLowerCase() ?? ''
            const visible = el.offsetParent !== null
            return (
              visible &&
              (text.includes('load more') ||
                text.includes('show more') ||
                text.includes('view more'))
            )
          }) ?? null
        )
      }, LOAD_MORE_SELECTOR)

      const loadMoreEl = loadMoreHandle.asElement()

      if (!loadMoreEl) {
        console.log('✓ No "Load More" button found — all bands loaded.')
        break
      }

      // Scroll the button into view and click
      await loadMoreEl.scrollIntoView()
      await loadMoreEl.click()
      clickCount++

      console.log(`  ↻ Clicked "Load More" (#${clickCount}), waiting for new cards…`)

      // Wait for new cards to appear (or timeout)
      await new Promise((r) => setTimeout(r, LOAD_MORE_WAIT_MS))

      const newCount = await page.$$eval(CARD_SELECTOR, (els) => els.length)

      if (newCount > previousCount) {
        console.log(`  + ${newCount - previousCount} new cards (total: ${newCount})`)
        retries = 0
      } else {
        retries++
        console.log(
          `  ⚠ No new cards appeared (attempt ${retries}/${MAX_LOAD_MORE_RETRIES})`
        )
        if (retries >= MAX_LOAD_MORE_RETRIES) {
          console.log('  Giving up on Load More — max retries reached.')
          break
        }
      }

      previousCount = newCount
    }

    // ── 5. Extract band data ─────────────────────────────────────────────────
    console.log()
    console.log('🔍 Extracting band data…')

    const rawBands = await page.evaluate((cardSel) => {
      const cards = [...document.querySelectorAll(cardSel)]
      return cards.map((card) => {
        // ── Name ──────────────────────────────────────────────────────
        const nameEl =
          card.querySelector('h1, h2, h3, h4') ||
          card.querySelector('[class*="title"]') ||
          card.querySelector('[class*="name"]')
        const name = nameEl?.textContent?.trim() ?? ''

        // ── Genre + Location ──────────────────────────────────────────
        // Typically the first sub-text element after the title
        const subEls = [
          ...card.querySelectorAll('p, [class*="excerpt"], [class*="meta"], [class*="subtitle"], [class*="description"]'),
        ]

        // Try to find genre and location from paragraph content.
        // Squarespace often puts it as the card excerpt.
        let genre = ''
        let location = ''

        for (const el of subEls) {
          const text = el.textContent?.trim() ?? ''
          if (!text) continue

          // "Genre | Location" or "Genre — Location" or separate lines
          const separators = /\s*[|•·—–\n\/]\s*/
          const parts = text.split(separators).map((p) => p.trim()).filter(Boolean)

          if (parts.length >= 2) {
            genre = parts[0]
            location = parts[1]
            break
          } else if (parts.length === 1 && !genre) {
            genre = parts[0]
          }
        }

        // ── Image ──────────────────────────────────────────────────────
        const imgEl =
          card.querySelector('img') ||
          card.querySelector('[data-src]')
        const imageUrl =
          imgEl?.getAttribute('data-src') ||
          imgEl?.getAttribute('src') ||
          imgEl?.currentSrc ||
          null

        // ── Facebook ───────────────────────────────────────────────────
        const fbEl = [...card.querySelectorAll('a')].find((a) => {
          const href = a.href ?? ''
          const text = a.textContent?.trim().toLowerCase() ?? ''
          return href.includes('facebook.com') || text === 'facebook'
        })
        // Treat "#" or missing href as inactive
        const facebookUrl =
          fbEl && fbEl.href && !fbEl.href.endsWith('#') && !fbEl.href.includes('javascript')
            ? fbEl.href
            : null

        // ── Bandcamp ───────────────────────────────────────────────────
        const bcEl = [...card.querySelectorAll('a')].find((a) => {
          const href = a.href ?? ''
          const text = a.textContent?.trim().toLowerCase() ?? ''
          return href.includes('bandcamp.com') || text === 'bandcamp'
        })
        const bandcampUrl =
          bcEl && bcEl.href && !bcEl.href.endsWith('#') && !bcEl.href.includes('javascript')
            ? bcEl.href
            : null

        return { name, genre, location, facebookUrl, bandcampUrl, imageUrl }
      })
    }, CARD_SELECTOR)

    // Filter out empty/unnamed entries
    const validBands = rawBands.filter((b) => b.name.length > 0)
    console.log(`✓ Extracted ${validBands.length} bands`)

    // ── 6. Download images ──────────────────────────────────────────────────
    console.log()
    console.log('🖼  Downloading band images…')

    const bandsWithLocalImages = []

    for (let i = 0; i < validBands.length; i++) {
      const band = validBands[i]
      const slug = slugify(band.name) || `band-${i}`

      let localImagePath = null

      if (band.imageUrl) {
        const ext = extFromUrl(band.imageUrl)
        const filename = `${slug}${ext}`
        const destPath = path.join(IMAGES_DIR, filename)

        process.stdout.write(
          `  [${String(i + 1).padStart(3)}/${validBands.length}] ${band.name} … `
        )

        // Skip download if file already exists (re-run friendly)
        if (fs.existsSync(destPath)) {
          console.log('(cached)')
          localImagePath = `/images/bands/${filename}`
        } else {
          const ok = await downloadFile(band.imageUrl, destPath)
          if (ok) {
            console.log('✓')
            localImagePath = `/images/bands/${filename}`
          } else {
            console.log('✗ (kept original URL)')
            localImagePath = band.imageUrl // fall back to remote URL
          }
        }
      } else {
        localImagePath = null
      }

      bandsWithLocalImages.push({
        id: slugify(band.name) || `band-${i}`,
        name: band.name,
        genre: band.genre || '',
        location: band.location || '',
        image: localImagePath,
        facebook: band.facebookUrl,
        bandcamp: band.bandcampUrl,
      })
    }

    // ── 7. Write JSON ───────────────────────────────────────────────────────
    console.log()
    console.log(`💾 Writing ${bandsWithLocalImages.length} bands to ${BANDS_JSON}`)
    fs.writeFileSync(
      BANDS_JSON,
      JSON.stringify(bandsWithLocalImages, null, 2) + '\n',
      'utf8'
    )

    console.log()
    console.log('🤘 Done!')
    console.log(`   Bands  : ${bandsWithLocalImages.length}`)
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
