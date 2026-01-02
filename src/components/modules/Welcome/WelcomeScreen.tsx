import type { ReactElement } from 'react'
import { Building2, ArrowRight } from 'lucide-react'

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps): ReactElement {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center transform transition-all hover:scale-[1.01] duration-300 border border-gray-100">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform duration-300">
          <Building2 size={40} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Financiamento Pro
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          Simule, compare e planeje seu financiamento imobiliário com precisão e facilidade.
        </p>

        <button
          onClick={onStart}
          className="group w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Iniciar Simulação
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-xs text-center text-gray-400 font-medium">
            Desenvolvido para investidores inteligentes
          </p>
        </div>
      </div>
    </div>
  )
}
