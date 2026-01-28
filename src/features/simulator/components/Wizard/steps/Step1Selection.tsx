import { Building2, Home, Key } from 'lucide-react'
import type { SimulationScenario, ScenarioType } from '../../../../../types/ScenarioTypes'
import type { ReactElement } from 'react'
import { useThemeStyles } from '../../../../../hooks/useThemeStyles'

interface StepProps {
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function Step1Selection({ data, setData }: StepProps): ReactElement {
  const { colors, components } = useThemeStyles()

  const handleSelect = (type: ScenarioType) => {
    setData({ ...data, type })
  }

  const options = [
    {
      id: 'MCMV',
      label: 'MCMV / Caixa',
      description: 'Financiamento Bancário padrão. INCC corrige apenas a entrada. Juros de Obra pagos ao banco.',
      icon: Building2,
      activeColor: colors.accent // Accent (Blue) guarantees contrast against dark backgrounds
    },
    {
      id: 'DIRETO',
      label: 'Direto com Incorporadora',
      description: 'INCC corrige tanto a Entrada quanto o Saldo Devedor durante a fase de obra.',
      icon: Key,
      activeColor: '#f97316' // Orange (keep specific semantic or map to secondary?) Let's keep specific for now or use secondary?
    },
    {
      id: 'PRONTO',
      label: 'Imóvel Pronto',
      description: 'Sem fase de obra. Financiamento imediato (SAC/PRICE) com chaves na mão.',
      icon: Home,
      activeColor: '#10b981' // Green
    }
  ]

  // Helper to determine style based on selection
  const getCardStyle = (isSelected: boolean, activeColor: string) => {
    if (isSelected) {
      return {
        borderColor: activeColor,
        backgroundColor: `${activeColor}15`, // 15 = ~8% opacity
        boxShadow: `0 0 0 1px ${activeColor}`
      }
    }
    return {
      // Inherit default card style properties but allow override
      // We rely on className for base card look
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold" style={{ color: colors.text }}>Qual o tipo de negociação?</h2>
        <p className="mt-2" style={{ color: colors.textMuted }}>Escolha o modelo de financiamento para iniciar a simulação.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        {options.map((opt) => {
          const isSelected = data.type === opt.id
          const Icon = opt.icon
          const activeColor = opt.activeColor || colors.primary

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id as ScenarioType)}
              className={`
                relative group flex flex-col p-6 text-left transition-all duration-300 hover:scale-[1.02]
                ${components.card.wrapper}
                ${isSelected ? '' : 'hover:opacity-100'}
              `}
              style={getCardStyle(isSelected, activeColor)}
            >
              <div
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors
                  ${isSelected ? '' : components.card.iconWrapper}
                `}
                style={isSelected ? { backgroundColor: activeColor, color: '#fff' } : {}}
              >
                <Icon size={28} />
              </div>

              <h3 className="text-lg font-bold mb-2" style={{ color: isSelected ? activeColor : colors.text }}>
                {opt.label}
              </h3>

              <p className="text-sm leading-relaxed" style={{ color: isSelected ? activeColor : colors.textMuted, opacity: isSelected ? 1 : 0.8 }}>
                {opt.description}
              </p>

              {isSelected && (
                <div className="absolute top-4 right-4 animate-in fade-in" style={{ color: activeColor }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeColor }} />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
