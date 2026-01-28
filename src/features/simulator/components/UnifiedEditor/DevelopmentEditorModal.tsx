import { useState, useEffect } from 'react'
import { X, Save, Building2, TrendingUp, Construction } from 'lucide-react'
import { useTheme } from '../../../../context/ThemeContext'
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
  const { theme } = useTheme()
  const isRetro = theme === 'premium'

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
      <div className={`w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${isRetro ? 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]' : 'bg-white shadow-2xl'}`}>

        {/* Header */}
        <div className={`flex items-center justify-between p-6 ${isRetro ? 'bg-[#18181b] text-white border-b-4 border-black' : 'border-b border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isRetro ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-blue-100 text-blue-600'}`}>
              <Building2 size={24} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isRetro ? 'text-white' : 'text-gray-800'}`}>Editor de Empreendimento</h2>
              <p className={`text-sm ${isRetro ? 'text-gray-400' : 'text-gray-500'}`}>Configure os padrões da obra</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isRetro ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}>
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Name Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Empreendimento</label>
            <input
              type="text"
              className={`w-full p-3 rounded-xl outline-none transition-all font-medium placeholder:text-gray-400 ${isRetro ? 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_0px_#000]' : 'bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800'}`}
              placeholder="Ex: Reserva das Flores"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              autoFocus
            />
          </div>

          {/* Construction Status Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
              <Construction className={isRetro ? 'text-yellow-600' : 'text-orange-500'} size={18} />
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Status da Obra</h3>
            </div>

            <div className={`flex p-1 rounded-lg mb-4 ${isRetro ? 'bg-white border-2 border-black gap-2 p-2' : 'bg-gray-100'}`}>
              <button
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${(!data.constructionStatus || data.constructionStatus === 'EM_ANDAMENTO') ? (isRetro ? 'bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-gray-900 shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setData({ ...data, constructionStatus: 'EM_ANDAMENTO' })}
              >
                Em Andamento / Iniciada
              </button>
              <button
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${data.constructionStatus === 'PRE_OBRA' ? (isRetro ? 'bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-gray-900 shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
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
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
              <TrendingUp className={isRetro ? 'text-purple-600' : 'text-purple-500'} size={18} />
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Configurações Financeiras da Obra</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* INCC */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Correção INCC (% a.m.)</label>
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
                  <label className="text-sm font-bold text-gray-700">Juros de Obra</label>
                  <ToggleSwitch
                    checked={!!data.useWorkEvolution}
                    onChange={(v) => setData({ ...data, useWorkEvolution: v })}
                  />
                </div>
                <p className="text-xs text-gray-500">Cobrança gradual de juros conforme evolução.</p>
              </div>

              {/* Appreciation */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Valorização (% a.a.)</label>
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
        <div className={`p-6 bg-gray-50 flex justify-end gap-3 rounded-b-2xl ${isRetro ? 'border-t-2 border-black' : 'border-t border-gray-100'}`}>
          <button
            onClick={onClose}
            className={`px-6 py-3 font-bold transition-colors ${isRetro ? 'text-black hover:text-red-600 uppercase tracking-widest' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${isRetro ? 'bg-green-500 hover:bg-green-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000]' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'}`}
          >
            <Save size={18} />
            Salvar Empreendimento
          </button>
        </div>
      </div>
    </div>
  )
}
