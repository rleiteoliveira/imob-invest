import React, { ReactElement } from 'react'

const TypeCard = ({
  icon: Icon,
  label,
  active,
  onClick,
  color
}: {
  icon: any
  label: string
  active: boolean
  onClick: () => void
  color: string
}): ReactElement => {
  const colors: Record<string, string> = {
    orange: 'border-orange-500 bg-orange-50 text-orange-700',
    blue: 'border-blue-500 bg-blue-50 text-blue-700',
    purple: 'border-purple-500 bg-purple-50 text-purple-700',
    gray: 'border-gray-200 hover:border-gray-300 text-gray-600'
  }
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-2 md:p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 md:gap-3 text-center h-24 md:h-28 justify-center shadow-sm hover:shadow-md ${active ? colors[color] : colors['gray']}`}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] md:text-xs font-bold leading-tight px-1">{label}</span>
    </div>
  )
}

export default TypeCard
