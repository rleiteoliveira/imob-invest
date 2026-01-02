import type { ReactElement } from 'react'
import { useState, useEffect } from 'react'
import * as Slider from '@radix-ui/react-slider'

interface PercentageInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
}

const PercentageInput = ({
  value,
  onChange,
  label = 'Percentual',
}: PercentageInputProps): ReactElement => {
  // Ensure value is within [0, 100]
  const [inputValue, setInputValue] = useState<string>(value.toString())

  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    if (newVal === '') {
      setInputValue('')
      return
    }
    // Only allow numbers
    if (!/^\d*$/.test(newVal)) return

    const num = parseInt(newVal, 10)
    if (!isNaN(num)) {
      if (num > 100) {
        onChange(100)
        setInputValue('100')
      } else {
        onChange(num)
        setInputValue(newVal)
      }
    }
  }

  const handleBlur = () => {
    let num = parseInt(inputValue, 10)
    if (isNaN(num)) num = 0
    if (num < 0) num = 0
    if (num > 100) num = 100
    setInputValue(num.toString())
    onChange(num)
  }

  const presets = [0, 25, 50, 75, 90]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm group hover:border-blue-300 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </label>
        <div className="flex items-baseline text-blue-600">
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="text-3xl font-black bg-transparent outline-none w-[60px] text-right placeholder-gray-300"
            placeholder="0"
          />
          <span className="text-lg font-bold ml-0.5">%</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative flex items-center w-full h-8 touch-none select-none">
        <Slider.Root
          className="relative flex items-center w-full h-5 cursor-pointer"
          value={[value]}
          max={100}
          step={1}
          onValueChange={(val) => {
            onChange(val[0])
            setInputValue(val[0].toString())
          }}
        >
          <Slider.Track className="bg-gray-100 relative grow rounded-full h-3 overflow-hidden">
            <Slider.Range className="absolute bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-6 h-6 bg-white border-2 border-blue-600 shadow-md rounded-full hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-transform"
            aria-label={label}
          />
        </Slider.Root>
      </div>

      {/* Quick Presets */}
      <div className="flex justify-between gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              onChange(preset)
              setInputValue(preset.toString())
            }}
            className={`
              flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all border
              ${value === preset
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100 hover:border-gray-300'}
            `}
          >
            {preset}%
          </button>
        ))}
      </div>
    </div>
  )
}

export default PercentageInput
