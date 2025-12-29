import { useMemo, type ReactElement } from 'react'
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

interface EvolutionChartProps {
  scenarios: SimulationScenario[]
  height?: number
}

const EvolutionChart = ({ scenarios, height = 300 }: EvolutionChartProps): ReactElement => {
  const colors = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed']

  const chartData = useMemo(() => {
    if (scenarios.length === 0) return []
    let maxMonths = 0
    const engine = new CaixaMCMV()

    const timelines = scenarios.map((s) => {
      // Ensure we have a valid ID for keying
      const safeId = s.id || 'current'
      const timeline = engine.calculate(s)
      if (timeline.length > maxMonths) maxMonths = timeline.length
      return { id: safeId, name: s.name || 'Cenário', timeline }
    })

    const points: Record<string, any>[] = []
    const step = maxMonths > 120 ? 12 : 1

    // Limit to reasonable render points for performance if dragging slider
    // If step is small and maxMonths is huge, it might be slow.
    // Optimization: If dragging (updates frequent), maybe sample less points?
    // For now, standard logic.

    for (let m = 1; m <= maxMonths; m += step) {
      const point: Record<string, any> = { name: `Mês ${m}` }
      timelines.forEach((t) => {
        const exactData = t.timeline.find((x) => x.month === m)
        if (exactData) point[t.id] = exactData.accumulatedPaid
      })
      points.push(point)
    }
    return points
  }, [scenarios])

  if (scenarios.length === 0) return <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados para exibir</div>

  return (
    <div className="w-full bg-white rounded-3xl" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            formatter={(value: any) =>
              new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
            }
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
          {scenarios.map((s, idx) => (
            <Line
              key={s.id || 'current'}
              type="monotone"
              dataKey={s.id || 'current'}
              name={s.name || 'Cenário Atual'}
              stroke={colors[idx % colors.length]}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
              isAnimationActive={false} // Important for slider performance!
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EvolutionChart
