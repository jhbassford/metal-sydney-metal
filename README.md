# Metal Sydney Metal

Community hub for the Sydney metal music scene — **[metalsydneymetal.com](https://metalsydneymetal.com)**

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, deployed on **Vercel**.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

| Variable             | Description                                                              |
|----------------------|--------------------------------------------------------------------------|
| `GOOGLE_CALENDAR_ID` | Calendar ID from Google Calendar settings → "Integrate calendar"         |
| `GOOGLE_API_KEY`     | API key from Google Cloud Console (restrict to Calendar API + your domain) |

> These are **server-side only** variables. Never prefix them with `NEXT_PUBLIC_`.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run scrape:bands` | Scrape bands from Wix site → `data/bands.json` + `public/images/bands/` |
| `npm run scrape:venues` | Scrape venues from Wix site → `data/venues.json` + `public/images/venues/` |
| `npm run compare` | Visual diff vs live Wix site (requires `npm run dev` running) → `scripts/screenshots/report.html` |

---

## Enabling Google Calendar on the Gig Guide

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable the **Google Calendar API**
3. Create an **API Key** (Credentials → Create credentials → API key)
4. Restrict the key: API restrictions → Google Calendar API; HTTP referrers → your domain
5. In Google Calendar, find your calendar's **Calendar ID** (Settings → "Integrate calendar")
6. Set both values in `.env.local`

The `/gig-guide` page fetches events server-side and revalidates every hour (ISR). Past/upcoming toggle is handled via URL search params (`?view=past`).

---

## Updating Band & Venue Data

The scrapers pull directly from the live Wix site. Re-run them whenever the Wix content changes:

```bash
npm run scrape:bands    # updates data/bands.json and public/images/bands/
npm run scrape:venues   # updates data/venues.json and public/images/venues/
```

### Manual edits

**Bands** — edit `data/bands.json`:

```json
{
  "id": "unique-slug",
  "name": "Band Name",
  "genre": "Genre",
  "location": "Sydney",
  "image": "/images/bands/band-name.jpg",
  "facebook": "https://facebook.com/bandpage",
  "bandcamp": "https://bandname.bandcamp.com"
}
```

**Venues** — edit `data/venues.json`:

```json
{
  "id": "unique-slug",
  "name": "Venue Name",
  "address": "123 Street, Suburb NSW 2000",
  "description": "Description of the venue.",
  "image": "/images/venues/venue-name.jpg",
  "bookingEmail": "bookings@venue.com.au",
  "website": "https://venue.com.au"
}
```

Set `image`, `facebook`, `bandcamp`, `bookingEmail`, or `website` to `null` to hide/placeholder them.

---

## Project Structure

```
app/
  layout.tsx          Root layout (Nav + Footer, fonts)
  page.tsx            Home (/)
  gig-guide/          /gig-guide — Google Calendar events list
  bands/              /bands — band directory with filter
  venues/             /venues — venue directory with map
  music/              /music — placeholder
  feed/               /feed — placeholder

components/
  Nav.tsx             Sticky two-row nav with hamburger (client)
  Footer.tsx          Footer with social links
  Hero.tsx            Full-width hero (cathedral photo or dark gradient)
  BandsClient.tsx     Band grid with search + genre/location filter (client)

lib/
  calendar.ts         Google Calendar API helper (server-only, ISR)

data/
  bands.json          24 bands scraped from Wix
  venues.json         17 venues scraped from Wix

scripts/
  scrape-bands.js     Puppeteer scraper for the Wix bands page
  scrape-venues.js    Puppeteer scraper for the Wix venues page
  compare-designs.js  Puppeteer + pixelmatch visual comparison tool

public/
  images/
    msm-logo.png      MSM skull logo
    hero-bg.jpg       Cathedral hero background
    bands/            Band photos (scraped)
    venues/           Venue photos (scraped)
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `GOOGLE_CALENDAR_ID`
   - `GOOGLE_API_KEY`
4. Deploy

No additional configuration needed — Next.js App Router works out of the box on Vercel.

---

## Migrating to a CMS

Band and venue data live in JSON files for easy CMS migration:

- **Bands** → Replace `data/bands.json` import with a Sanity/Contentful fetch in `app/bands/page.tsx`
- **Venues** → Same pattern in `app/venues/page.tsx`
- **Calendar** → Swap `lib/calendar.ts` (or point to a different calendar provider / custom API)
