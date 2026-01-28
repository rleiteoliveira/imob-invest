import type { RentabilityConfig, RentalResult } from '../../../../types/ScenarioTypes'

export const calculateRentalReturn = (
  config: RentabilityConfig,
  financingMonthlyCost: number
): RentalResult => {
  const projectedIncome = Number(config.projectedMonthlyIncome) || 0
  const occupancyRate = Number(config.occupancyRate) || 0 // 0-100
  const managementFeePercent = Number(config.managementFeePercent) || 0 // 0-100
  const cleaningFee = Number(config.cleaningFee) || 0
  const monthlyCondo = Number(config.monthlyCondo) || 0
  const monthlyMaintenance = Number(config.monthlyMaintenance) || 0
  const turnover = Number(config.monthlyTurnover) || 0

  // 1. Receita Bruta (Calculada com base na Ocupação)
  // Se for aluguel fixo, ocupação pode ser 100%.
  // Se for temporada, projeta-se receita cheia * taxa de ocupação.
  const grossRevenue = projectedIncome * (occupancyRate / 100)

  // 2. Despesas
  // Taxa de gestão/plataforma sobre a receita Efetiva (Bruta)
  const managementFee = grossRevenue * (managementFeePercent / 100)

  // Custo variável (ex: limpeza) * rotatividade
  const totalVariableCost = cleaningFee * turnover

  const totalExpenses =
    managementFee +
    totalVariableCost +
    monthlyCondo +
    monthlyMaintenance

  // 3. Resultado Operacional
  const netOperatingIncome = grossRevenue - totalExpenses

  // 4. Fluxo de Caixa (Líquido após parcela)
  const cashFlow = netOperatingIncome - financingMonthlyCost

  return {
    grossRevenue,
    totalExpenses,
    netOperatingIncome,
    cashFlow
  }
}
