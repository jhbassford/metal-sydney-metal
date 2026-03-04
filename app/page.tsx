import Hero from '@/components/Hero'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* Full-height hero */}
      <Hero minHeight="min-h-[520px] md:min-h-[580px]">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/images/msm-logo.png"
            alt="Metal Sydney Metal"
            width={240}
            height={206}
            className="drop-shadow-2xl"
            priority
          />

          <p className="text-gray-300 text-sm max-w-xl mx-auto leading-relaxed font-body">
            Welcome to the homepage of the Sydney metal community. The one-stop
            place for everything metal, everything Sydney.
          </p>

          <Link href="/gig-guide" className="btn-accent text-sm">
            GIG CALENDAR
          </Link>
        </div>
      </Hero>

      {/* Feature cards */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-4">
          <div className="card p-7 group hover:border-accent/50 transition-colors">
            <div className="w-8 h-0.5 bg-accent mb-5" />
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider mb-3">
              Gig Guide
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Never miss a metal event in Sydney again. Browse upcoming gigs,
              concerts, and festivals across the city and greater NSW.
            </p>
            <Link
              href="/gig-guide"
              className="btn-outline text-xs group-hover:bg-accent group-hover:text-white"
            >
              View Events →
            </Link>
          </div>

          <div className="card p-7 group hover:border-accent/50 transition-colors">
            <div className="w-8 h-0.5 bg-accent mb-5" />
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider mb-3">
              Bands
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Discover Sydney&apos;s thriving metal scene. Browse hundreds of
              active bands by genre and location across New South Wales.
            </p>
            <Link
              href="/bands"
              className="btn-outline text-xs group-hover:bg-accent group-hover:text-white"
            >
              Browse Bands →
            </Link>
          </div>

          <div className="card p-7 group hover:border-accent/50 transition-colors">
            <div className="w-8 h-0.5 bg-accent mb-5" />
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider mb-3">
              Venues
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Find the best metal and rock venues in Sydney. From intimate
              underground clubs to major concert halls — all in one place.
            </p>
            <Link
              href="/venues"
              className="btn-outline text-xs group-hover:bg-accent group-hover:text-white"
            >
              Find Venues →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
