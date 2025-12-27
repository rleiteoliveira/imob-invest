import type { SimulationScenario, MonthlyResult } from '../../types/ScenarioTypes'

export interface CalculationEngine {
  calculate(data: SimulationScenario): MonthlyResult[]
}