import { useState, useEffect } from 'react'
import type { GlobalSettings } from '../types/SettingsTypes'
import { DEFAULT_GLOBAL_SETTINGS } from '../types/SettingsTypes'

const STORAGE_KEY = 'imob-invest-global-settings-v1'

export function useGlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_GLOBAL_SETTINGS
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return { ...DEFAULT_GLOBAL_SETTINGS, ...parsed }
      } catch (e) {
        console.error('Failed to parse global settings', e)
        return DEFAULT_GLOBAL_SETTINGS
      }
    }
    return DEFAULT_GLOBAL_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_GLOBAL_SETTINGS)
  }

  return {
    settings,
    updateSettings,
    resetSettings
  }
}
