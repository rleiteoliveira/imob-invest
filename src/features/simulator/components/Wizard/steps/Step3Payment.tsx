import type { ReactElement } from 'react'
import { useState, useEffect } from 'react'
import type { SimulationScenario, BuilderBalloon, DevelopmentConfig } from '../../../../../types/ScenarioTypes'
import BuilderBalloonModal from '../../UnifiedEditor/BuilderBalloonModal'
import DevelopmentEditorModal from '../../UnifiedEditor/DevelopmentEditorModal'
import ConstructionConfigModal from '../../UnifiedEditor/ConstructionConfigModal'
import { useDevelopments } from '../../../../../hooks/useDevelopments'
import SmartInput from '../../../../../components/ui/SmartInput'
import TimeSliderInput from '../../../../../components/ui/TimeSliderInput'
import ToggleSwitch from '../../../../../components/ui/ToggleSwitch'
import { ChevronDown, Construction, Building2, Edit2 } from 'lucide-react'
import { useThemeStyles } from '../../../../../hooks/useThemeStyles'


interface StepProps {
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function Step3Payment({ data, setData }: StepProps): ReactElement {
  const { colors, components } = useThemeStyles()
  // Remove isRetro, use theme styles instead

  const [showBalloonModal, setShowBalloonModal] = useState(false)
  const [showConstructionModal, setShowConstructionModal] = useState(false)

  // Development Mode State
  const { developments, saveDevelopment } = useDevelopments()
  const [showDevModal, setShowDevModal] = useState(false)
  const [editingDev, setEditingDev] = useState<DevelopmentConfig | null>(null)

  const selectedDev = data.developmentId ? developments.find(d => d.id === data.developmentId) : null

  const handleSelectDevelopment = (devId: string) => {
    if (!devId) {
      setData({ ...data, developmentId: undefined, name: undefined }) // Reset to custom
      return
    }
    const dev = developments.find(d => d.id === devId)
    if (dev) {
      applyDevelopmentToData(dev)
    }
  }

  const applyDevelopmentToData = (dev: DevelopmentConfig) => {
    setData({
      ...data,
      developmentId: dev.id,
      // name: dev.name, // Keeping scenario name independent? Or sync? Let's NOT sync scenario name to keep it flexible
      constructionStatus: dev.constructionStatus,
      monthsUntilConstructionStart: dev.monthsUntilConstructionStart,
      constructionDuration: dev.constructionDuration,
      constructionTime: dev.constructionTime,
      currentWorkPercent: dev.currentWorkPercent,
      inccRate: dev.inccRate,
      useWorkEvolution: dev.useWorkEvolution,
      appreciationRate: dev.appreciationRate
    })
  }

  const handleSaveDev = (dev: DevelopmentConfig) => {
    saveDevelopment(dev)
    applyDevelopmentToData(dev)
    setShowDevModal(false)
  }

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

  // Calculate outstanding balance for entry installments
  const signalTmp = Number(data.entrySignal) || 0
  const fgtsTmp = data.useFGTS ? (Number(data.fgtsValue) || 0) : 0
  const outstandingEntryBalance = Math.max(0, downPayment - signalTmp - fgtsTmp - monthlyBalloonsTotal - balloonsInConstructionValue)



  if (isPreObra) {
    // Fix: Use nullish coalescing to allow 0 if needed (though we might force 1 below)
    const waitTime = Number(data.monthsUntilConstructionStart ?? 0)
    const duration = Number(data.constructionDuration ?? 36)
    monthsToKeys = waitTime + duration
  } else {
    // If EM_ANDAMENTO
    monthsToKeys = Number(data.constructionTime ?? 24)
  }

  // Ensure validity just in case
  if (monthsToKeys < 1 && outstandingEntryBalance > 0) monthsToKeys = 1

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
      <DevelopmentEditorModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        initialData={editingDev}
        onSave={handleSaveDev}
      />

      <ConstructionConfigModal
        isOpen={showConstructionModal}
        onClose={() => setShowConstructionModal(false)}
        data={data}
        setData={setData}
      />

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
          <div className={`p-6 space-y-6 ${components.card.wrapper}`}>
            <div className="flex items-center gap-2 mb-4">
              <Construction size={20} style={{ color: '#f97316' }} />
              <h3 className="font-bold" style={{ color: colors.text }}>Fluxo de Pagamento na Obra</h3>
            </div>

            {/* Unified Construction Summary Card */}
            <div className={`rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 transition-all ${components.card.wrapper}`} style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className={`p-2 rounded-lg shadow-sm shrink-0`} style={{ backgroundColor: colors.surface === '#18181b' ? 'rgba(249, 115, 22, 0.1)' : '#fff7ed', color: '#f97316' }}>
                  <Building2 size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: colors.textMuted }}>
                    Empreendimento / Obra
                  </p>

                  {/* Integrated Combobox */}
                  <div className="relative inline-block w-full md:w-64">
                    <select
                      value={data.developmentId || ''}
                      onChange={(e) => handleSelectDevelopment(e.target.value)}
                      className={`w-full appearance-none font-bold py-1.5 pl-3 pr-8 rounded-lg outline-none cursor-pointer shadow-sm text-sm`}
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    >
                      <option value="">Personalizado</option>
                      {developments.map(dev => (
                        <option key={dev.id} value={dev.id}>{dev.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                  </div>

                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    {data.constructionStatus === 'PRE_OBRA' ? 'Lançamento/Pré-Obra' : 'Em Andamento'} • {data.constructionDuration || 36} meses totais
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <div className="text-right hidden md:block mr-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded border block mb-1`} style={{ backgroundColor: 'transparent', borderColor: colors.border, color: colors.text }}>
                    {data.constructionStatus === 'PRE_OBRA'
                      ? `Início em ${data.monthsUntilConstructionStart || 0} m`
                      : `${data.constructionTime} m restantes`
                    }
                  </span>
                </div>

                {/* Actions Area */}
                <div className="flex gap-1">
                  {selectedDev ? (
                    <button
                      onClick={() => { setEditingDev(selectedDev); setShowDevModal(true); }}
                      className={`p-2 border rounded-lg transition-all shadow-sm ${components.button.secondary}`}
                      title="Editar Empreendimento"
                    >
                      <Edit2 size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        // Open modal to CREATE NEW, pre-filling with current construction data
                        setEditingDev({
                          id: '',
                          name: '',
                          constructionStatus: data.constructionStatus || 'EM_ANDAMENTO',
                          constructionDuration: Number(data.constructionDuration) || 36,
                          monthsUntilConstructionStart: Number(data.monthsUntilConstructionStart) || 0,
                          constructionTime: Number(data.constructionTime) || 24,
                          currentWorkPercent: Number(data.currentWorkPercent) || 0,
                          inccRate: Number(data.inccRate) || 0.2,
                          useWorkEvolution: !!data.useWorkEvolution,
                          appreciationRate: Number(data.appreciationRate) || 10
                        });
                        setShowDevModal(true);
                      }}
                      className={`p-2 border rounded-lg transition-all shadow-sm ${components.button.secondary}`}
                      title="Salvar como Novo Empreendimento"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}

                </div>
              </div>
            </div>
            {/* End Status da Obra / Summary */}

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

                <div className={`p-3 rounded-xl border transition-all ${components.card.wrapper}`} style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase" style={{ color: colors.textMuted }}>Utilizar FGTS?</span>
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
              <div className={`space-y-2 transition-opacity ${outstandingEntryBalance <= 0 ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <TimeSliderInput
                  label="Parcelamento da Entrada"
                  subLabel={outstandingEntryBalance <= 0
                    ? 'Entrada 100% Paga no Ato'
                    : `Parcela: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyInstallment)}`
                  }
                  value={outstandingEntryBalance <= 0 ? 0 : (data.entryInstallments || 12)}
                  onChange={(v) => setData({ ...data, entryInstallments: v })}
                  max={monthsToKeys}
                  min={outstandingEntryBalance > 0 ? 1 : 0}
                  disabled={outstandingEntryBalance <= 0}
                />
                <span className="text-[10px] font-medium ml-2" style={{ color: colors.textMuted }}>
                  {outstandingEntryBalance > 0 ? `Sugestão: até ${monthsToKeys} meses` : 'Nenhum valor restante para parcelar.'}
                </span>
              </div>
            </div>

            {/* Configure Balloons Button */}
            <div
              onClick={() => setShowBalloonModal(true)}
              className={`cursor-pointer rounded-xl p-4 flex items-center justify-between transition-all hover:scale-[1.01] ${components.card.wrapper}`}
              style={{ borderColor: colors.border }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold`} style={{ backgroundColor: colors.surface === '#09090b' ? `${colors.primary}20` : `${colors.primary}20`, color: colors.primary }}>
                  {data.builderBalloons?.length || 0}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: colors.text }}>Intercaladas (Balões)</p>
                  <p className="text-xs" style={{ color: colors.textMuted }}>Configurar pagamentos anuais/semestrais</p>
                </div>
              </div>
              <div className="font-bold" style={{ color: colors.text }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyBalloonsTotal)}
              </div>
            </div>

          </div>
        )}
      </div>
    </div >
  )
}
