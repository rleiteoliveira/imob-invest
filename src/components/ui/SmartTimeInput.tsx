import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

interface SmartTimeInputProps {
  value: number
  onChange: (val: number) => void
  label: string
  subLabel?: string
  presets?: number[]
  min?: number
  max?: number
  step?: number
}

const SmartTimeInput = ({
  value,
  onChange,
  label,
  subLabel,
  presets = [],
  min = 1,
  max = 420,
  step = 1
}: SmartTimeInputProps): ReactElement => {
  const [inputValue, setInputValue] = useState(value?.toString() || '')

  useEffect(() => {
    if (value !== undefined && value.toString() !== inputValue) {
      setInputValue(value.toString())
    }
  }, [value, inputValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    // Allow empty string for typing
    if (rawVal === '') {
      setInputValue('')
      return
    }

    // Only numbers
    const num = parseInt(rawVal.replace(/\D/g, ''))
    if (!isNaN(num)) {
      setInputValue(num.toString())
      // Only propagate change if within reasonable bounds (or accept standard)
      // We allow typing intermediate values, but onChange might check validity or just pass through
      if (num <= max) {
        onChange(num)
      }
    }
  }

  const handleBlur = () => {
    let num = parseInt(inputValue)
    if (isNaN(num)) num = min
    if (num < min) num = min
    if (num > max) num = max

    setInputValue(num.toString())
    onChange(num)
  }

  const increment = () => {
    const current = parseInt(inputValue) || 0
    const next = Math.min(current + step, max)
    setInputValue(next.toString())
    onChange(next)
  }

  const decrement = () => {
    const current = parseInt(inputValue) || 0
    const next = Math.max(current - step, min)
    setInputValue(next.toString())
    onChange(next)
  }

  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center space-y-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
      <div className="text-center">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</label>
        {subLabel && <p className="text-[10px] text-gray-400 mt-1">{subLabel}</p>}
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={decrement}
          tabIndex={-1}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 shadow-sm active:scale-95 transition-all"
        >
          <Minus size={20} strokeWidth={3} />
        </button>

        <div className="relative w-24 md:w-32">
          <input
            type="text"
            className="w-full text-center text-4xl font-bold bg-transparent text-gray-800 placeholder-gray-300 focus:outline-none focus:text-blue-600 transition-colors"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') { e.preventDefault(); increment(); }
              if (e.key === 'ArrowDown') { e.preventDefault(); decrement(); }
            }}
          />
          <span className="absolute -right-2 top-2 text-xs font-bold text-gray-400 pointer-events-none">meses</span>
        </div>

        <button
          onClick={increment}
          tabIndex={-1}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 shadow-sm active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 w-full">
          {presets.map(months => (
            <button
              key={months}
              onClick={() => {
                setInputValue(months.toString())
                onChange(months)
              }}
              className={`
                    px-3 py-1 text-xs font-bold rounded-full border transition-all
                    ${value === months
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-105'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                }
                 `}
            >
              {months}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SmartTimeInput
