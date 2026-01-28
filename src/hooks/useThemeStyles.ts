import { useTheme } from '../context/ThemeContext'
import { getTheme } from '../config/themes'
import type { ThemeSchema } from '../config/themes'

export const useThemeStyles = (): ThemeSchema => {
  const { theme } = useTheme()
  return getTheme(theme)
}
