import { useState } from 'react'
import type { ReactElement, ChangeEvent, FocusEvent } from 'react'

const formatFinal = (val: number) => {
  if (val === undefined || val === null) return ''
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val)
}

const CurrencyInput = ({
  label,
  value,
  onChange,
  prefix,
  subtitle,
  highlight,
  readOnly,
  className,
  inputClassName,
  placeholder
}: {
  label?: string
  value: number | ''
  onChange: (v: number) => void
  prefix?: string
  subtitle?: string
  highlight?: string
  readOnly?: boolean
  className?: string
  inputClassName?: string
  placeholder?: string
}): ReactElement => {
  const [displayValue, setDisplayValue] = useState(() => (value === 0 || value === '') ? '0,00' : formatFinal(value as number))
  const [active, setActive] = useState(false)
  const [prevValue, setPrevValue] = useState(value)

  if (value !== prevValue && !active) {
    setPrevValue(value)
    setDisplayValue(value === 0 || value === '' ? '0,00' : formatFinal(value as number))
  }

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    if (readOnly) return
    setActive(true)
    // Ao focar, se for 0,00 limpa para facilitar digitação
    if (displayValue === '0,00') {
      setDisplayValue('')
    } else {
      e.target.select()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return
    const val = e.target.value
    if (val === '') {
      setDisplayValue('')
      return
    }
    const onlyNumsAndComma = val.replace(/[^0-9,]/g, '')
    const parts = onlyNumsAndComma.split(',')
    if (parts.length > 2) return
    let integerPart = parts[0]
    if (integerPart.length > 1 && integerPart.startsWith('0')) {
      integerPart = integerPart.replace(/^0+/, '')
    }
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    let newDisplay = formattedInteger
    if (parts.length > 1) {
      newDisplay += ',' + parts[1].slice(0, 2)
    } else if (val.includes(',')) {
      newDisplay += ','
    }
    setDisplayValue(newDisplay)
  }

  const handleBlur = () => {
    setActive(false)
    if (displayValue === '' || displayValue === ',') {
      onChange(0)
      setDisplayValue('0,00')
      return
    }
    const raw = displayValue.replace(/\./g, '').replace(',', '.')
    let num = parseFloat(raw)
    if (isNaN(num)) num = 0
    onChange(num)
    setDisplayValue(formatFinal(num))
  }

  return (
    <div className="flex-1 w-full">
      {label && (
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex justify-between">
          {label}{' '}
          {highlight && (
            <span className="text-blue-600 bg-blue-50 px-1.5 rounded text-[10px]">{highlight}</span>
          )}
        </label>
      )}
      <div
        className={`relative flex items-center border rounded-xl transition-all ${readOnly ? 'bg-gray-100 border-gray-200' : active ? 'bg-white border-blue-500 ring-2 ring-blue-100' : 'bg-white border-gray-300 hover:border-gray-400'} ${className}`}
      >
        {prefix && (
          <span className="pl-3 text-gray-400 font-bold text-sm select-none">{prefix}</span>
        )}
        <input
          type="text"
          disabled={readOnly}
          className={`w-full pl-2 pr-3 outline-none font-bold bg-transparent ${readOnly ? 'text-gray-500 cursor-not-allowed' : 'text-gray-900'} ${inputClassName || 'py-3 text-xl'}`}
          value={displayValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder || "0,00"}
          inputMode="numeric"
        />
      </div>
      {subtitle && <p className="text-[10px] text-gray-400 mt-1 ml-1">{subtitle}</p>}
    </div>
  )
}

export default CurrencyInput
