import { ReactElement, useState, useEffect } from 'react'
import { X, RefreshCw, Trash2, Plus, Check } from 'lucide-react'
import NumberInput from '../../ui/NumberInput'
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
  const [localBalloons, setLocalBalloons] = useState<BuilderBalloon[]>(
    (balloons || []).map(b => ({ ...b }))
  )

  const [genValue, setGenValue] = useState<number | ''>('')
  const [genFrequency, setGenFrequency] = useState<number>(6)
  const [genStartMonth, setGenStartMonth] = useState<number>(6)

  useEffect(() => {
    if (isOpen) {
      setLocalBalloons((balloons || []).map(b => ({ ...b })))
    }
  }, [isOpen, balloons])

  if (!isOpen) return null

  // Atualização genérica usando o tipo correto
  const handleUpdateItem = (index: number, field: keyof BuilderBalloon, val: number | '') => {
    const updated = [...localBalloons]
    // Se for vazio, salvamos 0 ou mantemos vazio dependendo da sua preferência lógica
    // Aqui assumirei 0 para cálculos, mas o componente NumberInput lida com a exibição
    updated[index] = { ...updated[index], [field]: val === '' ? 0 : val }
    setLocalBalloons(updated)
  }

  const handleRemoveItem = (index: number) => {
    const updated = localBalloons.filter((_, i) => i !== index)
    setLocalBalloons(updated)
  }

  const handleAddItem = () => {
    const lastMonth = localBalloons.length > 0
      ? Math.max(...localBalloons.map(b => b.month))
      : 0
    const nextMonth = Math.min(lastMonth + 6, constructionTime)
    setLocalBalloons([...localBalloons, { month: nextMonth > 0 ? nextMonth : 6, value: 0 }])
  }

  const generateBalloons = (): void => {
    if (!genValue || !genFrequency || genFrequency <= 0 || !genStartMonth) return
    const newBalloons: BuilderBalloon[] = []
    const maxMonths = Number(constructionTime) || 36
    for (let m = Number(genStartMonth); m <= maxMonths; m += Number(genFrequency)) {
      newBalloons.push({ month: m, value: Number(genValue) })
    }
    const currentMap = new Map(localBalloons.map(b => [b.month, b.value]))
    newBalloons.forEach(nb => {
      currentMap.set(nb.month, nb.value)
    })
    const finalArray: BuilderBalloon[] = []
    currentMap.forEach((val, key) => {
      finalArray.push({ month: key, value: val })
    })
    finalArray.sort((a, b) => a.month - b.month)
    setLocalBalloons(finalArray)
  }

  const handleSaveAndClose = () => {
    const cleanList = localBalloons
      .filter(b => b.value > 0 && b.month > 0)
      .sort((a, b) => a.month - b.month)
    onSave(cleanList)
  }

  const totalIntercaladas = localBalloons.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              Configurar Balões / Intercaladas
            </h3>
            <p className="text-xs text-gray-400">Parcelas extras durante a obra.</p>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-500"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-8 custom-scrollbar bg-gray-50/50 flex-1">
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h4 className="text-xs font-bold text-blue-800 flex items-center gap-2 uppercase tracking-wide mb-2">
              <RefreshCw size={14} className="text-blue-500" /> Gerador Automático
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Valor</label>
                <NumberInput
                  placeholder="0"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:border-blue-500"
                  value={genValue}
                  onChange={(val) => setGenValue(val)}
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Repetir (Meses)</label>
                <NumberInput
                  placeholder="Ex: 6"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:border-blue-500"
                  value={genFrequency}
                  onChange={(val) => setGenFrequency(val === '' ? 0 : val)}
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Início (Mês)</label>
                <NumberInput
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:border-blue-500"
                  value={genStartMonth}
                  onChange={(val) => setGenStartMonth(val === '' ? 0 : val)}
                />
              </div>
            </div>
            <button onClick={generateBalloons} className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 py-2 rounded-lg text-sm font-bold transition-colors">Gerar Padrão</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Ou personalize abaixo</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <h4 className="text-sm font-bold text-gray-800">Parcelas Agendadas</h4>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Agendado</span>
                <span className="text-lg font-bold text-emerald-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIntercaladas)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {localBalloons.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-400 font-medium">Nenhuma parcela adicionada.</p>
                </div>
              )}

              {localBalloons.map((b, i) => (
                <div key={i} className="flex gap-3 items-center group animate-in slide-in-from-left-2 duration-300">
                  <div className="w-24 relative">
                    <div className="absolute left-2 top-2.5 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">Mês</div>
                    <NumberInput
                      min={1}
                      max={constructionTime}
                      className="w-full pl-9 p-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-center"
                      value={b.month}
                      onChange={(val) => handleUpdateItem(i, 'month', val)}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-2.5 font-bold text-gray-400 text-sm pointer-events-none">R$</div>
                    <NumberInput
                      className="w-full pl-9 p-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      placeholder="0,00"
                      value={b.value}
                      onChange={(val) => handleUpdateItem(i, 'value', val)}
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveItem(i)}
                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddItem}
              className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 text-gray-400 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group"
            >
              <Plus size={18} className="group-hover:scale-110 transition-transform" /> Adicionar Parcela Manual
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 z-10">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-500 font-bold text-sm hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
          <button onClick={handleSaveAndClose} className="px-8 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 transition-all active:scale-95 flex items-center gap-2"><Check size={18} /> Salvar Alterações</button>
        </div>
      </div>
    </div>
  )
}

export default BuilderBalloonModal
