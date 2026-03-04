import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Music',
  description: 'Sydney metal music — stream the Metal Sydney Metal compilation and community playlist.',
}

export default function MusicPage() {
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white uppercase tracking-widest mb-4">
          Music
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
          {/* Spotify playlist */}
          <iframe
            src="https://open.spotify.com/embed/playlist/5GOddxIZAYjAn84NOqNztJ"
            width="400"
            height="800"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Metal Sydney Metal Spotify Playlist"
          />

          {/* Bandcamp compilation */}
          <iframe
            style={{ border: 0, width: 350, height: 786 }}
            src="https://bandcamp.com/EmbeddedPlayer/album=1341689838/size=large/bgcol=ffffff/linkcol=0687f5/transparent=true/"
            seamless
            loading="lazy"
            title="Metal Sydney Metal Compilation 2024"
          >
            <a href="https://metalsydneymetal.bandcamp.com/album/metal-sydney-metal-compilation-2024">
              Metal Sydney Metal Compilation 2024 by Metal Sydney Metal
            </a>
          </iframe>
        </div>
      </div>
    </>
  )
}
