interface HeroProps {
  children?: React.ReactNode
  imagePath?: string | null
  fullHeight?: boolean
  minHeight?: string
}

export default function Hero({
  children,
  imagePath,
  fullHeight = false,
  minHeight,
}: HeroProps) {
  const heightClass = fullHeight
    ? 'min-h-screen'
    : minHeight
    ? minHeight
    : 'min-h-[380px] md:min-h-[480px]'

  return (
    <div className={`relative w-full ${heightClass} flex items-center justify-center overflow-hidden`}>
      {/* Background */}
      {imagePath !== null ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${imagePath ?? '/images/hero-bg.jpg'})` }}
          />
          <div className="absolute inset-0 bg-black/65" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      )}

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 py-20 max-w-4xl mx-auto w-full">
        {children}
      </div>
    </div>
  )
}
