import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  currency?: boolean
  className?: string
}

export default function AnimatedNumber({ value, currency = true, className = '' }: AnimatedNumberProps) {
  /* Optimized for ~0.2s duration (Snappy/Real-time feel) */
  const spring = useSpring(value, { mass: 0.5, stiffness: 250, damping: 25 })
  const displayValue = useTransform(spring, (current) => {
    if (currency) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(current)
    }
    return Math.round(current).toString()
  })

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return <motion.span className={className}>{displayValue}</motion.span>
}
