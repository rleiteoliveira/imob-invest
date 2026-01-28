import type { ThemeSchema } from '../theme.types'

export const retroTheme: ThemeSchema = {
  name: 'premium',
  colors: {
    primary: '#8b5cf6', // Violet
    secondary: '#f472b6', // Pink
    accent: '#facc15', // Yellow
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    textMuted: '#525252',
    border: '#000000',
    success: '#10b981',
    danger: '#ef4444'
  },
  components: {
    card: {
      wrapper: "bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000]",
      header: "bg-[#18181b] text-white border-b-2 border-black p-6 flex items-center justify-between",
      content: "p-6",
      title: "text-lg font-black uppercase tracking-wide text-black", // If header is dark, user must override or context aware. For general cards, title is black.
      subtitle: "text-xs font-bold uppercase tracking-widest text-gray-500"
    },
    input: {
      wrapper: "relative",
      field: "w-full pl-3 pr-4 py-2 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_#000] focus:shadow-[6px_6px_0px_0px_#000] focus:translate-y-[-2px] outline-none transition-all placeholder:text-gray-300 font-bold text-black",
      label: "block text-[10px] font-bold uppercase tracking-widest text-black mb-1"
    },
    button: {
      primary: "bg-green-500 hover:bg-green-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] font-black rounded-xl transition-all active:translate-y-0 active:shadow-none",
      secondary: "bg-white hover:bg-gray-50 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] font-bold rounded-xl transition-all",
      ghost: "text-black font-extrabold uppercase hover:text-red-600 tracking-widest transition-colors"
    },
    badge: {
      default: "bg-gray-100 border-2 border-black text-black font-bold px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_#000] text-[10px] uppercase",
      success: "bg-green-400 border-2 border-black text-black font-bold px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_#000] text-[10px] uppercase",
      warning: "bg-yellow-400 border-2 border-black text-black font-bold px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_#000] text-[10px] uppercase"
    }
  }
}
