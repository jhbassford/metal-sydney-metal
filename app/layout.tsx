import type { Metadata } from 'next'
import { Cinzel, Inter, UnifrakturMaguntia } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '600', '700', '900'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const unifraktur = UnifrakturMaguntia({
  subsets: ['latin'],
  variable: '--font-metal',
  display: 'swap',
  weight: '400',
})

export const metadata: Metadata = {
  title: {
    default: 'Metal Sydney Metal — Sydney Metal Community',
    template: '%s | Metal Sydney Metal',
  },
  description:
    'The homepage of the Sydney metal community. The one-stop place for everything metal, everything Sydney.',
  keywords: ['metal', 'Sydney', 'music', 'gigs', 'bands', 'heavy metal', 'NSW', 'concerts'],
  openGraph: {
    title: 'Metal Sydney Metal',
    description: 'The homepage of the Sydney metal community.',
    type: 'website',
    siteName: 'Metal Sydney Metal',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} ${unifraktur.variable}`}>
      <body className="bg-background text-text-primary font-body min-h-screen flex flex-col antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
