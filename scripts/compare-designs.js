#!/usr/bin/env node
/**
 * scripts/compare-designs.js
 *
 * Visual regression comparison between the live Wix site and our local
 * Next.js dev server (localhost:3000).
 *
 * Usage:
 *   npm run compare          # (start `npm run dev` first in another terminal)
 *
 * Requires (added to devDependencies):
 *   puppeteer ^22, pixelmatch ^5, pngjs ^6
 */

'use strict'

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')
const pixelmatch = require('pixelmatch')

// ─── Config ──────────────────────────────────────────────────────────────────

const SCREENSHOTS_DIR = path.resolve(__dirname, 'screenshots')

const PAGES = [
  {
    name: 'home',
    label: 'Home',
    wix: 'https://www.metalsydneymetal.com',
    local: 'http://localhost:3000',
  },
  {
    name: 'gig-guide',
    label: 'Gig Guide',
    wix: 'https://www.metalsydneymetal.com/sydneymetalgigguide',
    local: 'http://localhost:3000/gig-guide',
  },
  {
    name: 'bands',
    label: 'Bands',
    wix: 'https://www.metalsydneymetal.com/bands',
    local: 'http://localhost:3000/bands',
  },
  {
    name: 'venues',
    label: 'Venues',
    wix: 'https://www.metalsydneymetal.com/venues',
    local: 'http://localhost:3000/venues',
  },
]

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
  { name: 'mobile',  width: 390,  height: 844, isMobile: true  },
]

/** Pixelmatch threshold (0–1). Lower = more sensitive. */
const DIFF_THRESHOLD = 0.1

/** Extra settle time (ms) after networkidle2 before capturing */
const SETTLE_MS = 1500

/** Navigation timeout (ms) */
const NAV_TIMEOUT_MS = 30_000

// ─── Screenshot helpers ───────────────────────────────────────────────────────

async function takeScreenshot(page, url, viewport, outputPath) {
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  })

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT_MS })
  } catch (err) {
    // networkidle2 can time-out on heavy pages; try to screenshot anyway
    if (!err.message.includes('Navigation timeout')) {
      console.warn(`    ⚠  goto error: ${err.message}`)
      return false
    }
  }

  // Let animations / lazy images settle
  await new Promise((r) => setTimeout(r, SETTLE_MS))

  try {
    await page.screenshot({ path: outputPath, fullPage: true })
    return true
  } catch (err) {
    console.warn(`    ⚠  screenshot error: ${err.message}`)
    return false
  }
}

// ─── Image diff helpers ───────────────────────────────────────────────────────

/**
 * Extract a w×h sub-buffer from a PNG (top-left crop).
 * If the PNG is already exactly w×h, returns .data directly.
 */
function cropData(png, w, h) {
  if (png.width === w && png.height === h) return png.data
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    const src = (y * png.width) * 4
    const dst = (y * w) * 4
    png.data.copy(out, dst, src, src + w * 4)
  }
  return out
}

/**
 * Compare two PNG files with pixelmatch.
 * Crops both to their common (minimum) dimensions before comparing.
 * Returns { similarity, numDiff, total, width, height } and writes diffPath.
 */
function diffImages(pathA, pathB, diffPath) {
  const a = PNG.sync.read(fs.readFileSync(pathA))
  const b = PNG.sync.read(fs.readFileSync(pathB))

  const w = Math.min(a.width, b.width)
  const h = Math.min(a.height, b.height)

  const da = cropData(a, w, h)
  const db = cropData(b, w, h)
  const diff = new PNG({ width: w, height: h })

  const numDiff = pixelmatch(da, db, diff.data, w, h, {
    threshold: DIFF_THRESHOLD,
    includeAA: false,
  })

  fs.writeFileSync(diffPath, PNG.sync.write(diff))

  const total = w * h
  const similarity = (((total - numDiff) / total) * 100).toFixed(1)
  return { similarity: Number(similarity), numDiff, total, width: w, height: h }
}

// ─── HTML report ─────────────────────────────────────────────────────────────

function scoreColor(pct) {
  if (pct >= 95) return '#4ade80'  // green
  if (pct >= 80) return '#facc15'  // yellow
  if (pct >= 60) return '#fb923c'  // orange
  return '#f87171'                  // red
}

function imgTag(file, alt, exists) {
  if (!exists) {
    return `<div class="no-img">⚠ screenshot failed</div>`
  }
  return `<img src="${file}" alt="${alt}" loading="lazy">`
}

