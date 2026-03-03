import type { Metadata } from 'next'
import Link from 'next/link'
import Hero from '@/components/Hero'
import { getEvents, formatEventDate, groupEventsByMonth } from '@/lib/calendar'

export const metadata: Metadata = {
  title: 'Sydney Metal Gig Guide',
  description:
    'Your one-stop place for metal events in Sydney and NSW. Never miss a gig again.',
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function GigGuidePage({ searchParams }: PageProps) {
  const showPast = searchParams?.view === 'past'
  const events = await getEvents(showPast)
  const grouped = groupEventsByMonth(events)

  return (
    <>
      <Hero>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white uppercase tracking-widest leading-tight">
          Sydney Metal
          <br />
          <span className="text-accent">Gig Guide</span>
        </h1>
        <p className="text-gray-400 mt-4 text-sm font-heading uppercase tracking-widest">
          {showPast ? 'Past events — last 6 months' : 'Upcoming events in Sydney & NSW'}
        </p>
      </Hero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        <div className="bg-surface border-l-2 border-accent px-6 py-5 mb-10">
          <p className="text-gray-400 text-sm leading-relaxed">
            The Sydney Metal Gig Guide: A one-stop place for everything metal,
            everything Sydney. Bookmark this calendar page and never lose track
            of the events happening in town again. We also try to cover some of
            the gigs in our extended neighborhoods of Newcastle, Wollongong and
            other close areas in NSW. If you wish for your event to be displayed
            here (if it is not already), please email{' '}
            <a
              href="mailto:media@metalsydneymetal.com"
              className="text-accent hover:underline"
            >
              media@metalsydneymetal.com
            </a>
          </p>
        </div>

        {/* Upcoming / Past toggle */}
        <div className="flex items-center gap-3 mb-10">
          <Link
            href="/gig-guide"
            className={`font-heading text-xs uppercase tracking-widest px-5 py-2.5 border transition-colors ${
              !showPast
                ? 'border-accent bg-accent text-white'
                : 'border-gray-700 text-gray-500 hover:border-accent hover:text-accent'
            }`}
          >
            Upcoming
          </Link>
          <Link
            href="/gig-guide?view=past"
            className={`font-heading text-xs uppercase tracking-widest px-5 py-2.5 border transition-colors ${
              showPast
                ? 'border-accent bg-accent text-white'
                : 'border-gray-700 text-gray-500 hover:border-accent hover:text-accent'
            }`}
          >
            Past Events
          </Link>
        </div>

        {/* Event list */}
        {events.length === 0 ? (
          <div className="text-center py-24 border border-gray-800">
            {!process.env.GOOGLE_CALENDAR_ID ? (
              <>
                <p className="font-heading text-gray-600 uppercase tracking-widest text-sm">
                  Calendar not configured
                </p>
                <p className="text-gray-700 text-xs mt-2">
                  Add GOOGLE_CALENDAR_ID and GOOGLE_API_KEY to .env.local
                </p>
              </>
            ) : (
              <p className="font-heading text-gray-600 uppercase tracking-widest text-sm">
                No {showPast ? 'past' : 'upcoming'} events found
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-14">
            {grouped.map(({ month, events: monthEvents }) => (
              <section key={month}>
                <h2 className="section-heading">{month}</h2>
                <div className="space-y-3">
                  {monthEvents.map((event) => {
                    const { date, time } = formatEventDate(event)
                    return (
                      <a
                        key={event.id}
                        href={event.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card flex flex-col md:flex-row md:items-start gap-4 p-5 group hover:border-accent/50"
                      >
                        {/* Date + time */}
                        <div className="md:w-52 shrink-0">
                          <p className="text-accent font-heading text-sm font-semibold leading-snug">
                            {date}
                          </p>
                          {time && (
                            <p className="text-gray-500 text-xs mt-1 font-heading uppercase tracking-wider">
                              {time}
                            </p>
                          )}
                        </div>

                        {/* Event details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide group-hover:text-accent transition-colors leading-snug">
                            {event.summary}
                          </h3>
                          {event.location && (
                            <p className="text-gray-500 text-xs mt-1.5">
                              <span className="text-gray-600">📍 </span>
                              {event.location}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-gray-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                              {event.description.replace(/<[^>]*>/g, '').trim()}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex items-center self-center text-gray-700 group-hover:text-accent transition-colors shrink-0">
                          →
                        </div>
                      </a>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
