import { ReactElement, useMemo } from 'react'
import { ArrowLeft, Building2, Settings2, Key, TrendingUp, Wallet, FileText } from 'lucide-react'
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
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import { CaixaMCMV } from '../../../core/engines/CaixaMCMV'

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
    const engine = new CaixaMCMV()

    const timelines = selectedScenarios.map((s: any) => {
      const timeline = engine.calculate(s)
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

export default ComparisonView
