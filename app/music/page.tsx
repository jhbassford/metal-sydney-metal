import type { Metadata } from 'next'
import Hero from '@/components/Hero'

export const metadata: Metadata = {
  title: 'Music',
  description: 'Sydney metal music — streaming and more coming soon.',
}

export default function MusicPage() {
  return (
    <>
      <Hero>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white uppercase tracking-widest">
          <span className="text-accent">Music</span>
        </h1>
      </Hero>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="border border-gray-800 p-12">
          <div className="w-12 h-0.5 bg-accent mx-auto mb-8" />
          <p className="font-heading text-gray-500 uppercase tracking-widest text-sm">
            Coming Soon
          </p>
          <p className="text-gray-700 mt-4 text-sm leading-relaxed max-w-sm mx-auto">
            We&apos;ll be embedding Spotify playlists, Bandcamp releases, and
            more here soon. Stay tuned.
          </p>
          <div className="w-12 h-0.5 bg-accent mx-auto mt-8" />
        </div>
      </div>
    </>
  )
}
