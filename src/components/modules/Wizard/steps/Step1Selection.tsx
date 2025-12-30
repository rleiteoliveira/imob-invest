import { Building2, Home, Key } from 'lucide-react'
import type { SimulationScenario, ScenarioType } from '../../../../types/ScenarioTypes'
import type { ReactElement } from 'react'

interface StepProps {
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function Step1Selection({ data, setData }: StepProps): ReactElement {
  const handleSelect = (type: ScenarioType) => {
    setData({ ...data, type })
  }

  const options = [
    {
      id: 'MCMV',
      label: 'MCMV / Caixa',
      description: 'Financiamento Bancário padrão. INCC corrige apenas a entrada. Juros de Obra pagos ao banco.',
      icon: Building2,
      color: 'blue'
    },
    {
      id: 'DIRETO',
      label: 'Direto com Incorporadora',
      description: 'INCC corrige tanto a Entrada quanto o Saldo Devedor durante a fase de obra.',
      icon: Key,
      color: 'orange'
    },
    {
      id: 'PRONTO',
      label: 'Imóvel Pronto',
      description: 'Sem fase de obra. Financiamento imediato (SAC/PRICE) com chaves na mão.',
      icon: Home,
      color: 'emerald'
    }
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Qual o tipo de negociação?</h2>
        <p className="text-gray-500 mt-2">Escolha o modelo de financiamento para iniciar a simulação.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        {options.map((opt) => {
          const isSelected = data.type === opt.id
          const Icon = opt.icon

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id as ScenarioType)}
              className={`
                relative group flex flex-col p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-xl
                ${isSelected
                  ? `border-${opt.color}-500 bg-${opt.color}-50 ring-2 ring-${opt.color}-200`
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors
                  ${isSelected ? `bg-${opt.color}-500 text-white` : `bg-gray-100 text-gray-500 group-hover:bg-gray-200`}
                `}
              >
                <Icon size={28} />
              </div>

              <h3 className={`text-lg font-bold mb-2 ${isSelected ? `text-${opt.color}-900` : 'text-gray-900'}`}>
                {opt.label}
              </h3>

              <p className={`text-sm leading-relaxed ${isSelected ? `text-${opt.color}-700` : 'text-gray-500'}`}>
                {opt.description}
              </p>

              {isSelected && (
                <div className={`absolute top-4 right-4 text-${opt.color}-500 animate-in fade-in`}>
                  <div className={`w-3 h-3 rounded-full bg-${opt.color}-500`} />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