function vpSection(pageName, vpName, vpData) {
  const { wixOk, localOk, diffResult, wixFile, localFile, diffFile } = vpData
  const hasDiff = wixOk && localOk && diffResult

  const badge = hasDiff
    ? `<span class="badge" style="background:${scoreColor(diffResult.similarity)};color:#000">
         ${diffResult.similarity}% match
       </span>`
    : `<span class="badge" style="background:#6b7280;color:#fff">no diff</span>`

  const diffDetail = hasDiff
    ? `<p class="detail">${diffResult.numDiff.toLocaleString()} of ${diffResult.total.toLocaleString()} pixels differ &nbsp;·&nbsp; canvas ${diffResult.width}×${diffResult.height}px</p>`
    : ''

  return `
    <section class="vp-section">
      <div class="vp-header">
        <span class="vp-name">${vpName.toUpperCase()}</span>
        ${badge}
        ${diffDetail}
      </div>
      <div class="grid-3">
        <figure>
          <figcaption>Wix (live)</figcaption>
          ${imgTag(wixFile, `${pageName} wix ${vpName}`, wixOk)}
        </figure>
        <figure>
          <figcaption>Local (Next.js)</figcaption>
          ${imgTag(localFile, `${pageName} local ${vpName}`, localOk)}
        </figure>
        <figure>
          <figcaption>Diff</figcaption>
          ${hasDiff ? imgTag(diffFile, `${pageName} diff ${vpName}`, true) : `<div class="no-img">—</div>`}
        </figure>
      </div>
    </section>`
}

