import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { SimulationScenario, MonthlyResult } from '../../../types/ScenarioTypes';

// Define fonts if needed. For now using standard Helvetica.


const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingHorizontal: 30,
    paddingBottom: 60, // Margem de segurança para o rodapé
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937', // gray-800
    backgroundColor: '#fff'
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#111827', // gray-900
    paddingBottom: 10
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'black',
    textTransform: 'uppercase',
    color: '#111827'
  },
  subTitle: {
    fontSize: 10,
    color: '#6b7280', // gray-500
    marginTop: 2
  },

  // Grid Cliente
  clientGrid: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb', // gray-50
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6' // gray-100
  },
  clientItem: {
    flex: 1
  },
  label: {
    fontSize: 8,
    color: '#9ca3af', // gray-400
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 0.5
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827'
  },
  valueBlue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb' // blue-600
  },

  // Conteúdo
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb', // blue-600
    paddingLeft: 6
  },
  sectionTitleGreen: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#059669', // emerald-600
    paddingLeft: 6
  },

  // Cards Coloridos
  cardsRow: {
    flexDirection: 'row',
    gap: 10
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1
  },

  // Azul
  cardBlue: {
    backgroundColor: '#eff6ff', // blue-50
    borderColor: '#dbeafe'      // blue-100
  },
  cardBlueTextMeta: { color: '#dbeafe' },
  cardBlueTextLabel: { fontSize: 8, fontWeight: 'bold', color: '#1d4ed8', textTransform: 'uppercase' }, // blue-700
  cardBlueTextValue: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginTop: 4 }, // White text on gradient? No, doing flat colors for PDF safety
  // Actually let's stick to the screen design: Blue bg with white text? Or Light bg?
  // User screen design: Blue Gradient (Dark) with White text.
  // Let's try to mimic that.
  cardBlueDark: {
    backgroundColor: '#2563eb', // blue-600
    borderColor: '#1d4ed8'
  },
  cardBlueLabelDark: { fontSize: 8, color: '#dbeafe', textTransform: 'uppercase', fontWeight: 'bold' },
  cardBlueValueDark: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginTop: 4 },
  cardBlueSubDark: { fontSize: 8, color: '#dbeafe', marginTop: 2 },

  // Laranja
  cardOrangeDark: {
    backgroundColor: '#f97316', // orange-500
    borderColor: '#ea580c'
  },
  cardOrangeLabelDark: { fontSize: 8, color: '#ffedd5', textTransform: 'uppercase', fontWeight: 'bold' },
  cardOrangeValueDark: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginTop: 4 },
  cardOrangeSubDark: { fontSize: 8, color: '#ffedd5', marginTop: 2 },

  // Verde ex: Emerald
  cardGreenDark: {
    backgroundColor: '#059669', // emerald-600
    borderColor: '#047857'
  },
  cardGreenLabelDark: { fontSize: 8, color: '#d1fae5', textTransform: 'uppercase', fontWeight: 'bold' },
  cardGreenValueDark: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginTop: 4 },
  cardGreenSubDark: { fontSize: 8, color: '#d1fae5', marginTop: 2 },

  // Cards Cinza (Totais)
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  cardGray: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9fafb', // gray-50
    borderColor: '#e5e7eb', // gray-200
    borderWidth: 1
  },
  cardGrayLabel: { fontSize: 8, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' },
  cardGrayValue: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginTop: 2 },
  cardGraySub: { fontSize: 8, color: '#9ca3af', marginTop: 2 },

  // Tabela
  tableContainer: { marginTop: 10 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center'
  },
  tableHeaderLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderColor: '#f3f4f6',
    alignItems: 'center'
  },
  colMonth: { width: '8%', textAlign: 'center' },
  colBuilder: { width: '22%', textAlign: 'right' },
  colBank: { width: '22%', textAlign: 'right' },
  colTotal: { width: '24%', textAlign: 'right', fontWeight: 'bold' },
  colBalance: { width: '24%', textAlign: 'right', color: '#9ca3af' },

  textBold: { fontWeight: 'bold', color: '#111827' },

  // Rodapé Refatorado
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    paddingVertical: 8, // ~ py-2
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // border-gray-200
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerLegalText: {
    fontSize: 8, // text-[8px]
    color: '#9ca3af', // text-gray-400
    textAlign: 'justify',
    width: '65%',
    lineHeight: 1.2
  },
  footerRightBlock: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '30%'
  },
  footerBrand: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  footerPageNumber: {
    fontSize: 8,
    color: '#9ca3af'
  }
});

