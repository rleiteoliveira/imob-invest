
export type FrequencyType = 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'UNICA'
export type ScenarioType = 'SAC' | 'PLANTA' | 'FUTURO'
export type AmortizationSystem = 'SAC' | 'PRICE'

export interface BuilderBalloon {
  month: number
  value: number
}

export interface SimulationScenario {
  id?: string
  name?: string
  propertyValue: number | ''
  downPayment: number | ''
  type: ScenarioType

  entrySignal: number | ''
  entryInstallments: number | ''
  builderBalloons?: BuilderBalloon[]

  amortizationSystem: AmortizationSystem
  interestRate: number | ''
  termMonths: number | ''
  monthlyAdminFee: number | ''
  insuranceMIP: number | ''
  insuranceDFI: number | ''

  hasBalloonPayments: boolean
  balloonFrequency: FrequencyType
  balloonCount: number | ''
  balloonValue: number | ''
  balloonStartMonth?: number | ''

  constructionTime: number | ''
  inccRate: number | ''
  useWorkEvolution: boolean
  currentWorkPercent: number | ''

  monthsToReady?: number | ''
  appreciationRate?: number | ''
}

export interface MonthlyResult {
  month: number
  bankBalance: number
  bankInterest: number
  bankAmortization: number
  bankFees: number
  builderInstallment: number
  builderBalance: number
  totalInstallment: number
  accumulatedPaid: number
  phase: 'OBRA' | 'AMORTIZACAO'
}
