import { useState, useEffect } from 'react'
import { X, Save, Settings2, Banknote } from 'lucide-react'
import { useThemeStyles } from '../../../../hooks/useThemeStyles'
import type { SimulationScenario } from '../../../../types/ScenarioTypes'
import SmartInput from '../../../../components/ui/SmartInput'


interface ProposalConfigModalProps {
  isOpen: boolean
  onClose: () => void
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function ProposalConfigModal({ isOpen, onClose, data, setData }: ProposalConfigModalProps) {
  const { colors, components } = useThemeStyles()

  const [localData, setLocalData] = useState<SimulationScenario>(data)

  useEffect(() => {
    if (isOpen) {

      setLocalData(data)
    }
  }, [isOpen, data])

  if (!isOpen) return null

  const handleSave = () => {
    setData(localData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${components.card.wrapper}`}>

        {/* Header */}
        <div className={`flex items-center justify-between ${components.card.header}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Configuração de Taxas e Seguros</h2>
              <p className="text-sm" style={{ color: colors.textMuted }}>Defina os encargos bancários do financiamento</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${components.button.ghost}`}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* 1. SEÇÃO OBRA (INCC e Evolução) - Only if construction */}

          {/* 3. SEÇÃO BANCO (Taxas e Seguros) */}
          {!localData.useExternalSimulation && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 mb-4" style={{ borderColor: colors.border }}>
                <Banknote size={18} style={{ color: colors.primary }} />
                <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors.textMuted }}>Taxas Bancárias (CET)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SmartInput label="Juros (% a.a)" value={localData.interestRate ?? ''} onChange={(v) => setLocalData({ ...localData, interestRate: v })} prefix="%" allowFloat subtitle="Taxa Nominal" disableSlider />
                <SmartInput label="Taxa Adm. (R$)" value={localData.monthlyAdminFee ?? ''} onChange={(v) => setLocalData({ ...localData, monthlyAdminFee: v })} prefix="R$" subtitle="Mensal" disableSlider />
                <SmartInput label="MIP (R$ est.)" value={localData.insuranceMIP ?? ''} onChange={(v) => setLocalData({ ...localData, insuranceMIP: v })} prefix="R$" subtitle="Morte/Invalidez" disableSlider />
                <SmartInput label="DFI (R$ est.)" value={localData.insuranceDFI ?? ''} onChange={(v) => setLocalData({ ...localData, insuranceDFI: v })} prefix="R$" subtitle="Danos Físicos" disableSlider />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-6 flex justify-end gap-3 rounded-b-2xl border-t`} style={{ borderColor: colors.border, backgroundColor: `${colors.surface}` }}>
          <button
            onClick={onClose}
            className={`px-6 py-3 font-bold transition-colors ${components.button.ghost}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-3 flex items-center gap-2 ${components.button.primary}`}
          >
            <Save size={18} />
            Aplicar na Proposta
          </button>
        </div>
      </div>
    </div>
  )
}
