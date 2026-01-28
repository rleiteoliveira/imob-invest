import type { ThemeSchema } from '../theme.types'

export const darkTheme: ThemeSchema = {
  name: 'dark',
  colors: {
    primary: '#f8fafc', // Slate-50 (White-ish for high contrast actions)
    secondary: '#334155', // Slate-700
    accent: '#38bdf8', // Sky-400 (Electric Blue pop)
    background: '#09090b', // Zinc-950 (Deep black)
    surface: '#18181b', // Zinc-900
    text: '#f8fafc', // Slate-50
    textMuted: '#94a3b8', // Slate-400
    border: '#27272a', // Zinc-800
    success: '#4ade80', // Green-400 (Neon-ish)
    danger: '#f87171' // Red-400
  },
  components: {
    card: {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      wrapper: "bg-zinc-900 border border-white/10 shadow-lg shadow-black/20 rounded-2xl transition-colors duration-200 hover:bg-zinc-800",
=======
      wrapper: "bg-zinc-900 border border-white/10 shadow-lg shadow-black/40 rounded-2xl transition-all duration-300 hover:bg-zinc-800/40 hover:border-zinc-600 hover:shadow-2xl hover:shadow-black/60",
>>>>>>> Stashed changes
=======
      wrapper: "bg-zinc-900 border border-white/10 shadow-lg shadow-black/40 rounded-2xl transition-all duration-300 hover:bg-zinc-800/40 hover:border-zinc-600 hover:shadow-2xl hover:shadow-black/60",
>>>>>>> Stashed changes
=======
      wrapper: "bg-zinc-900 border border-white/10 shadow-lg shadow-black/40 rounded-2xl transition-all duration-300 hover:bg-zinc-800/40 hover:border-zinc-600 hover:shadow-2xl hover:shadow-black/60",
>>>>>>> Stashed changes
      header: "border-b border-white/5 p-6 flex items-center justify-between",
      content: "p-6",
      iconWrapper: "bg-zinc-800 text-zinc-400",
      title: "text-lg font-bold text-white tracking-tight",
      subtitle: "text-xs font-medium text-gray-400 uppercase tracking-widest"
    },
    input: {
      wrapper: "relative group",
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      field: "w-full pl-3 pr-4 py-2 bg-zinc-950 border border-white/10 rounded-xl focus:border-zinc-700 focus:bg-zinc-900 outline-none transition-colors duration-200 placeholder:text-gray-600 text-gray-200 shadow-inner",
=======
      field: "w-full pl-3 pr-4 py-2 bg-zinc-950 border border-white/10 rounded-xl focus:border-zinc-500 focus:bg-zinc-900/80 outline-none transition-colors duration-200 placeholder:text-gray-600 text-gray-200 shadow-inner",
>>>>>>> Stashed changes
=======
      field: "w-full pl-3 pr-4 py-2 bg-zinc-950 border border-white/10 rounded-xl focus:border-zinc-500 focus:bg-zinc-900/80 outline-none transition-colors duration-200 placeholder:text-gray-600 text-gray-200 shadow-inner",
>>>>>>> Stashed changes
=======
      field: "w-full pl-3 pr-4 py-2 bg-zinc-950 border border-white/10 rounded-xl focus:border-zinc-500 focus:bg-zinc-900/80 outline-none transition-colors duration-200 placeholder:text-gray-600 text-gray-200 shadow-inner",
>>>>>>> Stashed changes
      label: "block text-sm font-medium text-gray-400 mb-1.5"
    },
    button: {
      primary: "bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 font-bold rounded-xl shadow-md transition-all active:scale-95",
      secondary: "bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl font-medium transition-colors",
      ghost: "text-zinc-500 hover:text-white font-medium transition-colors hover:bg-white/5 rounded-lg"
    },
    badge: {
      default: "bg-zinc-800 border border-white/10 text-gray-300 px-2 py-1 rounded-md text-xs font-medium",
      success: "bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 px-2 py-1 rounded-md text-xs font-bold",
      warning: "bg-amber-900/30 border border-amber-800/50 text-amber-400 px-2 py-1 rounded-md text-xs font-bold"
    }
  }
}
