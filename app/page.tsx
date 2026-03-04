import Hero from '@/components/Hero'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
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

      {/* Community copy */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          Check out our Gig Calendar to see all the metal events happening in
          town and never miss out another gig again. Meet the rest of your Metal
          Kin, Check out music from the local artists, watch out for the latest
          news and be part of this growing community.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          Send us your Music and we&apos;ll play it, Give us your news and
          we&apos;ll share it.
        </p>
        <p className="text-gray-500 text-sm italic">For the love of Metal,</p>

        <div className="mt-8">
          <Link href="/gig-guide" className="btn-accent text-sm">
            Click here for all events
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
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

      {/* Instagram feed */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Script src="https://static.elfsight.com/platform/platform.js" strategy="lazyOnload" />
        <div
          className="elfsight-app-c24c6bb8-9d05-4e07-8c31-d1ad1ec9eb1e"
          data-elfsight-app-lazy
        />
      </section>
    </>
  )
}
