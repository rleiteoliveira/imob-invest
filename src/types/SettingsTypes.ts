export interface GlobalSettings {
  interestRate: number
  monthlyAdminFee: number
  insuranceMIP: number
  insuranceDFI: number
  termMonths: number
  inccRate: number
  appreciationRate: number
  useWorkEvolution: boolean
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  interestRate: 8.66,
  monthlyAdminFee: 25.0,
  insuranceMIP: 30.24,
  insuranceDFI: 24.85,
  termMonths: 420,
  inccRate: 0.45,
  appreciationRate: 10,
  useWorkEvolution: true
}