interface ReportPDFProps {
  scenario: SimulationScenario
  timeline: MonthlyResult[]
  summary: any
  brandColor?: string
  companyLogo?: string | null
}

export const ReportPDF = ({ scenario, timeline, summary, brandColor = '#2563eb', companyLogo }: ReportPDFProps) => {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const getOptimizedRows = (fullTimeline: MonthlyResult[]) => {
    const constructionRows = fullTimeline.filter(r => r.phase === 'OBRA');
    const financingRows = fullTimeline.filter(r => r.phase === 'AMORTIZACAO');

    const financingSummary = financingRows.length > 0 ? {
      first: financingRows[0],
      last: financingRows[financingRows.length - 1],
      count: financingRows.length,
      years: Math.floor(financingRows.length / 12),
      totalValue: financingRows.reduce((acc, curr) => acc + curr.totalInstallment, 0)
    } : null;

    return { constructionRows, financingSummary };
  };

  const { constructionRows, financingSummary } = getOptimizedRows(timeline);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              {companyLogo ? (
                <Image src={companyLogo} style={{ height: 40, marginBottom: 10, objectFit: 'contain' }} />
              ) : (
                <Text style={[styles.title, { color: brandColor }]}>Planejamento Financeiro</Text>
              )}
              <Text style={styles.subTitle}>Simulação Oficial • {new Date().toLocaleDateString('pt-BR')}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: brandColor }}>{scenario.name}</Text>
            </View>
          </View>

          <View style={styles.clientGrid}>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Cliente</Text>
              <Text style={styles.value}>{scenario.clientLead?.name || scenario.clientName || '---'}</Text>
            </View>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Telefone</Text>
              <Text style={styles.value}>{scenario.clientLead?.phone || scenario.clientPhone || '---'}</Text>
            </View>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Unidade</Text>
              <Text style={styles.value}>{scenario.clientLead?.unitOfInterest || scenario.unitName || '---'}</Text>
            </View>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Valor Imóvel</Text>
              <Text style={[styles.valueBlue, { color: brandColor }]}>{fmt(Number(scenario.propertyValue))}</Text>
            </View>
          </View>
        </View>

        {/* Linha 1: Cards Mês */}
        <Text style={styles.sectionTitle}>Fluxo Mensal Inicial</Text>
        <View style={styles.cardsRow}>
          {/* Azul - Construtora */}
          <View style={[styles.card, styles.cardBlueDark, { backgroundColor: brandColor || '#2563eb', borderColor: brandColor || '#1d4ed8' }]}>
            <Text style={styles.cardBlueLabelDark}>1ª Parc. Construtora</Text>
            <Text style={styles.cardBlueValueDark}>{fmt(summary.firstEntryInstallment)}</Text>
            <Text style={styles.cardBlueSubDark}>Mensalidade da Entrada</Text>
          </View>
          {/* Laranja - Obra */}
          <View style={[styles.card, styles.cardOrangeDark]}>
            <Text style={styles.cardOrangeLabelDark}>1ª Evolução Obra</Text>
            <Text style={styles.cardOrangeValueDark}>{fmt(summary.firstObraInstallment)}</Text>
            <Text style={styles.cardOrangeSubDark}>Juros Bancários (Estimado)</Text>
          </View>
        </View>



        {/* Total Cost Section (New) */}
        <View style={{ marginTop: 8, padding: 10, backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', color: '#111827' }}>Total Estimado no Período de Obra</Text>
            <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 2 }}>Entrada ({fmt(Number(scenario.downPayment) || 0)}) + Juros Obra ({fmt(summary.totalObraInterest)}) + INCC ({fmt(summary.totalINCC)})</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', letterSpacing: -0.5 }}>
            {fmt((Number(scenario.downPayment) || 0) + summary.totalObraInterest + summary.totalINCC)}
          </Text>
        </View>

        {/* Tabela */}
        <Text style={styles.sectionTitleGreen}>Cronograma Detalhado</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.colMonth, styles.tableHeaderLabel]}>Mês</Text>
            <Text style={[styles.colBuilder, styles.tableHeaderLabel]}>Construtora</Text>
            <Text style={[styles.colBank, styles.tableHeaderLabel]}>Banco</Text>
            <Text style={[styles.colTotal, styles.tableHeaderLabel]}>Total Mensal</Text>
            <Text style={[styles.colBalance, styles.tableHeaderLabel]}>Saldo Dev.</Text>
          </View>
          {constructionRows.map((row, i) => (
            <View key={row.month} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fafb' }]}>
              <Text style={[styles.colMonth, { fontSize: 8, color: '#9ca3af' }]}>{row.month}</Text>
              <Text style={[styles.colBuilder, { fontSize: 9, color: row.builderInstallment > 0 ? brandColor : '#d1d5db', fontWeight: row.builderInstallment > 0 ? 'bold' : 'normal' }]}>
                {row.builderInstallment > 0 ? fmt(row.builderInstallment) : '-'}
              </Text>
              <Text style={[styles.colBank, { fontSize: 9 }]}>
                {fmt(row.bankAmortization + row.bankInterest + row.bankFees)}
              </Text>
              <Text style={[styles.colTotal, { fontSize: 9, fontWeight: 'bold' }]}>
                {fmt(row.totalInstallment)}
              </Text>
              <Text style={[styles.colBalance, { fontSize: 8 }]}>
                {fmt(row.bankBalance)}
              </Text>
            </View>
          ))}

          {/* Divisor Entrega das Chaves */}
          <View style={{ paddingVertical: 8, backgroundColor: '#f0fdf4', borderTopWidth: 1, borderTopColor: '#bbf7d0', borderBottomWidth: 1, borderBottomColor: '#bbf7d0', marginTop: 5, marginBottom: 5 }}>
            <Text style={{ textAlign: 'center', fontSize: 10, fontWeight: 'black', color: '#15803d', textTransform: 'uppercase', letterSpacing: 1 }}>
              ★ Entrega das Chaves / Início do Financiamento ★
            </Text>
          </View>

          {/* Resumo da Fase de Financiamento */}
          {financingSummary && (
            <View break style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>Resumo do Financiamento</Text>
              <View style={{ flexDirection: 'row', backgroundColor: '#f9fafb', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#f3f4f6' }}>

                {/* Saldo */}
                <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#e5e7eb', paddingRight: 10 }}>
                  <Text style={styles.label}>Saldo a Financiar</Text>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111827', marginTop: 2 }}>
                    {fmt(financingSummary.first.bankBalance + financingSummary.first.bankAmortization)}
                  </Text>
                </View>

                {/* Condições */}
                <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#e5e7eb', paddingHorizontal: 10 }}>
                  <Text style={styles.label}>Condições</Text>
                  <Text style={{ fontSize: 10, color: '#111827', marginTop: 2 }}>
                    {scenario.amortizationSystem} • {scenario.interestRate}% a.a.
                  </Text>
                  <Text style={{ fontSize: 9, color: '#6b7280' }}>
                    {financingSummary.count} meses ({financingSummary.years} anos)
                  </Text>
                </View>

                {/* Parcelas */}
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={styles.label}>Parcelas Estimadas</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                    <Text style={{ fontSize: 9, color: '#111827' }}>1ª {fmt(financingSummary.first.totalInstallment)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 9, color: '#6b7280' }}>Últ. {fmt(financingSummary.last.totalInstallment)}</Text>
                  </View>
                </View>

              </View>
            </View>
          )}
        </View>

        {/* Rodapé Refatorado */}
        <View style={styles.footerContainer} fixed>
          <Text style={styles.footerLegalText}>
            Atenção: Os valores podem sofrer alterações. Simulação sem valor contratual.
          </Text>

          <View style={styles.footerRightBlock}>
            <Text style={styles.footerBrand}>
              Imob-Invest Simulator
            </Text>
            <Text style={styles.footerPageNumber} render={({ pageNumber, totalPages }) => (
              `${pageNumber} / ${totalPages}`
            )} />
          </View>
        </View>
      </Page>
    </Document>
  );
};
