import { useEffect, useState } from 'react'
import { X, Save, RotateCcw, Settings2, Banknote, Shield, TrendingUp } from 'lucide-react'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import SmartInput from '../../../components/ui/SmartInput'
import ToggleSwitch from '../../../components/ui/ToggleSwitch'
import { useThemeStyles } from '../../../hooks/useThemeStyles'
import Button from '../../../components/ui/Button'

interface GlobalSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  variant?: 'modal' | 'page'
}

export default function GlobalSettingsModal({ isOpen, onClose, variant = 'modal' }: GlobalSettingsModalProps) {
  const { settings, updateSettings, resetSettings } = useGlobalSettings()
  const [localSettings, setLocalSettings] = useState(settings)
  const { colors } = useThemeStyles()

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

  // Dynamic Styles
  const containerStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text
  }

  const containerClass = isPage
    ? `w-full h-full rounded-2xl shadow-sm flex flex-col border animate-in fade-in duration-300`
    : `w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200`

  const wrapperClass = isPage
    ? "w-full h-full"
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"

  return (
    <div className={wrapperClass}>
      <div className={containerClass} style={containerStyle}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Parâmetros Globais</h2>
              <p className="text-sm" style={{ color: colors.textMuted }}>Defina os valores padrão para novas simulações</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full transition-colors hover:bg-gray-100/10" style={{ color: colors.textMuted }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {/* SECTION 1: BANK */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2 mb-4" style={{ borderColor: colors.border }}>
              <Banknote className="text-blue-500" size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors.textMuted }}>Padrões Bancários</h3>
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
            <div className="flex items-center gap-2 border-b pb-2 mb-4" style={{ borderColor: colors.border }}>
              <Shield className="text-emerald-500" size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors.textMuted }}>Seguros Estimados</h3>
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
            <div className="flex items-center gap-2 border-b pb-2 mb-4" style={{ borderColor: colors.border }}>
              <TrendingUp className="text-purple-500" size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors.textMuted }}>Obra e Valorização</h3>
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
                  <label className="text-sm font-bold" style={{ color: colors.text }}>Juros de Obra (Cobrança)</label>
                  <ToggleSwitch
                    checked={localSettings.useWorkEvolution}
                    onChange={(v) => setLocalSettings({ ...localSettings, useWorkEvolution: v })}
                  />
                </div>
                <p className="text-xs" style={{ color: colors.textMuted }}>Habilitar cobrança gradual de juros por padrão.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between gap-3 rounded-b-2xl" style={{ borderColor: colors.border, backgroundColor: isPage ? 'transparent' : colors.surface }}>
          <Button
            onClick={handleReset}
            variant="ghost"
            className="text-red-400 hover:text-red-500 font-bold gap-2 text-sm"
          >
            <RotateCcw size={16} /> Restaurar Padrões
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              className="gap-2"
            >
              <Save size={18} />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
