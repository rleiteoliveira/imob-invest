import type { ThemeSchema } from './theme.types'
import { defaultTheme } from './variants/default'
import { retroTheme } from './variants/retro'
import { darkTheme } from './variants/dark'

export type { ThemeSchema } from './theme.types'

// Atualize o tipo para refletir as chaves reais
// Nota: 'premium' é o nome legado para o Retro. 'dark' é o novo.
export type ThemeKey = 'default' | 'premium' | 'dark'

export const themeRegistry: Record<string, ThemeSchema> = {
  default: defaultTheme,
  premium: retroTheme,
  dark: darkTheme
}

export const getTheme = (key: string): ThemeSchema => {
  return themeRegistry[key] || themeRegistry.default
}

