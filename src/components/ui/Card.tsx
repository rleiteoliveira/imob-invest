import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export default function Card({ children, className = '', noPadding = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm ${!noPadding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
