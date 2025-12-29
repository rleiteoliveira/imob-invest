import { ReactElement, useState, useEffect } from 'react'
import {
  Building2,
  Home,
  TrendingUp,
  Plus,
  HardHat,
  Clock,
  Wallet,
  Coins,
  Settings2,
  CalendarDays,
  ArrowRight,
  Landmark,
  Shield
} from 'lucide-react'
import type { SimulationScenario, BuilderBalloon } from '../../../types/ScenarioTypes'
import BuilderBalloonModal from './BuilderBalloonModal'
import TypeCard from '../../ui/TypeCard'
import SmartInput from '../../ui/SmartInput'
import NumberInput from '../../ui/NumberInput'
import ToggleSwitch from '../../ui/ToggleSwitch'
import EvolutionChart from '../Comparison/EvolutionChart'

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
        balloons={data.builderBalloons || []}
        constructionTime={data.constructionTime || 36}
        onSave={(newBalloons: BuilderBalloon[]) => {
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
        <SmartInput
          label="Valor do Imóvel"
          prefix="R$"
          value={data.propertyValue}
          onChange={(v: number) => setData({ ...data, propertyValue: v })}
          max={Math.max(1000000, propertyValue * 1.5)}
          disableSlider
        />
        <div className="flex flex-col md:flex-row gap-4 md:items-end relative">
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 bg-white shadow-sm w-6 h-6 items-center justify-center rounded-full z-10 border border-gray-100">
            <Plus size={14} />
          </div>
          <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 hover:border-blue-300 transition-colors">
            <SmartInput
              label="Financiamento"
              highlight={`${financedPercent.toFixed(0)}%`}
              prefix="R$"
              value={financedAmount}
              onChange={handleFinancedChange}
              max={propertyValue}
              subtitle={isBalloonAtZero ? 'Saldo Dev. (Descontado FGTS/Ato)' : 'Saldo Devedor'}
            />
          </div>
          <div className="flex-1 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 hover:border-emerald-300 transition-colors">
            <SmartInput
              label="Entrada Total"
              highlight={`${downPaymentPercent.toFixed(0)}%`}
              prefix="R$"
              value={data.downPayment}
              onChange={(v: number) => setData({ ...data, downPayment: v })}
              max={propertyValue}
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
                  <SmartInput label="Ato / Sinal" prefix="R$" value={data.entrySignal ?? ''} onChange={(v: number) => setData({ ...data, entrySignal: v })} max={downPayment} subtitle="Pago na assinatura" />

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
                              <NumberInput placeholder="0" className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-emerald-500" value={data.balloonStartMonth ?? ''} onChange={(val) => setData({ ...data, balloonStartMonth: val })} />
                            </>
                          ) : (
                            <>
                              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Qtd. Vezes</label>
                              <NumberInput className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-emerald-500" value={data.balloonCount} onChange={(val) => setData({ ...data, balloonCount: val })} />
                            </>
                          )}
                        </div>
                      </div>
                      <SmartInput prefix="R$" label="Valor" value={data.balloonValue ?? ''} onChange={(v: number) => setData({ ...data, balloonValue: v })} subtitle={balloonsInConstructionValue > 0 ? `Abatendo R$ ${balloonsInConstructionValue.toLocaleString('pt-BR')} da Entrada` : "Abatendo do Financiamento/Pós-Obra"} />
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

      {/* CHART SECTION IN EDITOR */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-3">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-blue-600" size={20} />
          <h3 className="font-bold text-gray-800 text-lg">Projeção de Evolução</h3>
        </div>
        <div className="h-[250px]">
          <EvolutionChart scenarios={[data]} height={250} />
        </div>
      </div>

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
              <SmartInput label="Taxa Adm. (R$)" prefix="R$" value={data.monthlyAdminFee ?? ''} onChange={(v: number) => setData({ ...data, monthlyAdminFee: v })} max={200} sliderStep={5} />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 h-full"><label className="text-[10px] font-bold text-gray-500 uppercase mb-3 block flex items-center gap-1"><Shield size={10} /> Seguros (Mensal)</label><div className="space-y-3"><SmartInput label="MIP (R$)" prefix="R$" value={data.insuranceMIP ?? ''} onChange={(v: number) => setData({ ...data, insuranceMIP: v })} max={200} subtitle="Morte/Invalidez" sliderStep={5} /><SmartInput label="DFI (R$)" prefix="R$" value={data.insuranceDFI ?? ''} onChange={(v: number) => setData({ ...data, insuranceDFI: v })} max={200} subtitle="Danos Físicos" sliderStep={5} /></div></div>
          </div>
        </div>
      </div>

      {data.type === 'FUTURO' && (
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 animate-in fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-purple-700 uppercase mb-1 block">Espera (Meses)</label><NumberInput className="w-full p-2 border border-purple-200 rounded-lg" value={data.monthsToReady ?? ''} onChange={(val) => setData({ ...data, monthsToReady: val })} /></div>
            <div><label className="text-xs font-bold text-purple-700 uppercase mb-1 block">Valorização (% a.a)</label><NumberInput allowFloat={true} className="w-full p-2 border border-purple-200 rounded-lg" value={data.appreciationRate ?? ''} onChange={(val) => setData({ ...data, appreciationRate: val })} /></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UnifiedEditor
