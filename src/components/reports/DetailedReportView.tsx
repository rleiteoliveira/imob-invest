import { useMemo, ReactElement } from 'react'
import { X, Printer, LayoutDashboard } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { FinancialMath } from '../../services/FinancialMath'
import type { SimulationScenario } from '../../services/FinancialMath'

const DetailedReportView = ({
  scenario,
  onClose
}: {
  scenario: SimulationScenario
  onClose: () => void
}): ReactElement => {
  // 1. Calcular a linha do tempo completa
  const timeline = useMemo(() => {
    return FinancialMath.calculate(scenario)
  }, [scenario])

  // 2. Métricas de Resumo
  const summary = useMemo(() => {
    if (timeline.length === 0) return null

    const totalPaid = timeline.reduce((acc, t) => acc + t.totalInstallment, 0)
    const totalInterest = timeline.reduce((acc, t) => acc + t.bankInterest, 0)
    const maxInstallment = Math.max(...timeline.map((t) => t.totalInstallment))
    const firstFinancing = timeline.find((t) => t.phase === 'AMORTIZACAO')

    return {
      totalPaid,
      totalInterest,
      maxInstallment,
      firstFinancingVal: firstFinancing ? firstFinancing.totalInstallment : 0,
      monthsTotal: timeline.length
    }
  }, [timeline])

  // Função auxiliar de formatação
  const fmtMoney = (val: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  // Ação de Imprimir
  const handlePrint = (): void => {
    window.print()
  }

  if (!summary)
    return (
      <div className="p-8 text-center text-gray-500">
        Não foi possível gerar o relatório com os dados atuais.
      </div>
    )

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto custom-scrollbar">
      {/* BARRA DE AÇÕES (Não sai na impressão) */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-sm print:hidden z-20">
        <div className="min-w-0">
          <h2 className="text-sm md:text-lg font-bold text-gray-900 flex flex-wrap items-center gap-2">
            Extrato Financeiro
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 uppercase truncate max-w-[150px] md:max-w-none">
              {scenario.name}
            </span>
          </h2>
          <p className="text-[10px] md:text-xs text-gray-500 hidden sm:block">
            Fluxo detalhado de pagamentos e amortização.
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold text-xs md:text-sm shadow-lg shadow-gray-200 active:scale-95"
          >
            <Printer size={16} />
            <span className="hidden xs:inline">Imprimir</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* CONTEÚDO DO RELATÓRIO */}
      <div className="max-w-[210mm] mx-auto bg-white min-h-screen my-0 md:my-8 p-4 md:p-12 md:shadow-2xl print:shadow-none print:m-0 print:w-full print:max-w-none">
        {/* CABEÇALHO DO DOCUMENTO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-gray-900 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">
              Relatório de Proposta
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Simulação gerada em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Identificação
            </p>
            <p className="text-lg md:text-xl font-bold text-blue-600 leading-tight">
              {scenario.name}
            </p>
          </div>
        </div>

        {/* 1. RESUMO (Cards Responsivos) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 print:border-gray-300">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider text-center md:text-left">
              Imóvel
            </p>
            <p className="text-sm md:text-lg font-bold text-gray-900 text-center md:text-left">
              {fmtMoney(Number(scenario.propertyValue))}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 print:bg-white print:border-gray-300">
            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1 tracking-wider text-center md:text-left">
              1ª Parc. Banco
            </p>
            <p className="text-sm md:text-lg font-bold text-blue-700 text-center md:text-left">
              {fmtMoney(summary.firstFinancingVal)}
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 print:bg-white print:border-gray-300">
            <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1 tracking-wider text-center md:text-left">
              Total Pago Est.
            </p>
            <p className="text-sm md:text-lg font-bold text-emerald-700 text-center md:text-left">
              {fmtMoney(summary.totalPaid)}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 print:bg-white print:border-gray-300">
            <p className="text-[10px] font-bold text-orange-600 uppercase mb-1 tracking-wider text-center md:text-left">
              Prazo Final
            </p>
            <p className="text-sm md:text-lg font-bold text-orange-700 text-center md:text-left">
              {summary.monthsTotal} Meses
            </p>
          </div>
        </div>

        {/* 2. GRÁFICO */}
        <div className="mb-10 break-inside-avoid">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-blue-600 pl-3 uppercase tracking-tighter">
            Curva de Pagamentos Mensais
          </h3>
          <div className="h-48 md:h-72 w-full bg-white border border-gray-100 rounded-2xl md:p-4 print:border-gray-300 shadow-sm overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="month" hide />
                <YAxis
                  tickFormatter={(val) => `R$${val / 1000}k`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  width={35}
                />
                <Tooltip
                  formatter={(val: number) => fmtMoney(val)}
                  labelFormatter={(label) => `Mês ${label}`}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '11px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalInstallment"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPmt)"
                  name="Parcela"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[9px] text-gray-400 mt-3 text-center italic leading-relaxed px-4">
            A projeção acima considera todos os custos mensais (Entrada + Financiamento + Seguros).
          </p>
        </div>

        {/* 3. TABELA (Mobile adaptada) */}
        <div className="break-before-auto">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-emerald-600 pl-3 uppercase tracking-tighter">
            Cronograma de Pagamentos
          </h3>

          <div className="hidden md:block border rounded-2xl overflow-hidden border-gray-100 shadow-sm print:rounded-none print:border-gray-300">
            <div className="grid grid-cols-12 bg-gray-50 p-4 font-bold text-gray-500 uppercase tracking-widest text-[10px] border-b border-gray-100">
              <div className="col-span-1 text-center">Mês</div>
              <div className="col-span-3 text-right">Construtora</div>
              <div className="col-span-3 text-right">Banco</div>
              <div className="col-span-2 text-right">Saldo Dev.</div>
              <div className="col-span-3 text-right text-gray-900 border-l border-gray-100 ml-2">
                Total Mensal
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {timeline.map((row) => (
                <div
                  key={row.month}
                  className="grid grid-cols-12 p-4 text-xs items-center hover:bg-gray-50/50 transition-colors"
                >
                  <div className="col-span-1 text-center font-bold text-gray-400 text-[10px]">
                    {row.month}
                  </div>
                  <div className="col-span-3 text-right font-medium text-gray-600">
                    {row.builderInstallment > 0 ? (
                      <span
                        className={
                          row.builderInstallment > timeline[0]?.builderInstallment * 1.5
                            ? 'font-bold text-blue-600'
                            : ''
                        }
                      >
                        {fmtMoney(row.builderInstallment)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </div>
                  <div className="col-span-3 text-right font-medium text-gray-600">
                    {fmtMoney(row.bankAmortization + row.bankInterest + row.bankFees)}
                  </div>
                  <div className="col-span-2 text-right text-gray-400 tabular-nums">
                    {fmtMoney(row.bankBalance)}
                  </div>
                  <div className="col-span-3 text-right font-black text-gray-900 border-l border-gray-50 ml-2">
                    {fmtMoney(row.totalInstallment)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Versão MOBILE: Cards simplificados */}
          <div className="md:hidden space-y-3">
            {timeline.slice(0, 48).map((row) => (
              <div
                key={row.month}
                className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex justify-between items-center"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase">
                    Mês {row.month}
                  </span>
                  <div className="flex gap-2 mt-1">
                    {row.builderInstallment > 0 && (
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                        Constr.
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {fmtMoney(row.totalInstallment)}
                  </p>
                  <p className="text-[9px] text-gray-400">Restante: {fmtMoney(row.bankBalance)}</p>
                </div>
              </div>
            ))}
            {timeline.length > 48 && (
              <div className="text-center py-4 text-gray-400 text-[10px] italic">
                ... demais {timeline.length - 48} meses omitidos na visualização mobile (disponível
                no PDF) ...
              </div>
            )}
          </div>
        </div>

        {/* RODAPÉ IMPRESSO */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center print:block">
          <p className="text-[9px] md:text-xs text-gray-400 leading-relaxed">
            * Simulação meramente informativa baseada nos parâmetros fornecidos pelo usuário.{' '}
            <br className="hidden md:block" />
            Valores sujeitos a alteração de acordo com as taxas vigentes de mercado e política de
            crédito do banco.
          </p>
          <div className="mt-4 flex flex-col items-center gap-1">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-300">
              <LayoutDashboard size={14} />
            </div>
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
              Financiamento Pro
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailedReportView
