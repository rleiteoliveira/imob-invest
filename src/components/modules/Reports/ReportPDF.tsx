import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { SimulationScenario, MonthlyResult } from '../../../types/ScenarioTypes';

// Define fonts if needed. For now using standard Helvetica.


const styles = StyleSheet.create({
  page: {
    padding: 30,
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

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  disclaimerBox: {
    backgroundColor: '#fefce8', // yellow-50
    padding: 8,
    borderRadius: 4,
    marginBottom: 10
  },
  disclaimerText: {
    fontSize: 8,
    color: '#854d0e', // yellow-800
    textAlign: 'justify',
    lineHeight: 1.4
  },
  footerBrand: {
    fontSize: 8,
    color: '#d1d5db',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 2
  }
});

interface ReportPDFProps {
  scenario: SimulationScenario
  timeline: MonthlyResult[]
  summary: any
}

export const ReportPDF = ({ scenario, timeline, summary }: ReportPDFProps) => {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Planejamento Financeiro</Text>
              <Text style={styles.subTitle}>Simulação Oficial • {new Date().toLocaleDateString('pt-BR')}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2563eb' }}>{scenario.name}</Text>
            </View>
          </View>

          <View style={styles.clientGrid}>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Cliente</Text>
              <Text style={styles.value}>{scenario.clientName || '---'}</Text>
            </View>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Telefone</Text>
              <Text style={styles.value}>{scenario.clientPhone || '---'}</Text>
            </View>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Unidade</Text>
              <Text style={styles.value}>{scenario.unitName || '---'}</Text>
            </View>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Valor Imóvel</Text>
              <Text style={styles.valueBlue}>{fmt(Number(scenario.propertyValue))}</Text>
            </View>
          </View>
        </View>

        {/* Linha 1: Cards Mês */}
        <Text style={styles.sectionTitle}>Fluxo Mensal Inicial</Text>
        <View style={styles.cardsRow}>
          {/* Azul */}
          <View style={[styles.card, styles.cardBlueDark]}>
            <Text style={styles.cardBlueLabelDark}>1ª Parc. Construtora</Text>
            <Text style={styles.cardBlueValueDark}>{fmt(summary.firstEntryInstallment)}</Text>
            <Text style={styles.cardBlueSubDark}>Mensalidade Entrada</Text>
          </View>
          {/* Laranja */}
          <View style={[styles.card, styles.cardOrangeDark]}>
            <Text style={styles.cardOrangeLabelDark}>1ª Evolução Obra</Text>
            <Text style={styles.cardOrangeValueDark}>{fmt(summary.firstObraInstallment)}</Text>
            <Text style={styles.cardOrangeSubDark}>Juros Banco (Estimado)</Text>
          </View>
          {/* Verde */}
          <View style={[styles.card, styles.cardGreenDark]}>
            <Text style={styles.cardGreenLabelDark}>1ª Financiamento</Text>
            <Text style={styles.cardGreenValueDark}>{fmt(summary.firstFinancInstallment)}</Text>
            <Text style={styles.cardGreenSubDark}>Pós-Chaves</Text>
          </View>
        </View>

        {/* Linha 2: Totais */}
        <Text style={styles.sectionTitle}>Resumo de Custos</Text>
        <View style={styles.summaryRow}>
          <View style={styles.cardGray}>
            <Text style={styles.cardGrayLabel}>Total Juros de Obra</Text>
            <Text style={styles.cardGrayValue}>{fmt(summary.totalObraInterest)}</Text>
            <Text style={styles.cardGraySub}>Juros pagos durante a construção</Text>
          </View>
          <View style={styles.cardGray}>
            <Text style={styles.cardGrayLabel}>Variação INCC</Text>
            <Text style={styles.cardGrayValue}>{fmt(summary.totalINCC)}</Text>
            <Text style={styles.cardGraySub}>Correção monetária estimada</Text>
          </View>
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
          {timeline.map((row, i) => (
            <View key={row.month} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fafb' }]}>
              <Text style={[styles.colMonth, { fontSize: 8, color: '#9ca3af' }]}>{row.month}</Text>
              <Text style={[styles.colBuilder, { fontSize: 9, color: row.builderInstallment > 0 ? '#2563eb' : '#d1d5db', fontWeight: row.builderInstallment > 0 ? 'bold' : 'normal' }]}>
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
        </View>

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              Atenção: Os valores de financiamento futuro são projeções baseadas na taxa de juros atual e na correção do INCC durante a obra. O valor total final pago depende de indexadores econômicos, amortizações extraordinárias e reajustes anuais de seguro. Esta simulação não possui valor contratual.
            </Text>
          </View>
          <Text style={styles.footerBrand}>
            Imob-Invest Simulator
          </Text>
        </View>
      </Page>
    </Document>
  );
};
