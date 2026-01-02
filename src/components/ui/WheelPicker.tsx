
import { useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { EmblaCarouselType } from 'embla-carousel'
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

  useEffect(() => {
    if (!emblaApi) return

    const onScroll = () => {
      // We can iterate slides
      emblaApi.slideNodes().forEach((slide) => {
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
