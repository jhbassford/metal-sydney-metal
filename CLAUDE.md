# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run scrape:bands # Puppeteer script to scrape band data (scripts/scrape-bands.js)
npm run compare      # Visual diff against reference screenshots (scripts/compare-designs.js)
```

There is no test framework configured.

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in:
- `GOOGLE_CALENDAR_ID` — Calendar ID from Google Calendar settings
- `GOOGLE_API_KEY` — API key from Google Cloud Console (Calendar API)

These are **server-side only** — never prefix with `NEXT_PUBLIC_`.

## Architecture

**Next.js 14 App Router** with a clear server/client component split:

- **Server components** (`app/**/page.tsx`) fetch data at request time — Google Calendar events via `lib/calendar.ts`, band/venue data via direct JSON import
- **Client components** (`'use client'`) handle interactivity: `Nav.tsx` (hamburger menu), `BandsClient.tsx` (genre/location filters with `useState`/`useMemo`)
- `lib/calendar.ts` is server-only — it reads `process.env` vars without `NEXT_PUBLIC_` prefix and must never be imported from client components

**Data layer:**
- `data/bands.json` and `data/venues.json` are the sole sources of truth for bands/venues — imported directly in server page components
- Google Calendar is the sole source for gig guide events; `lib/calendar.ts` exposes `getEvents()`, `formatEventDate()`, and `groupEventsByMonth()`
- Gig guide uses ISR (`next: { revalidate: 3600 }` on the fetch) and past/upcoming toggle via `?view=past` search param

**Design system:**

Tailwind custom tokens (defined in `tailwind.config.ts`):
- Colors: `background` (`#0a0a0a`), `surface` (`#111111`), `accent` (`#8b0000`), `accent-hover`, `text-primary`, `text-muted`
- Fonts: `font-heading` (Cinzel, serif — used for all headings and UI labels), `font-body` (Inter)

Reusable CSS component classes (defined in `app/globals.css` `@layer components`):
- `.btn-accent`, `.btn-outline`, `.btn-ghost` — button variants
- `.card` — dark bordered surface box
- `.page-heading`, `.section-heading` — typography utilities

All pages follow the same layout pattern: `<Hero>` full-width header → constrained content container (`max-w-*xl mx-auto px-4 sm:px-6 lg:px-8 py-12`).

**CMS migration path:** Band/venue JSON imports in page components are the only touch points to replace when moving to a CMS.
