import { useMemo, type ReactElement } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts'
import {
  Percent,
  Calendar,
  Sparkles,
  Building2,
  TrendingUp
} from 'lucide-react'
import CurrencyInput from '../../../components/ui/CurrencyInput'
import NumberInput from '../../../components/ui/NumberInput'
import AnimatedNumber from '../../../components/ui/AnimatedNumber'
import { calculateRentalReturn } from '../../simulator/services/engines/RentalCalculator'
import type { SimulationScenario, RentabilityConfig } from '../../../types/ScenarioTypes'

interface RentabilityViewProps {
  scenario: SimulationScenario
  onChange: (scenario: SimulationScenario) => void
  financingMonthlyCost?: number
}

const defaultConfig: RentabilityConfig = {
  projectedMonthlyIncome: 3000,
  occupancyRate: 80,
  managementFeePercent: 10,
  cleaningFee: 100,
  monthlyCondo: 400,
  monthlyMaintenance: 200,
  monthlyTurnover: 2,
  rentalPeriod: 'monthly'
}

const formatMoney = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val)
}

// Custom toolitp for chart
// Internal Components
interface KPICardProps {
  label: string
  value: number
  subtitle?: string
  color: 'teal' | 'red' | 'green'
  size?: 'md' | 'lg'
  highlight?: boolean
}

const KPICard = ({ label, value, subtitle, color, highlight = false }: KPICardProps) => {
  const colorStyles = {
    teal: {
      bg: 'theme-bg-card',
      border: 'theme-border',
      text: 'text-teal-700',
      iconBg: 'bg-teal-100',
      icon: 'text-teal-600',
      value: 'theme-text-main'
    },
    red: {
      bg: 'theme-bg-card',
      border: 'theme-border',
      text: 'text-red-700',
      iconBg: 'bg-red-100',
      icon: 'text-red-600',
      value: 'theme-text-main'
    },
    green: {
      bg: 'theme-bg-card',
      border: 'theme-border ring-1 ring-emerald-100',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      icon: 'text-emerald-600',
      value: 'text-emerald-600'
    }
  }

  const currentStyle = colorStyles[color]

  return (
    <div className={`
      relative overflow-hidden theme-rounded-card flex flex-col justify-between transition-all duration-300 cursor-default
      ${currentStyle.bg} ${currentStyle.border} theme-shadow border
      ${highlight ? 'hover:shadow-lg hover:scale-[1.02]' : 'hover:shadow-md hover:scale-[1.01]'}
      p-4
    `}>
      <div className="flex items-start justify-between mb-2">
        <span className={`font-semibold uppercase tracking-wider ${currentStyle.text} text-[10px]`}>
          {label}
        </span>
        {highlight && (
          <div className={`${currentStyle.iconBg} ${currentStyle.icon} p-1.5 rounded-lg`}>
            <TrendingUp size={14} />
          </div>
        )}
      </div>

      <div>
        <div className={`font-bold tracking-tight ${currentStyle.value} text-2xl`}>
          <AnimatedNumber value={value} />
        </div>
        {subtitle && (
          <p className={`font-medium mt-0.5 ${currentStyle.text} text-[10px] flex items-center gap-1`}>
            {highlight && <Sparkles size={10} className="text-emerald-500" />}
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

const AnnualProjectionCard = ({ monthlyProfit, occupancyRate, propertyValue }: { monthlyProfit: number, occupancyRate: number, propertyValue: number }) => {
  const annualProfit = monthlyProfit * 12
  const yieldAnnual = propertyValue > 0 ? (annualProfit / propertyValue) * 100 : 0

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-1 border border-teal-500/20 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-900/40 p-4 rounded-2xl backdrop-blur-md">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 text-teal-400">
            <div className="p-1 bg-teal-500/10 rounded-md">
              <TrendingUp size={12} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Projeção Anual</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-white tracking-tight">
              <AnimatedNumber value={annualProfit} />
            </div>
            <span className="text-xs text-gray-400 font-medium">/ ano</span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              {yieldAnnual.toFixed(2)}% a.a.
            </span>
            <span className="text-gray-500 text-[10px]">
              (Ocupação base: {occupancyRate}%)
            </span>
          </div>
        </div>

        {/* Separator / Divider visually */}
        <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent via-gray-700 to-transparent mx-2" />

        {/* Right Section: Tip */}
        <div className="flex-1 w-full md:w-auto bg-gradient-to-br from-teal-500/5 to-teal-500/0 rounded-lg border border-teal-500/10 p-3 relative hover:border-teal-500/20 transition-colors">
          <div className="flex items-start gap-3">
            <div className="bg-teal-500/20 text-teal-300 p-1.5 rounded-lg shrink-0">
              <Sparkles size={14} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-teal-200 uppercase mb-0.5">Dica de Performance</p>
              <p className="text-[11px] text-gray-300 leading-snug">
                Aumente a ocupação para <strong className="text-teal-300">{Math.min(occupancyRate + 10, 100)}%</strong> para incrementar seu Yield.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const formatPercent = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(val / 100)
}

const InvestmentHighlights = ({ metrics, propertyValue }: { metrics: { cashFlow: number, grossRevenue: number }, propertyValue: number }) => {
  const annualProfit = metrics.cashFlow * 12
  const annualYield = propertyValue > 0 ? (annualProfit / propertyValue) * 100 : 0

  const highlights = [
    {
      icon: '💰',
      title: 'Geração Imediata de Renda',
      subtitle: 'Lucro mensal garantido',
      value: <><AnimatedNumber value={metrics.cashFlow} />/mês</>,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-900',
      subTextColor: 'text-emerald-700',
      valueColor: 'text-emerald-600'
    },
    {
      icon: '📈',
      title: 'Patrimônio Crescente',
      subtitle: 'Imóvel + renda acumulada',
      value: 'A cada mês, seu patrimônio aumenta',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      subTextColor: 'text-blue-700',
      valueColor: 'text-blue-600'
    },
    {
      icon: '💪',
      title: 'Rentabilidade Anual',
      subtitle: 'Retorno sobre o valor do imóvel',
      value: `${formatPercent(annualYield)} a.a.`,
      color: 'teal',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-900',
      subTextColor: 'text-teal-700',
      valueColor: 'text-teal-600'
    },
    {
      icon: '🔒',
      title: 'Segurança: Ativo Tangível',
      subtitle: 'Você possui um imóvel real',
      value: <>Valor: <AnimatedNumber value={propertyValue} /></>,
      color: 'amber',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      subTextColor: 'text-amber-700',
      valueColor: 'text-amber-600'
    }
  ]

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold theme-text-main mb-4 flex items-center gap-2 uppercase tracking-wide">
        <Sparkles className="w-4 h-4 text-teal-600" />
        Destaques
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {highlights.map((highlight, idx) => (
          <div
            key={idx}
            className={`${highlight.bgColor} border ${highlight.borderColor} rounded-xl p-3 hover:shadow-md transition-shadow cursor-default`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xl filter drop-shadow-sm">{highlight.icon}</span>
                <span className={`text-[10px] font-bold ${highlight.textColor} uppercase tracking-wide opacity-80`}>
                  {highlight.title}
                </span>
              </div>
              <div>
                <div className={`font-bold ${highlight.valueColor} text-sm mb-0.5`}>
                  {highlight.value}
                </div>
                <p className={`text-[10px] ${highlight.subTextColor} font-medium leading-tight`}>
                  {highlight.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RentabilityView({
  scenario,
  onChange
}: RentabilityViewProps): ReactElement {
  const config = scenario.rentability || defaultConfig

  const updateConfig = (key: keyof RentabilityConfig, value: any) => {
    const newConfig = { ...config, [key]: value }
    onChange({ ...scenario, rentability: newConfig })
  }

  const isDaily = config.rentalPeriod === 'daily'

  const effectiveFinancingCost = Number(config.financingCostOverride) || 0

  const metrics = useMemo(() => {
    return calculateRentalReturn(config, effectiveFinancingCost)
  }, [config, effectiveFinancingCost])

  const totalOutflows = metrics.totalExpenses + effectiveFinancingCost

  const chartData = [
    {
      name: 'Receita',
      Valor: metrics.grossRevenue,
      color: '#14b8a6' // teal-500
    },
    {
      name: 'Custos',
      Valor: totalOutflows,
      color: '#ef4444' // red-500
    },
    {
      name: 'Lucro Líquido',
      Valor: metrics.cashFlow,
      color: metrics.cashFlow >= 0 ? '#10b981' : '#f97316' // emerald-500
    }
  ]

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-4 overflow-y-auto w-full max-w-screen-2xl mx-auto">
      {/* Esquerda: Inputs - Fixed width on Desktop */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
        <div className="theme-bg-card p-6 theme-rounded-card theme-border border-0 shadow-none ring-1 ring-white/20">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center">
              <Building2 size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold theme-text-main">Análise Lucro</h2>
              <p className="text-[11px] theme-text-muted">Configure as premissas</p>
            </div>
          </div>

          <div className="space-y-3">
            <CurrencyInput
              label="Valor do Imóvel"
              value={scenario.propertyValue}
              onChange={(v) => onChange({ ...scenario, propertyValue: v })}
              prefix="R$"
              subtitle="Base YIED"
            />

            <div>
              <div className="flex items-end justify-between mb-1.5 min-h-[20px]">
                <label className="text-[10px] font-bold theme-text-muted uppercase tracking-wider">
                  {isDaily ? 'Valor da Diária' : 'Receita Mensal Potencial'}
                </label>

                {/* Modern Segmented Segment Control */}
                <div
                  className="flex items-center bg-gray-100/50 rounded-md p-0.5 cursor-pointer relative select-none border border-gray-200"
                  onClick={() => updateConfig('rentalPeriod', isDaily ? 'monthly' : 'daily')}
                >
                  {/* Active Indicator */}
                  <div
                    className={`absolute top-[2px] bottom-[2px] w-[calc(50%-2px)] bg-white rounded shadow-sm transition-all duration-300 ease-out
                      ${isDaily ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`}
                  />

                  {/* Labels */}
                  <div className={`relative z-10 px-2.5 py-0.5 text-[9px] font-bold transition-colors duration-300 ${!isDaily ? 'text-teal-700' : 'text-gray-400'}`}>
                    MENSAL
                  </div>
                  <div className={`relative z-10 px-2.5 py-0.5 text-[9px] font-bold transition-colors duration-300 ${isDaily ? 'text-teal-700' : 'text-gray-400'}`}>
                    DIÁRIA
                  </div>
                </div>
              </div>

              <CurrencyInput
                label=""
                value={isDaily ? (Number(config.projectedMonthlyIncome) / 30) : config.projectedMonthlyIncome}
                onChange={(v) => {
                  const monthlyValue = isDaily ? (Number(v) * 30) : v
                  updateConfig('projectedMonthlyIncome', monthlyValue)
                }}
                prefix="R$"
              />
            </div>

            <div className="w-full">
              <label className="text-[10px] font-bold theme-text-muted uppercase mb-1 flex justify-between">
                Ocupação (%)
              </label>
              <div className="relative flex items-center border theme-border rounded-lg bg-white/50 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all h-10">
                <Percent size={14} className="absolute left-3 text-gray-400" />
                <NumberInput
                  value={config.occupancyRate}
                  onChange={(v) => updateConfig('occupancyRate', v)}
                  className="w-full pl-8 pr-3 py-2 outline-none font-bold text-sm theme-text-main bg-transparent rounded-lg"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="w-full">
                <label className="text-[10px] font-bold theme-text-muted uppercase mb-1">
                  Taxa Gestão
                </label>
                <div className="relative flex items-center border theme-border rounded-lg bg-white/50 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all h-10">
                  <Percent size={14} className="absolute left-3 text-gray-400" />
                  <NumberInput
                    value={config.managementFeePercent}
                    onChange={(v) => updateConfig('managementFeePercent', v)}
                    className="w-full pl-8 pr-3 py-2 outline-none font-bold text-sm theme-text-main bg-transparent rounded-lg"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold theme-text-muted uppercase mb-1">Giro/Mês</label>
                <div className="relative flex items-center border theme-border rounded-lg bg-white/50 h-10">
                  <Calendar size={14} className="absolute left-3 text-gray-400" />
                  <NumberInput
                    value={config.monthlyTurnover}
                    onChange={(v) => updateConfig('monthlyTurnover', v)}
                    className="w-full pl-8 pr-3 py-2 outline-none font-bold text-sm theme-text-main bg-transparent rounded-lg"
                  />
                </div>
              </div>
            </div>

            <CurrencyInput
              label="Custo Variável (Un)"
              value={config.cleaningFee}
              onChange={(v) => updateConfig('cleaningFee', v)}
              prefix="R$"
            />

            <div className="grid grid-cols-2 gap-2">
              <CurrencyInput
                label="Condomínio"
                value={config.monthlyCondo}
                onChange={(v) => updateConfig('monthlyCondo', v)}
                prefix="R$"
              />
              <CurrencyInput
                label="Manutenção/Luz"
                value={config.monthlyMaintenance}
                onChange={(v) => updateConfig('monthlyMaintenance', v)}
                prefix="R$"
              />
            </div>
          </div>

          {/* Financing Override Section */}
          <div className="border-t theme-border pt-3 mt-3">
            <h3 className="text-[10px] font-bold theme-text-muted uppercase tracking-widest mb-2">
              Financiamento
            </h3>
            <CurrencyInput
              label="Parcela Mensal"
              value={config.financingCostOverride ?? ''}
              onChange={(v) => updateConfig('financingCostOverride', v)}
              prefix="R$"
              subtitle="Opcional"
            />
          </div>
        </div>
      </div>

      {/* Direita: Resultados */}
      <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <KPICard
            label="RECEITA"
            value={metrics.grossRevenue}
            subtitle="(bruto)"
            color="teal"
            size="md"
          />
          <KPICard
            label="CUSTOS"
            value={totalOutflows}
            subtitle="Taxas + Cond + Parc."
            color="red"
            size="md"
          />
          <KPICard
            label="LUCRO MENSAL"
            value={metrics.cashFlow}
            subtitle={`${((metrics.cashFlow * 12 / (Number(scenario.propertyValue) || 1)) * 100).toFixed(2)}% a.a. (Yield)`}
            color="green"
            size="lg"
            highlight={true}
          />
        </div>

        {/* Insight Card */}
        <AnnualProjectionCard
          monthlyProfit={metrics.cashFlow}
          occupancyRate={Number(config.occupancyRate) || 0}
          propertyValue={Number(scenario.propertyValue) || 1}
        />

        {/* Gráfico */}
        <div className="flex-1 theme-bg-card p-4 theme-rounded-card theme-border border shadow-md flex flex-col min-h-[250px] relative">
          <h3 className="text-xs font-bold theme-text-main mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp size={14} className="text-teal-500" />
            Estrutura de Resultados
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  width={70}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const val = payload[0].value as number;
                      return (
                        <div className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-lg">
                          {formatMoney(val)}
                        </div>
                      )
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="Valor"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1000}
                >
                  <LabelList
                    dataKey="Valor"
                    position="right"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any) => formatMoney(val)}
                    style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }}
                  />
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 pt-2 border-t theme-border flex justify-between items-center">
            <p className="text-[10px] text-gray-400">
              Margem de Lucro: <span className="font-bold text-emerald-600">{((metrics.cashFlow / metrics.grossRevenue) * 100).toFixed(1)}%</span>
            </p>
          </div>
        </div>

        {/* Destaques do Investimento */}
        <InvestmentHighlights metrics={metrics} propertyValue={Number(scenario.propertyValue) || 1} />
      </div>
    </div>
  )
}
