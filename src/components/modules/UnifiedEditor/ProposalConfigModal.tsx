import { useState, useEffect } from 'react'
import { X, Save, Settings2, Banknote, TrendingUp } from 'lucide-react'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import SmartInput from '../../ui/SmartInput'
import ToggleSwitch from '../../ui/ToggleSwitch'

interface ProposalConfigModalProps {
  isOpen: boolean
  onClose: () => void
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function ProposalConfigModal({ isOpen, onClose, data, setData }: ProposalConfigModalProps) {
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
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Personalização da Proposta</h2>
              <p className="text-sm text-gray-500">Ajustes finos para este cenário</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* 1. SEÇÃO OBRA (INCC e Evolução) - Only if construction */}
          {(localData.type === 'MCMV' || localData.type === 'DIRETO' || localData.type === 'PLANTA') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                <TrendingUp className="text-purple-500" size={18} />
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Correção e Evolução (Obra/Valorização)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* INCC */}
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
                  <p className="text-xs text-gray-500">Reajuste mensal sobre saldo de obra.</p>
                </div>

                {/* EVOLUÇÃO DE OBRA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700">Juros de Obra</label>
                    <ToggleSwitch
                      checked={!!localData.useWorkEvolution}
                      onChange={(v) => setLocalData({ ...localData, useWorkEvolution: v })}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Cobrança gradual de juros pelo banco.</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. APPRAISAL */}
          <div className="space-y-4">
            <SmartInput
              label="Valorização do Imóvel (% a.a.)"
              value={localData.appreciationRate ?? ''}
              onChange={(v) => setLocalData({ ...localData, appreciationRate: v })}
              prefix="%"
              allowFloat
              disableSlider
              subtitle="Projeção para cálculo de retorno"
            />
          </div>

          {/* 3. SEÇÃO BANCO (Taxas e Seguros) */}
          {!localData.useExternalSimulation && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                <Banknote className="text-blue-500" size={18} />
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Taxas Bancárias (CET)</h3>
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
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            <Save size={18} />
            Aplicar na Proposta
          </button>
        </div>
      </div>
    </div>
  )
}
