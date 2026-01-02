
export type FrequencyType = 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'UNICA'
export type ScenarioType = 'MCMV' | 'DIRETO' | 'PRONTO' | 'PLANTA' | 'SAC' | 'FUTURO'
export type AmortizationSystem = 'SAC' | 'PRICE'

export interface BuilderBalloon {
  month: number
  value: number
}

export interface RentabilityConfig {
  dailyRate: number | ''
  occupancyRate: number | '' // 0-100
  platformFeePercent: number | ''
  cleaningFee: number | ''
  monthlyCondo: number | ''
  monthlyMaintenance: number | ''
  averageStaysPerMonth: number | ''
}

export interface AirbnbResult {
  grossRevenue: number
  totalExpenses: number
  netOperatingIncome: number
  cashFlow: number
}

export interface SimulationScenario {
  id?: string
  name?: string
  propertyValue: number | ''
  downPayment: number | ''
  type: ScenarioType

  entrySignal: number | ''
  useFGTS?: boolean
  fgtsValue?: number | ''
  entryInstallments: number | ''
  builderBalloons?: BuilderBalloon[]

  amortizationSystem: AmortizationSystem
  interestRate: number | ''
  termMonths: number | ''
  monthlyAdminFee: number | ''
  insuranceMIP: number | ''
  insuranceDFI: number | ''

  useManualBankInstallment?: boolean // Deprecated, keep for safety
  manualBankInstallmentValue?: number | ''

  useExternalSimulation?: boolean
  externalInstallmentValue?: number | ''

  hasBalloonPayments: boolean
  balloonFrequency: FrequencyType
  balloonCount: number | ''
  balloonValue: number | ''
  balloonStartMonth?: number | ''

  constructionTime: number | ''
  inccRate: number | ''
  useWorkEvolution: boolean
  currentWorkPercent: number | ''

  constructionStatus?: 'PRE_OBRA' | 'EM_ANDAMENTO'
  monthsUntilConstructionStart?: number | ''
  constructionDuration?: number | ''

  monthsToReady?: number | ''
  appreciationRate?: number | ''
  rentability?: RentabilityConfig

  // Client Metadata
  clientName?: string
  clientPhone?: string
  unitName?: string
  brokerName?: string

  clientLead: ClientLead
}

export interface ClientLead {
  name: string      // Nome do Cliente (Obrigatório para o PDF ficar bonito)
  phone?: string    // Telefone/WhatsApp (Opcional)
  email?: string    // Email (Opcional)
  unitOfInterest?: string // Unidade/Torre (ex: "Apt 402 - Torre A")
  notes?: string    // Observações do Corretor
  createdAt: Date
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
