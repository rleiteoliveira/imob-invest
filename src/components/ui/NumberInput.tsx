import React, { useState, useEffect, ReactElement } from 'react'

const NumberInput = ({
  value,
  onChange,
  allowFloat = false, // Define se aceita decimais (Ex: INCC) ou só inteiros (Ex: Prazo)
  min,
  max,
  placeholder,
  className
}: {
  value: number | ''
  onChange: (val: number | '') => void
  allowFloat?: boolean
  min?: number
  max?: number
  placeholder?: string
  className?: string
}): ReactElement => {
  // Estado local string para permitir "0", "0.", "0,4" enquanto digita
  const [localValue, setLocalValue] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)

  // Sincroniza quando o valor externo muda (e o usuário não está digitando)
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value === '' || value === undefined ? '' : String(value))
    }
  }, [value, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value

    // Substitui vírgula por ponto para facilitar a digitação brasileira
    val = val.replace(',', '.')

    // Validação Regex: Permite digitar apenas números e UM ponto
    const regex = allowFloat ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/

    if (val === '' || regex.test(val)) {
      setLocalValue(val)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)

    if (localValue === '' || localValue === '.') {
      onChange('') // Se deixou vazio ou só um ponto, salva vazio
      setLocalValue('')
      return
    }

    let parsed = parseFloat(localValue)

    if (isNaN(parsed)) {
      onChange('')
      setLocalValue('')
      return
    }

    // APLICAÇÃO DAS REGRAS DE NEGÓCIO (Forçar valor ao sair)
    if (min !== undefined && parsed < min) parsed = min
    if (max !== undefined && parsed > max) parsed = max

    onChange(parsed)
    setLocalValue(String(parsed)) // Atualiza visualmente para o valor corrigido
  }

  return (
    <input
      type="text"
      inputMode={allowFloat ? "decimal" : "numeric"}
      className={className}
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      onFocus={() => setIsEditing(true)}
      onBlur={handleBlur}
    />
  )
}

export default NumberInput
