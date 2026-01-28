import { useEffect, useState } from 'react'
import { X, Save, RotateCcw, Settings2, Banknote, Shield, TrendingUp } from 'lucide-react'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import SmartInput from '../../../components/ui/SmartInput'
import ToggleSwitch from '../../../components/ui/ToggleSwitch'

interface GlobalSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  variant?: 'modal' | 'page'
}

export default function GlobalSettingsModal({ isOpen, onClose, variant = 'modal' }: GlobalSettingsModalProps) {
  const { settings, updateSettings, resetSettings } = useGlobalSettings()
  // Local state for editing before saving? No, can edit directly or local state then save. 
  // Let's use local state to allow "Cancel".
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    if (isOpen) {


      setLocalSettings(settings)
    }
  }, [isOpen, settings])

  if (!isOpen) return null

  const handleSave = () => {
    updateSettings(localSettings)
    onClose()
  }

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar os padrões originais?')) {
      resetSettings()
      onClose()
    }
  }

  const isPage = variant === 'page'

  const containerClass = isPage
    ? "bg-white w-full h-full rounded-2xl shadow-sm flex flex-col border border-gray-100 animate-in fade-in duration-300"
    : "bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"

  const wrapperClass = isPage
    ? "w-full h-full"
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"

  return (
    <div className={wrapperClass}>
      <div className={containerClass}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Parâmetros Globais</h2>
              <p className="text-sm text-gray-500">Defina os valores padrão para novas simulações</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* SECTION 1: BANK */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
              <Banknote className="text-blue-500" size={18} />
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Padrões Bancários</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SmartInput
                label="Juros Nominais (% a.a.)"
                value={localSettings.interestRate}
                onChange={(v) => setLocalSettings({ ...localSettings, interestRate: v })}
                prefix="%"
                allowFloat
                disableSlider
              />
              <SmartInput
                label="Prazo Padrão (Meses)"
                value={localSettings.termMonths}
                onChange={(v) => setLocalSettings({ ...localSettings, termMonths: v })}
                disableSlider
              />
              <SmartInput
                label="Taxa Administrativa (R$)"
                value={localSettings.monthlyAdminFee}
                onChange={(v) => setLocalSettings({ ...localSettings, monthlyAdminFee: v })}
                prefix="R$"
                disableSlider
              />
            </div>
          </div>

          {/* SECTION 2: INSURANCE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
              <Shield className="text-emerald-500" size={18} />
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Seguros Estimados</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SmartInput
                label="MIP (Morte/Invalidez)"
                value={localSettings.insuranceMIP}
                onChange={(v) => setLocalSettings({ ...localSettings, insuranceMIP: v })}
                prefix="R$"
                disableSlider
              />
              <SmartInput
                label="DFI (Danos Físicos)"
                value={localSettings.insuranceDFI}
                onChange={(v) => setLocalSettings({ ...localSettings, insuranceDFI: v })}
                prefix="R$"
                disableSlider
              />
            </div>
          </div>

          {/* SECTION 3: CONSTRUCTION & APPRECIATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
              <TrendingUp className="text-purple-500" size={18} />
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Obra e Valorização</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SmartInput
                label="INCC (% a.m.)"
                value={localSettings.inccRate}
                onChange={(v) => setLocalSettings({ ...localSettings, inccRate: v })}
                prefix="%"
                allowFloat
                disableSlider
              />
              <SmartInput
                label="Valorização (% a.a.)"
                value={localSettings.appreciationRate}
                onChange={(v) => setLocalSettings({ ...localSettings, appreciationRate: v })}
                prefix="%"
                allowFloat
                disableSlider
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700">Juros de Obra (Cobrança)</label>
                  <ToggleSwitch
                    checked={localSettings.useWorkEvolution}
                    onChange={(v) => setLocalSettings({ ...localSettings, useWorkEvolution: v })}
                  />
                </div>
                <p className="text-xs text-gray-500">Habilitar cobrança gradual de juros por padrão.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between gap-3 rounded-b-2xl">
          <button
            onClick={handleReset}
            className="px-4 py-3 font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-2 text-sm"
          >
            <RotateCcw size={16} /> Restaurar Padrões
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 font-bold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Save size={18} />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
