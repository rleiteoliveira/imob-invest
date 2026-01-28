import React from 'react'
import { Palette } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="fixed top-6 right-6 z-[100] flex items-center gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/90 backdrop-blur-md shadow-xl rounded-full px-4 py-2 flex items-center gap-3 border border-white/50"
          >
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Tema
            </span>
            <button
              onClick={() => {
                if (theme !== 'default') setTheme('default')
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${theme === 'default'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Padrão
            </button>
            <button
              onClick={() => {
                if (theme !== 'premium') setTheme('premium')
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${theme === 'premium'
                ? 'bg-violet-500 text-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Retrô
            </button>
            <button
              onClick={() => {
                if (theme !== 'dark') setTheme('dark')
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${theme === 'dark'
                ? 'bg-[#18181b] text-white border border-white/20 shadow-lg'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Dark
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${theme === 'premium'
          ? 'bg-yellow-400 text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
          : 'bg-white text-gray-700 shadow-gray-200'
          }`}
      >
        <Palette size={20} />
      </button>
    </div>
  )
}
