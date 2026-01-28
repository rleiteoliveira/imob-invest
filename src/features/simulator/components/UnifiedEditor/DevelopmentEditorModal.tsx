import { useState, useEffect } from 'react'
import { X, Save, Building2, TrendingUp, Construction } from 'lucide-react'
import { useThemeStyles } from '../../../../hooks/useThemeStyles'
import type { DevelopmentConfig } from '../../../../types/ScenarioTypes'
import SmartInput from '../../../../components/ui/SmartInput'
import TimeSliderInput from '../../../../components/ui/TimeSliderInput'
import PercentageInput from '../../../../components/ui/PercentageInput'
import ToggleSwitch from '../../../../components/ui/ToggleSwitch'

interface DevelopmentEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (dev: DevelopmentConfig) => void
  initialData?: DevelopmentConfig | null
}

const DEFAULT_DEV: DevelopmentConfig = {
  id: '',
  name: '',
  constructionStatus: 'EM_ANDAMENTO',
  monthsUntilConstructionStart: 0,
  constructionDuration: 36,
  constructionTime: 24,
  currentWorkPercent: 0,
  inccRate: '',
  useWorkEvolution: true,
  appreciationRate: ''
}

export default function DevelopmentEditorModal({ isOpen, onClose, onSave, initialData }: DevelopmentEditorModalProps) {
  const { colors, components } = useThemeStyles()

  const [data, setData] = useState<DevelopmentConfig>(DEFAULT_DEV)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {

        setData(initialData)
      } else {
        // Generate new ID only if we don't have one or are resetting

        setData({ ...DEFAULT_DEV, id: crypto.randomUUID() })
      }
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  // Helper logic for construction time
  const isPreObra = data.constructionStatus === 'PRE_OBRA'

  const handleSave = () => {
    if (!data.name) {
      alert('Por favor, dê um nome ao empreendimento.')
      return
    }
    onSave(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${components.card.wrapper}`}>

        {/* Header */}
        <div className={`flex items-center justify-between ${components.card.header}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Editor de Empreendimento</h2>
              <p className="text-sm" style={{ color: colors.textMuted }}>Configure os padrões da obra</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${components.button.ghost}`}>
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Name Input */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: colors.text }}>Nome do Empreendimento</label>
            <input
              type="text"
              className={components.input.field}
              placeholder="Ex: Reserva das Flores"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              autoFocus
            />
          </div>

          {/* Construction Status Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2 mb-4" style={{ borderColor: colors.border }}>
              <Construction size={18} style={{ color: '#f97316' }} />
              <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors.textMuted }}>Status da Obra</h3>
            </div>

            <div className="flex p-1 rounded-lg mb-4 gap-2" style={{ backgroundColor: colors.surface }}>
              <button
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${(!data.constructionStatus || data.constructionStatus === 'EM_ANDAMENTO') ? components.button.primary : 'text-gray-400 hover:text-gray-500'}`}
                style={(!data.constructionStatus || data.constructionStatus === 'EM_ANDAMENTO') ? {} : { color: colors.textMuted }}
                onClick={() => setData({ ...data, constructionStatus: 'EM_ANDAMENTO' })}
              >
                Em Andamento / Iniciada
              </button>
              <button
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${data.constructionStatus === 'PRE_OBRA' ? components.button.primary : 'text-gray-400 hover:text-gray-500'}`}
                style={data.constructionStatus === 'PRE_OBRA' ? {} : { color: colors.textMuted }}
                onClick={() => setData({ ...data, constructionStatus: 'PRE_OBRA' })}
              >
                Lançamento (Pré-Obra)
              </button>
            </div>

            {/* Logic copied from Step3Payment */}
            {isPreObra ? (
              <div className="grid grid-cols-2 gap-4">
                <TimeSliderInput
                  label="Espera (Pré-Obra)"
                  value={Number(data.monthsUntilConstructionStart ?? 0)}
                  onChange={(v) => {
                    const duration = Number(data.constructionDuration) || 0
                    setData({
                      ...data,
                      monthsUntilConstructionStart: v,
                      constructionTime: v + duration
                    })
                  }}
                  max={60}
                />
                <TimeSliderInput
                  label="Duração da Obra"
                  value={Number(data.constructionDuration ?? 36)}
                  onChange={(v) => {
                    const start = Number(data.monthsUntilConstructionStart) || 0
                    setData({
                      ...data,
                      constructionDuration: v,
                      constructionTime: start + v
                    })
                  }}
                  max={100}
                  min={1}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TimeSliderInput
                  label="Tempo Restante de Obra"
                  value={Number(data.constructionTime ?? 24)}
                  onChange={(v) => setData({ ...data, constructionTime: v })}
                  max={100}
                  min={1}
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

          {/* Advanced Settings Section (INCC, Appreciation, etc) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2 mb-4" style={{ borderColor: colors.border }}>
              <TrendingUp size={18} style={{ color: colors.accent || '#8b5cf6' }} />
              <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors.textMuted }}>Configurações Financeiras da Obra</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* INCC */}
              <div className="space-y-3">
                <label className="text-sm font-bold" style={{ color: colors.text }}>Correção INCC (% a.m.)</label>
                <SmartInput
                  value={data.inccRate ?? ''}
                  onChange={(v) => setData({ ...data, inccRate: v })}
                  prefix="%"
                  allowFloat
                  disableSlider
                  placeholder="0.00"
                />
              </div>

              {/* Evolution */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold" style={{ color: colors.text }}>Juros de Obra</label>
                  <ToggleSwitch
                    checked={!!data.useWorkEvolution}
                    onChange={(v) => setData({ ...data, useWorkEvolution: v })}
                  />
                </div>
                <p className="text-xs text-gray-500">Cobrança gradual de juros conforme evolução.</p>
              </div>

              {/* Appreciation */}
              <div className="space-y-3">
                <label className="text-sm font-bold" style={{ color: colors.text }}>Valorização (% a.a.)</label>
                <SmartInput
                  value={data.appreciationRate ?? ''}
                  onChange={(v) => setData({ ...data, appreciationRate: v })}
                  prefix="%"
                  allowFloat
                  disableSlider
                />
              </div>
            </div>
          </div>

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
            Salvar Empreendimento
          </button>
        </div>
      </div>
    </div>
  )
}
