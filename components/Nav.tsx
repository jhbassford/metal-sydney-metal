'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Gig Guide', href: '/gig-guide' },
  { label: 'Bands', href: '/bands' },
  { label: 'Music', href: '/music' },
  {
    label: 'Merch',
    href: 'https://metalsydneymetal.bandcamp.com/merch',
    external: true,
  },
  { label: 'Feed', href: '/feed' },
  { label: 'Venues', href: '/venues' },
  { label: 'Nightbreed', href: 'http://www.nightbreed.live', external: true },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-surface border-b border-gray-800 sticky top-0 z-50">
      {/* Logo row */}
      <div className="border-b border-gray-900">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Logo — centered on desktop, left on mobile */}
          <Link
            href="/"
            className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-white hover:text-accent transition-colors tracking-widest uppercase w-full text-center hidden lg:block"
          >
            metal sydney metal
          </Link>
          <Link
            href="/"
            className="font-heading text-lg font-bold text-white hover:text-accent transition-colors tracking-widest uppercase lg:hidden"
          >
            Metal Sydney Metal
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden text-gray-400 hover:text-white p-2 -mr-2 shrink-0"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            <div className={`w-6 h-0.5 bg-current transition-all duration-200 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <div className={`w-6 h-0.5 bg-current transition-all duration-200 my-1.5 ${open ? 'opacity-0' : ''}`} />
            <div className={`w-6 h-0.5 bg-current transition-all duration-200 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Desktop links row */}
      <div className="hidden lg:flex items-center justify-center gap-1 px-4 h-10">
        {navLinks.map((link) =>
          link.external ? (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white hover:bg-accent text-[11px] font-heading uppercase tracking-wider transition-colors px-3 py-1"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              href={link.href}
              className={`text-[11px] font-heading uppercase tracking-wider transition-colors px-3 py-1 ${
                pathname === link.href
                  ? 'bg-accent text-white'
                  : 'text-gray-400 hover:text-white hover:bg-accent'
              }`}
            >
              {link.label}
            </Link>
          )
        )}
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-surface border-t border-gray-800 px-4 py-4 flex flex-col gap-0">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent text-sm font-heading uppercase tracking-wider transition-colors py-3 border-b border-gray-900"
                onClick={() => setOpen(false)}
              >
                {link.label} ↗
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-heading uppercase tracking-wider transition-colors py-3 border-b border-gray-900 ${
                  pathname === link.href
                    ? 'text-accent'
                    : 'text-gray-400 hover:text-accent'
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  )
}
