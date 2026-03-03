'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'

export interface Band {
  id: string
  name: string
  genre: string
  location: string
  image?: string | null
  facebook?: string | null
  bandcamp?: string | null
}

interface BandsClientProps {
  bands: Band[]
}

export default function BandsClient({ bands }: BandsClientProps) {
  const [genreFilter, setGenreFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

  const genres = useMemo(
    () => Array.from(new Set(bands.map((b) => b.genre))).sort(),
    [bands]
  )

  const locations = useMemo(
    () => Array.from(new Set(bands.map((b) => b.location))).sort(),
    [bands]
  )

  const filtered = useMemo(
    () =>
      bands.filter((b) => {
        if (genreFilter && b.genre !== genreFilter) return false
        if (locationFilter && b.location !== locationFilter) return false
        return true
      }),
    [bands, genreFilter, locationFilter]
  )

  const resetFilters = () => {
    setGenreFilter('')
    setLocationFilter('')
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-10 p-4 bg-surface border border-gray-800">
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="bg-background border border-gray-700 text-gray-300 text-xs px-4 py-2.5 font-heading uppercase tracking-wider focus:border-accent focus:outline-none cursor-pointer"
        >
          <option value="">Filter by Genre</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="bg-background border border-gray-700 text-gray-300 text-xs px-4 py-2.5 font-heading uppercase tracking-wider focus:border-accent focus:outline-none cursor-pointer"
        >
          <option value="">Filter by Location</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <button
          onClick={resetFilters}
          className="border border-gray-700 text-gray-400 hover:border-accent hover:text-accent text-xs px-4 py-2.5 font-heading uppercase tracking-wider transition-colors"
        >
          Reset Filters
        </button>

        <span className="text-gray-600 text-xs font-heading uppercase tracking-wider ml-auto">
          {filtered.length} band{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Band grid */}
      {filtered.length === 0 ? (
        <p className="text-gray-600 text-center py-20 font-heading uppercase tracking-widest">
          No bands match your filters
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((band) => (
            <div
              key={band.id}
              className="card flex flex-col items-center p-4 gap-3"
            >
              {/* Photo — 250×250 square */}
              <div className="w-full aspect-square max-w-[250px] relative bg-gray-900 flex items-center justify-center overflow-hidden">
                {band.image ? (
                  <Image
                    src={band.image}
                    alt={band.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 250px"
                  />
                ) : (
                  <span className="font-heading text-4xl font-bold text-gray-700 select-none">
                    {band.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Band info */}
              <div className="w-full text-center flex flex-col gap-0.5">
                <h3 className="font-heading font-bold text-white text-xs uppercase tracking-wide leading-snug">
                  {band.name}
                </h3>
                <p className="text-accent text-xs font-heading uppercase tracking-wider">
                  {band.genre}
                </p>
                <p className="text-gray-600 text-xs">{band.location}</p>
              </div>

              {/* Social buttons */}
              <div className="flex gap-2 mt-auto w-full pt-1">
                {band.facebook ? (
                  <a
                    href={band.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center btn-outline py-1.5 text-[10px]"
                  >
                    Facebook
                  </a>
                ) : (
                  <span className="flex-1 text-center btn-ghost py-1.5 text-[10px]">
                    Facebook
                  </span>
                )}
                {band.bandcamp ? (
                  <a
                    href={band.bandcamp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center btn-outline py-1.5 text-[10px]"
                  >
                    Bandcamp
                  </a>
                ) : (
                  <span className="flex-1 text-center btn-ghost py-1.5 text-[10px]">
                    Bandcamp
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
