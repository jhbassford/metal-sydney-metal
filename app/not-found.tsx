import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-8xl font-bold text-accent">404</p>
      <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-widest mt-4">
        Page Not Found
      </h1>
      <p className="text-gray-500 mt-4 mb-8">This page has been lost in the pit.</p>
      <Link href="/" className="btn-accent">
        Back to Home
      </Link>
    </div>
  )
}
