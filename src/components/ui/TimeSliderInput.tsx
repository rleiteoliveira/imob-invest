import type { ReactElement } from 'react'
import { useState, useEffect } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { useThemeStyles } from '../../hooks/useThemeStyles'

interface TimeSliderInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  subLabel?: string
  max?: number
  min?: number
  disabled?: boolean
}

const TimeSliderInput = ({
  value,
  onChange,
  label,
  subLabel,
  max = 100,
  min = 0,
  disabled = false,
}: TimeSliderInputProps): ReactElement => {
  const { colors, components } = useThemeStyles()
  // Safety checks
  const safeMax = Math.max(max || 100, 1) // Ensure max is never < 1

  // Ensure value is within [0, safeMax]
  // We use local state for the input to allow free typing, but sync with props
  const [inputValue, setInputValue] = useState<string>(value.toString())

  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    // Allow empty string for editing
    if (newVal === '') {
      setInputValue('')
      return
    }

    // Only allow numbers
    if (!/^\d*$/.test(newVal)) return

    setInputValue(newVal)
    const num = parseInt(newVal, 10)
    if (!isNaN(num)) {
      // We allow the user to type typically, clamping happens mostly on blur or we can clamp loosely
      // However, for the slider execution, we need strictly clamped values.
      // The user requested: "Input numérico grande ... permitindo edição livre via teclado."
      // So we should trigger onChange, but maybe clamp logic is needed in parent or here?
      // Let's trigger onChange with the raw number, but component should probably respect limits?
      // We'll update the parent, but validation might be on them or we clamp silently?
      // The slider MUST receive clamped values.
      onChange(num)
    }
  }

  const handleBlur = () => {
    let num = parseInt(inputValue, 10)
    if (isNaN(num)) num = 0
    if (num < min) num = min
    if (num > safeMax) num = safeMax

    setInputValue(num.toString())
    onChange(num)
  }

  // Value for slider needs to be strictly valid
  const sliderValue = [Math.min(Math.max(value || 0, min), safeMax)]

  return (
    <div className={`flex flex-col gap-4 shadow-sm p-4 ${components.card.wrapper}`}>
      {/* Header / Input Area */}
      <div className="flex flex-col gap-1 relative z-0">
        {label && (
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.textMuted }}>
            {label}
          </span>
        )}

        <div className="flex items-baseline gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="text-2xl font-bold bg-transparent outline-none w-full placeholder-gray-500"
            style={{ color: colors.text }}
            placeholder="0"
          />
          {subLabel && (
            <span className="text-xs font-medium whitespace-nowrap" style={{ color: colors.textMuted }}>
              {subLabel}
            </span>
          )}
        </div>
      </div>

      {/* Slider Area */}
      <div className="relative flex items-center w-full h-6 touch-none select-none">
        <Slider.Root
          className={`relative flex items-center w-full h-5 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          value={sliderValue}
          max={safeMax}
          min={min}
          step={1}
          disabled={disabled}
          onValueChange={(val) => {
            if (disabled) return
            onChange(val[0])
            setInputValue(val[0].toString())
          }}
        >
          <Slider.Track className="relative grow rounded-full h-2 overflow-hidden" style={{ backgroundColor: colors.border }}>
            <Slider.Range className="absolute rounded-full h-full" style={{ backgroundColor: colors.primary }} />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 border-2 shadow-md rounded-full hover:scale-110 focus:outline-none focus:ring-2 transition-transform"
            style={{ backgroundColor: colors.surface, borderColor: colors.primary, boxShadow: `0 0 10px ${colors.primary}40` }}
            aria-label={label}
          />
        </Slider.Root>
      </div>

      {/* Footer Labels */}
      <div className="flex justify-between text-[10px] font-bold px-1 mt-[-8px]" style={{ color: colors.textMuted }}>
        <span>{min}</span>
        <span>{safeMax}</span>
      </div>
    </div>
  )
}

export default TimeSliderInput
