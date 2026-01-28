import React from 'react'
import { Settings, Sparkles } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()
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
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              Design System
            </span>
            <button
              onClick={() => {
                if (theme !== 'default') toggleTheme()
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${theme === 'default'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Pro
            </button>
            <button
              onClick={() => {
                if (theme !== 'premium') toggleTheme()
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${theme === 'premium'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Premium
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${theme === 'premium'
          ? 'bg-indigo-600 text-white shadow-indigo-200'
          : 'bg-white text-gray-700 shadow-gray-200'
          }`}
      >
        {theme === 'premium' ? <Sparkles size={20} /> : <Settings size={20} />}
      </button>
    </div>
  )
}
