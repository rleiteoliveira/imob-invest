import { useMemo } from 'react'
import type { ReactElement } from 'react'
import { X, FileDown, LayoutDashboard, Coins, TrendingUp } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { CaixaMCMV } from '../../../core/engines/CaixaMCMV'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ReportPDF } from './ReportPDF'
import { useBrand } from '../../../context/BrandContext'

const DetailedReportView = ({
  scenario,
  onClose
}: {
  scenario: SimulationScenario
  onClose: () => void
}): ReactElement => {
  const { brandColor, companyLogo } = useBrand()

  // 1. Calcular a linha do tempo completa
  const timeline = useMemo(() => {
    return new CaixaMCMV().calculate(scenario)
  }, [scenario])

  // 2. Métricas de Resumo
  const summary = useMemo(() => {
    if (timeline.length === 0) return null

    // Cálculos específicos de venda
    const firstObra = timeline.find(t => t.phase === 'OBRA')
    const firstFinanc = timeline.find(t => t.phase === 'AMORTIZACAO')

    // 1. Métricas Mensais Iniciais (Linha 1)
    const firstEntryInstallment = firstObra ? firstObra.builderInstallment : 0
    // Juros de obra = Juros + Taxas do banco na 1ª parcela
    const firstObraInstallment = firstObra ? (firstObra.bankInterest + firstObra.bankFees) : 0

    // 2. Totais de Custos (Linha 2)
    // Total Juros de Obra (Banco durante obra)
    const totalObraInterest = timeline
      .filter(t => t.phase === 'OBRA')
      .reduce((acc, t) => acc + t.bankInterest + t.bankFees, 0)

    // Total Pago à Construtora (com INCC)
    const totalBuilderPaid = timeline.reduce((acc, t) => acc + t.builderInstallment, 0)

    // Variação INCC = Total Pago - Principal Original (Entrada - Sinal)
    const originalPrincipal = (Number(scenario.downPayment) || 0) - (Number(scenario.entrySignal) || 0)
    const totalINCC = Math.max(0, totalBuilderPaid - originalPrincipal)

    return {
      firstEntryInstallment,
      firstObraInstallment,
      firstFinancInstallment: firstFinanc ? firstFinanc.totalInstallment : 0,
      totalObraInterest,
      totalINCC,
      monthsTotal: timeline.length
    }
  }, [timeline, scenario])

  // Função auxiliar de formatação
  const fmtMoney = (val: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  if (!summary)
    return (
      <div className="p-8 text-center text-gray-500">
        Não foi possível gerar o relatório com os dados atuais.
      </div>
    )

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto custom-scrollbar print:relative print:inset-auto print:bg-white print:overflow-visible print:h-auto print:z-auto">
      {/* BARRA DE AÇÕES (Não sai na impressão) */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-sm print:hidden z-[110]">
        <div className="min-w-0">
          <h2 className="text-sm md:text-lg font-bold text-gray-900 flex flex-wrap items-center gap-2">
            Planejamento Financeiro
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 uppercase truncate max-w-[150px] md:max-w-none">
              {scenario.name}
            </span>
          </h2>
        </div>
        <div className="flex gap-2 md:gap-3">
          <PDFDownloadLink
            document={
              <ReportPDF
                scenario={scenario}
                timeline={timeline}
                summary={summary}
                brandColor={brandColor}
                companyLogo={companyLogo}
              />
            }
            fileName={`Simulacao_${scenario.clientName || 'Imovel'}.pdf`}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold text-xs md:text-sm shadow-lg shadow-gray-200 active:scale-95"
          >
            {({ loading }: { loading: boolean }) => (
              <>
                <FileDown size={16} />
                <span className="hidden xs:inline">{loading ? 'Gerando...' : 'Baixar PDF'}</span>
              </>
            )}
          </PDFDownloadLink>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* CONTEÚDO DO RELATÓRIO */}
      <div className="w-full bg-white min-h-screen p-4 md:max-w-[210mm] md:mx-auto md:my-8 md:p-12 md:shadow-2xl print:shadow-none print:m-0 print:w-full print:max-w-none print:p-8">
        {/* CABEÇALHO DO DOCUMENTO REFORMULADO */}
        <div className="border-b-2 border-gray-900 pb-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">
                Planejamento Financeiro
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Data de Emissão: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* GRID DE DADOS DO CLIENTE */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Cliente
              </p>
              <p className="font-bold text-gray-900 text-sm md:text-base truncate">
                {scenario.clientName || 'Não Informado'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Telefone
              </p>
              <p className="font-bold text-gray-900 text-sm md:text-base">
                {scenario.clientPhone || '-'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Unidade
              </p>
              <p className="font-bold text-gray-900 text-sm md:text-base">
                {scenario.unitName || '-'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Valor do Imóvel
              </p>
              <p className="font-bold text-blue-600 text-sm md:text-base">
                {fmtMoney(Number(scenario.propertyValue))}
              </p>
            </div>
          </div>
        </div>

        {/* 1. FLUXO MENSAL INICIAL (3 Cards) */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
            Fluxo Mensal Inicial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 break-inside-avoid">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-2xl shadow-lg shadow-blue-200 print:shadow-none print:border print:border-gray-300 print:text-black print:bg-white">
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-2 print:text-gray-500">
                1ª Parcela Construtora
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {fmtMoney(summary.firstEntryInstallment)}
              </p>
              <p className="text-[9px] text-blue-100 mt-1 opacity-80 print:text-gray-400 font-medium">
                Mensalidade da Entrada
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 rounded-2xl shadow-lg shadow-orange-200 print:shadow-none print:border print:border-gray-300 print:text-black print:bg-white">
              <p className="text-[10px] font-bold text-orange-100 uppercase tracking-wider mb-2 print:text-gray-500">
                1ª Evolução de Obra
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {fmtMoney(summary.firstObraInstallment)}
              </p>
              <p className="text-[9px] text-orange-100 mt-1 opacity-80 print:text-gray-400 font-medium">
                Juros do Banco (Estimado)
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-5 rounded-2xl shadow-lg shadow-emerald-200 print:shadow-none print:border print:border-gray-300 print:text-black print:bg-white">
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mb-2 print:text-gray-500">
                1ª Parc. Financiamento
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {fmtMoney(summary.firstFinancInstallment)}
              </p>
              <p className="text-[9px] text-emerald-100 mt-1 opacity-80 print:text-gray-400 font-medium">
                Pós-Chaves
              </p>
            </div>
          </div>
        </div>

        {/* 2. RESUMO DE CUSTOS DA OBRA (2 Cards) */}
        <div className="mb-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
            Resumo de Custos da Obra
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 break-inside-avoid">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col justify-between print:bg-white print:border-gray-300 relative overflow-hidden group hover:border-gray-300 transition-colors">
              <div className="absolute top-3 right-3 text-gray-200 group-hover:text-gray-300 transition-colors">
                <Coins size={40} strokeWidth={1.5} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Coins size={12} /> Total Juros de Obra
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {fmtMoney(summary.totalObraInterest)}
                </p>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed relative z-10">
                Valor total pago ao banco referente a juros durante a fase de construção.
              </p>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col justify-between print:bg-white print:border-gray-300 relative overflow-hidden group hover:border-gray-300 transition-colors">
              <div className="absolute top-3 right-3 text-gray-200 group-hover:text-gray-300 transition-colors">
                <TrendingUp size={40} strokeWidth={1.5} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <TrendingUp size={12} /> Variação Monetária (INCC)
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {fmtMoney(summary.totalINCC)}
                </p>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed relative z-10">
                Correção monetária estimada sobre as parcelas da entrada devidas à construtora.
              </p>
            </div>
          </div>
        </div>

        {/* 2. GRÁFICO */}
        <div className="mb-10 break-inside-avoid">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-blue-600 pl-3 uppercase tracking-tighter">
            Evolução de Pagamentos
          </h3>
          <div className="h-[300px] w-full bg-white border border-gray-100 rounded-2xl md:p-4 print:border-gray-300 shadow-sm overflow-hidden min-w-[300px]">
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
                  formatter={(val: number | string | Array<number | string> | undefined) => [fmtMoney(Number(val || 0)), 'Parcela']}
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
          <p className="text-[9px] text-gray-400 mt-3 text-center italic leading-relaxed">
            Gráfico demonstrativo da evolução das parcelas ao longo do tempo.
          </p>
        </div>

        {/* 3. TABELA DETALHADA */}
        <div className="break-before-auto">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-emerald-600 pl-3 uppercase tracking-tighter">
            Cronograma Detalhado
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
                  className="grid grid-cols-12 p-4 text-xs items-center hover:bg-gray-50/50 transition-colors break-inside-avoid print:break-inside-avoid"
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
                ... demais {timeline.length - 48} meses omitidos na visualização mobile ...
              </div>
            )}
          </div>
        </div>

        {/* RODAPÉ E AVISO LEGAL */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center print:block break-inside-avoid">
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-[10px] md:text-xs text-yellow-800 leading-relaxed font-medium">
              <strong>Atenção:</strong> Os valores de financiamento futuro são projeções baseadas na taxa de juros atual e na correção do INCC durante a obra. O valor total final pago depende de indexadores econômicos, amortizações extraordinárias e reajustes anuais de seguro. Esta simulação não possui valor contratual.
            </p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-300">
              <LayoutDashboard size={14} />
            </div>
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
              Imob-Invest Simulator
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailedReportView
