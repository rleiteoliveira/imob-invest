import { useMemo, type ReactElement } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import {
  DollarSign,
  Calendar,
  Percent,
  Sparkles,
  Building2,
  TrendingUp,
  Wallet
} from 'lucide-react'
import CurrencyInput from '../../ui/CurrencyInput'
import NumberInput from '../../ui/NumberInput'
import { calculateRentalReturn } from '../../../core/engines/RentalCalculator'
import type { SimulationScenario, RentabilityConfig } from '../../../types/ScenarioTypes'

interface RentabilityViewProps {
  scenario: SimulationScenario
  onChange: (scenario: SimulationScenario) => void
  financingMonthlyCost?: number // Keeping optional for backwards compat or hint if needed, but primary is internal config
}

const defaultConfig: RentabilityConfig = {
  projectedMonthlyIncome: 3000,
  occupancyRate: 80,
  managementFeePercent: 10,
  cleaningFee: 100,
  monthlyCondo: 400,
  monthlyMaintenance: 200,
  monthlyTurnover: 2
}

const formatMoney = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val)
}

// Custom toolitp for chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
        <p className="font-bold text-gray-700 text-sm mb-1">{label}</p>
        <p className="text-blue-600 font-bold text-base">
          {formatMoney(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export default function RentabilityView({
  scenario,
  onChange
}: RentabilityViewProps): ReactElement {
  const config = scenario.rentability || defaultConfig

  const updateConfig = (key: keyof RentabilityConfig, value: number | '') => {
    const newConfig = { ...config, [key]: value }
    onChange({ ...scenario, rentability: newConfig })
  }


  const effectiveFinancingCost = Number(config.financingCostOverride) || 0

  const metrics = useMemo(() => {
    return calculateRentalReturn(config, effectiveFinancingCost)
  }, [config, effectiveFinancingCost])

  const chartData = [
    {
      name: 'Receita',
      Valor: metrics.grossRevenue,
      color: '#10b981'
    },
    {
      name: 'Custos',
      Valor: metrics.totalExpenses + effectiveFinancingCost,
      color: '#ef4444'
    },
    {
      name: 'Lucro',
      Valor: metrics.cashFlow,
      color: metrics.cashFlow >= 0 ? '#3b82f6' : '#f97316'
    }
  ]

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
      {/* Esquerda: Inputs */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Análise Lucro</h2>
              <p className="text-xs text-gray-400">Configure as premissas de aluguel</p>
            </div>
          </div>

          <div className="space-y-4">
            <CurrencyInput
              label="Receita Mensal Potencial"
              value={config.projectedMonthlyIncome}
              onChange={(v) => updateConfig('projectedMonthlyIncome', v)}
              prefix="R$"
              highlight='Mensal'
            />

            <div className="w-full">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
                Taxa de Ocupação (%)
              </label>
              <div className="relative flex items-center border border-gray-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
                <Percent size={16} className="absolute left-3 text-gray-400" />
                <NumberInput
                  value={config.occupancyRate}
                  onChange={(v) => updateConfig('occupancyRate', v)}
                  className="w-full pl-9 pr-3 py-3 outline-none font-bold text-lg text-gray-800 bg-transparent rounded-xl"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className="w-full">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1">
                Taxa de Gestão (%)
              </label>
              <div className="relative flex items-center border border-gray-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
                <Percent size={16} className="absolute left-3 text-gray-400" />
                <NumberInput
                  value={config.managementFeePercent}
                  onChange={(v) => updateConfig('managementFeePercent', v)}
                  className="w-full pl-9 pr-3 py-3 outline-none font-bold text-lg text-gray-800 bg-transparent rounded-xl"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1">Rotatividade/Mês</label>
                <div className="relative flex items-center border border-gray-300 rounded-xl bg-white">
                  <Calendar size={16} className="absolute left-3 text-gray-400" />
                  <NumberInput
                    value={config.monthlyTurnover}
                    onChange={(v) => updateConfig('monthlyTurnover', v)}
                    className="w-full pl-9 pr-3 py-3 outline-none font-bold text-lg text-gray-800 bg-transparent rounded-xl"
                  />
                </div>
              </div>
              <div>
                <CurrencyInput
                  label="Custo Variável (Un)"
                  value={config.cleaningFee}
                  onChange={(v) => updateConfig('cleaningFee', v)}
                  prefix="R$"
                />
              </div>
            </div>

            <CurrencyInput
              label="Condomínio Mensal"
              value={config.monthlyCondo}
              onChange={(v) => updateConfig('monthlyCondo', v)}
              prefix="R$"
            />
            <CurrencyInput
              label="Manutenção/Internet/Luz"
              value={config.monthlyMaintenance}
              onChange={(v) => updateConfig('monthlyMaintenance', v)}
              prefix="R$"
            />
          </div>

          {/* Financing Override Section */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Custo de Financiamento
            </h3>
            <CurrencyInput
              label="Parcela Mensal (Opcional)"
              value={config.financingCostOverride ?? ''}
              onChange={(v) => updateConfig('financingCostOverride', v)}
              prefix="R$"
              subtitle="Se vazio, será desconsiderado"
            />
          </div>
        </div>
      </div>

      {/* Direita: Resultados */}
      <div className="flex-1 flex flex-col gap-6">

        {/* Cards de Resultado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Receita */}
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Receita</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatMoney(metrics.grossRevenue)}</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">/ mês bruto</p>
          </div>

          {/* Despesas Op */}
          <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Despesas Op.</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatMoney(metrics.totalExpenses)}</p>
            <p className="text-xs text-orange-600 mt-1 font-medium">Taxas + Limpeza + Cond.</p>
          </div>

          {/* Financiamento - Only show if > 0 */}
          {effectiveFinancingCost > 0 && (
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Parcela</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{formatMoney(effectiveFinancingCost)}</p>
              <p className="text-xs text-blue-600 mt-1 font-medium">Financiamento</p>
            </div>
          )}


          {/* Lucro Líquido */}
          <div className={`border p-5 rounded-2xl flex flex-col justify-between ${metrics.cashFlow >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metrics.cashFlow >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'}`}>
                <Wallet size={18} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${metrics.cashFlow >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>No Bolso</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatMoney(metrics.cashFlow)}</p>
            <p className={`text-xs mt-1 font-medium ${metrics.cashFlow >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
              {metrics.cashFlow >= 0 ? 'Lucro Líquido' : 'Prejuízo Mensal'}
            </p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="flex-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Comparativo de Rentabilidade
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                  dy={10}
                />
                <YAxis
                  hide={true}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar
                  dataKey="Valor"
                  radius={[8, 8, 8, 8]}
                  barSize={60}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
