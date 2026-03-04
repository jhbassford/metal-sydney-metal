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
        <p className="font-metal font-normal text-white text-xl leading-relaxed mb-4">
          Check out our Gig Calendar to see all the metal events happening in
          town and never miss out another gig again. Meet the rest of your Metal
          Kin, Check out music from the local artists, watch out for the latest
          news and be part of this growing community.
        </p>
        <p className="font-metal font-normal text-white text-xl leading-relaxed mb-4">
          Send us your Music and we&apos;ll play it, Give us your news and
          we&apos;ll share it.
        </p>
        <p className="font-metal font-normal text-white text-xl mb-8">
          For the love of Metal,
        </p>
        <Link href="/gig-guide" className="btn-accent text-sm">
          Click here for all events
        </Link>
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
