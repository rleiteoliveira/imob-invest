import { useState } from 'react'
import type { ReactElement } from 'react'
import { X, Check } from 'lucide-react'
import BalloonPaymentList from './BalloonPaymentList'
import type { BuilderBalloon } from '../../../types/ScenarioTypes'

const BuilderBalloonModal = ({
  isOpen,
  onClose,
  balloons,
  onSave,
  constructionTime
}: {
  isOpen: boolean
  onClose: () => void
  balloons: BuilderBalloon[]
  onSave: (ballons: BuilderBalloon[]) => void
  constructionTime: number
}): ReactElement | null => {
  // We keep a local state just to hold the "temporary" list before saving
  // Since component unmounts when !isOpen, we don't need to sync state in useEffect
  const [currentList, setCurrentList] = useState<BuilderBalloon[]>(balloons || [])

  if (!isOpen) return null

  const handleSave = () => {
    // Basic validation/cleanup if needed, though BalloonPaymentList keeps it clean
    onSave(currentList)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">

        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              Configurar Balões / Intercaladas
            </h3>
            <p className="text-xs text-gray-400">Parcelas extras durante a obra.</p>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-500"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-50/50 p-4">
          <BalloonPaymentList
            balloons={currentList}
            onChange={setCurrentList}
            constructionTime={constructionTime}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 z-10 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-500 font-bold text-sm hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-8 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 transition-all active:scale-95 flex items-center gap-2">
            <Check size={18} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuilderBalloonModal
