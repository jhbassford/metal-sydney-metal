import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import BandsClient from '@/components/BandsClient'
import bandsData from '@/data/bands.json'

export const metadata: Metadata = {
  title: 'Sydney Metal Bands',
  description:
    'A comprehensive list of all active metal bands in Sydney & rest of New South Wales.',
}

export default function BandsPage() {
  return (
    <>
      <Hero>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white uppercase tracking-widest leading-tight">
          Sydney Metal
          <br />
          <span className="text-accent">Bands</span>
        </h1>
      </Hero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-3xl border-l-2 border-accent pl-4">
          A comprehensive list of all active metal bands in Sydney &amp; rest of
          New South Wales. Note: Some bands may not have a Facebook or Bandcamp
          link, so certain buttons may be inactive.
        </p>

        <BandsClient bands={bandsData} />
      </div>
    </>
  )
}
