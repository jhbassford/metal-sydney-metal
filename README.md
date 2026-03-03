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

## Enabling Google Calendar on the Gig Guide

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable the **Google Calendar API**
3. Create an **API Key** (Credentials → Create credentials → API key)
4. Restrict the key: API restrictions → Google Calendar API; HTTP referrers → your domain
5. In Google Calendar, find your calendar's **Calendar ID** (Settings → "Integrate calendar")
6. Set both values in `.env.local`

The `/gig-guide` page fetches events server-side and revalidates every hour (ISR). Past/upcoming toggle is handled via URL search params (`?view=past`).

---

## Adding Bands

Edit `data/bands.json`. Each entry follows this schema:

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

- `image` — place files in `/public/images/bands/`. Set to `null` if no photo.
- `facebook` / `bandcamp` — set to `null` to show greyed-out inactive button.

---

## Adding Venues

Edit `data/venues.json`. Each entry follows this schema:

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

- `image` — place files in `/public/images/venues/`. Set to `null` for placeholder.
- `bookingEmail` / `website` — optional; set to `null` to hide.

---

## Adding Hero Images

Each page uses the `<Hero>` component. To add real photos:

1. Place images in `/public/images/heroes/` (e.g. `home.jpg`, `gig-guide.jpg`)
2. Pass the path via the `imagePath` prop:

```tsx
<Hero imagePath="/images/heroes/home.jpg">
  ...
</Hero>
```

Dark overlay is applied automatically for text readability.

---

## Project Structure

```
app/
  layout.tsx          Root layout (Nav + Footer)
  page.tsx            Home (/)
  gig-guide/          /gig-guide — Google Calendar events
  bands/              /bands — band directory
  venues/             /venues — venue directory
  music/              /music — placeholder
  feed/               /feed — placeholder

components/
  Nav.tsx             Sticky top nav with hamburger (client)
  Footer.tsx          Footer with social links
  Hero.tsx            Full-width hero section
  BandsClient.tsx     Band grid with genre/location filter (client)

lib/
  calendar.ts         Google Calendar API helper (server-only)

data/
  bands.json          Band data (seed with 24 "A" bands)
  venues.json         Venue data (16 Sydney venues)

public/
  images/             Static images (bands, venues, heroes)
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
- **Calendar** → Swap the implementation in `lib/calendar.ts` (e.g. use a custom API or different calendar provider)
