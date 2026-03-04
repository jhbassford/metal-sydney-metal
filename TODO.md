# TODO

## High priority

- [ ] **Configure Google Calendar** — add `GOOGLE_CALENDAR_ID` and `GOOGLE_API_KEY` to `.env.local` (and Vercel env vars) so the Gig Guide shows real events instead of the "Calendar not configured" placeholder. The calendar ID is available in Google Calendar → Settings → Integrate calendar.

- [ ] **Add missing bands** — the initial scrape only captured bands starting with A–12 (first page of Wix results). Manually add any missing bands to `data/bands.json`.

- [ ] **Deployment** — the site hasn't been deployed to Vercel yet. Set up the project, add env vars, and confirm the build passes. The Elfsight Instagram widget (home + feed pages) will only render once the domain is registered with Elfsight.

---

## Content maintenance

- [ ] Review scraped venue addresses — the scraper used a heuristic to extract addresses and some may be missing or wrong. Manually verify `data/venues.json`.

- [ ] Some bands in `data/bands.json` may be missing Facebook or Bandcamp links (shown as greyed-out buttons). Fill these in manually where possible.

---

## Design / UX

- [ ] **Mobile nav** — the hamburger menu works but the mobile link list could be styled more closely to Wix's mobile nav.

- [ ] **Gig Guide UX** — once calendar is configured, consider adding a month-view calendar option (similar to the Wix Events Calendar widget) alongside the current list view.

- [ ] **Band detail pages** — currently bands link to Facebook/Bandcamp externally. Consider adding individual band pages at `/bands/[slug]` with bio, photos, and social links.

- [ ] **Venue detail pages** — same pattern as bands; `/venues/[slug]` with photos, capacity, upcoming shows.

---

## Technical

- [ ] **Image domains** — `next.config.js` allows images from `static.wixstatic.com` as a CDN fallback. Once the site is live, consider migrating images to your own storage (Cloudflare R2, Vercel Blob, etc.) to avoid depending on Wix's CDN.

- [ ] **OG images** — add dynamic Open Graph images (using `next/og`) for the gig guide and band pages so social shares look good.

- [ ] **Analytics** — add Vercel Analytics or Plausible for traffic visibility.
