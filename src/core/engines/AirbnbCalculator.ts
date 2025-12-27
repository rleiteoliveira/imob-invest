import Decimal from 'decimal.js'
// AQUI ESTAVA O ERRO: Adicione 'type'
import type { RentabilityConfig, AirbnbResult } from '../../types/ScenarioTypes'

export const calculateAirbnbReturn = (
  config: RentabilityConfig,
  financingMonthlyCost: number
): AirbnbResult => {
  const dailyRate = Number(config.dailyRate) || 0
  const occupancyRate = Number(config.occupancyRate) || 0 // 0-100
  const platformFeePercent = Number(config.platformFeePercent) || 0 // 0-100 (e.g. 15)
  const cleaningFee = Number(config.cleaningFee) || 0
  const monthlyCondo = Number(config.monthlyCondo) || 0
  const monthlyMaintenance = Number(config.monthlyMaintenance) || 0
  const averageStays = Number(config.averageStaysPerMonth) || 0

  // 1. Receita Bruta
  // Dias ocupados = 30 * (taxa / 100)
  const daysOccupied = 30 * (occupancyRate / 100)
  const grossRevenue = daysOccupied * dailyRate

  // 2. Despesas
  // Taxa plataforma sobre a receita bruta
  const platformFee = grossRevenue * (platformFeePercent / 100)

  // Limpeza total = custo * numero de estadias
  const totalCleaningCost = cleaningFee * averageStays

  const totalExpenses =
    platformFee +
    totalCleaningCost +
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