function generateReport(results) {
  const generated = new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const pageSections = results.map((r) => {
    const vpHtml = VIEWPORTS.map((vp) => vpSection(r.name, vp.name, r.viewports[vp.name])).join('\n')
    return `
      <article class="page-section">
        <h2>${r.label}</h2>
        <div class="urls">
          <span>Wix: <a href="${r.wix}" target="_blank">${r.wix}</a></span>
          <span>Local: <a href="${r.local}" target="_blank">${r.local}</a></span>
        </div>
        ${vpHtml}
      </article>`
  }).join('\n')

  // Summary table
  const summaryRows = results.flatMap((r) =>
    VIEWPORTS.map((vp) => {
      const d = r.viewports[vp.name]
      const sim = d.diffResult ? `${d.diffResult.similarity}%` : '—'
      const color = d.diffResult ? scoreColor(d.diffResult.similarity) : '#6b7280'
      return `
        <tr>
          <td>${r.label}</td>
          <td>${vp.name}</td>
          <td class="center">${d.wixOk ? '✓' : '✗'}</td>
          <td class="center">${d.localOk ? '✓' : '✗'}</td>
          <td class="center" style="color:${color};font-weight:700">${sim}</td>
        </tr>`
    })
  ).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Design Comparison — Metal Sydney Metal</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }

  body {
    background: #0d0d0d;
    color: #e5e5e5;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.5;
  }

  header {
    background: #1a1a1a;
    border-bottom: 2px solid #b91c1c;
    padding: 1.5rem 2rem;
  }
  header h1 { font-size: 1.5rem; color: #f87171 }
  header p  { color: #9ca3af; margin-top: .25rem; font-size: .85rem }

  main { padding: 2rem; max-width: 1600px; margin: 0 auto }

  /* Summary table */
  .summary { margin-bottom: 2.5rem }
  .summary h2 { font-size: 1.1rem; color: #d1d5db; margin-bottom: .75rem }
  table { border-collapse: collapse; width: 100%; max-width: 640px }
  th, td {
    border: 1px solid #374151;
    padding: .4rem .75rem;
    text-align: left;
  }
  th { background: #1f2937; color: #9ca3af; font-weight: 600; font-size: .8rem; text-transform: uppercase; letter-spacing: .05em }
  td.center { text-align: center }
  tr:nth-child(even) td { background: #111827 }

  /* Page sections */
  .page-section {
    margin-bottom: 3rem;
    border: 1px solid #1f2937;
    border-radius: 8px;
    overflow: hidden;
  }
  .page-section h2 {
    background: #1f2937;
    padding: .75rem 1.25rem;
    font-size: 1.1rem;
    color: #f9fafb;
    border-bottom: 1px solid #374151;
  }
  .urls {
    background: #111827;
    padding: .5rem 1.25rem;
    font-size: .8rem;
    color: #6b7280;
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    border-bottom: 1px solid #1f2937;
  }
  .urls a { color: #60a5fa; text-decoration: none }
  .urls a:hover { text-decoration: underline }

  /* Viewport section */
  .vp-section { padding: 1rem 1.25rem }
  .vp-section + .vp-section { border-top: 1px solid #1f2937 }

  .vp-header {
    display: flex;
    align-items: baseline;
    gap: .75rem;
    margin-bottom: .75rem;
    flex-wrap: wrap;
  }
  .vp-name {
    font-weight: 700;
    font-size: .85rem;
    letter-spacing: .1em;
    color: #9ca3af;
  }
  .badge {
    display: inline-block;
    padding: .15rem .55rem;
    border-radius: 999px;
    font-size: .75rem;
    font-weight: 700;
  }
  .detail { font-size: .75rem; color: #6b7280 }

  /* 3-col screenshot grid */
  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: .75rem;
  }

  figure {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 6px;
    overflow: hidden;
  }
  figcaption {
    padding: .4rem .75rem;
    font-size: .75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: .05em;
    background: #1a2233;
    border-bottom: 1px solid #1f2937;
  }
  figure img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 540px;
    object-fit: cover;
    object-position: top;
    cursor: zoom-in;
    transition: max-height .2s;
  }
  figure img:hover { max-height: none }
  .no-img {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    color: #4b5563;
    font-size: .85rem;
  }

  @media (max-width: 900px) {
    .grid-3 { grid-template-columns: 1fr }
    main { padding: 1rem }
  }
</style>
</head>
<body>

<header>
  <h1>🤘 Metal Sydney Metal — Design Comparison</h1>
  <p>Generated ${generated} &nbsp;·&nbsp; Wix (live) vs Local Next.js (localhost:3000) &nbsp;·&nbsp; Hover screenshots to expand</p>
</header>

<main>

  <div class="summary">
    <h2>Summary</h2>
    <table>
      <thead>
        <tr><th>Page</th><th>Viewport</th><th>Wix ✓</th><th>Local ✓</th><th>Match</th></tr>
      </thead>
      <tbody>${summaryRows}</tbody>
    </table>
  </div>

  ${pageSections}

</main>
</body>
</html>`
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })

  console.log('🤘 Metal Sydney Metal — Design Comparison')
  console.log(`   Wix  : https://www.metalsydneymetal.com`)
  console.log(`   Local: http://localhost:3000`)
  console.log(`   Out  : ${SCREENSHOTS_DIR}`)
  console.log()

  // Check local server is reachable before starting
  try {
    const http = require('http')
    await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000', { timeout: 5000 }, () => resolve())
      req.on('error', reject)
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    })
    console.log('✓ Local server is up\n')
  } catch {
    console.warn('⚠  Could not reach http://localhost:3000')
    console.warn('   Local screenshots will show failure — run `npm run dev` in another terminal.\n')
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  const results = []

  try {
    // Re-use a single page to avoid opening dozens of tabs
    const page = await browser.newPage()

    // Suppress noisy console/error output from target pages
    page.on('console', () => {})
    page.on('pageerror', () => {})

    for (const pageDef of PAGES) {
      console.log(`\n📄 ${pageDef.label}`)
      const pageResult = { ...pageDef, viewports: {} }

      for (const vp of VIEWPORTS) {
        const wixFile    = `${pageDef.name}-wix-${vp.name}.png`
        const localFile  = `${pageDef.name}-local-${vp.name}.png`
        const diffFile   = `${pageDef.name}-diff-${vp.name}.png`
        const wixPath    = path.join(SCREENSHOTS_DIR, wixFile)
        const localPath  = path.join(SCREENSHOTS_DIR, localFile)
        const diffPath   = path.join(SCREENSHOTS_DIR, diffFile)

        console.log(`  [${vp.name}] ${vp.width}×${vp.height}`)

        process.stdout.write(`    Wix   → `)
        const wixOk = await takeScreenshot(page, pageDef.wix, vp, wixPath)
        console.log(wixOk ? '✓' : '✗')

        process.stdout.write(`    Local → `)
        const localOk = await takeScreenshot(page, pageDef.local, vp, localPath)
        console.log(localOk ? '✓' : '✗')

        let diffResult = null
        if (wixOk && localOk) {
          process.stdout.write(`    Diff  → `)
          diffResult = diffImages(wixPath, localPath, diffPath)
          console.log(
            `${diffResult.similarity}% similar` +
            ` (${diffResult.numDiff.toLocaleString()} px differ,` +
            ` ${diffResult.width}×${diffResult.height}px canvas)`
          )
        } else {
          console.log(`    Diff  → skipped`)
        }

        pageResult.viewports[vp.name] = {
          wixOk,
          localOk,
          diffResult,
          wixFile,
          localFile,
          diffFile,
        }
      }

      results.push(pageResult)
    }
  } finally {
    await browser.close()
  }

  // Generate HTML report
  const reportPath = path.join(SCREENSHOTS_DIR, 'report.html')
  fs.writeFileSync(reportPath, generateReport(results), 'utf8')

  // Print summary table
  console.log('\n─────────────────────────────────────────────────')
  console.log('Page         Viewport  Match')
  console.log('─────────────────────────────────────────────────')
  for (const r of results) {
    for (const vp of VIEWPORTS) {
      const d = r.viewports[vp.name]
      const sim = d.diffResult ? `${d.diffResult.similarity}%` : ' —'
      const wixMark   = d.wixOk   ? '✓' : '✗'
      const localMark = d.localOk ? '✓' : '✗'
      console.log(
        `${r.label.padEnd(12)} ${vp.name.padEnd(9)}` +
        ` Wix:${wixMark} Local:${localMark}  ${sim}`
      )
    }
  }
  console.log('─────────────────────────────────────────────────')
  console.log(`\n📊 Report → ${reportPath}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
