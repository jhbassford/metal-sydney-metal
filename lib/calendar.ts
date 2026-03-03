export interface CalendarEvent {
  id: string
  summary: string
  description: string | null
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  location: string | null
  htmlLink: string
}

interface GoogleCalendarItem {
  id: string
  summary?: string
  description?: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  location?: string
  htmlLink?: string
}

interface GoogleCalendarResponse {
  items?: GoogleCalendarItem[]
  error?: { message: string; code: number }
}

/**
 * Fetch events from Google Calendar.
 * Called from server components only — GOOGLE_API_KEY is never exposed to the client.
 */
export async function getEvents(includePast = false): Promise<CalendarEvent[]> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const apiKey = process.env.GOOGLE_API_KEY

  if (!calendarId || !apiKey) {
    console.warn(
      '[calendar] Missing env vars: GOOGLE_CALENDAR_ID and/or GOOGLE_API_KEY'
    )
    return []
  }

  const params = new URLSearchParams({
    key: apiKey,
    orderBy: 'startTime',
    singleEvents: 'true',
    maxResults: '100',
  })

  if (!includePast) {
    params.set('timeMin', new Date().toISOString())
  } else {
    // Past events: show last 6 months, ordered newest-first
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    params.set('timeMin', sixMonthsAgo.toISOString())
    params.set('timeMax', new Date().toISOString())
    // For past events sorted descending we fetch ascending then reverse in JS
  }

  try {
    const encodedId = encodeURIComponent(calendarId)
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodedId}/events?${params}`

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[calendar] API error', res.status, text)
      return []
    }

    const data: GoogleCalendarResponse = await res.json()

    if (data.error) {
      console.error('[calendar] API returned error:', data.error.message)
      return []
    }

    const events: CalendarEvent[] = (data.items ?? []).map((item) => ({
      id: item.id,
      summary: item.summary ?? 'Untitled Event',
      description: item.description ?? null,
      start: item.start,
      end: item.end,
      location: item.location ?? null,
      htmlLink: item.htmlLink ?? '#',
    }))

    // For past events, reverse so newest is first
    return includePast ? events.reverse() : events
  } catch (err) {
    console.error('[calendar] Fetch failed:', err)
    return []
  }
}

/** Format a calendar event's start date/time into display strings. */
export function formatEventDate(event: CalendarEvent): {
  date: string
  time: string
  sortKey: string
} {
  const raw = event.start.dateTime ?? event.start.date ?? ''
  if (!raw) return { date: 'Date TBA', time: '', sortKey: '' }

  const d = new Date(raw)

  const date = d.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Sydney',
  })

  const time = event.start.dateTime
    ? d.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Australia/Sydney',
      })
    : 'All Day'

  return { date, time, sortKey: raw }
}

/** Group events into a Record keyed by "Month Year" (e.g. "March 2025"). */
export function groupEventsByMonth(
  events: CalendarEvent[]
): { month: string; events: CalendarEvent[] }[] {
  const map = new Map<string, CalendarEvent[]>()

  for (const event of events) {
    const raw = event.start.dateTime ?? event.start.date ?? ''
    if (!raw) continue

    const d = new Date(raw)
    const key = d.toLocaleDateString('en-AU', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Australia/Sydney',
    })

    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(event)
  }

  return Array.from(map.entries()).map(([month, evts]) => ({ month, events: evts }))
}
