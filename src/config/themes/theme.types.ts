export interface ComponentStyle {
  container?: string
  wrapper?: string
  header?: string
  content?: string
  footer?: string
  iconWrapper?: string
  title?: string
  subtitle?: string
}

export interface InputStyle {
  wrapper: string
  field: string
  label: string
  // Optional specific states if needed, but wrapper/field often cover classes
  active?: string
  error?: string
}

export interface ButtonStyle {
  primary: string
  secondary: string
  ghost: string
  icon?: string
}

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
  success: string
  danger: string
}

export interface ThemeSchema {
  name: string
  colors: ThemeColors
  components: {
    card: ComponentStyle
    input: InputStyle
    button: ButtonStyle
    badge: {
      default: string
      success: string
      warning: string
    }
  }
}
