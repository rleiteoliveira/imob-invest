import type { ReactElement } from 'react'
import { Building2, ArrowRight } from 'lucide-react'
import { useThemeStyles } from '../../../../hooks/useThemeStyles'

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps): ReactElement {
  const { colors, components } = useThemeStyles()

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <div className={`max-w-md w-full p-8 md:p-12 text-center transform transition-all hover:scale-[1.01] duration-300 ${components.card.wrapper}`}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform duration-300" style={{ backgroundColor: colors.primary, color: colors.background }}>
          <Building2 size={40} />
        </div>

        <h1 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Imob-Invest</h1>

        <p className="mb-8 leading-relaxed" style={{ color: colors.textMuted }}>
          Simule, compare e planeje seu financiamento imobiliário com precisão e facilidade.
        </p>

        <button
          onClick={onStart}
          className={`w-full py-4 px-6 flex items-center justify-center gap-2 ${components.button.primary}`}
        >
          Iniciar Simulação
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
          <p className="text-xs text-center font-medium" style={{ color: colors.textMuted }}>
            Desenvolvido para investidores inteligentes
          </p>
        </div>
      </div>
    </div>
  )
}
