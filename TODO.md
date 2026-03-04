# TODO

## High priority

- [ ] **Configure Google Calendar** — add `GOOGLE_CALENDAR_ID` and `GOOGLE_API_KEY` to `.env.local` (and Vercel env vars) so the Gig Guide shows real events instead of the "Calendar not configured" placeholder. The calendar ID is available in Google Calendar → Settings → Integrate calendar.

- [ ] **Scrape remaining bands** — the scraper only collected bands starting with letters A–12 (first page of Wix results). The Wix bands page has a "Load More" button; check if there are more pages and re-run `npm run scrape:bands` or adjust the scraper to paginate fully.

- [ ] **Music page** (`/music`) — currently a placeholder. The Wix site has music content; flesh this out (embed Bandcamp player, link to releases, etc.).

- [ ] **Feed page** (`/feed`) — currently a placeholder. Could be an RSS/social feed aggregator or news section.

---

## Content maintenance

- [ ] Re-run scrapers periodically to keep band/venue data in sync with the Wix site:
  ```bash
  npm run scrape:bands
  npm run scrape:venues
  ```
- [ ] Review scraped venue addresses — the scraper uses a heuristic to extract addresses and some may be missing or wrong. Manually verify `data/venues.json`.

- [ ] Some bands in `data/bands.json` may be missing Facebook or Bandcamp links (shown as greyed-out buttons). Fill these in manually where possible.

---

## Design / UX

- [ ] **Mobile nav** — the hamburger menu works but the mobile link list could be styled more closely to Wix's mobile nav (full-screen overlay or slide-in drawer).

- [ ] **Band detail pages** — currently bands link to Facebook/Bandcamp externally. Consider adding individual band pages at `/bands/[slug]` with bio, photos, and social links.

- [ ] **Venue detail pages** — same pattern as bands; `/venues/[slug]` with photos, capacity, upcoming shows.

- [ ] **Gig Guide UX** — once calendar is configured, consider adding a month-view calendar option (similar to the Wix Events Calendar widget) alongside the current list view.

- [ ] **Home page community sections** — the Wix home page has a community welcome text section and an upcoming events preview below the hero. Adding these would make the page feel less sparse and closer to the Wix original.

---

## Technical

- [ ] **Deployment** — the site hasn't been deployed to Vercel yet. Set up the project, add env vars, and confirm the build passes.

- [ ] **Image domains** — `next.config.js` allows images from `static.wixstatic.com` as a CDN fallback. Once the site is live, consider migrating images to your own storage (Cloudflare R2, Vercel Blob, etc.) to avoid depending on Wix's CDN.

- [ ] **Search** — the bands filter is client-side and works well for the current dataset. If bands grow to hundreds, consider server-side filtering or a lightweight search index (Fuse.js or similar).

- [ ] **OG images** — add dynamic Open Graph images (using `next/og`) for the gig guide and band pages so social shares look good.

- [ ] **Analytics** — add Vercel Analytics or Plausible for traffic visibility.
