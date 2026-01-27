import type { ReactElement } from 'react'
import { useState } from 'react'
import type { SimulationScenario } from '../../../../types/ScenarioTypes'
import ProposalConfigModal from '../../UnifiedEditor/ProposalConfigModal'
import SmartInput from '../../../ui/SmartInput'
import TimeSliderInput from '../../../ui/TimeSliderInput'
import ToggleSwitch from '../../../ui/ToggleSwitch'
import { Settings2, Banknote } from 'lucide-react'

interface StepProps {
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function Step4Financing({ data, setData }: StepProps): ReactElement {
  const [showProposalModal, setShowProposalModal] = useState(false)

  const isConstruction = data.type === 'MCMV' || data.type === 'DIRETO'

  return (
    <div className="h-full animate-in fade-in slide-in-from-right-4 duration-300 pb-20">

      <ProposalConfigModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        data={data}
        setData={setData}
      />

      <div className="space-y-8">
        {/* READY / BANK MAIN SETTINGS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Banknote className="text-blue-500" size={20} />
              <h3 className="font-bold text-gray-800">Financiamento Bancário</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] md:text-xs text-gray-500 font-medium text-right leading-tight">
                Simulação Aprovada<br />(Inserir parcela fixa)
              </span>
              <ToggleSwitch
                checked={!!data.useExternalSimulation}
                onChange={(v) => setData({ ...data, useExternalSimulation: v })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.useExternalSimulation ? (
              <div className="animate-in fade-in slide-in-from-left-2">
                <SmartInput
                  label="Valor da 1ª Parcela"
                  prefix="R$"
                  value={data.externalInstallmentValue ?? ''}
                  onChange={(v) => setData({ ...data, externalInstallmentValue: v })}
                  subtitle="Valor fixo inicial"
                />
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sistema de Amortização</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${data.amortizationSystem === 'PRICE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setData({ ...data, amortizationSystem: 'PRICE' })}>PRICE</button>
                  <button className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${data.amortizationSystem === 'SAC' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setData({ ...data, amortizationSystem: 'SAC' })}>SAC</button>
                </div>
              </div>
            )}

            <div>
              <TimeSliderInput
                label="Prazo do Financiamento"
                value={data.termMonths || 360}
                onChange={(v) => setData({ ...data, termMonths: v })}
                max={420}
                subLabel={`${((data.termMonths || 360) / 12).toFixed(1)} Anos`}
              />
            </div>
          </div>
        </div>

        {/* CONFIGURAÇÕES DE CÁLCULO / PROPOSTA (Simplified Button) */}
        {!data.useExternalSimulation && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                <Settings2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Personalização da Proposta</h3>
                <p className="text-xs text-gray-500">
                  {isConstruction ? 'INCC, Evolução de Obra, Taxas e Seguros' : 'Taxas Bancárias e Valorização'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowProposalModal(true)}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs transition-colors"
            >
              Configurar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
