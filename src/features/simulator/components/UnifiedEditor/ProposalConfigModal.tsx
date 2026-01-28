import { useState, useEffect } from 'react'
import { X, Save, Settings2, Banknote } from 'lucide-react'
import { useTheme } from '../../../../context/ThemeContext'
import type { SimulationScenario } from '../../../../types/ScenarioTypes'
import SmartInput from '../../../../components/ui/SmartInput'


interface ProposalConfigModalProps {
  isOpen: boolean
  onClose: () => void
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function ProposalConfigModal({ isOpen, onClose, data, setData }: ProposalConfigModalProps) {
  const { theme } = useTheme()
  const isRetro = theme === 'premium'

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
      <div className={`w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${isRetro ? 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]' : 'bg-white shadow-2xl'}`}>

        {/* Header */}
        <div className={`flex items-center justify-between p-6 ${isRetro ? 'bg-[#18181b] text-white border-b-4 border-black' : 'border-b border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isRetro ? 'bg-purple-400 text-black border-2 border-white' : 'bg-purple-100 text-purple-600'}`}>
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isRetro ? 'text-white' : 'text-gray-800'}`}>Configuração de Taxas e Seguros</h2>
              <p className={`text-sm ${isRetro ? 'text-gray-400' : 'text-gray-500'}`}>Defina os encargos bancários do financiamento</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isRetro ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* 1. SEÇÃO OBRA (INCC e Evolução) - Only if construction */}

          {/* 3. SEÇÃO BANCO (Taxas e Seguros) */}
          {!localData.useExternalSimulation && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                <Banknote className={isRetro ? 'text-blue-600' : 'text-blue-500'} size={18} />
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
        <div className={`p-6 bg-gray-50 flex justify-end gap-3 rounded-b-2xl ${isRetro ? 'border-t-2 border-black' : 'border-t border-gray-100'}`}>
          <button
            onClick={onClose}
            className={`px-6 py-3 font-bold transition-colors ${isRetro ? 'text-black hover:text-red-600 uppercase tracking-widest' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${isRetro ? 'bg-blue-600 hover:bg-blue-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000]' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'}`}
          >
            <Save size={18} />
            Aplicar na Proposta
          </button>
        </div>
      </div>
    </div>
  )
}
