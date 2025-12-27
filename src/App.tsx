import React, { useState, useMemo, useEffect, ReactElement, Dispatch, SetStateAction } from 'react'
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Settings2,
  CalendarDays,
  Plus,
  Trash2,
  LayoutDashboard,
  BarChart3,
  Save,
  Home,
  Check,
  TrendingUp,
  Clock,
  Key,
  Wallet,
  Shield,
  AlertCircle,
  Menu,
  X,
  Coins,
  RefreshCw,
  CalendarClock,
  FileText,
  HardHat,
  Landmark,
  Printer
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { FinancialMath } from './services/FinancialMath'
import type { SimulationScenario, BuilderBalloon } from './services/FinancialMath'
import DetailedReportView from './components/reports/DetailedReportView'

// ==========================================
// 1. COMPONENTES HELPER
// ==========================================

const ToggleSwitch = ({
  checked,
  onChange
}: {
  checked: boolean
  onChange: (v: boolean) => void
}): ReactElement => (
  <div
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </div>
)

const TypeCard = ({
  icon: Icon,
  label,
  active,
  onClick,
  color
}: {
  icon: any
  label: string
  active: boolean
  onClick: () => void
  color: string
}): ReactElement => {
  const colors: Record<string, string> = {
    orange: 'border-orange-500 bg-orange-50 text-orange-700',
    blue: 'border-blue-500 bg-blue-50 text-blue-700',
    purple: 'border-purple-500 bg-purple-50 text-purple-700',
    gray: 'border-gray-200 hover:border-gray-300 text-gray-600'
  }
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-2 md:p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 md:gap-3 text-center h-24 md:h-28 justify-center shadow-sm hover:shadow-md ${active ? colors[color] : colors['gray']}`}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] md:text-xs font-bold leading-tight px-1">{label}</span>
    </div>
  )
}

const CurrencyInput = ({
  label,
  value,
  onChange,
  prefix,
  subtitle,
  highlight,
  readOnly
}: {
  label?: string
  value: number | ''
  onChange: (v: number) => void
  prefix?: string
  subtitle?: string
  highlight?: string
  readOnly?: boolean
}): ReactElement => {
  const [displayValue, setDisplayValue] = useState('')
  const [active, setActive] = useState(false)

  const formatFinal = (val: number) => {
    if (val === undefined || val === null) return ''
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val)
  }

  useEffect(() => {
    if (!active) {
      setDisplayValue(value === 0 || value === '' ? '0,00' : formatFinal(value))
    }
  }, [value, active])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (readOnly) return
    setActive(true)
    // Ao focar, se for 0,00 limpa para facilitar digitação
    if (displayValue === '0,00') {
      setDisplayValue('')
    } else {
      e.target.select()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return
    const val = e.target.value
    if (val === '') {
      setDisplayValue('')
      return
    }
    const onlyNumsAndComma = val.replace(/[^0-9,]/g, '')
    const parts = onlyNumsAndComma.split(',')
    if (parts.length > 2) return
    let integerPart = parts[0]
    if (integerPart.length > 1 && integerPart.startsWith('0')) {
      integerPart = integerPart.replace(/^0+/, '')
    }
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    let newDisplay = formattedInteger
    if (parts.length > 1) {
      newDisplay += ',' + parts[1].slice(0, 2)
    } else if (val.includes(',')) {
      newDisplay += ','
    }
    setDisplayValue(newDisplay)
  }

  const handleBlur = () => {
    setActive(false)
    if (displayValue === '' || displayValue === ',') {
      onChange(0)
      setDisplayValue('0,00')
      return
    }
    const raw = displayValue.replace(/\./g, '').replace(',', '.')
    let num = parseFloat(raw)
    if (isNaN(num)) num = 0
    onChange(num)
    setDisplayValue(formatFinal(num))
  }

  return (
    <div className="flex-1 w-full">
      {label && (
        <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
          {label}{' '}
          {highlight && (
            <span className="text-blue-600 bg-blue-50 px-1.5 rounded text-[10px]">{highlight}</span>
          )}
        </label>
      )}
      <div
        className={`relative flex items-center border rounded-xl transition-all ${readOnly ? 'bg-gray-100 border-gray-200' : active ? 'bg-white border-blue-500 ring-2 ring-blue-100' : 'bg-white border-gray-300 hover:border-gray-400'}`}
      >
        {prefix && (
          <span className="pl-3 text-gray-400 font-bold text-sm select-none">{prefix}</span>
        )}
        <input
          type="text"
          disabled={readOnly}
          className={`w-full pl-2 pr-3 py-3 outline-none font-bold text-lg bg-transparent ${readOnly ? 'text-gray-500 cursor-not-allowed' : 'text-gray-800'}`}
          value={displayValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0,00"
          inputMode="numeric"
        />
      </div>
      {subtitle && <p className="text-[10px] text-gray-400 mt-1 ml-1">{subtitle}</p>}
    </div>
  )
}

// ==========================================
// 2. COMPONENTES DE VISUALIZAÇÃO
// ==========================================

const ComparisonView = ({
  scenarios,
  selectedIds,
  onBack,
  getCardMetrics,
  onGenerateReport
}: {
  scenarios: SimulationScenario[]
  selectedIds: string[]
  onBack: () => void
  getCardMetrics: (cenario: SimulationScenario) => any
  onGenerateReport: (s: SimulationScenario) => void
}): ReactElement => {
  const selectedScenarios = scenarios.filter((s: any) => selectedIds.includes(s.id))
  const colors = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed']

  const chartData = useMemo(() => {
    if (selectedScenarios.length === 0) return []
    let maxMonths = 0
    const timelines = selectedScenarios.map((s: any) => {
      const timeline = FinancialMath.calculate(s)
      if (timeline.length > maxMonths) maxMonths = timeline.length
      return { id: s.id, timeline }
    })
    const points: any[] = []
    const step = maxMonths > 120 ? 12 : 1
    for (let m = 1; m <= maxMonths; m += step) {
      const point: any = { name: `Mês ${m}` }
      timelines.forEach((t: any) => {
        const exactData = t.timeline.find((x: any) => x.month === m)
        if (exactData) point[t.id] = exactData.accumulatedPaid
      })
      points.push(point)
    }
    return points
  }, [selectedScenarios])

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300 custom-scrollbar pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            Comparativo
          </h2>
          <p className="text-gray-500 mt-1">Análise de fluxo financeiro.</p>
        </div>
        <button
          onClick={onBack}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors bg-white border border-gray-200 md:border-0"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      <div className="bg-white p-3 md:p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 h-[250px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f8f8" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              hide={chartData.length > 50}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                fontSize: '11px'
              }}
              formatter={(value: number) =>
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
              }
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            {selectedScenarios.map((s: any, idx: number) => (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.id}
                name={s.name}
                stroke={colors[idx % colors.length]}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
        {selectedScenarios.map((s: any, idx: number) => {
          const metrics = getCardMetrics(s)
          const borderColor = colors[idx % colors.length]
          const isPlanta = s.type === 'PLANTA'

          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative flex flex-col hover:shadow-lg transition-shadow"
            >
              <div
                className="absolute top-0 left-0 w-full h-1.5"
                style={{ backgroundColor: borderColor }}
              ></div>

              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800 truncate pr-2 w-48">{s.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded border uppercase whitespace-nowrap ${isPlanta ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}
                  >
                    {isPlanta ? 'Na Planta' : s.type}
                  </span>
                </div>

                <button
                  onClick={() => onGenerateReport(s)}
                  className="w-full flex items-center justify-center gap-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <FileText size={14} /> Ver Relatório Detalhado
                </button>
              </div>

              <div className="p-5 flex-1 space-y-4">
                {isPlanta ? (
                  <>
                    <div className="space-y-3">
                      <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1 text-blue-800 mb-0.5">
                            <Building2 size={12} className="text-blue-600" />
                            <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                              1ª Parc. Construtora
                            </span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(metrics.parcelaEntrada)}
                          </div>
                          <div className="text-[10px] text-blue-600/70">
                            Entrada + INCC (Mensal)
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50/60 rounded-xl p-3 border border-orange-100 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1 text-orange-800 mb-0.5">
                            <Settings2 size={12} className="text-orange-600" />
                            <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                              1ª Parc. Evolução
                            </span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(metrics.parcelaObraBanco)}
                          </div>
                          <div className="text-[10px] text-orange-600/70">
                            Juros sobre o liberado
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute right-0 top-0 bg-emerald-100 text-[9px] px-2 py-0.5 rounded-bl-lg font-bold text-emerald-700">
                          PÓS-CHAVES
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-emerald-800 mb-0.5">
                            <Key size={12} className="text-emerald-600" />
                            <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                              1ª Parc. Financiamento
                            </span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(metrics.parcelaFinanciamento)}
                          </div>
                          <div className="text-[10px] text-emerald-600/70">Inicia na entrega</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-1 border-t border-gray-100 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                          <TrendingUp size={14} className="text-emerald-500" /> Valorização Est.
                        </span>
                        <span className="font-bold text-emerald-600">
                          +
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(metrics.valorizacao)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                          <Wallet size={14} className="text-orange-500" /> Total Pago Evolução
                        </span>
                        <span className="font-bold text-gray-700">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(metrics.totalJurosObra)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 space-y-4">
                    <div>
                      <span className="text-gray-500 text-xs uppercase font-bold block mb-1">
                        1ª Parcela Financiamento
                      </span>
                      <div className="text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(metrics.parcelaFinanciamento)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==========================================
// 3. STEPS (UNIFICADO)
// ==========================================

// COMPONENTE DE MODAL ATUALIZADO (Com Inputs "Livres")
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

// Substitua o componente UnifiedEditor inteiro por este código:

const UnifiedEditor = ({
  data,
  setData
}: {
  data: SimulationScenario
  setData: (d: SimulationScenario) => void
}): ReactElement => {
  const [showBalloonModal, setShowBalloonModal] = useState(false)

  const propertyValue = Number(data.propertyValue) || 0
  const downPayment = Number(data.downPayment) || 0
  const constructionMonths = Number(data.constructionTime) || 1

  // === LÓGICA INTELIGENTE DE FGTS/BALÕES ===
  const balloonVal = Number(data.balloonValue) || 0
  const startMonth = Number(data.balloonStartMonth)

  // 1. É Mês 0 (Sinal Puro)?
  const isBalloonAtZero = data.hasBalloonPayments && data.balloonFrequency === 'UNICA' && startMonth === 0

  // 2. É Durante a Obra (Intercalada Automática)?
  // Calcula quanto dinheiro do FGTS/Balão cai DENTRO do prazo de obra
  let balloonsInConstructionValue = 0
  if (data.hasBalloonPayments) {
    if (data.balloonFrequency === 'UNICA') {
      if (startMonth > 0 && startMonth <= constructionMonths) {
        balloonsInConstructionValue = balloonVal
      }
    } else {
      // Periódico: Conta quantas vezes cai dentro da obra
      // Ex: Obra 36 meses, Anual. Cai no 12, 24, 36. (3 vezes)
      let interval = 12
      if (data.balloonFrequency === 'MENSAL') interval = 1
      if (data.balloonFrequency === 'TRIMESTRAL') interval = 3
      if (data.balloonFrequency === 'SEMESTRAL') interval = 6

      const maxCount = Number(data.balloonCount) || 999
      let countInside = 0
      for (let m = 1; m <= constructionMonths; m++) {
        if (m % interval === 0 && countInside < maxCount) {
          balloonsInConstructionValue += balloonVal
          countInside++
        }
      }
    }
  }

  // Abatimento no Financiamento apenas se for Mês 0 (Sinal)
  const financedDeduction = isBalloonAtZero ? balloonVal : 0

  const financedAmount = Math.max(0, propertyValue - downPayment - financedDeduction)
  const financedPercent = propertyValue > 0 ? (financedAmount / propertyValue) * 100 : 0
  const downPaymentPercent = propertyValue > 0 ? (downPayment / propertyValue) * 100 : 0

  // === CÁLCULO DA PARCELA MENSAL ===
  const manualBalloonsTotal = (data.builderBalloons || []).reduce(
    (acc: number, cur: BuilderBalloon) => acc + cur.value,
    0
  )

  // Saldo da Entrada = Entrada - Sinal - Intercaladas Manuais - Intercaladas Auto (FGTS na obra)
  const entryBalanceToSplit = Math.max(0,
    downPayment
    - (Number(data.entrySignal) || 0)
    - manualBalloonsTotal
    - balloonsInConstructionValue
    // Se for Mês 0, tecnicamente já descontou do 'financedAmount' ou compôs a entrada.
    // Se o usuário colocou no 'downPayment' o valor do FGTS, então aqui temos que abater se for mês 0 também.
    // Mas a lógica padrão é: Entrada (Recurso Próprio). Se FGTS Mês 0, ele ajuda a abater o TOTAL do imóvel.
    // Se FGTS > 0 e <= Obra, ele ajuda a pagar a ENTRADA.
  )

  const monthlyInstallmentBase = entryBalanceToSplit / constructionMonths

  // Projeção INCC
  const monthlyINCC = (Number(data.inccRate) || 0) / 100
  const estimatedLastInstallment = monthlyInstallmentBase * Math.pow(1 + monthlyINCC, constructionMonths)

  const handleFinancedChange = (val: number): void => {
    const newDownPayment = propertyValue - val - financedDeduction
    setData({ ...data, downPayment: Math.max(0, newDownPayment) })
  }

  useEffect(() => {
    if (data.entryInstallments !== constructionMonths) {
      setData({ ...data, entryInstallments: constructionMonths })
    }
  }, [constructionMonths, data.entryInstallments])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-12">
      <BuilderBalloonModal
        isOpen={showBalloonModal}
        onClose={() => setShowBalloonModal(false)}
        balloons={data.builderBalloons}
        constructionTime={data.constructionTime || 36}
        onSave={(newBalloons: any) => {
          setData({ ...data, builderBalloons: newBalloons })
          setShowBalloonModal(false)
        }}
      />

      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-2 md:gap-4 flex-1">
          <TypeCard icon={Building2} label="Planta" active={data.type === 'PLANTA'} onClick={() => setData({ ...data, type: 'PLANTA' })} color="orange" />
          <TypeCard icon={Home} label="Pronto" active={data.type === 'SAC'} onClick={() => setData({ ...data, type: 'SAC' })} color="blue" />
          <TypeCard icon={TrendingUp} label="Invest." active={data.type === 'FUTURO'} onClick={() => setData({ ...data, type: 'FUTURO' })} color="purple" />
        </div>
      </div>

      <div className="bg-gray-50 p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <CurrencyInput
          label="Valor do Imóvel"
          prefix="R$"
          value={data.propertyValue}
          onChange={(v: any) => setData({ ...data, propertyValue: v })}
        />
        <div className="flex flex-col md:flex-row gap-4 md:items-end relative">
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 bg-white shadow-sm w-6 h-6 items-center justify-center rounded-full z-10 border border-gray-100">
            <Plus size={14} />
          </div>
          <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 hover:border-blue-300 transition-colors">
            <CurrencyInput
              label="Financiamento"
              highlight={`${financedPercent.toFixed(0)}%`}
              prefix="R$"
              value={financedAmount}
              onChange={handleFinancedChange}
              subtitle={isBalloonAtZero ? 'Saldo Dev. (Descontado FGTS/Ato)' : 'Saldo Devedor'}
            />
          </div>
          <div className="flex-1 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 hover:border-emerald-300 transition-colors">
            <CurrencyInput
              label="Entrada Total"
              highlight={`${downPaymentPercent.toFixed(0)}%`}
              prefix="R$"
              value={data.downPayment}
              onChange={(v: any) => setData({ ...data, downPayment: v })}
              subtitle="Recursos Próprios"
            />
          </div>
        </div>
      </div>

      {data.type === 'PLANTA' && downPayment > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 px-1">
            <HardHat className="text-orange-600" size={20} />
            <h3 className="font-bold text-gray-800 text-lg">Fluxo de Pagamento (Obra)</h3>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* COLUNA ESQUERDA: Obra */}
            <div className="xl:col-span-4 bg-orange-50 p-5 rounded-2xl border border-orange-100 space-y-4 h-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-orange-800 uppercase flex items-center gap-1"><Clock size={14} /> Cronograma</span>
              </div>
              <div>
                <label className="text-xs font-bold text-orange-700 block mb-1">Prazo Restante (Meses)</label>
                <NumberInput
                  className="w-full p-3 border border-orange-200 rounded-xl font-bold text-xl text-orange-900 bg-white focus:ring-2 focus:ring-orange-200 outline-none"
                  value={data.constructionTime}
                  onChange={(val) => setData({ ...data, constructionTime: val })}
                />
                <p className="text-[10px] text-orange-600/70 mt-1">Define o número de parcelas mensais.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div><label className="text-[10px] font-bold text-orange-700 block mb-1">INCC (% a.m)</label><NumberInput allowFloat={true} className="w-full p-2 border border-orange-200 rounded-lg bg-white" value={data.inccRate} onChange={(val) => setData({ ...data, inccRate: val })} /></div>
                <div><label className="text-[10px] font-bold text-orange-700 block mb-1">Obra Executada (%)</label><NumberInput className="w-full p-2 border border-orange-200 rounded-lg bg-white" value={data.currentWorkPercent} onChange={(val) => setData({ ...data, currentWorkPercent: val })} /></div>
              </div>
              <div className="pt-3 border-t border-orange-200/50">
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-orange-900">Cobrar Juros de Obra?</span><ToggleSwitch checked={data.useWorkEvolution} onChange={(c) => setData({ ...data, useWorkEvolution: c })} /></div>
              </div>
            </div>

            {/* COLUNA DIREITA: Divisão da Entrada (Agora com FGTS integrado) */}
            <div className="xl:col-span-8 space-y-4">

              {/* Bloco Unificado de Entrada */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Wallet size={14} /> Divisão da Entrada</span>
                  <span className="text-sm font-bold text-emerald-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(downPayment)}</span>
                </div>

                {/* Grid de Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* 1. ATO */}
                  <CurrencyInput label="Ato / Sinal" prefix="R$" value={data.entrySignal} onChange={(v: any) => setData({ ...data, entrySignal: v })} subtitle="Pago na assinatura" />

                  {/* 2. INTERCALADAS MANUAIS */}
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => setShowBalloonModal(true)}>
                    <div>
                      <p className="text-[10px] text-blue-600 font-bold uppercase flex items-center gap-1"><Coins size={10} /> Intercaladas (Balões)</p>
                      <p className="text-lg font-bold text-blue-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(manualBalloonsTotal)}</p>
                      <p className="text-[9px] text-blue-400 font-medium mt-0.5">Clique para configurar</p>
                    </div>
                    <div className="bg-white text-blue-600 border border-blue-200 p-2 rounded-lg group-hover:scale-105 transition-transform"><Settings2 size={16} /></div>
                  </div>
                </div>

                {/* 3. CARD FGTS / RECURSO EXTRA (Movido para cá!) */}
                <div className={`p-4 rounded-xl border transition-all ${data.hasBalloonPayments ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-dashed border-gray-200 opacity-80 hover:opacity-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className={data.hasBalloonPayments ? "text-emerald-600" : "text-gray-400"} />
                      <span className={`text-xs font-bold uppercase ${data.hasBalloonPayments ? "text-emerald-700" : "text-gray-500"}`}>
                        Recurso Extra / FGTS
                      </span>
                    </div>
                    <ToggleSwitch checked={data.hasBalloonPayments} onChange={(c) => setData({ ...data, hasBalloonPayments: c })} />
                  </div>

                  {data.hasBalloonPayments && (
                    <div className="animate-in slide-in-from-top-2 duration-200 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Frequência</label>
                          <select className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-emerald-500" value={data.balloonFrequency} onChange={(e) => setData({ ...data, balloonFrequency: e.target.value as any, balloonCount: e.target.value === 'UNICA' ? 1 : data.balloonCount })}>
                            <option value="UNICA">Única (Pontual)</option>
                            <option value="ANUAL">Anual</option>
                            <option value="SEMESTRAL">Semestral</option>
                            <option value="TRIMESTRAL">Trimestral</option>
                            <option value="MENSAL">Mensal</option>
                          </select>
                        </div>
                        <div>
                          {data.balloonFrequency === 'UNICA' ? (
                            <>
                              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Mês (0 = Ato)</label>
                              <NumberInput placeholder="0" className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-emerald-500" value={data.balloonStartMonth} onChange={(val) => setData({ ...data, balloonStartMonth: val })} />
                            </>
                          ) : (
                            <>
                              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Qtd. Vezes</label>
                              <NumberInput className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-emerald-500" value={data.balloonCount} onChange={(val) => setData({ ...data, balloonCount: val })} />
                            </>
                          )}
                        </div>
                      </div>
                      <CurrencyInput prefix="R$" label="Valor" value={data.balloonValue} onChange={(v: any) => setData({ ...data, balloonValue: v })} subtitle={balloonsInConstructionValue > 0 ? `Abatendo R$ ${balloonsInConstructionValue.toLocaleString('pt-BR')} da Entrada` : "Abatendo do Financiamento/Pós-Obra"} />
                    </div>
                  )}
                </div>

                {/* 4. CARD MENSAIS (Resultado Final) */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-4 rounded-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Parcelamento do Restante</span>
                      <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {data.constructionTime}x Mensais
                        {monthlyINCC > 0 && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">+ INCC</span>}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase">Saldo a dividir</span>
                      <p className="text-sm font-bold text-gray-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entryBalanceToSplit)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 relative z-10">
                    <div className="flex-1 w-full bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">1ª Parcela (Base)</span>
                      <div className="text-xl font-bold text-emerald-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyInstallmentBase)}
                      </div>
                    </div>

                    {monthlyINCC > 0 ? (
                      <>
                        <ArrowRight className="text-gray-300 hidden md:block" />
                        <div className="flex-1 w-full bg-orange-50/50 border border-orange-100 p-3 rounded-xl border-dashed">
                          <span className="text-[10px] text-orange-500 font-bold uppercase block mb-1 flex items-center gap-1">
                            <TrendingUp size={10} /> Estimativa Final
                          </span>
                          <div className="text-xl font-bold text-orange-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedLastInstallment)}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ... (Seções de Financiamento e Futuro mantidas) ... */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 px-1 border-t border-gray-100 pt-6"><Landmark className="text-blue-600" size={20} /><h3 className="font-bold text-gray-800 text-lg">Financiamento Bancário</h3></div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Sistema de Amortização</label><div className="flex bg-gray-100 p-1 rounded-lg"><button className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${data.amortizationSystem === 'SAC' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setData({ ...data, amortizationSystem: 'SAC' })}>SAC</button><button className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${data.amortizationSystem === 'PRICE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setData({ ...data, amortizationSystem: 'PRICE' })}>PRICE</button></div></div>
              <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Prazo (Meses)</label><NumberInput className="w-full p-3 border border-gray-200 rounded-lg font-bold text-gray-700" value={data.termMonths} onChange={(val) => setData({ ...data, termMonths: val })} /></div>
            </div>
            <div className="space-y-4">
              <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Juros Nominais (% a.a)</label><NumberInput allowFloat={true} className="w-full p-3 border border-gray-200 rounded-lg" value={data.interestRate} onChange={(val) => setData({ ...data, interestRate: val })} /></div>
              <CurrencyInput label="Taxa Adm. (R$)" prefix="R$" value={data.monthlyAdminFee} onChange={(v: any) => setData({ ...data, monthlyAdminFee: v })} />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 h-full"><label className="text-[10px] font-bold text-gray-500 uppercase mb-3 block flex items-center gap-1"><Shield size={10} /> Seguros (Mensal)</label><div className="space-y-3"><CurrencyInput label="MIP (R$)" prefix="R$" value={data.insuranceMIP} onChange={(v: any) => setData({ ...data, insuranceMIP: v })} subtitle="Morte/Invalidez" /><CurrencyInput label="DFI (R$)" prefix="R$" value={data.insuranceDFI} onChange={(v: any) => setData({ ...data, insuranceDFI: v })} subtitle="Danos Físicos" /></div></div>
          </div>
        </div>
      </div>

      {data.type === 'FUTURO' && (
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 animate-in fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-purple-700 uppercase mb-1 block">Espera (Meses)</label><NumberInput className="w-full p-2 border border-purple-200 rounded-lg" value={data.monthsToReady} onChange={(val) => setData({ ...data, monthsToReady: val })} /></div>
            <div><label className="text-xs font-bold text-purple-700 uppercase mb-1 block">Valorização (% a.a)</label><NumberInput allowFloat={true} className="w-full p-2 border border-purple-200 rounded-lg" value={data.appreciationRate} onChange={(val) => setData({ ...data, appreciationRate: val })} /></div>
          </div>
        </div>
      )}
    </div>
  )
}

const EditorWizard = ({
  step,
  setStep,
  data,
  setData,
  currentName,
  setCurrentName,
  onSave,
  onGenerateReport
}: {
  step: number
  setStep: Dispatch<SetStateAction<number>>
  data: SimulationScenario
  setData: (d: SimulationScenario) => void
  currentName: string
  setCurrentName: (n: string) => void
  onSave: () => void
  onGenerateReport: (s: SimulationScenario) => void
}): ReactElement => {
  return (
    <div className="h-full flex items-center justify-center p-0 md:p-4 bg-gray-50">
      <div className="w-full max-w-4xl bg-white md:rounded-3xl shadow-none md:shadow-xl border-x-0 md:border border-gray-100 overflow-hidden flex flex-col h-[100dvh] md:h-[85vh] md:max-h-[800px] md:min-h-[500px]">
        <div className="bg-white px-6 md:px-8 py-6 border-b border-gray-100 relative shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                {data.id ? 'Editando' : 'Novo Cenário'}
              </h1>
              <p className="text-xs md:text-sm text-gray-400">
                {step === 0 && 'Configuração Completa do Negócio'}
                {step === 1 && 'Finalização'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600 w-6' : 'bg-gray-200 w-2'}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 px-4 md:px-8 py-6">
          {step === 0 && <UnifiedEditor data={data} setData={setData} />}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-100">
                <Save size={36} />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Finalizar Simulação</h2>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">
                  Identifique esta proposta para consultar ou comparar depois.
                </p>
              </div>
              <div className="w-full max-w-sm">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
                  Nome do Cliente / Unidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva - Apto 302"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-center shadow-sm"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
          {step > 0 ? (
            <button
              onClick={() => setStep((s: number) => s - 1)}
              className="text-gray-500 font-bold flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 1 ? (
            <button
              onClick={() => setStep((s: number) => s + 1)}
              className="bg-gray-900 hover:bg-black text-white flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold shadow-lg shadow-gray-300 transition-all active:scale-95 text-sm md:text-base"
            >
              Salvar e Continuar <ArrowRight size={18} />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => onGenerateReport({ ...data, name: currentName })}
                disabled={!currentName}
                className={`flex items-center gap-2 px-6 md:px-6 py-3 md:py-3.5 rounded-xl font-bold text-gray-700 border border-gray-300 shadow-sm transition-all text-sm md:text-base ${!currentName ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300'}`}
              >
                <Printer size={18} />{' '}
                <span className="hidden md:inline">Pré-visualizar Relatório</span>
              </button>

              <button
                onClick={onSave}
                disabled={!currentName}
                className={`flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold text-white shadow-lg transition-all text-sm md:text-base ${!currentName ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 active:scale-95'}`}
              >
                <Check size={18} /> {data.id ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function App(): ReactElement {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'EDITOR' | 'COMPARE'>('EDITOR')
  const [showSuccess, setShowSuccess] = useState(false)
  const [step, setStep] = useState(0)
  const [currentName, setCurrentName] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [reportScenario, setReportScenario] = useState<SimulationScenario | null>(null)

  const defaultData: SimulationScenario = {
    propertyValue: 350000,
    downPayment: 70000,
    entrySignal: 15000,
    entryInstallments: 36,
    builderBalloons: [],
    type: 'PLANTA',
    amortizationSystem: 'PRICE',
    interestRate: 8.66,
    termMonths: 420,
    monthlyAdminFee: 25.0,
    insuranceMIP: 30.24,
    insuranceDFI: 24.85,
    hasBalloonPayments: false,
    balloonFrequency: 'UNICA',
    balloonCount: 1,
    balloonValue: 10000,
    balloonStartMonth: 0,
    constructionTime: 36,
    inccRate: 0.45,
    useWorkEvolution: true,
    currentWorkPercent: 30,
    monthsToReady: 24,
    appreciationRate: 10
  }

  const [data, setData] = useState<SimulationScenario>(defaultData)

  const createNew = (): void => {
    setStep(0)
    setCurrentName('')
    setViewMode('EDITOR')
    setData({ ...defaultData })
    setIsMobileMenuOpen(false)
  }
  const handleSave = (): void => {
    if (!currentName) return
    const newId = data.id || Date.now().toString()
    const newScenario = { ...data, id: newId, name: currentName }
    setScenarios((prev) => {
      const exists = prev.find((s: SimulationScenario) => s.id === newId)
      if (exists) return prev.map((s: SimulationScenario) => (s.id === newId ? newScenario : s))
      return [...prev, newScenario]
    })
    if (!selectedIds.includes(newId)) setSelectedIds((prev) => [...prev, newId])
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      createNew()
    }, 1500)
  }
  const loadScenario = (cenario: SimulationScenario): void => {
    setData(cenario)
    setCurrentName(cenario.name || '')
    setStep(0)
    setViewMode('EDITOR')
    setIsMobileMenuOpen(false)
  }
  const formatMoney = (val: number | ''): string => {
    if (val === '') return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const getCardMetrics = (cenario: SimulationScenario): any => {
    const timeline = FinancialMath.calculate(cenario)
    if (!timeline || timeline.length === 0)
      return {
        parcelaEntrada: 0,
        parcelaObraBanco: 0,
        parcelaFinanciamento: 0,
        valorizacao: 0,
        totalJurosObra: 0
      }

    const firstMonth = timeline[0]
    const parcelaEntrada = firstMonth ? firstMonth.builderInstallment || 0 : 0
    const parcelaObraBanco = firstMonth
      ? (firstMonth.bankInterest || 0) + (firstMonth.bankFees || 0)
      : 0

    const firstAmort = timeline.find((t) => t.phase === 'AMORTIZACAO')
    const parcelaFinanciamento = firstAmort ? firstAmort.totalInstallment || 0 : 0

    const totalJurosObra = timeline
      .filter((t) => t.phase === 'OBRA')
      .reduce((acc, curr) => acc + (curr.bankInterest + curr.bankFees), 0)

    let valorizacao = 0
    const originalVal = Number(cenario.propertyValue) || 0
    if (cenario.type === 'PLANTA') {
      valorizacao = originalVal * 0.3
    }

    return { parcelaEntrada, parcelaObraBanco, parcelaFinanciamento, valorizacao, totalJurosObra }
  }

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800 overflow-hidden relative selection:bg-blue-100 flex-col md:flex-row">
      {showSuccess && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-emerald-100 scale-110">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Check size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Simulação Salva!</h2>
            <p className="text-gray-500 text-sm mt-1">Sincronizado com sucesso.</p>
          </div>
        </div>
      )}

      {reportScenario && (
        <DetailedReportView scenario={reportScenario} onClose={() => setReportScenario(null)} />
      )}

      <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center z-40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">Simulador Pro</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[45] md:hidden transition-opacity animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 h-[100dvh] md:h-full w-[280px] md:w-80 bg-white border-r border-gray-100 flex flex-col z-50 transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl md:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="p-6 border-b border-gray-50 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Financiamento Pro</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest opacity-70">
                Simulador Imobiliário
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
          <button
            onClick={createNew}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-bold text-sm bg-white active:scale-[0.98]"
          >
            <Plus size={18} /> Nova Simulação
          </button>

          <div className="space-y-2.5">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-3">
              Minhas Simulações
            </h3>
            {scenarios.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-gray-100 rounded-2xl">
                <p className="text-xs text-gray-400">Nenhum cenário salvo ainda.</p>
              </div>
            ) : (
              scenarios.map((cenario: SimulationScenario) => (
                <div
                  key={cenario.id}
                  className={`group relative border rounded-2xl p-4 transition-all cursor-pointer ${data.id === cenario.id ? 'bg-blue-50/50 border-blue-500/50 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'}`}
                  onClick={() => loadScenario(cenario)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cenario.id)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(cenario.id)
                              ? prev.filter((x) => x !== cenario.id)
                              : [...prev, cenario.id]
                          )
                        }
                        className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-gray-900 truncate leading-tight">
                          {cenario.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setScenarios((s) => s.filter((x) => x.id !== cenario.id))
                          }}
                          className="text-gray-300 hover:text-red-500 p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${cenario.type === 'PLANTA' ? 'bg-orange-500' : 'bg-blue-500'}`}
                          ></span>
                          <span className="uppercase font-bold text-[9px] text-gray-500 tracking-wide">
                            {cenario.type}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-gray-700">
                          {formatMoney(cenario.propertyValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-50 bg-white">
          <button
            onClick={() => {
              setViewMode('COMPARE')
              setIsMobileMenuOpen(false)
            }}
            disabled={selectedIds.length < 1}
            className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-bold text-white transition-all transform active:scale-95 shadow-lg ${selectedIds.length < 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
          >
            <BarChart3 size={18} /> Comparar ({selectedIds.length})
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative w-full bg-gray-50/30">
        {viewMode === 'COMPARE' ? (
          <ComparisonView
            scenarios={scenarios}
            selectedIds={selectedIds}
            onBack={() => setViewMode('EDITOR')}
            getCardMetrics={getCardMetrics}
            onGenerateReport={(s: SimulationScenario) => setReportScenario(s)}
          />
        ) : (
          <EditorWizard
            step={step}
            setStep={setStep}
            data={data}
            setData={setData}
            currentName={currentName}
            setCurrentName={setCurrentName}
            onSave={handleSave}
            onGenerateReport={(scenarioData: SimulationScenario) => setReportScenario(scenarioData)}
          />
        )}
      </main>
    </div>
  )
}

const NumberInput = ({
  value,
  onChange,
  allowFloat = false, // Define se aceita decimais (Ex: INCC) ou só inteiros (Ex: Prazo)
  min,
  max,
  placeholder,
  className
}: {
  value: number | ''
  onChange: (val: number | '') => void
  allowFloat?: boolean
  min?: number
  max?: number
  placeholder?: string
  className?: string
}): ReactElement => {
  // Estado local string para permitir "0", "0.", "0,4" enquanto digita
  const [localValue, setLocalValue] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)

  // Sincroniza quando o valor externo muda (e o usuário não está digitando)
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value === '' || value === undefined ? '' : String(value))
    }
  }, [value, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value

    // Substitui vírgula por ponto para facilitar a digitação brasileira
    val = val.replace(',', '.')

    // Validação Regex: Permite digitar apenas números e UM ponto
    const regex = allowFloat ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/

    if (val === '' || regex.test(val)) {
      setLocalValue(val)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)

    if (localValue === '' || localValue === '.') {
      onChange('') // Se deixou vazio ou só um ponto, salva vazio
      setLocalValue('')
      return
    }

    let parsed = parseFloat(localValue)

    if (isNaN(parsed)) {
      onChange('')
      setLocalValue('')
      return
    }

    // APLICAÇÃO DAS REGRAS DE NEGÓCIO (Forçar valor ao sair)
    if (min !== undefined && parsed < min) parsed = min
    if (max !== undefined && parsed > max) parsed = max

    onChange(parsed)
    setLocalValue(String(parsed)) // Atualiza visualmente para o valor corrigido
  }

  return (
    <input
      type="text"
      inputMode={allowFloat ? "decimal" : "numeric"}
      className={className}
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      onFocus={() => setIsEditing(true)}
      onBlur={handleBlur}
    />
  )
}

export default App