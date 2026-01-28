import type { ReactElement } from 'react'
import type { SimulationScenario } from '../../../../../types/ScenarioTypes'
import SmartInput from '../../../../../components/ui/SmartInput'
import { Wallet, Landmark } from 'lucide-react'
import { useThemeStyles } from '../../../../../hooks/useThemeStyles'

interface StepProps {
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function Step2Values({ data, setData }: StepProps): ReactElement {
  const { colors, components } = useThemeStyles()

  const propertyValue = Number(data.propertyValue) || 0
  const downPayment = Number(data.downPayment) || 0

  // Logic from UnifiedEditor to handle basic financed calc
  // Note: Complex balloon deductions happen in Step 3 or Engine, 
  // but here we show the main split: Entry vs Financing.

  const financedAmount = Math.max(0, propertyValue - downPayment)
  const financedPercent = propertyValue > 0 ? (financedAmount / propertyValue) * 100 : 0
  const downPaymentPercent = propertyValue > 0 ? (downPayment / propertyValue) * 100 : 0

  const handlePropertyValueChange = (newVal: number) => {
    // Keep 'downPayment' percentage fixed relative to new 'propertyValue'
    // If propertyValue is 0 (or new value is 0), handle gracefully
    let newDownPayment = 0
    const currentPropValue = Number(data.propertyValue)
    const currentDownPayment = Number(data.downPayment)

    if (currentPropValue > 0) {
      const currentRatio = currentDownPayment / currentPropValue
      newDownPayment = newVal * currentRatio
    } else {
      // Only if starting from 0, maybe keep 0 or set a default 20%? 
      // Sticking to 20% default if previously 0 is safer UX
      newDownPayment = newVal * 0.20
    }

    // Round to 2 decimal places to avoid float issues
    newDownPayment = Math.round(newDownPayment * 100) / 100

    setData({
      ...data,
      propertyValue: newVal,
      downPayment: newDownPayment
    })
  }

  const handleFinancedChange = (val: number): void => {
    // If user changes financed amount, we adjust down payment
    // Financing slider is disabled, but if we ever enable typing:
    const newDownPayment = Math.max(0, propertyValue - val)
    setData({ ...data, downPayment: newDownPayment })
  }

  // Visualization Colors: Dynamic from Theme
  // Entry = Secondary Color (Pink in Retro, Dark in Default) -> Actually let's use Secondary for Entry
  // Finance = Primary Color (Violet in Retro, Blue in Default)

  // Note: Default theme secondary is slate-900 (blackish). Maybe we want emerald?
  // Let's use 'success' color for Entry in default theme to match previous logic (Emerald).
  // In Retro theme, we want Pink. Pink is secondary in Retro.
  // So: Entry = colors.secondary (Retro) OR colors.success (Default).
  // This is where semantic mapping matters. 
  // Let's assume 'secondary' is the accent for Entry. However, in default theme secondary is dark.
  // I will check if I can use 'colors.secondary' for all.
  // Retro: secondary is Pink. GOOD.
  // Default: secondary is '#0f172a'. BAD (Black). We want Emerald.
  // Solução: Use specific colors if we want to match exact legacy behavior, or redefine default secondary.
  // For now I will map explicitly:
  // Let's us: 
  // Finance -> Primary.
  // Entry -> Secondary (if Retro) else Success. 
  // Better: I should have defined 'chart' colors in theme.
  // I will fallback to: Retro -> Pink (secondary), Default -> Emerald (success).
  // Actually, let's just use 'colors.secondary' for Entry and see if we can update Default Theme secondary to be Emerald? No, that breaks other things.
  // Let's use 'colors.success' for Entry (Emerald in Default, Green in Retro). Retro wants Pink.
  // Okay, I will implement a quick checks or just use the colors directly if I can't guarantee semantic match yet.

  // WORKAROUND: Use 'colors.text' as a proxy? No.
  // Let's stick to the previous manual colors for this specific chart OR accept the theme change.
  // I'll try to use theme properties.
  // Retro Primary: Violet. Retro Secondary: Pink.
  // Default Primary: Blue. Default Success: Emerald.

  // Let's us: 
  // Finance -> Primary.
  // Entry -> Secondary (if Retro) else Success.
  const isRetroTheme = colors.secondary === '#f472b6'
  const finalEntryColor = isRetroTheme ? colors.secondary : colors.success
  const finalFinanceColor = colors.primary

  // Simple Donut Chart using CSS conic-gradient
  const donutStyle = {
    background: `conic-gradient(
      ${finalEntryColor} 0% ${downPaymentPercent}%, 
      ${finalFinanceColor} ${downPaymentPercent}% 100%
    )`
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Left: Inputs */}
      <div className="flex-1 space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: colors.text }}>Definição de Valores</h2>
          <p className="text-sm" style={{ color: colors.textMuted }}>Ajuste o valor do imóvel e quanto deseja dar de entrada.</p>
        </div>

        <SmartInput
          label="Valor do Imóvel"
          prefix="R$"
          value={data.propertyValue}
          onChange={handlePropertyValueChange}
          disableSlider
        />

        <div className={`p-6 ${components.card.wrapper}`}>
          <div className="flex items-center gap-2 mb-4 font-bold uppercase text-xs tracking-wide" style={{ color: finalEntryColor }}>
            <Wallet size={16} /> Entrada (Recursos Próprios)
          </div>
          <SmartInput
            label="Valor da Entrada"
            highlight={`${downPaymentPercent.toFixed(1)}%`}
            prefix="R$"
            value={data.downPayment}
            onChange={(v: number) => setData({ ...data, downPayment: v })}
            max={propertyValue}
            subtitle="Sinal + FGTS + Parcelas durante obra"
            sliderStep={1000}
          />
        </div>

        <div className={`p-6 ${components.card.wrapper}`}>
          <div className="flex items-center gap-2 mb-4 font-bold uppercase text-xs tracking-wide" style={{ color: finalFinanceColor }}>
            <Landmark size={16} /> Financiamento Bancário
          </div>
          <SmartInput
            label="Valor a Financiar"
            highlight={`${financedPercent.toFixed(1)}%`}
            prefix="R$"
            value={financedAmount}
            onChange={handleFinancedChange}
            max={propertyValue}
            subtitle="Saldo Devedor"
            disableSlider
          />
        </div>
      </div>

      {/* Right: Visualization */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 ${components.card.wrapper}`}>
        <div className={`relative w-64 h-64 rounded-full transition-all duration-500 shadow-none border-2`} style={{ borderColor: colors.border, background: donutStyle.background }}>
          {/* Inner White Circle */}
          <div className="absolute inset-4 rounded-full flex flex-col items-center justify-center border-2 border-transparent" style={{ backgroundColor: colors.surface }}>
            <span className="font-bold text-xs uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>Total do Negócio</span>
            <span className="text-2xl font-bold" style={{ color: colors.text }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(propertyValue)}
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8 w-full max-w-xs">
          <div className="text-center">
            <span className="block w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: finalEntryColor }}></span>
            <p className="text-xs font-bold uppercase" style={{ color: colors.textMuted }}>Entrada</p>
            <p className="text-lg font-bold" style={{ color: finalEntryColor }}>{downPaymentPercent.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <span className="block w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: finalFinanceColor }}></span>
            <p className="text-xs font-bold uppercase" style={{ color: colors.textMuted }}>Financiamento</p>
            <p className="text-lg font-bold" style={{ color: finalFinanceColor }}>{financedPercent.toFixed(1)}%</p>
          </div>
        </div>
      </div>

    </div>
  )
}
