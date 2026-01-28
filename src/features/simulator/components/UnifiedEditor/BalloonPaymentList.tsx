import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { Trash2, PlusCircle, Plus } from 'lucide-react'
import { useThemeStyles } from '../../../../hooks/useThemeStyles'
import NumberInput from '../../../../components/ui/NumberInput'
import CurrencyInput from '../../../../components/ui/CurrencyInput'
import type { BuilderBalloon } from '../../../../types/ScenarioTypes'

interface BalloonPaymentListProps {
  balloons: BuilderBalloon[]
  onChange: (balloons: BuilderBalloon[]) => void
  constructionTime: number
}

interface BalloonItem {
  id: string
  month: number
  value: number
}

const BalloonPaymentList = ({
  balloons,
  onChange,
  constructionTime
}: BalloonPaymentListProps): ReactElement => {
  const { colors, components } = useThemeStyles()

  // Initialize state with IDs
  const [items, setItems] = useState<BalloonItem[]>(() => {
    if (!balloons || balloons.length === 0) {
      return []
    }
    return balloons.map(b => ({
      id: crypto.randomUUID(),
      month: b.month,
      value: b.value
    }))
  })

  // Notify parent whenever items change
  useEffect(() => {
    const cleaned = items.map(({ month, value }) => ({ month, value }))
    onChange(cleaned)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const handleUpdate = (id: string, field: 'month' | 'value', rawValue: number) => {
    setItems(prev => {
      // Update item
      const updated = prev.map(item => {
        if (item.id === id) {
          return { ...item, [field]: rawValue }
        }
        return item
      })

      // If month changed, sort immediately
      if (field === 'month') {
        return updated.sort((a, b) => a.month - b.month)
      }
      return updated
    })
  }

  const handleAdd = () => {
    setItems(prev => {
      const maxMonth = prev.length > 0 ? Math.max(...prev.map(p => p.month)) : 0
      // "Cria nova parcela no mês maxMonth + 1 (ou mês 1 se a lista estiver vazia)."
      const newMonth = maxMonth + 1
      const newItem: BalloonItem = {
        id: crypto.randomUUID(),
        month: newMonth,
        value: 0
      }
      // Add and presumably sort (it will be at end if max+1)
      return [...prev, newItem].sort((a, b) => a.month - b.month)
    })
  }

  const handleDuplicate = (id: string) => {
    setItems(prev => {
      const itemToCopy = prev.find(p => p.id === id)
      if (!itemToCopy) return prev

      const maxMonth = prev.length > 0 ? Math.max(...prev.map(p => p.month)) : 0
      const newItem: BalloonItem = {
        id: crypto.randomUUID(),
        month: maxMonth + 1, // "maior_mês_da_lista + 1" per instruction
        value: itemToCopy.value
      }
      return [...prev, newItem].sort((a, b) => a.month - b.month)
    })
  }

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(p => p.id !== id))
  }

  const totalValue = items.reduce((acc, cur) => acc + (cur.value || 0), 0)

  return (
    <div className={`flex flex-col h-full rounded-xl overflow-hidden shadow-sm ${components.card.wrapper}`} style={{ borderColor: colors.border, backgroundColor: 'transparent' }}>
      {/* Header handled by modal usually, but list needs headers for columns? */}
      <div className="flex items-center gap-4 px-4 py-2 border-b text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: `${colors.surface}80`, borderColor: colors.border, color: colors.textMuted }}>
        <div className="w-20 text-center">Mês</div>
        <div className="flex-1">Valor</div>
        <div className="w-20 text-center">Ações</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg m-2" style={{ borderColor: colors.border, color: colors.textMuted }}>
            <span className="text-sm">Nenhuma parcela intercalada.</span>
            <span className="text-xs opacity-70">Adicione manualmente abaixo.</span>
          </div>
        )}

        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all border border-transparent hover:border-blue-100 group`}
            style={{ backgroundColor: index % 2 === 0 ? 'transparent' : `${colors.primary}05` }}
          >
            {/* Input Mês */}
            <div className="w-20">
              <NumberInput
                value={item.month}
                max={constructionTime}
                onChange={(v: any) => handleUpdate(item.id, 'month', Number(v))}
                className={`${components.input.field} h-9 text-center font-bold`}
                placeholder="Mês"
              />
            </div>

            {/* Input Valor */}
            <div className="flex-1">
              <CurrencyInput
                value={item.value}
                onChange={(v: any) => handleUpdate(item.id, 'value', Number(v))}
                className={`${components.input.field} h-9 font-bold`}
                placeholder="R$ 0,00"
              />
            </div>

            {/* Actions */}
            <div className="w-20 flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDuplicate(item.id)}
                title="Duplicar (final da lista)"
                className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"
                style={{ color: colors.primary }}
              >
                <PlusCircle size={16} />
              </button>
              <button
                onClick={() => handleRemove(item.id)}
                title="Excluir"
                className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
                style={{ color: colors.danger }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Add Button / Total */}
      <div className="p-4 border-t flex flex-col gap-3" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
        <button
          onClick={handleAdd}
          className={`w-full flex items-center justify-center gap-2 py-2 border border-dashed rounded-lg font-bold text-sm transition-all ${components.button.ghost}`}
          style={{ borderColor: colors.border }}
        >
          <Plus size={16} /> Adicionar Parcela
        </button>

        <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: colors.border }}>
          <span className="text-xs font-bold uppercase" style={{ color: colors.textMuted }}>Total em Intercaladas</span>
          <span className="text-lg font-bold" style={{ color: colors.success }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BalloonPaymentList
