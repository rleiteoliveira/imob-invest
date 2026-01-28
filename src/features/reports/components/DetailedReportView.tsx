import { useMemo } from 'react'
import type { ReactElement } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { ArrowLeft, FileDown, LayoutDashboard, Coins, TrendingUp, Building2 } from 'lucide-react'
import { CaixaMCMV } from '../../simulator/services/engines/CaixaMCMV'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ReportPDF } from './ReportPDF'
import ThemeSwitcher from '../../settings/components/ThemeSwitcher'
import { useThemeStyles } from '../../../hooks/useThemeStyles'

const DetailedReportView = ({
  scenario,
  onClose
}: {
  scenario: SimulationScenario
  onClose: () => void
}): ReactElement => {
  const { colors, components } = useThemeStyles()

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

    // Cálculo da Parcela Mensal Pura (Sem Balões/INCC do primeiro mês)
    const monthlyBalloonsTotal = (scenario.builderBalloons || []).reduce((acc, cur) => acc + cur.value, 0)
    const signal = Number(scenario.entrySignal) || 0
    const fgts = scenario.useFGTS ? (Number(scenario.fgtsValue) || 0) : 0
    const totalEntry = Number(scenario.downPayment) || 0
    const entryBalanceToParcel = Math.max(0, totalEntry - signal - fgts - monthlyBalloonsTotal)
    const installmentsCount = Number(scenario.entryInstallments) || 1
    const recurringInstallment = entryBalanceToParcel / installmentsCount

    // 1. Métricas Mensais Iniciais (Linha 1)
    // firstEntryInstallment agora usa o valor recorrente calculado para não assustar com balão no mês 1
    const firstEntryInstallment = recurringInstallment
    // Juros de obra = Juros + Taxas do banco na 1ª parcela
    const firstObraInstallment = firstObra ? (firstObra.bankInterest + firstObra.bankFees) : 0

    // 2. Totais de Custos (Linha 2)
    // Total Juros de Obra (Banco durante obra)
    const totalObraInterest = timeline
      .filter(t => t.phase === 'OBRA')
      .reduce((acc, t) => acc + t.bankInterest + t.bankFees, 0)

    // Total Pago à Construtora (com INCC)
    const totalBuilderPaid = timeline.reduce((acc, t) => acc + t.builderInstallment, 0)

    // Variação INCC = Total Pago - Principal Original (Entrada - Sinal - FGTS)
    const originalPrincipal = (Number(scenario.downPayment) || 0) - (Number(scenario.entrySignal) || 0) - (scenario.useFGTS ? (Number(scenario.fgtsValue) || 0) : 0)
    const totalINCC = Math.max(0, totalBuilderPaid - originalPrincipal)

    return {
      firstEntryInstallment, // Valor puro da parcela
      firstObraInstallment,
      firstFinancInstallment: firstFinanc ? firstFinanc.totalInstallment : 0,
      totalObraInterest,
      totalINCC,
      monthsTotal: timeline.length,
      // Novos campos para exibição
      entryBalanceToParcel,
      installmentsCount,
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
    <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar print:relative print:inset-auto print:bg-white print:overflow-visible print:h-auto print:z-auto" style={{ backgroundColor: colors.background }}>
      {/* BARRA DE AÇÕES (Não sai na impressão) */}
      <div className="sticky top-0 backdrop-blur-md border-b px-4 md:px-6 py-3 flex justify-between items-center shadow-sm print:hidden z-[110]" style={{ backgroundColor: `${colors.surface}CC`, borderColor: colors.border }}>

        {/* Lado Esquerdo: Voltar + Título */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm active:scale-95 group ${components.button.ghost}`}
            style={{ color: colors.textMuted }}
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar</span>
          </button>

          <div className="h-6 w-[1px] hidden md:block" style={{ backgroundColor: colors.border }}></div>

          <h2 className="text-sm md:text-base font-bold hidden md:flex items-center gap-2" style={{ color: colors.text }}>
            Relatório Detalhado
            <span className="text-[10px] px-2 py-0.5 rounded-full border uppercase truncate max-w-[150px]" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary, borderColor: `${colors.primary}30` }}>
              {scenario.name}
            </span>
          </h2>
        </div>

        {/* Lado Direito: Tema + Ações */}
        <div className="flex items-center gap-3 md:gap-4">

          {/* Theme Selector Simplificado */}
          {/* Theme Selector Oficial (Reutilizado) */}
          <ThemeSwitcher className="flex items-center gap-2 relative z-50 mr-2" />

          <PDFDownloadLink
            document={
              <ReportPDF
                scenario={scenario}
                timeline={timeline}
                summary={summary}
              />
            }
            fileName={`Simulacao_${scenario.clientLead?.name || scenario.clientName || 'Imovel'}.pdf`}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 text-white rounded-xl transition-all font-bold text-xs md:text-sm shadow-sm active:scale-95 ${components.button.primary}`}
          >
            {({ loading }: { loading: boolean }) => (
              <>
                <FileDown size={16} />
                <span className="hidden xs:inline">{loading ? 'Gerando...' : 'Baixar PDF'}</span>
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* CONTEÚDO DO RELATÓRIO */}
      <div className="w-full min-h-screen p-4 md:max-w-[210mm] md:mx-auto md:my-8 md:p-12 md:shadow-2xl print:shadow-none print:m-0 print:w-full print:max-w-none print:p-8" style={{ backgroundColor: colors.surface }}>
        {/* CABEÇALHO DO DOCUMENTO REFORMULADO */}
        <div className="border-b-2 pb-6 mb-8" style={{ borderColor: colors.text }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>
                Planejamento Financeiro
              </h1>
              <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                Data de Emissão: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* GRID DE DADOS DO CLIENTE */}
          <div className="rounded-2xl p-6 border grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" style={{ backgroundColor: `${colors.surface}80`, borderColor: colors.border }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>
                Cliente
              </p>
              <p className="font-bold text-sm md:text-base truncate" style={{ color: colors.text }}>
                {scenario.clientLead?.name || scenario.clientName || 'Não Informado'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>
                Telefone
              </p>
              <p className="font-bold text-sm md:text-base" style={{ color: colors.text }}>
                {scenario.clientLead?.phone || scenario.clientPhone || '-'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>
                Unidade de Interesse
              </p>
              <p className="font-bold text-sm md:text-base" style={{ color: colors.text }}>
                {scenario.clientLead?.unitOfInterest || scenario.unitName || '-'}
              </p>
            </div>
          </div>

          {/* DESTAQUE DO VALOR DO IMÓVEL (HERO - ESTILO PADRONIZADO) */}
          <div className="rounded-2xl p-6 md:px-10 md:py-8 relative overflow-hidden shadow-sm border print:shadow-none print:bg-white print:border print:border-gray-300" style={{ backgroundColor: `${colors.text}10`, borderColor: colors.border }}>
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] print:hidden pointer-events-none">
              <Building2 size={160} style={{ color: colors.text }} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 justify-center md:justify-start" style={{ color: colors.textMuted }}>
                  <Building2 size={14} style={{ color: colors.primary }} />
                  Valor de Avaliação do Imóvel
                </h2>
                <p className="text-4xl md:text-5xl font-black tracking-tighter print:text-black" style={{ color: colors.text }}>
                  {fmtMoney(Number(scenario.propertyValue))}
                </p>
              </div>

              <div className="hidden md:block h-12 w-[1px] print:hidden" style={{ backgroundColor: colors.border }}></div>

              <div className="max-w-md">
                <p className="text-xs leading-relaxed print:text-gray-600" style={{ color: colors.textMuted }}>
                  Este é o valor de tabela considerado para a estruturação desta proposta financeira.
                  Abaixo, detalhamos como este investimento está distribuído.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. SEÇÃO DE DESTAQUES (Entrada & Intercaladas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 break-inside-avoid">

          {/* Card: Composição da Entrada */}
          <div className="rounded-2xl p-6 border shadow-sm relative overflow-hidden" style={{ backgroundColor: `${colors.text}10`, borderColor: colors.border }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                <Coins size={18} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors.text }}>Composição da Entrada</h3>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs text-gray-500 font-medium">Sinal (Ato)</span>
                <span className="font-bold text-gray-900">{fmtMoney(Number(scenario.entrySignal) || 0)}</span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">FGTS</span>
                  {scenario.useFGTS ? (
                    <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">UTILIZADO</span>
                  ) : (
                    <span className="text-[9px] bg-gray-100 text-gray-400 font-bold px-1.5 py-0.5 rounded">NÃO UTILIZADO</span>
                  )}
                </div>
                <span className={`font-bold ${scenario.useFGTS ? 'text-green-600' : 'text-gray-300'}`}>
                  {fmtMoney(scenario.useFGTS ? (Number(scenario.fgtsValue) || 0) : 0)}
                </span>
              </div>

              {/* Parcelamento - Corrigido */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">Saldo Parcelado</span>
                  <span className="text-[9px] text-gray-400">
                    {summary.installmentsCount}x de {fmtMoney(summary.firstEntryInstallment)}
                  </span>
                </div>
                <span className="font-bold">{fmtMoney(summary.entryBalanceToParcel)}</span>
              </div>
            </div>
            {/* Decorative blob */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-50 pointer-events-none" style={{ backgroundColor: `${colors.primary}10` }}></div>
          </div>

          {/* Card: Balões / Intercaladas */}
          <div className="rounded-2xl p-6 border shadow-sm relative overflow-hidden flex flex-col justify-between h-full" style={{ backgroundColor: `${colors.text}10`, borderColor: colors.border }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <TrendingUp size={18} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors.text }}>Reforços (Intercaladas)</h3>
            </div>

            {(!scenario.builderBalloons || scenario.builderBalloons.length === 0) ? (
              <div className="flex flex-col items-center justify-center flex-grow text-gray-400 text-center py-2 h-full">
                <p className="text-xs italic" style={{ color: colors.textMuted }}>Nenhum reforço configurado.</p>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Total em Reforços</p>
                  <p className="text-2xl font-black" style={{ color: colors.primary }}>
                    {fmtMoney(scenario.builderBalloons.reduce((acc, b) => acc + b.value, 0))}
                  </p>
                </div>

                <div className="border-t border-amber-50 pt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 font-medium">Recorrência</span>
                    <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                      {scenario.builderBalloons.length} Parcelas
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-snug mt-2">
                    Meses: <span className="font-bold text-amber-700">{scenario.builderBalloons.map(b => b.month).join(', ')}</span>
                  </p>
                </div>
              </div>
            )}
            {/* Decorative blob */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-50 pointer-events-none" style={{ backgroundColor: `${colors.accent || colors.secondary}10` }}></div>
          </div>

        </div>

        {/* 2. FLUXO MENSAL INICIAL (IMPACTO IMEDIATO) */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 ml-1" style={{ color: colors.textMuted }}>
            Fluxo Mensal Inicial (Fase de Obras)
          </h3>
          <div className={`grid grid-cols-1 ${scenario.useWorkEvolution ? 'md:grid-cols-2' : 'md:grid-cols-1 md:max-w-md'} gap-4 break-inside-avoid`}>
            {/* Card 1: Construtora */}
            <div className="p-6 rounded-2xl shadow-sm relative overflow-hidden border" style={{ backgroundColor: `${colors.text}10`, borderColor: colors.border }}>
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                <Coins size={80} style={{ color: colors.text }} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
                  Mensalidade Construtora (Base)
                </p>
                <div className="flex items-baseline gap-1" style={{ color: colors.primary }}>
                  <span className="text-lg opacity-80">R$</span>
                  <span className="text-4xl font-black tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(summary.firstEntryInstallment)}
                  </span>
                </div>
                <p className="text-[10px] mt-2 opacity-80 font-medium" style={{ color: colors.textMuted }}>
                  Valor da parcela mensal recorrente
                </p>
              </div>
            </div>

            {/* Card 2: Evolução de Obra (Condicional) */}
            {scenario.useWorkEvolution && (
              <div className="p-6 rounded-2xl shadow-sm relative overflow-hidden border" style={{ backgroundColor: `${colors.text}10`, borderColor: colors.border }}>
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                  <TrendingUp size={80} style={{ color: colors.text }} />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
                    1ª Evolução de Obra
                  </p>
                  <div className="flex items-baseline gap-1" style={{ color: '#f97316' }}>
                    <span className="text-lg opacity-80">R$</span>
                    <span className="text-4xl font-black tracking-tighter">
                      {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(summary.firstObraInstallment)}
                    </span>
                  </div>
                  <p className="text-[10px] mt-2 opacity-80 font-medium" style={{ color: colors.textMuted }}>
                    Juros Bancários (Estimativa Inicial)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. RESUMO DE CUSTOS DA OBRA (Totalizador) */}
        <div className="mb-10">

          {/* CARD DE TOTAL TOTALIZADOR (PADRONIZADO) */}
          <div className="mt-4 rounded-2xl p-6 shadow-sm border relative overflow-hidden print:bg-gray-100 print:text-black print:border print:border-gray-300 print:shadow-none break-inside-avoid" style={{ backgroundColor: `${colors.text}10`, borderColor: colors.border }}>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] transform translate-x-4 -translate-y-4 print:hidden">
              <Coins size={120} style={{ color: colors.text }} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 print:text-gray-500" style={{ color: colors.textMuted }}>
                  Total Estimado no Período de Obras
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl md:text-5xl font-bold tracking-tighter print:text-black" style={{ color: colors.text }}>
                    {fmtMoney(summary.totalConstructionCost)}
                  </h4>
                  <span className="text-[10px] hidden md:inline-block font-medium" style={{ color: colors.textMuted }}>
                    (Sem Financiamento)
                  </span>
                </div>
                <p className="text-[10px] md:text-xs mt-2 print:text-gray-600" style={{ color: colors.textMuted }}>
                  Soma de: Entrada Principal ({fmtMoney(Number(scenario.downPayment) || 0)})
                  {scenario.useWorkEvolution && <> + Juros de Obra ({fmtMoney(summary.totalObraInterest)})</>}
                  + INCC ({fmtMoney(summary.totalINCC)})
                </p>
              </div>

              <div className="hidden md:block h-10 w-[1px] mx-4 print:hidden" style={{ backgroundColor: colors.border }}></div>

              <div className="text-right hidden md:block print:hidden">
                <div className="text-[10px] bg-blue-600/10 border border-blue-500/30 text-blue-500 px-3 py-1 rounded-full inline-block mb-1">
                  Investimento na Fase 1
                </div>
                <p className="text-[10px] max-w-[200px] leading-tight mt-1" style={{ color: colors.textMuted }}>
                  Este é o valor total desembolsado até a entrega das chaves.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. GRÁFICO (DONUT - COMPOSIÇÃO) */}
        <div className="mb-10 break-inside-avoid">
          <h3 className="text-xs md:text-sm font-bold mb-4 flex items-center gap-2 border-l-4 border-purple-600 pl-3 uppercase tracking-tighter" style={{ color: colors.text }}>
            Composição Total do Imóvel (Investimento + Financiamento)
          </h3>
          <div className="border rounded-2xl md:p-6 p-4 shadow-sm flex flex-col md:flex-row items-center justify-around min-h-[300px]" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>

            {/* Chart Area */}
            <div className="w-full md:w-1/2 h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Entrada (Principal)', value: (Number(scenario.downPayment) || 0), color: '#2563eb' },
                      { name: 'Financiamento', value: reportData.financingSummary ? (reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization) : 0, color: '#9333ea' },
                      { name: 'Juros de Obra', value: scenario.useWorkEvolution ? summary.totalObraInterest : 0, color: '#f97316' },
                      { name: 'Correção INCC', value: summary.totalINCC, color: '#10b981' }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Entrada (Principal)', value: (Number(scenario.downPayment) || 0), color: colors.primary },
                      { name: 'Financiamento', value: reportData.financingSummary ? (reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization) : 0, color: colors.secondary },
                      { name: 'Juros de Obra', value: scenario.useWorkEvolution ? summary.totalObraInterest : 0, color: '#f97316' }, // keep orange for construction interest
                      { name: 'Correção INCC', value: summary.totalINCC, color: colors.accent || '#10b981' }
                    ].filter(item => item.value > 0).map((entry, index) => (
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
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: colors.textMuted }}>Valor Total</p>
                <p className="text-sm font-black" style={{ color: colors.text }}>
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
                <h4 className="text-sm font-bold mb-2" style={{ color: colors.text }}>Entenda os Custos</h4>
                <p className="text-xs leading-relaxed text-justify" style={{ color: colors.textMuted }}>
                  O gráfico apresenta a composição completa do custo do imóvel.
                  Observe a proporção entre o valor financiado pelo banco e o capital próprio investido (Entrada), além dos custos acessórios da obra.
                </p>
              </div>

              {/* Percentage Breakdown (Mini Table) */}
              <div className="space-y-2 pt-2">
                {[
                  { name: 'Entrada (Principal)', val: (Number(scenario.downPayment) || 0), color: colors.primary, label: 'Entrada (Principal)' },
                  { name: 'Financiamento', val: reportData.financingSummary ? (reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization) : 0, color: colors.secondary, label: 'Financiamento' },
                  { name: 'Juros de Obra', val: scenario.useWorkEvolution ? summary.totalObraInterest : 0, color: '#f97316', label: 'Juros de Obra' },
                  { name: 'INCC (Correção)', val: summary.totalINCC, color: colors.accent || '#10b981', label: 'INCC (Correção)' }
                ].filter(item => item.val > 0).map((item) => {
                  const financingVal = reportData.financingSummary ? (reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization) : 0;
                  const totalWithFinancing = summary.totalConstructionCost + financingVal;

                  const pct = totalWithFinancing > 0
                    ? ((item.val / totalWithFinancing) * 100).toFixed(1)
                    : 0;
                  return (
                    <div key={item.label} className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-medium" style={{ color: colors.textMuted }}>{item.label}</span>
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
          <h3 className="text-xs md:text-sm font-bold mb-4 flex items-center gap-2 border-l-4 border-emerald-600 pl-3 uppercase tracking-tighter" style={{ color: colors.text }}>
            Fase de Obras (Detalhamento)
          </h3>

          <div className="border rounded-2xl overflow-hidden shadow-sm print:rounded-none print:border-l-0 print:border-r-0 print:border-gray-300 print:shadow-none" style={{ borderColor: colors.border }}>
            {/* HEADERS */}
            <div className="grid grid-cols-12 p-3 md:p-4 font-bold uppercase tracking-widest text-[10px] border-b print:bg-gray-100 print:text-black print:border-gray-300 print:py-2" style={{ backgroundColor: `${colors.surface}80`, color: colors.textMuted, borderColor: colors.border }}>
              <div className="col-span-1 text-center">Mês</div>
              <div className={`text-right ${scenario.useWorkEvolution ? 'col-span-2' : 'col-span-3'}`}>Mensal</div>
              <div className="col-span-2 text-right">Reforço</div>
              {scenario.useWorkEvolution && <div className="col-span-2 text-right">Evolução</div>}
              <div className={`text-right text-gray-900 border-l border-gray-100 ml-2 print:border-gray-300 ${scenario.useWorkEvolution ? 'col-span-3' : 'col-span-4'}`}>
                Total Mensal
              </div>
              <div className="col-span-2 text-right">Saldo Dev.</div>
            </div>

            {/* LISTA DE MESES DE OBRA */}
            <div className="divide-y divide-gray-50 print:divide-gray-200">
              {reportData.constructionRows.map((row) => {
                // Check if there is a balloon (heuristic: if builderInstallment > summary.firstEntryInstallment * 1.5)
                // Or better: check scenario balloons.
                // Actually relying on the value is safer as INCC affects it.
                // let's estimate:
                const estimatedBalloon = scenario.builderBalloons?.find(b => b.month === row.month)?.value || 0

                // If estimatedBalloon > 0, we assume the portion of builderInstallment is balloon.
                // However, builderInstallment implies INCC correction on the WHOLE debt.
                // For display, if we just want to split the columns "Mensal" vs "Reforço", we can try:

                const monthlyPart = row.builderInstallment > estimatedBalloon ? row.builderInstallment - estimatedBalloon : row.builderInstallment
                const balloonPart = estimatedBalloon > 0 ? estimatedBalloon : 0

                // Note: this isn't perfect mathematically for INCC distribution but visually correct for the user.

                return (
                  <div
                    key={row.month}
                    className="grid grid-cols-12 p-3 md:p-4 text-xs items-center hover:bg-gray-50/50 transition-colors break-inside-avoid print:p-1.5 print:text-[10px] print:leading-tight even:print:bg-gray-50"
                  >
                    <div className="col-span-1 text-center font-bold text-[10px] print:text-black" style={{ color: colors.textMuted }}>
                      {row.month}
                    </div>

                    {/* Mensal */}
                    <div className={`text-right font-medium print:text-black ${scenario.useWorkEvolution ? 'col-span-2' : 'col-span-3'}`} style={{ color: colors.text }}>
                      {monthlyPart > 0 ? fmtMoney(monthlyPart) : '-'}
                    </div>

                    {/* Reforço */}
                    <div className="col-span-2 text-right font-medium text-amber-600 print:text-black">
                      {balloonPart > 0 ? (
                        <span className="font-bold print:font-bold">{fmtMoney(balloonPart)}</span>
                      ) : '-'}
                    </div>

                    {/* Evolução */}
                    {scenario.useWorkEvolution && (
                      <div className="col-span-2 text-right font-medium print:text-black" style={{ color: colors.text }}>
                        {fmtMoney(row.bankAmortization + row.bankInterest + row.bankFees)}
                      </div>
                    )}

                    <div className={`text-right font-black border-l ml-2 print:border-gray-300 print:ml-0 print:pl-2 ${scenario.useWorkEvolution ? 'col-span-3' : 'col-span-4'}`} style={{ color: colors.text, borderColor: colors.border }}>
                      {fmtMoney(row.totalInstallment)}
                    </div>
                    <div className="col-span-2 text-right tabular-nums print:text-gray-600" style={{ color: colors.textMuted }}>
                      {fmtMoney(row.bankBalance)}
                    </div>
                  </div>
                )
              })}
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
            <h3 className="text-xs md:text-sm font-bold mb-4 flex items-center gap-2 border-l-4 border-blue-600 pl-3 uppercase tracking-tighter" style={{ color: colors.text }}>
              Fase de Financiamento (Pós-Chaves)
            </h3>

            <div className="rounded-xl border p-6 shadow-sm print:shadow-none print:border-gray-300" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

                {/* COLUNA 1: VALOR */}
                <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textMuted }}>
                    Saldo a Financiar
                  </p>
                  <p className="text-2xl font-black tracking-tight" style={{ color: colors.text }}>
                    {fmtMoney(reportData.financingSummary.first.bankBalance + reportData.financingSummary.first.bankAmortization)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    Valor sujeito a aprovação bancária
                  </p>
                </div>

                {/* COLUNA 2: CONDIÇÕES */}
                <div className="text-center md:text-left border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-8" style={{ borderColor: colors.border }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textMuted }}>
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
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textMuted }}>
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
      <footer className="fixed bottom-0 left-0 w-full border-t py-2 px-6 md:px-12 flex justify-between items-center z-[120] print:fixed print:bottom-0 print:left-0 print:w-full print:px-8 print:py-2" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <p className="text-[8px] md:text-[9px] text-gray-400 text-justify w-2/3 md:w-1/2 leading-tight">
          Atenção: Os valores podem sofrer alterações. Simulação sem valor contratual.
        </p>
        <div className="text-right flex items-center gap-4">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <LayoutDashboard size={12} /> Imob-Invest Simulator
          </p>
        </div>
      </footer>
    </div >
  )
}

export default DetailedReportView
