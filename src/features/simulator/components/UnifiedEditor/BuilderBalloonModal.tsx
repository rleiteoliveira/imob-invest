import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactElement } from 'react'
import { X, Check } from 'lucide-react'
import BalloonPaymentList from './BalloonPaymentList'
import { useThemeStyles } from '../../../../hooks/useThemeStyles'
import type { BuilderBalloon } from '../../../../types/ScenarioTypes'

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

  /* import useThemeStyles missing here, need to add import first, doing replace locally */
  const { colors, components } = useThemeStyles()

  if (!isOpen) return null

  const handleSave = () => {
    // Basic validation/cleanup if needed, though BalloonPaymentList keeps it clean
    onSave(currentList)
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] ${components.card.wrapper}`} style={{ margin: 0 }}>
        {/* Style override margin to 0 just in case wrapper adds margins */}

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center shrink-0" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: colors.text }}>
              Configurar Balões / Intercaladas
            </h3>
            <p className="text-xs" style={{ color: colors.textMuted }}>Parcelas extras durante a obra.</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${components.button.ghost}`}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4" style={{ backgroundColor: `${colors.surface}80` }}>
          <BalloonPaymentList
            balloons={currentList}
            onChange={setCurrentList}
            constructionTime={constructionTime}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3 z-10 shrink-0" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <button onClick={onClose} className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-colors ${components.button.ghost}`}>Cancelar</button>
          <button onClick={handleSave} className={`px-8 py-2.5 font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${components.button.primary}`}>
            <Check size={18} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default BuilderBalloonModal
