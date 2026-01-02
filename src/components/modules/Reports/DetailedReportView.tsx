import { useMemo } from 'react'
import type { ReactElement } from 'react'
import { X, FileDown, LayoutDashboard, Coins, TrendingUp } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
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
      monthsTotal: timeline.length,
      // Novo totalizador
      totalConstructionCost: (Number(scenario.downPayment) || 0) + totalObraInterest + totalINCC
    }
  }, [timeline, scenario])

  // 3. Dados Otimizados para Relatório (Obra Detalhada + Financiamento Resumido)
  const reportData = useMemo(() => {
    const constructionRows = timeline.filter(t => t.phase === 'OBRA')
    const financingRows = timeline.filter(t => t.phase !== 'OBRA')

    const financingSummary = financingRows.length > 0 ? {
      first: financingRows[0],
      last: financingRows[financingRows.length - 1],
      totalMonths: financingRows.length,
      years: (financingRows.length / 12).toFixed(1),
      system: scenario.amortizationSystem,
      interest: scenario.interestRate
    } : null

    return { constructionRows, financingSummary }
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
            fileName={`Simulacao_${scenario.clientLead?.name || scenario.clientName || 'Imovel'}.pdf`}
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
                {scenario.clientLead?.name || scenario.clientName || 'Não Informado'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Telefone
              </p>
              <p className="font-bold text-gray-900 text-sm md:text-base">
                {scenario.clientLead?.phone || scenario.clientPhone || '-'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Unidade
              </p>
              <p className="font-bold text-gray-900 text-sm md:text-base">
                {scenario.clientLead?.unitOfInterest || scenario.unitName || '-'}
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

        {/* 1. FLUXO MENSAL INICIAL (2 Cards) */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
            Fluxo Mensal Inicial (Fase de Obras)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 break-inside-avoid">
            {/* Card 1: Construtora (Blue - Investment/Equity theme) */}
            <div className="bg-gradient-to-bl from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg shadow-blue-200/50 print:shadow-none print:border print:border-gray-300 print:text-black print:bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Coins size={80} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-2 print:text-gray-500">
                  1ª Parcela Construtora
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {fmtMoney(summary.firstEntryInstallment)}
                </p>
                <p className="text-[10px] text-blue-100 mt-2 opacity-80 print:text-gray-400 font-medium">
                  Mensalidade da Entrada (Principal)
                </p>
              </div>
            </div>

            {/* Card 2: Evolução de Obra (Copper/Amber - Cost/Process theme) */}
            <div className="bg-gradient-to-bl from-orange-500 to-amber-600 text-white p-6 rounded-2xl shadow-lg shadow-orange-200/50 print:shadow-none print:border print:border-gray-300 print:text-black print:bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={80} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-amber-50 uppercase tracking-wider mb-2 print:text-gray-500">
                  1ª Evolução de Obra
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {fmtMoney(summary.firstObraInstallment)}
                </p>
                <p className="text-[10px] text-amber-50 mt-2 opacity-80 print:text-gray-400 font-medium">
                  Juros Bancários (Estimativa Inicial)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. RESUMO DE CUSTOS DA OBRA (2 Cards) */}
        {/* 2. RESUMO DE CUSTOS DA OBRA (Totalizador) */}
        <div className="mb-10">

          {/* CARD DE TOTAL TOTALIZADOR (NOVO) */}
          <div className="mt-4 bg-gray-900 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden print:bg-gray-100 print:text-black print:border print:border-gray-300 print:shadow-none break-inside-avoid">
            {/* Background Pattern for Modern Feel */}
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 print:hidden">
              <Coins size={120} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-[10px] md:text-xs font-bold text-blue-200 uppercase tracking-widest mb-1 print:text-gray-500">
                  Total Estimado no Período de Obras
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl md:text-5xl font-bold tracking-tighter text-white print:text-black">
                    {fmtMoney(summary.totalConstructionCost)}
                  </h4>
                  <span className="text-[10px] text-gray-400 hidden md:inline-block font-medium">
                    (Sem Financiamento)
                  </span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-400 mt-2 print:text-gray-600">
                  Soma de: Entrada Principal ({fmtMoney(Number(scenario.downPayment) || 0)}) + Juros de Obra ({fmtMoney(summary.totalObraInterest)}) + INCC ({fmtMoney(summary.totalINCC)})
                </p>
              </div>

              <div className="hidden md:block h-10 w-[1px] bg-gray-700 mx-4 print:hidden"></div>

              <div className="text-right hidden md:block print:hidden">
                <div className="text-[10px] bg-blue-600/20 border border-blue-500/30 text-blue-200 px-3 py-1 rounded-full inline-block mb-1">
                  Investimento na Fase 1
                </div>
                <p className="text-[10px] text-gray-400 max-w-[200px] leading-tight mt-1">
                  Este é o valor total desembolsado até a entrega das chaves.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. GRÁFICO (DONUT - COMPOSIÇÃO) */}
        <div className="mb-10 break-inside-avoid">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-purple-600 pl-3 uppercase tracking-tighter">
            Composição Total do Imóvel (Investimento + Financiamento)
          </h3>
          <div className="bg-white border border-gray-100 rounded-2xl md:p-6 p-4 shadow-sm flex flex-col md:flex-row items-center justify-around min-h-[300px]">

            {/* Chart Area */}
            <div className="w-full md:w-1/2 h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Entrada (Principal)', value: (Number(scenario.downPayment) || 0), color: '#2563eb' },
                      { name: 'Financiamento', value: reportData.financingSummary ? (reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization) : 0, color: '#9333ea' },
                      { name: 'Juros de Obra', value: summary.totalObraInterest, color: '#f97316' },
                      { name: 'Correção INCC', value: summary.totalINCC, color: '#10b981' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Entrada (Principal)', value: (Number(scenario.downPayment) || 0), color: '#2563eb' },
                      { name: 'Financiamento', value: reportData.financingSummary ? (reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization) : 0, color: '#9333ea' },
                      { name: 'Juros de Obra', value: summary.totalObraInterest, color: '#f97316' },
                      { name: 'Correção INCC', value: summary.totalINCC, color: '#10b981' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) => fmtMoney(value || 0)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-medium text-gray-600 ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text (Total) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Valor Total</p>
                <p className="text-sm font-black text-gray-900">
                  {fmtMoney(
                    summary.totalConstructionCost +
                    (reportData.financingSummary ? (reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization) : 0)
                  )}
                </p>
              </div>
            </div>

            {/* Insights / Details Side */}
            <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-8 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">Entenda os Custos</h4>
                <p className="text-xs text-gray-500 leading-relaxed text-justify">
                  O gráfico apresenta a composição completa do custo do imóvel.
                  Observe a proporção entre o valor financiado pelo banco e o capital próprio investido (Entrada), além dos custos acessórios da obra.
                </p>
              </div>

              {/* Percentage Breakdown (Mini Table) */}
              <div className="space-y-2 pt-2">
                {[
                  { label: 'Principal (Entrada)', val: (Number(scenario.downPayment) || 0), color: 'bg-blue-600' },
                  { label: 'Financiamento', val: reportData.financingSummary ? (reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization) : 0, color: 'bg-purple-600' },
                  { label: 'Juros de Obra', val: summary.totalObraInterest, color: 'bg-orange-500' },
                  { label: 'INCC (Correção)', val: summary.totalINCC, color: 'bg-emerald-500' }
                ].map((item) => {
                  const financingVal = reportData.financingSummary ? (reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization) : 0;
                  const totalWithFinancing = summary.totalConstructionCost + financingVal;

                  const pct = totalWithFinancing > 0
                    ? ((item.val / totalWithFinancing) * 100).toFixed(1)
                    : 0;
                  return (
                    <div key={item.label} className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="text-gray-600 font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">{fmtMoney(item.val)}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. TABELA DE OBRA (DETALHADA) */}
        <div className="break-before-auto mb-8">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-emerald-600 pl-3 uppercase tracking-tighter">
            Fase de Obras (Detalhamento)
          </h3>

          <div className="border rounded-2xl overflow-hidden border-gray-100 shadow-sm print:rounded-none print:border-l-0 print:border-r-0 print:border-gray-300 print:shadow-none">
            {/* HEADERS */}
            <div className="grid grid-cols-12 bg-gray-50 p-3 md:p-4 font-bold text-gray-500 uppercase tracking-widest text-[10px] border-b border-gray-100 print:bg-gray-100 print:text-black print:border-gray-300 print:py-2">
              <div className="col-span-1 text-center">Mês</div>
              <div className="col-span-3 text-right">Construtora</div>
              <div className="col-span-3 text-right">Evolução Obra</div>
              <div className="col-span-3 text-right text-gray-900 border-l border-gray-100 ml-2 print:border-gray-300">
                Total Mensal
              </div>
              <div className="col-span-2 text-right">Saldo Devedor</div>
            </div>

            {/* LISTA DE MESES DE OBRA */}
            <div className="divide-y divide-gray-50 print:divide-gray-200">
              {reportData.constructionRows.map((row) => (
                <div
                  key={row.month}
                  className="grid grid-cols-12 p-3 md:p-4 text-xs items-center hover:bg-gray-50/50 transition-colors break-inside-avoid print:p-1.5 print:text-[10px] print:leading-tight even:print:bg-gray-50"
                >
                  <div className="col-span-1 text-center font-bold text-gray-400 text-[10px] print:text-black">
                    {row.month}
                  </div>
                  <div className="col-span-3 text-right font-medium text-gray-600 print:text-black">
                    {row.builderInstallment > 0 ? (
                      <span className={row.builderInstallment > timeline[0]?.builderInstallment * 1.5 ? 'font-bold text-blue-600 print:text-black print:font-bold' : ''}>
                        {fmtMoney(row.builderInstallment)}
                      </span>
                    ) : '-'}
                  </div>
                  <div className="col-span-3 text-right font-medium text-gray-600 print:text-black">
                    {fmtMoney(row.bankAmortization + row.bankInterest + row.bankFees)}
                  </div>
                  <div className="col-span-3 text-right font-black text-gray-900 border-l border-gray-50 ml-2 print:border-gray-300 print:ml-0 print:pl-2">
                    {fmtMoney(row.totalInstallment)}
                  </div>
                  <div className="col-span-2 text-right text-gray-400 tabular-nums print:text-gray-600">
                    {fmtMoney(row.bankBalance)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AVISO SE FOR MUITO LONGO NO MOBILE */}
          <div className="md:hidden mt-2 text-center text-[10px] text-gray-400 italic">
            (Visualização completa disponível em PDF ou Desktop)
          </div>
        </div>

        {/* 4. BLOCO DE FINANCIAMENTO (RESUMO) */}
        {reportData.financingSummary && (
          <div className="break-inside-avoid print:break-inside-avoid mt-8 mb-12">
            <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-l-4 border-blue-600 pl-3 uppercase tracking-tighter">
              Fase de Financiamento (Pós-Chaves)
            </h3>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm print:shadow-none print:border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

                {/* COLUNA 1: VALOR */}
                <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Saldo a Financiar
                  </p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    {fmtMoney(reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    Valor sujeito a aprovação bancária
                  </p>
                </div>

                {/* COLUNA 2: CONDIÇÕES */}
                <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Condições do Plano
                  </p>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-gray-700">
                      <span className="text-gray-400 font-normal">Sistema:</span> {reportData.financingSummary.system}
                    </p>
                    <p className="text-sm font-bold text-gray-700">
                      <span className="text-gray-400 font-normal">Taxa:</span> {reportData.financingSummary.interest}% a.a.
                    </p>
                    <p className="text-sm font-bold text-gray-700">
                      <span className="text-gray-400 font-normal">Prazo:</span> {reportData.financingSummary.totalMonths} meses ({reportData.financingSummary.years} anos)
                    </p>
                  </div>
                </div>

                {/* COLUNA 3: PARCELAS (RANGE) */}
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Projeção de Parcelas
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center md:justify-start md:gap-4">
                      <span className="text-xs text-gray-500 font-medium w-16 text-left">1ª Parcela:</span>
                      <span className="text-lg font-bold text-blue-600">{fmtMoney(reportData.financingSummary.first.totalInstallment)}</span>
                    </div>
                    <div className="flex justify-between items-center md:justify-start md:gap-4">
                      <span className="text-xs text-gray-500 font-medium w-16 text-left">Última:</span>
                      <span className="text-lg font-bold text-emerald-600">{fmtMoney(reportData.financingSummary.last.totalInstallment)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Padding final para garantir que o contúdo não fique por baixo do footer fixo */}
        <div className="h-20 print:hidden"></div>
      </div>

      {/* RODAPÉ FIXO (Status Bar style) */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-2 px-6 md:px-12 flex justify-between items-center z-[120] print:fixed print:bottom-0 print:left-0 print:w-full print:px-8 print:py-2">
        <p className="text-[8px] md:text-[9px] text-gray-400 text-justify w-2/3 md:w-1/2 leading-tight">
          Atenção: Os valores podem sofrer alterações. Simulação sem valor contratual.
        </p>
        <div className="text-right">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <LayoutDashboard size={12} /> Imob-Invest Simulator
          </p>
        </div>
      </footer>
    </div>
  )
}

export default DetailedReportView
