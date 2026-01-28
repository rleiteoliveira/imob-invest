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
import { useThemeStyles } from '../../../hooks/useThemeStyles'
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
  const { colors, components } = useThemeStyles()

  // Simple map for specific accent colors (keeping semantic meaning)
  const accents = {
    teal: colors.primary, // Use primary for generic positive/info
    red: colors.danger,
    green: colors.success
  }

  const activeColor = accents[color] || colors.primary

  return (
    <div className={`
      relative overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-default
      ${components.card.wrapper} p-4
    `}>
      <div className="flex items-start justify-between mb-2">
        <span className="font-semibold uppercase tracking-wider text-[10px]" style={{ color: colors.textMuted }}>
          {label}
        </span>
        {highlight && (
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${activeColor}15`, color: activeColor }}>
            <TrendingUp size={14} />
          </div>
        )}
      </div>

      <div>
        <div className="font-bold tracking-tight text-2xl" style={{ color: colors.text }}>
          <AnimatedNumber value={value} />
        </div>
        {subtitle && (
          <p className="font-medium mt-0.5 text-[10px] flex items-center gap-1" style={{ color: activeColor }}>
            {highlight && <Sparkles size={10} />}
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

const AnnualProjectionCard = ({ monthlyProfit, occupancyRate, propertyValue }: { monthlyProfit: number, occupancyRate: number, propertyValue: number }) => {
  const { colors, components } = useThemeStyles()
  const annualProfit = monthlyProfit * 12
  const yieldAnnual = propertyValue > 0 ? (annualProfit / propertyValue) * 100 : 0

  return (
    <div className={`${components.card.wrapper} p-1 relative overflow-hidden group`}>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1" style={{ color: colors.primary }}>
            <div className="p-1 rounded-md" style={{ backgroundColor: `${colors.primary}15` }}>
              <TrendingUp size={12} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Projeção Anual</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
              <AnimatedNumber value={annualProfit} />
            </div>
            <span className="text-xs font-medium" style={{ color: colors.textMuted }}>/ ano</span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="px-1.5 py-0.5 rounded-full font-bold text-[10px]" style={{ backgroundColor: `${colors.success}15`, color: colors.success, border: `1px solid ${colors.success}30` }}>
              {yieldAnnual.toFixed(2)}% a.a.
            </span>
            <span className="text-[10px]" style={{ color: colors.textMuted }}>
              (Ocupação base: {occupancyRate}%)
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-12 mx-2" style={{ backgroundColor: colors.border }} />

        {/* Right Section: Tip */}
        <div className="flex-1 w-full md:w-auto rounded-lg p-3 relative transition-colors border" style={{ borderColor: `${colors.primary}20`, backgroundColor: `${colors.primary}05` }}>
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
              <Sparkles size={14} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase mb-0.5" style={{ color: colors.primary }}>Dica de Performance</p>
              <p className="text-[11px] leading-snug" style={{ color: colors.textMuted }}>
                Aumente a ocupação para <strong style={{ color: colors.primary }}>{Math.min(occupancyRate + 10, 100)}%</strong> para incrementar seu Yield.
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
  const { colors, components } = useThemeStyles()
  const annualProfit = metrics.cashFlow * 12
  const annualYield = propertyValue > 0 ? (annualProfit / propertyValue) * 100 : 0

  const highlights = [
    {
      icon: '💰',
      title: 'Geração Imediata de Renda',
      subtitle: 'Lucro mensal garantido',
      value: <><AnimatedNumber value={metrics.cashFlow} />/mês</>,
    },
    {
      icon: '📈',
      title: 'Patrimônio Crescente',
      subtitle: 'Imóvel + renda acumulada',
      value: 'A cada mês, seu patrimônio aumenta',
    },
    {
      icon: '💪',
      title: 'Rentabilidade Anual',
      subtitle: 'Retorno sobre o valor do imóvel',
      value: `${formatPercent(annualYield)} a.a.`,
    },
    {
      icon: '🔒',
      title: 'Segurança: Ativo Tangível',
      subtitle: 'Você possui um imóvel real',
      value: <>Valor: <AnimatedNumber value={propertyValue} /></>,
    }
  ]

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 uppercase tracking-wide" style={{ color: colors.text }}>
        <Sparkles className="w-4 h-4" style={{ color: colors.primary }} />
        Destaques
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {highlights.map((highlight, idx) => (
          <div
            key={idx}
            className={`${components.card.wrapper} p-3 cursor-default`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xl filter drop-shadow-sm">{highlight.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-80" style={{ color: colors.primary }}>
                  {highlight.title}
                </span>
              </div>
              <div>
                <div className="font-bold text-sm mb-0.5" style={{ color: colors.text }}>
                  {highlight.value}
                </div>
                <p className="text-[10px] font-medium leading-tight" style={{ color: colors.textMuted }}>
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

  /* Colors based on Theme */
  const { colors, components } = useThemeStyles()

  const chartData = [
    {
      name: 'Receita',
      Valor: metrics.grossRevenue,
      color: colors.success || '#10b981'
    },
    {
      name: 'Custos',
      Valor: totalOutflows,
      color: colors.danger || '#ef4444'
    },
    {
      name: 'Lucro Líquido',
      Valor: metrics.cashFlow,
      color: colors.primary || '#3b82f6'
    }
  ]

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-4 overflow-y-auto w-full max-w-screen-2xl mx-auto">
      {/* Esquerda: Inputs - Fixed width on Desktop */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
        <div className={`p-6 transition-all ${components.card.wrapper}`}>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center p-2" style={{ backgroundColor: `${colors.danger}15`, color: colors.danger }}>
              <Building2 size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: colors.text }}>Análise Lucro</h2>
              <p className="text-[11px]" style={{ color: colors.textMuted }}>Configure as premissas</p>
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
                  className={`flex items-center rounded-md p-0.5 cursor-pointer relative select-none border transition-all`}
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  onClick={() => updateConfig('rentalPeriod', isDaily ? 'monthly' : 'daily')}
                >
                  {/* Active Indicator */}
                  <div
                    className={`absolute top-[2px] bottom-[2px] w-[calc(50%-2px)] rounded shadow-sm transition-all duration-300 ease-out
                      ${isDaily ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`}
                    style={{ backgroundColor: colors.primary }}
                  />

                  {/* Labels */}
                  <div className={`relative z-10 px-2.5 py-0.5 text-[9px] font-bold transition-colors duration-300 ${!isDaily ? 'text-white' : ''}`} style={isDaily ? { color: colors.textMuted } : {}}>
                    MENSAL
                  </div>
                  <div className={`relative z-10 px-2.5 py-0.5 text-[9px] font-bold transition-colors duration-300 ${isDaily ? 'text-white' : ''}`} style={!isDaily ? { color: colors.textMuted } : {}}>
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
              <label className="text-[10px] font-bold uppercase mb-1 flex justify-between" style={{ color: colors.textMuted }}>
                Ocupação (%)
              </label>
              <div className={`relative flex items-center border rounded-lg transition-all h-10 ${components.input.wrapper}`} style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
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
                <label className="text-[10px] font-bold uppercase mb-1" style={{ color: colors.textMuted }}>
                  Taxa Gestão
                </label>
                <div className={`relative flex items-center border rounded-lg transition-all h-10 ${components.input.wrapper}`} style={{ borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }}>
                  <Percent size={14} className="absolute left-3" style={{ color: colors.textMuted }} />
                  <NumberInput
                    value={config.managementFeePercent}
                    onChange={(v) => updateConfig('managementFeePercent', v)}
                    className="w-full pl-8 pr-3 py-2 outline-none font-bold text-sm bg-transparent rounded-lg"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase mb-1" style={{ color: colors.textMuted }}>Giro/Mês</label>
                <div className={`relative flex items-center border rounded-lg h-10 ${components.input.wrapper}`} style={{ borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }}>
                  <Calendar size={14} className="absolute left-3" style={{ color: colors.textMuted }} />
                  <NumberInput
                    value={config.monthlyTurnover}
                    onChange={(v) => updateConfig('monthlyTurnover', v)}
                    className="w-full pl-8 pr-3 py-2 outline-none font-bold text-sm bg-transparent rounded-lg"
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
          <div className="border-t pt-3 mt-3" style={{ borderColor: colors.border }}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textMuted }}>
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
        <div className={`flex-1 p-4 border flex flex-col min-h-[250px] relative transition-all ${components.card.wrapper}`} style={{ borderColor: colors.border }}>
          <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider" style={{ color: colors.text }}>
            <TrendingUp size={14} style={{ color: colors.primary }} />
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
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={colors.border} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.textMuted, fontSize: 10, fontWeight: 600 }}
                  width={70}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(128,128,128,0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const val = payload[0].value as number;
                      return (
                        <div className="text-[10px] py-1 px-2 rounded shadow-lg" style={{ backgroundColor: colors.surface, color: colors.text, border: `1px solid ${colors.border}` }}>
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
                    style={{ fontSize: '10px', fontWeight: 'bold', fill: colors.textMuted }}
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
