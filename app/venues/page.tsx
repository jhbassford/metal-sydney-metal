import type { Metadata } from 'next'
import Image from 'next/image'
import Hero from '@/components/Hero'
import venuesData from '@/data/venues.json'

export const metadata: Metadata = {
  title: 'Metal Venues Sydney',
  description:
    'Find all the best rock and metal venues in Sydney hosting regular gigs and events.',
}

export default function VenuesPage() {
  return (
    <>
      <Hero>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white uppercase tracking-widest leading-tight">
          <span className="text-accent">Venues</span>
        </h1>
      </Hero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-3xl border-l-2 border-accent pl-4">
          The following venues in Sydney host Rock &amp; Metal events on a
          regular basis. Support your local venues — without them, there is no
          scene. If a venue is missing, email{' '}
          <a
            href="mailto:media@metalsydneymetal.com"
            className="text-accent hover:underline"
          >
            media@metalsydneymetal.com
          </a>
        </p>

        <div className="space-y-5">
          {venuesData.map((venue) => (
            <div
              key={venue.id}
              className="card flex flex-col sm:flex-row gap-0 overflow-hidden group hover:border-accent/50"
            >
              {/* Photo — 160×160 */}
              <div className="relative w-full sm:w-[160px] h-48 sm:h-auto shrink-0 bg-gray-900 flex items-center justify-center overflow-hidden">
                {venue.image ? (
                  <Image
                    src={venue.image}
                    alt={venue.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 160px"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-gray-900 to-[#0a0a0a] p-4">
                    <span className="font-heading text-4xl font-bold text-gray-800 select-none">
                      {venue.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 p-6">
                <h2 className="font-heading text-xl font-bold text-white uppercase tracking-wider group-hover:text-accent transition-colors">
                  {venue.name}
                </h2>
                <p className="text-accent text-xs font-heading uppercase tracking-wider mt-1">
                  {venue.address}
                </p>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                  {venue.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {venue.bookingEmail && (
                    <a
                      href={`mailto:${venue.bookingEmail}`}
                      className="text-xs text-gray-500 hover:text-accent transition-colors"
                    >
                      ✉ {venue.bookingEmail}
                    </a>
                  )}
                  {venue.website && (
                    <a
                      href={venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-xs py-1.5"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
