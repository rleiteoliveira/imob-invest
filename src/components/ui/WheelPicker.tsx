
import React, { useCallback, useEffect, useRef, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { EmblaCarouselType } from 'embla-carousel'
import clsx from 'clsx'

interface WheelPickerProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  label?: string
  className?: string
}

export default function WheelPicker({
  value,
  onChange,
  min,
  max,
  label,
  className,
}: WheelPickerProps) {
  // Generate numbers array
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  // Find initial index from value
  const initialIndex = Math.max(0, numbers.indexOf(value) !== -1 ? numbers.indexOf(value) : 0)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    dragFree: false, // Snap to items
    containScroll: false, // Allow centering of first/last items with padding
    align: 'center',
    startIndex: initialIndex,
    loop: false,
  })

  // State to force re-render for visual updates if needed, 
  // though we'll try to use direct DOM manipulation for performance if possible,
  // or simply rely on React state if the list isn't huge.
  // For iOS feel, we usually manipulate style directly on scroll.
  const [isScrolling, setScrolling] = useState(false)

  // Update external value when selection changes
  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    const selectedIndex = emblaApi.selectedScrollSnap()
    const newValue = numbers[selectedIndex]
    if (newValue !== value) {
      onChange(newValue)
    }
  }, [numbers, value, onChange])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('scroll', () => {
      // Optional: Add haptic feedback logic here if using a native wrapper
      // functionality for 3D effect is handled in separate effect
    })

    // Sync external value changes (e.g. initial load or reset)
    const currentIndex = emblaApi.selectedScrollSnap()
    const targetIndex = numbers.indexOf(value)
    if (targetIndex !== -1 && targetIndex !== currentIndex) {
      emblaApi.scrollTo(targetIndex)
    }

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect, value, numbers])

  // 3D Effect / Opacity Logic
  // We reference the slide nodes to apply styles based on distance from center
  const updateVisuals = useCallback(() => {
    if (!emblaApi) return

    const engine = emblaApi.internalEngine()
    const scrollProgress = emblaApi.scrollProgress()
    const slidesInView = emblaApi.slidesInView()
    const { scrollSnaps } = emblaApi.scrollSnapList()

    emblaApi.slideNodes().forEach((slideNode, index) => {
      const target = emblaApi.scrollSnapList()[index]

      // Calculate distance from current scroll position
      // This is a simplified "distance from center" logic for y-axis
      // We need to know where the slide is relative to the center of the viewport

      // Get the slide's location relative to scroll
      // Embla's location logic is a bit internal, but we can approximate:
      // Distance = |scrollPosition - slidePosition|

      // Correct approach using engine location:
      let diff = target - scrollProgress

      // Handle loop logic if we were looping, but we aren't.

      // Normalize diff approximately. 
      // 1 unit of scrollProgress might be full length or something.
      // Let's use getScrollLocation logic?

      // Simpler approach for React:
      // Compare index with selectedIndex? No, that's not smooth.

      // Let's rely on standard CSS masking for the "easy" win first
      // and basic class switching for the "selected" item if we want simplicity.
      // But the user asked for "Opacidade reduzida e escala menor (efeito 3D)" for numbers above/below.

      // We'll trust a simpler CSS class based approach for the 'selected' item for now 
      // to avoid complex 'scroll' event paint thrashing without more boilerplate.
      // However, we can use `emblaApi.on('scroll')` to set a `data-distance` attribute?
    })
  }, [emblaApi])

  // Setup loop for animation frame if we want smooth 3D
  // For this task, let's achieve the look with:
  // 1. Center highlight (masking + border)
  // 2. CSS-based Opacity on non-selected items? (Only works if we update classes on scroll)
  // 3. To make it truly smooth like iOS, we need the scroll listener.

  const rootNodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!emblaApi) return

    const onScroll = () => {
      const { scrollBody, location } = emblaApi.internalEngine()
      // This is getting deep into Embla internals which might break on v8
      // Let's try a simpler 'distance' check using standard API

      const center = emblaApi.scrollProgress()
      // We can iterate slides
      emblaApi.slideNodes().forEach((slide, index) => {
        const slideLocation = emblaApi.scrollSnapList()[index]
        // This assumes scrollProgress is 0..1 for the whole track? 
        // Embla v8 'scrollProgress' is indeed 0..1 (or more if unconstrained).

        // But for calculating visual scale, we need distance in "slides".
        // Let's assume uniform slide height.
        // It is easier to just calculate offset from center of container.

        const slideRect = slide.getBoundingClientRect()
        const rootRect = emblaApi.rootNode().getBoundingClientRect()
        const rootCenter = rootRect.top + rootRect.height / 2
        const slideCenter = slideRect.top + slideRect.height / 2

        const dist = Math.abs(rootCenter - slideCenter)
        const normalizeDist = Math.min(dist / (rootRect.height / 2), 1) // 0 (center) to 1 (edge)

        // Visual Tweaks
        const scale = 1 - (normalizeDist * 0.3) // 1 at center, 0.7 at edge
        const opacity = 1 - (normalizeDist * 0.7) // 1 at center, 0.3 at edge
        const rotateX = (slideCenter - rootCenter) / 5 // Tilt effect (degrees)

        slide.style.transform = `scale(${scale}) rotateX(${-rotateX}deg)`
        slide.style.opacity = `${opacity}`
        slide.style.zIndex = `${Math.round((1 - normalizeDist) * 10)}`
        // We can color the text too?
      })
    }

    emblaApi.on('scroll', onScroll)
    emblaApi.on('reInit', onScroll)
    onScroll() // Initial call

    return () => {
      emblaApi.off('scroll', onScroll)
      emblaApi.off('reInit', onScroll)
    }
  }, [emblaApi])


  return (
    <div className={clsx("relative flex flex-col items-center justify-center", className)}>
      {label && <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{label}</div>}

      <div className="relative h-[150px] w-full max-w-[120px] overflow-hidden rounded-xl bg-gray-900/5 dark:bg-black/20 select-none touch-none">
        {/* Selection Indicator / Highlight */}
        <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[32px] bg-gray-200/20 dark:bg-white/10 border-y border-gray-300/30 dark:border-white/20 z-0" />

        {/* Gradients for Masking */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white dark:from-gray-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-gray-950 to-transparent z-10" />

        <div className="h-full" ref={emblaRef}>
          <div className="h-full flex flex-col items-center" style={{ perspective: '500px' }}>
            {/* Padding to allow first item to be in center. 
                 Container height 150. Item height ~32. 
                 Center is 75px. Item half is 16. 
                 Top space needed = 75 - 16 = 59px. 
                 We can add empty slides or padding/margin. 
                 Embla 'container' usually wraps slides. 
                 Better to use 'inset' logic or just CSS padding on the container div inside emblaRef.
             */}
            <div className="flex-none h-[59px]" />

            {numbers.map((num) => (
              <div
                key={num}
                className="flex-none h-[32px] w-full flex items-center justify-center text-sm transition-colors duration-100 will-change-transform"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className={clsx("font-semibold",
                  // Dynamic coloring is handled by opacity style, but we can add base colors
                  "text-gray-900 dark:text-white"
                )}>
                  {num}
                </span>
              </div>
            ))}

            <div className="flex-none h-[59px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
