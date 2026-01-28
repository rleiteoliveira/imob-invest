import { useState, useEffect } from 'react'
import { X, Save, Building2, TrendingUp, Clock } from 'lucide-react'
import type { SimulationScenario } from '../../../../types/ScenarioTypes'
import SmartInput from '../../../../components/ui/SmartInput'
import ToggleSwitch from '../../../../components/ui/ToggleSwitch'
import TimeSliderInput from '../../../../components/ui/TimeSliderInput'

interface ConstructionConfigModalProps {
  isOpen: boolean
  onClose: () => void
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function ConstructionConfigModal({ isOpen, onClose, data, setData }: ConstructionConfigModalProps) {
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

  const isPreObra = localData.constructionStatus === 'PRE_OBRA'
  const duration = Number(localData.constructionDuration) || 36
  const waitTime = Number(localData.monthsUntilConstructionStart) || 0
  const remainingTime = Number(localData.constructionTime) || 24

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Status e Cronograma da Obra</h2>
              <p className="text-sm text-gray-500">Defina os prazos e índices de correção</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* 1. SELEÇÃO DE STATUS */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">Fase do Empreendimento</label>
            <div className="flex bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
              <button
                className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-md transition-all ${!isPreObra ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setLocalData({ ...localData, constructionStatus: 'EM_ANDAMENTO' })}
              >
                Em Andamento / Iniciada
              </button>
              <button
                className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-md transition-all ${isPreObra ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setLocalData({ ...localData, constructionStatus: 'PRE_OBRA' })}
              >
                Lançamento (Pré-Obra)
              </button>
            </div>
          </div>

          {/* 2. PRAZOS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
              <Clock className="text-orange-500" size={18} />
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Cronograma</h3>
            </div>

            {isPreObra ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeSliderInput
                  label="Espera (Pré-Obra)"
                  value={waitTime}
                  onChange={(v) => {
                    setLocalData({
                      ...localData,
                      monthsUntilConstructionStart: v,
                      constructionTime: v + duration
                    })
                  }}
                  max={60}
                  subLabel="meses"
                />
                <TimeSliderInput
                  label="Duração da Obra"
                  value={duration}
                  onChange={(v) => {
                    setLocalData({
                      ...localData,
                      constructionDuration: v,
                      constructionTime: waitTime + v
                    })
                  }}
                  max={100}
                  subLabel="meses"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeSliderInput
                  label="Tempo Restante de Obra"
                  value={remainingTime}
                  onChange={(v) => {
                    setLocalData({ ...localData, constructionTime: v })
                  }}
                  max={100}
                  subLabel="meses"
                />
                <SmartInput
                  label="Obra Concluída"
                  value={localData.currentWorkPercent || 0}
                  onChange={(v) => setLocalData({ ...localData, currentWorkPercent: v })}
                  prefix="%"
                  disableSlider
                  max={100}
                />
              </div>
            )}
          </div>

          {/* 3. ÍNDICES E EVOLUÇÃO (Trazido para cá para unificar) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
              <TrendingUp className="text-orange-500" size={18} />
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Correção Monetária</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Correção INCC (% a.m.)</label>
                <SmartInput
                  value={localData.inccRate ?? ''}
                  onChange={(v) => setLocalData({ ...localData, inccRate: v })}
                  prefix="%"
                  allowFloat
                  disableSlider
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500">Incide sobre parcelas de obra e saldo devedor.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700">Juros de Obra (Banco)</label>
                  <ToggleSwitch
                    checked={!!localData.useWorkEvolution}
                    onChange={(v) => setLocalData({ ...localData, useWorkEvolution: v })}
                  />
                </div>
                <p className="text-xs text-gray-500">Cobrança gradual de juros proporcional à evolução.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center gap-2"
          >
            <Save size={18} />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}
