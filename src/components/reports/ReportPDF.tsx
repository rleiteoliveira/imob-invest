import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { SimulationScenario, MonthlyResult } from '../../types/ScenarioTypes';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#111', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase' },
  subTitle: { fontSize: 10, color: '#666', marginTop: 4 },

  // Grid Cliente
  clientGrid: { flexDirection: 'row', backgroundColor: '#f9fafb', padding: 10, borderRadius: 4, marginTop: 10 },
  clientItem: { flex: 1 },
  label: { fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' },
  value: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },

  // Cards Coloridos
  cardsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  card: { flex: 1, padding: 10, borderRadius: 6 },
  cardBlue: { backgroundColor: '#eff6ff', borderColor: '#dbeafe', borderWidth: 1, borderStyle: 'solid' },
  cardOrange: { backgroundColor: '#fff7ed', borderColor: '#ffedd5', borderWidth: 1, borderStyle: 'solid' },
  cardGreen: { backgroundColor: '#ecfdf5', borderColor: '#d1fae5', borderWidth: 1, borderStyle: 'solid' },

  cardLabel: { fontSize: 8, textTransform: 'uppercase', fontWeight: 'bold', opacity: 0.8 },
  cardValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  cardSub: { fontSize: 8, marginTop: 2, opacity: 0.6 },

  // Tabela
  tableContainer: { marginTop: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 6, borderBottomWidth: 1, borderColor: '#e5e7eb', fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 0.5, borderColor: '#f3f4f6' },
  colMonth: { width: '10%', textAlign: 'center' },
  colValue: { width: '22%', textAlign: 'right' },

  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, fontSize: 8, color: '#9ca3af', textAlign: 'center' }
});

interface ReportSummary {
  firstEntryInstallment: number;
  firstObraInstallment: number;
  firstFinancInstallment: number;
  totalObraInterest: number;
  totalINCC: number;
}

// Componente do PDF
export const ReportPDF = ({ scenario, timeline, summary }: { scenario: SimulationScenario, timeline: MonthlyResult[], summary: ReportSummary }) => {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.title}>Planejamento Financeiro</Text>
              <Text style={styles.subTitle}>Simulação Oficial • {new Date().toLocaleDateString('pt-BR')}</Text>
            </View>
          </View>

          <View style={styles.clientGrid}>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Cliente</Text>
              <Text style={styles.value}>{scenario.clientName || '---'}</Text>
            </View>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Unidade</Text>
              <Text style={styles.value}>{scenario.unitName || '---'}</Text>
            </View>
            <View style={styles.clientItem}>
              <Text style={styles.label}>Valor Imóvel</Text>
              <Text style={styles.value}>{fmt(Number(scenario.propertyValue))}</Text>
            </View>
          </View>
        </View>

        {/* Cards Destaque */}
        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardBlue]}>
            <Text style={{ ...styles.cardLabel, color: '#1e40af' }}>1ª Parc. Construtora</Text>
            <Text style={{ ...styles.cardValue, color: '#1e3a8a' }}>{fmt(summary.firstEntryInstallment)}</Text>
            <Text style={{ ...styles.cardSub, color: '#1e40af' }}>Mensalidade Entrada</Text>
          </View>
          <View style={[styles.card, styles.cardOrange]}>
            <Text style={{ ...styles.cardLabel, color: '#c2410c' }}>1ª Evolução Obra</Text>
            <Text style={{ ...styles.cardValue, color: '#9a3412' }}>{fmt(summary.firstObraInstallment)}</Text>
            <Text style={{ ...styles.cardSub, color: '#c2410c' }}>Juros Banco (Estimado)</Text>
          </View>
          <View style={[styles.card, styles.cardGreen]}>
            <Text style={{ ...styles.cardLabel, color: '#047857' }}>1ª Financiamento</Text>
            <Text style={{ ...styles.cardValue, color: '#064e3b' }}>{fmt(summary.firstFinancInstallment)}</Text>
            <Text style={{ ...styles.cardSub, color: '#047857' }}>Pós-Chaves</Text>
          </View>
        </View>

        {/* Linha 2: Resumo Totais */}
        <View style={styles.cardsRow}>
          <View style={[styles.card, { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', borderWidth: 1, borderStyle: 'solid' }]}>
            <Text style={styles.cardLabel}>Total Juros Obra</Text>
            <Text style={styles.cardValue}>{fmt(summary.totalObraInterest)}</Text>
            <Text style={styles.cardSub}>Pago ao banco durante obra</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', borderWidth: 1, borderStyle: 'solid' }]}>
            <Text style={styles.cardLabel}>Total INCC (Estimado)</Text>
            <Text style={styles.cardValue}>{fmt(summary.totalINCC)}</Text>
            <Text style={styles.cardSub}>Correção monetária sobre entrada</Text>
          </View>
        </View>

        {/* Tabela */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader} fixed>
            <Text style={styles.colMonth}>Mês</Text>
            <Text style={styles.colValue}>Construtora</Text>
            <Text style={styles.colValue}>Banco</Text>
            <Text style={styles.colValue}>Total Pago</Text>
            <Text style={styles.colValue}>Saldo Dev.</Text>
          </View>
          {timeline.map((row, i) => (
            <View key={row.month} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }]}>
              <Text style={styles.colMonth}>{row.month}</Text>
              <Text style={styles.colValue}>{row.builderInstallment > 0 ? fmt(row.builderInstallment) : '-'}</Text>
              <Text style={styles.colValue}>{fmt(row.bankAmortization + row.bankInterest + row.bankFees)}</Text>
              <Text style={styles.colValue}>{fmt(row.totalInstallment)}</Text>
              <Text style={styles.colValue}>{fmt(row.bankBalance)}</Text>
            </View>
          ))}
        </View>

        {/* Rodapé */}
        <Text style={styles.footer} fixed>
          Documento gerado eletronicamente. Valores sujeitos a alteração. | Financiamento Pro
        </Text>
      </Page>
    </Document>
  );
};
