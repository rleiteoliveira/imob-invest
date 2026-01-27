import { useState } from 'react'
import type { DevelopmentConfig } from '../types/ScenarioTypes'

const STORAGE_KEY = 'imob-invest-developments-v1'

export function useDevelopments() {
  const [developments, setDevelopments] = useState<DevelopmentConfig[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse developments', e)
        return []
      }
    }
    return []
  })

  const saveDevelopment = (dev: DevelopmentConfig) => {
    setDevelopments(prev => {
      const idx = prev.findIndex(d => d.id === dev.id)
      let newDevs
      if (idx >= 0) {
        newDevs = [...prev]
        newDevs[idx] = dev
      } else {
        newDevs = [...prev, dev]
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDevs))
      return newDevs
    })
  }

  const deleteDevelopment = (id: string) => {
    setDevelopments(prev => {
      const newDevs = prev.filter(d => d.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDevs))
      return newDevs
    })
  }

  return {
    developments,
    saveDevelopment,
    deleteDevelopment
  }
}
