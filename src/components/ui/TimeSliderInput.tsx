import type { ReactElement } from 'react'
import { useState, useEffect } from 'react'
import * as Slider from '@radix-ui/react-slider'

interface TimeSliderInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  subLabel?: string
  max?: number
  min?: number
}

const TimeSliderInput = ({
  value,
  onChange,
  label,
  subLabel,
  max = 100,
  min = 0,
}: TimeSliderInputProps): ReactElement => {
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
      // Usually it's better to clamp on blur. But let's follow the simple "free edit" request.
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
      {/* Header / Input Area */}
      <div className="flex flex-col gap-1 relative z-0">
        {label && (
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
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
            className="text-2xl font-bold text-gray-900 bg-transparent outline-none w-full placeholder-gray-300"
            placeholder="0"
          />
          {subLabel && (
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              {subLabel}
            </span>
          )}
        </div>
      </div>

      {/* Slider Area */}
      <div className="relative flex items-center w-full h-6 touch-none select-none">
        <Slider.Root
          className="relative flex items-center w-full h-5 cursor-pointer"
          value={sliderValue}
          max={safeMax}
          min={min}
          step={1}
          onValueChange={(val) => {
            onChange(val[0])
            setInputValue(val[0].toString())
          }}
        >
          <Slider.Track className="bg-gray-100 relative grow rounded-full h-2 overflow-hidden">
            <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-blue-600 shadow-md rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-transform"
            aria-label={label}
          />
        </Slider.Root>
      </div>

      {/* Footer Labels */}
      <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1 mt-[-8px]">
        <span>{min}</span>
        <span>{safeMax}</span>
      </div>
    </div>
  )
}

export default TimeSliderInput
