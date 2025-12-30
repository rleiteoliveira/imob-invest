import type { ReactElement } from 'react'
import { useState, useEffect } from 'react'
import type { SimulationScenario, BuilderBalloon } from '../../../../types/ScenarioTypes'
import BuilderBalloonModal from '../../UnifiedEditor/BuilderBalloonModal'
import SmartInput from '../../../ui/SmartInput'
import SmartTimeInput from '../../../ui/SmartTimeInput'
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

  // Calculate 'monthsToKeys' (Total time user has to pay entry installments)
  const isPreObra = data.constructionStatus === 'PRE_OBRA'
  let monthsToKeys = 0

  if (isPreObra) {
    monthsToKeys = (Number(data.monthsUntilConstructionStart) || 0) + (Number(data.constructionDuration) || 0)
  } else {
    // If EM_ANDAMENTO, constructionTime is already the "time remaining"
    monthsToKeys = Number(data.constructionTime) || 1
  }

  // Ensure validity just in case
  if (monthsToKeys < 1) monthsToKeys = 1

  // Effect to ensure installments don't exceed time to keys
  useEffect(() => {
    const currentInstallments = Number(data.entryInstallments) || 0
    if (currentInstallments > monthsToKeys) {
      setData({ ...data, entryInstallments: monthsToKeys })
    }
  }, [monthsToKeys, data.entryInstallments])

  // Calculate monthly installment base
  const entrySignal = Number(data.entrySignal) || 0
  // use constrained value for display calc immediately if needed, though effect will fix it next render
  const safeInstallments = Math.min((Number(data.entryInstallments) || 1), monthsToKeys)

  const entryBalance = Math.max(0, downPayment - entrySignal - monthlyBalloonsTotal - balloonsInConstructionValue)
  const monthlyInstallment = entryBalance / safeInstallments

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

              {/* Smart Time Input for Installments */}
              <div className="space-y-2">
                <SmartTimeInput
                  label="Parcelamento da Entrada"
                  subLabel={`Parcela: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyInstallment)}`}
                  value={data.entryInstallments || 12}
                  onChange={(v) => setData({ ...data, entryInstallments: v })}
                  presets={[12, 24, 30, 36, 48].filter(x => x <= monthsToKeys)}
                  max={monthsToKeys}
                />
                <span className="text-[10px] text-gray-400 font-medium ml-2">
                  Máximo: {monthsToKeys} meses (até Chaves)
                </span>
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
              <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
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
              {/* Construction Duration Inputs */}
              {data.constructionStatus === 'PRE_OBRA' ? (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <SmartTimeInput
                      label="Espera (Pré-Obra)"
                      value={data.monthsUntilConstructionStart || 0}
                      onChange={(v) => {
                        const duration = Number(data.constructionDuration) || 0
                        setData({
                          ...data,
                          monthsUntilConstructionStart: v,
                          constructionTime: v + duration
                        })
                      }}
                      presets={[6, 12, 18, 24]}
                      max={60}
                    />
                  </div>
                  <div>
                    <SmartTimeInput
                      label="Duração da Obra"
                      value={data.constructionDuration || 36}
                      onChange={(v) => {
                        const start = Number(data.monthsUntilConstructionStart) || 0
                        setData({
                          ...data,
                          constructionDuration: v,
                          constructionTime: start + v
                        })
                      }}
                      presets={[12, 24, 36]}
                      max={60}
                    />
                  </div>
                </div>
              ) : (
                /* If construction is ongoing, we usually just need Remaining Time (constructionTime) */
                <div className="animate-in fade-in slide-in-from-top-2">
                  <SmartTimeInput
                    label="Tempo Restante de Obra"
                    value={data.constructionTime || 24}
                    onChange={(v) => setData({ ...data, constructionTime: v })}
                    presets={[6, 12, 18, 24, 30, 36]}
                    max={60}
                  />
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
              <SmartTimeInput
                label="Prazo do Financiamento"
                value={data.termMonths || 360}
                onChange={(v) => setData({ ...data, termMonths: v })}
                presets={[120, 240, 360, 420]}
                max={420}
                step={12}
                subLabel={`${(data.termMonths || 360) / 12} Anos`}
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
              <SmartInput label="Taxa de Juros (% a.a)" value={data.interestRate ?? ''} onChange={(v) => setData({ ...data, interestRate: v })} prefix="%" allowFloat subtitle="Nominal" disableSlider />

              {isConstruction && (
                <SmartInput label="INCC (% a.m)" value={data.inccRate ?? ''} onChange={(v) => setData({ ...data, inccRate: v })} prefix="%" allowFloat subtitle="Correção Obra" disableSlider />
              )}

              <SmartInput label="Taxa Adm. Mensal" value={data.monthlyAdminFee ?? ''} onChange={(v) => setData({ ...data, monthlyAdminFee: v })} prefix="R$" disableSlider />
              <SmartInput label="Seguro MIP" value={data.insuranceMIP ?? ''} onChange={(v) => setData({ ...data, insuranceMIP: v })} prefix="R$" disableSlider />
              <SmartInput label="Seguro DFI" value={data.insuranceDFI ?? ''} onChange={(v) => setData({ ...data, insuranceDFI: v })} prefix="R$" disableSlider />

              <SmartInput label="Taxa de Valorização (% a.a)" value={data.appreciationRate ?? ''} onChange={(v) => setData({ ...data, appreciationRate: v })} prefix="%" allowFloat disableSlider />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
