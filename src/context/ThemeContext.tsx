import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ThemeKey } from '../config/themes'

type Theme = ThemeKey

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('imob-invest-theme')
    return (saved as Theme) || 'default'
  })

  useEffect(() => {
    localStorage.setItem('imob-invest-theme', theme)
    // Update the data-theme attribute on the document root
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'default') return 'premium'
      if (prev === 'premium') return 'dark'
      return 'default'
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
