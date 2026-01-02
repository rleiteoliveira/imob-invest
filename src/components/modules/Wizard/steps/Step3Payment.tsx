import type { ReactElement } from 'react'
import { useState, useEffect } from 'react'
import type { SimulationScenario, BuilderBalloon } from '../../../../types/ScenarioTypes'
import BuilderBalloonModal from '../../UnifiedEditor/BuilderBalloonModal'
import SmartInput from '../../../ui/SmartInput'
import TimeSliderInput from '../../../ui/TimeSliderInput'
import PercentageInput from '../../../ui/PercentageInput'
import ToggleSwitch from '../../../ui/ToggleSwitch'
import { Settings, ChevronDown, ChevronUp, Construction, Banknote, TrendingUp } from 'lucide-react'

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
    // Fix: Ensure we use the default duration (36) if not set, preventing it from being 0
    const waitTime = Number(data.monthsUntilConstructionStart) || 0
    const duration = Number(data.constructionDuration) || 36
    monthsToKeys = waitTime + duration
  } else {
    // If EM_ANDAMENTO, constructionTime is already the "time remaining"
    // Fix: Default to 24 if not set (matches default in input)
    monthsToKeys = Number(data.constructionTime) || 24
  }

  // Ensure validity just in case
  if (monthsToKeys < 1) monthsToKeys = 1

  // Effect to ensure installments don't exceed time to keys
  useEffect(() => {
    const currentInstallments = Number(data.entryInstallments) || 0

    // Auto-adjust if exceeding limit
    if (currentInstallments > monthsToKeys) {
      setData({ ...data, entryInstallments: monthsToKeys })
    }
  }, [monthsToKeys, data.entryInstallments, data, setData])

  // Calculate monthly installment base
  const entrySignal = Number(data.entrySignal) || 0
  const fgts = data.useFGTS ? (Number(data.fgtsValue) || 0) : 0

  const entryBalance = Math.max(0, downPayment - entrySignal - fgts - monthlyBalloonsTotal - balloonsInConstructionValue)
  const monthlyInstallment = entryBalance / (Number(data.entryInstallments) || 1)

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
              <div className="space-y-4">
                <SmartInput
                  label="Sinal (Ato)"
                  prefix="R$"
                  value={data.entrySignal ?? ''}
                  onChange={(v) => setData({ ...data, entrySignal: v })}
                  max={downPayment}
                  subtitle="Pago na assinatura"
                />

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Utilizar FGTS?</span>
                    <ToggleSwitch
                      checked={!!data.useFGTS}
                      onChange={(v) => setData({ ...data, useFGTS: v })}
                    />
                  </div>
                  {data.useFGTS && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <SmartInput
                        label="Valor do FGTS"
                        prefix="R$"
                        value={data.fgtsValue ?? ''}
                        onChange={(v) => setData({ ...data, fgtsValue: v })}
                        max={downPayment}
                        subtitle="Entrada (Recurso Próprio)"
                        disableSlider
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Time Slider Input for Installments */}
              <div className="space-y-2">
                <TimeSliderInput
                  label="Parcelamento da Entrada"
                  subLabel={`Parcela: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyInstallment)}`}
                  value={data.entryInstallments || 12}
                  onChange={(v) => setData({ ...data, entryInstallments: v })}
                  max={monthsToKeys}
                />
                <span className="text-[10px] text-gray-400 font-medium ml-2">
                  Sugestão: até {monthsToKeys} meses
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
                    <TimeSliderInput
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
                      max={100}
                    />
                  </div>
                  <div>
                    <TimeSliderInput
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
                      max={100}
                    />
                  </div>
                </div>
              ) : (
                /* If construction is ongoing, we set Remaining Time AND Current Progress */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <TimeSliderInput
                    label="Tempo Restante de Obra"
                    value={data.constructionTime || 24}
                    onChange={(v) => setData({ ...data, constructionTime: v })}
                    max={100}
                    subLabel="meses"
                  />
                  <PercentageInput
                    label="Obra Concluída"
                    value={data.currentWorkPercent || 0}
                    onChange={(v) => setData({ ...data, currentWorkPercent: v })}
                  />
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* CONFIGURAÇÕES DE CÁLCULO / PROPOSTA */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${showAdvanced ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                <Settings size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-sm">Personalização da Proposta</p>
                <p className="text-xs text-gray-500">Ajustes finos de INCC, Evolução de Obra e Taxas</p>
              </div>
            </div>
            {showAdvanced ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>

          {showAdvanced && (
            <div className="p-6 pt-0 border-t border-gray-100 bg-gray-50/30">
              <div className="grid grid-cols-1 gap-8 mt-6">

                {/* 1. SEÇÃO OBRA (INCC e Evolução) */}
                {isConstruction && (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp size={14} /> Correção e Evolução (Obra)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* INCC */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-gray-700">Correção INCC</label>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                            Recais sobre Entrada
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-tight">
                          Define a taxa mensal de reajuste das parcelas pagas diretamente à construtora.
                        </p>
                        <SmartInput
                          value={data.inccRate ?? ''}
                          onChange={(v) => setData({ ...data, inccRate: v })}
                          prefix="%"
                          allowFloat
                          disableSlider
                          placeholder="0.00"
                        />
                      </div>

                      {/* EVOLUÇÃO DE OBRA */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-gray-700">Juros de Obra</label>
                          <ToggleSwitch
                            checked={!!data.useWorkEvolution}
                            onChange={(v) => setData({ ...data, useWorkEvolution: v })}
                          />
                        </div>
                        <p className="text-xs text-gray-500 leading-tight">
                          Simula a cobrança gradual de juros pelo banco conforme a evolução física da obra.
                        </p>
                        <div className={`transition-opacity ${!data.useWorkEvolution ? 'opacity-50 pointer-events-none' : ''}`}>
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-100 p-2 rounded-lg">
                            <span>Status:</span>
                            <span className="text-blue-600 font-bold">
                              {data.useWorkEvolution ? 'Ativo (Cobrança Gradual)' : 'Inativo (Sem Juros Obra)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SEÇÃO BANCO (Taxas e Seguros) */}
                {(!data.useExternalSimulation) && (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Banknote size={14} /> Taxas Bancárias (CET)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <SmartInput label="Juros (% a.a)" value={data.interestRate ?? ''} onChange={(v) => setData({ ...data, interestRate: v })} prefix="%" allowFloat subtitle="Taxa Nominal" disableSlider />
                      <SmartInput label="Taxa Adm. (R$)" value={data.monthlyAdminFee ?? ''} onChange={(v) => setData({ ...data, monthlyAdminFee: v })} prefix="R$" subtitle="Mensal" disableSlider />
                      <div className="space-y-2">
                        <SmartInput label="MIP (R$ est.)" value={data.insuranceMIP ?? ''} onChange={(v) => setData({ ...data, insuranceMIP: v })} prefix="R$" subtitle="Morte/Invalidez" disableSlider />
                        <SmartInput label="DFI (R$ est.)" value={data.insuranceDFI ?? ''} onChange={(v) => setData({ ...data, insuranceDFI: v })} prefix="R$" subtitle="Danos Físicos" disableSlider />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. APPRAISAL */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                  <div className="max-w-[60%]">
                    <h4 className="text-sm font-bold text-gray-800 mb-1">Valorização do Imóvel</h4>
                    <p className="text-xs text-gray-500">Projeção conservadora de valorização anual do ativo.</p>
                  </div>
                  <div className="w-[120px]">
                    <SmartInput value={data.appreciationRate ?? ''} onChange={(v) => setData({ ...data, appreciationRate: v })} prefix="%" allowFloat disableSlider />
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
