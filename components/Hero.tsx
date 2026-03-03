interface HeroProps {
  children?: React.ReactNode
  imagePath?: string
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
      {/* Background image or gradient */}
      {imagePath ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imagePath})` }}
        />
      ) : (
        /* Dark atmospheric gradient — replace with real image by passing imagePath */
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#0d0d0d] to-[#0a0a0a]">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,0,0,0.15)_0%,_transparent_60%)]" />
        </div>
      )}

      {/* Dark overlay (for image readability) */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 py-20 max-w-4xl mx-auto w-full">
        {children}
      </div>
    </div>
  )
}
