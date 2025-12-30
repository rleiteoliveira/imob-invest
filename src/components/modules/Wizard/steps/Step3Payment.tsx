import type { ReactElement } from 'react'
import { useState } from 'react'
import type { SimulationScenario, BuilderBalloon } from '../../../../types/ScenarioTypes'
import BuilderBalloonModal from '../../UnifiedEditor/BuilderBalloonModal'
import SmartInput from '../../../ui/SmartInput'
import NumberInput from '../../../ui/NumberInput'
import { Settings, ChevronDown, ChevronUp, Construction, Banknote } from 'lucide-react'

interface StepProps {
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function Step3Payment({ data, setData }: StepProps): ReactElement {
  const [showBalloonModal, setShowBalloonModal] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const isConstruction = data.type === 'MCMV' || data.type === 'DIRETO'

  // Calculations for display
  const downPayment = Number(data.downPayment) || 0
  const monthlyBalloonsTotal = (data.builderBalloons || []).reduce((acc: number, cur: BuilderBalloon) => acc + cur.value, 0)

  // Logic from UnifiedEditor (simplified)
  const constructionMonths = Number(data.constructionTime) || 36
  const balloonVal = Number(data.balloonValue) || 0
  let balloonsInConstructionValue = 0
  // Simplified logic for display purposes in subtitle:
  if (data.hasBalloonPayments && data.balloonFrequency === 'UNICA' && Number(data.balloonStartMonth) <= constructionMonths && Number(data.balloonStartMonth) > 0) {
    balloonsInConstructionValue = balloonVal
  }

  // Calculate monthly installment base
  const entrySignal = Number(data.entrySignal) || 0
  const monthlyInstallmentsValue = (Number(data.entryInstallments) || 1)
  const entryBalance = Math.max(0, downPayment - entrySignal - monthlyBalloonsTotal - balloonsInConstructionValue)
  const monthlyInstallment = entryBalance / monthlyInstallmentsValue

  return (
    <div className="h-full animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
      <BuilderBalloonModal
        isOpen={showBalloonModal}
        onClose={() => setShowBalloonModal(false)}
        balloons={data.builderBalloons || []}
        constructionTime={data.constructionTime || 36}
        onSave={(newBalloons: BuilderBalloon[]) => {
          setData({ ...data, builderBalloons: newBalloons })
          setShowBalloonModal(false)
        }}
      />

      <div className="space-y-8">

        {/* CONSTRUCTION PHASE INPUTS */}
        {isConstruction && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
              <Construction className="text-orange-500" size={20} />
              <h3 className="font-bold text-gray-800">Fluxo de Pagamento na Obra</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SmartInput
                label="Sinal (Ato)"
                prefix="R$"
                value={data.entrySignal ?? ''}
                onChange={(v) => setData({ ...data, entrySignal: v })}
                max={downPayment}
                subtitle="Pago na assinatura"
              />

              {/* Parcelas Mensais */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Parcelamento da Entrada</label>
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <NumberInput
                      className="w-full p-3 border border-gray-200 rounded-xl font-bold text-center"
                      value={data.entryInstallments ?? ''}
                      onChange={(v) => setData({ ...data, entryInstallments: v })}
                    />
                    <span className="text-[10px] text-gray-400 font-bold uppercase block text-center mt-1">Meses</span>
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                    <span className="font-bold text-gray-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyInstallment)} / mês
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configure Balloons Button */}
            <div
              onClick={() => setShowBalloonModal(true)}
              className="cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 border-dashed rounded-xl p-4 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">
                  {data.builderBalloons?.length || 0}
                </div>
                <div>
                  <p className="font-bold text-blue-900 text-sm">Intercaladas (Balões)</p>
                  <p className="text-xs text-blue-600">Configurar pagamentos anuais/semestrais</p>
                </div>
              </div>
              <div className="font-bold text-blue-800">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyBalloonsTotal)}
              </div>
            </div>

            {/* Status da Obra Selection */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Status da Obra</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${(!data.constructionStatus || data.constructionStatus === 'EM_ANDAMENTO') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setData({ ...data, constructionStatus: 'EM_ANDAMENTO' })}
                >
                  Em Andamento / Iniciada
                </button>
                <button
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${data.constructionStatus === 'PRE_OBRA' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setData({ ...data, constructionStatus: 'PRE_OBRA' })}
                >
                  Lançamento (Pré-Obra)
                </button>
              </div>
              {data.constructionStatus === 'PRE_OBRA' && (
                <div className="mt-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Meses para Início</label>
                    <NumberInput className="w-full p-2 border border-gray-200 rounded-lg" value={data.monthsUntilConstructionStart ?? ''} onChange={(v) => setData({ ...data, monthsUntilConstructionStart: v })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Duração da Obra</label>
                    <NumberInput className="w-full p-2 border border-gray-200 rounded-lg" value={data.constructionDuration ?? ''} onChange={(v) => setData({ ...data, constructionDuration: v, constructionTime: (Number(data.monthsUntilConstructionStart) || 0) + Number(v) })} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* READY / BANK MAIN SETTINGS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Banknote className="text-blue-500" size={20} />
            <h3 className="font-bold text-gray-800">Financiamento Bancário</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sistema de Amortização</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${data.amortizationSystem === 'PRICE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setData({ ...data, amortizationSystem: 'PRICE' })}>PRICE</button>
                <button className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${data.amortizationSystem === 'SAC' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setData({ ...data, amortizationSystem: 'SAC' })}>SAC</button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Prazo (Meses)</label>
              <NumberInput
                className="w-full p-3 border border-gray-200 rounded-xl font-bold bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-100"
                value={data.termMonths ?? ''}
                onChange={(v) => setData({ ...data, termMonths: v })}
              />
            </div>
          </div>
        </div>

        {/* ADVANCED SETTINGS ACCORDION */}
        <div className="border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
              <Settings size={18} className="text-gray-400" />
              Configurações Avançadas (Taxas e Seguros)
            </div>
            {showAdvanced ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          {showAdvanced && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
              <SmartInput label="Taxa de Juros (% a.a)" value={data.interestRate ?? ''} onChange={(v) => setData({ ...data, interestRate: v })} prefix="%" allowFloat subtitle="Nominal" />

              {isConstruction && (
                <SmartInput label="INCC (% a.m)" value={data.inccRate ?? ''} onChange={(v) => setData({ ...data, inccRate: v })} prefix="%" allowFloat subtitle="Correção Obra" />
              )}

              <SmartInput label="Taxa Adm. Mensal" value={data.monthlyAdminFee ?? ''} onChange={(v) => setData({ ...data, monthlyAdminFee: v })} prefix="R$" max={100} sliderStep={5} />
              <SmartInput label="Seguro MIP" value={data.insuranceMIP ?? ''} onChange={(v) => setData({ ...data, insuranceMIP: v })} prefix="R$" max={200} sliderStep={5} />
              <SmartInput label="Seguro DFI" value={data.insuranceDFI ?? ''} onChange={(v) => setData({ ...data, insuranceDFI: v })} prefix="R$" max={200} sliderStep={5} />

              <SmartInput label="Taxa de Valorização (% a.a)" value={data.appreciationRate ?? ''} onChange={(v) => setData({ ...data, appreciationRate: v })} prefix="%" allowFloat />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
