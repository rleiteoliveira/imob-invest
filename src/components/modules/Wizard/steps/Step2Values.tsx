import type { ReactElement } from 'react'
import type { SimulationScenario } from '../../../../types/ScenarioTypes'
import SmartInput from '../../../ui/SmartInput'
import { Wallet, Landmark } from 'lucide-react'

interface StepProps {
  data: SimulationScenario
  setData: (data: SimulationScenario) => void
}

export default function Step2Values({ data, setData }: StepProps): ReactElement {
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

  // Simple Donut Chart using CSS conic-gradient
  const donutStyle = {
    background: `conic-gradient(
      #10b981 0% ${downPaymentPercent}%, 
      #3b82f6 ${downPaymentPercent}% 100%
    )`
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Left: Inputs */}
      <div className="flex-1 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Definição de Valores</h2>
          <p className="text-gray-500 text-sm">Ajuste o valor do imóvel e quanto deseja dar de entrada.</p>
        </div>

        <SmartInput
          label="Valor do Imóvel"
          prefix="R$"
          value={data.propertyValue}
          onChange={handlePropertyValueChange}
          disableSlider
        />

        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold uppercase text-xs tracking-wide">
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

        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-4 text-blue-800 font-bold uppercase text-xs tracking-wide">
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className="relative w-64 h-64 rounded-full shadow-xl transition-all duration-500" style={donutStyle}>
          {/* Inner White Circle */}
          <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-gray-400 font-medium text-xs uppercase tracking-widest mb-1">Total do Negócio</span>
            <span className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(propertyValue)}
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8 w-full max-w-xs">
          <div className="text-center">
            <span className="block w-3 h-3 bg-emerald-500 rounded-full mx-auto mb-2"></span>
            <p className="text-xs font-bold text-gray-400 uppercase">Entrada</p>
            <p className="text-lg font-bold text-emerald-600">{downPaymentPercent.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <span className="block w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></span>
            <p className="text-xs font-bold text-gray-400 uppercase">Financiamento</p>
            <p className="text-lg font-bold text-blue-600">{financedPercent.toFixed(1)}%</p>
          </div>
        </div>
      </div>

    </div>
  )
}
