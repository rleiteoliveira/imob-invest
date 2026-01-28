import type { ThemeSchema } from '../theme.types'

export const defaultTheme: ThemeSchema = {
  name: 'default',
  colors: {
    primary: '#2563eb', // blue-600
    secondary: '#0f172a', // slate-900
    accent: '#0ea5e9', // sky-500
    background: '#f8fafc', // slate-50
    surface: '#ffffff',
    text: '#1e293b', // slate-800
    textMuted: '#64748b', // slate-500
    border: '#e2e8f0', // slate-200
    success: '#10b981', // emerald-500
    danger: '#ef4444' // red-500
  },
  components: {
    card: {
      wrapper: "bg-white border border-gray-200 shadow-sm rounded-xl transition-all hover:shadow-md",
      header: "border-b border-gray-100 p-6 flex items-center justify-between",
      content: "p-6",
      iconWrapper: "bg-gray-100 text-gray-600",
      title: "text-lg font-bold text-gray-800",
      subtitle: "text-sm text-gray-500"
    },
    input: {
      wrapper: "relative",
      field: "w-full pl-3 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900",
      label: "block text-sm font-medium text-gray-700 mb-1.5"
    },
    button: {
      primary: "bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95",
      secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all",
      ghost: "text-gray-500 hover:text-gray-800 font-medium transition-colors"
    },
    badge: {
      default: "bg-gray-100 text-gray-600 px-2 py-1 rounded-[6px] text-xs font-medium",
      success: "bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-[6px] text-xs font-medium",
      warning: "bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-[6px] text-xs font-medium"
    }
  }
}
