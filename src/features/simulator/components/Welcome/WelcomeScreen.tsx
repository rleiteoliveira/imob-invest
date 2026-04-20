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
      <div className={`max-w-md w-full p-8 md:p-12 text-center ${components.card.wrapper}`}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6"
          style={{ backgroundColor: colors.primary, color: colors.surface }}
        >
          <Building2 size={32} />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: colors.textMuted }}>
          Planejamento Imobiliário
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3" style={{ color: colors.text }}>
          Imob-Invest
        </h1>

        <p className="mb-8 leading-relaxed text-sm md:text-base" style={{ color: colors.textMuted }}>
          Simule, compare e planeje seu financiamento imobiliário com precisão e facilidade.
        </p>

        <button
          onClick={onStart}
          className={`group w-full py-3.5 px-6 flex items-center justify-center gap-2 ${components.button.primary}`}
        >
          Iniciar Simulação
          <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
          <p className="text-xs font-medium" style={{ color: colors.textMuted }}>
            Desenvolvido para investidores inteligentes
          </p>
        </div>
      </div>
    </div>
  )
}
