import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Feed',
  description: 'Latest from the Metal Sydney Metal Instagram — news and updates from the Sydney metal scene.',
}

export default function FeedPage() {
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white uppercase tracking-widest mb-4">
          Feed
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Script src="https://static.elfsight.com/platform/platform.js" strategy="lazyOnload" />
        <div
          className="elfsight-app-c24c6bb8-9d05-4e07-8c31-d1ad1ec9eb1e"
          data-elfsight-app-lazy
        />
      </div>
    </>
  )
}
