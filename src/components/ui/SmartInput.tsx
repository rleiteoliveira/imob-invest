import type { ReactElement } from 'react'
import * as Slider from '@radix-ui/react-slider'
import CurrencyInput from './CurrencyInput'

interface SmartInputProps {
  label?: string
  value: number | ''
  onChange: (v: number) => void
  min?: number
  max?: number
  prefix?: string
  subtitle?: string
  highlight?: string
  readOnly?: boolean
  sliderStep?: number
  disableSlider?: boolean
  allowFloat?: boolean
  placeholder?: string
}

const SmartInput = ({
  value,
  onChange,
  max,
  min = 0,
  sliderStep = 500,
  disableSlider = false,
  subtitle,
  ...props
}: SmartInputProps): ReactElement => {
  const numericValue = typeof value === 'number' ? value : 0

  // Calculate a reasonable max if not provided
  const effectiveMax = max !== undefined ? max : Math.max(1000000, numericValue * 2)
  const validMax = Math.max(effectiveMax, min + 1)
  const safeValue = Math.min(Math.max(numericValue, min), validMax)

  return (
    <div className="w-full group">
      {/* Pass everything to CurrencyInput EXCEPT subtitle to prevent default rendering */}
      <CurrencyInput value={value} onChange={onChange} {...props} />

      {!props.readOnly && !disableSlider && (
        <div className="relative h-2 w-full px-1 mt-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
            value={[safeValue]}
            max={validMax}
            min={min}
            step={sliderStep}
            onValueChange={(val) => onChange(val[0])}
          >
            <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px] overflow-hidden shadow-sm">
              <Slider.Range className="absolute bg-blue-600/80 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-3.5 h-3.5 bg-white border border-blue-600 shadow-sm rounded-full hover:scale-125 focus:outline-none transition-transform"
              aria-label="Ajustar valor"
            />
          </Slider.Root>
        </div>
      )}

      {/* Render subtitle manually after slider to avoid overlap */}
      {subtitle && (
        <p className={`text-[10px] text-gray-400 ml-1 ${!props.readOnly && !disableSlider ? 'mt-1' : 'mt-1'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SmartInput
