import { useState } from 'react'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import { useSimulationHistory } from '../../../hooks/useSimulationHistory'
import { CaixaMCMV } from '../services/engines/CaixaMCMV'

export interface CardMetrics {
  parcelaEntrada: number
  parcelaObraBanco: number
  parcelaFinanciamento: number
  valorizacao: number
  totalJurosObra: number
}

export function useSimulation() {
  const { saveSimulation } = useSimulationHistory()
  const { settings: globalSettings } = useGlobalSettings()

  const defaultData: SimulationScenario = {
    propertyValue: 350000,
    downPayment: 70000,
    entrySignal: 15000,
    entryInstallments: 36,
    builderBalloons: [],
    type: 'MCMV',
    amortizationSystem: 'PRICE',
    interestRate: globalSettings.interestRate,
    termMonths: globalSettings.termMonths,
    monthlyAdminFee: globalSettings.monthlyAdminFee,
    insuranceMIP: globalSettings.insuranceMIP,
    insuranceDFI: globalSettings.insuranceDFI,
    hasBalloonPayments: false,
    balloonFrequency: 'UNICA',
    balloonCount: 1,
    balloonValue: 10000,
    balloonStartMonth: 0,
    constructionTime: 36,
    inccRate: globalSettings.inccRate,
    useWorkEvolution: globalSettings.useWorkEvolution,
    currentWorkPercent: 30,
    monthsToReady: 24,
    appreciationRate: globalSettings.appreciationRate,
    clientLead: {
      name: '',
      createdAt: new Date()
    }
  }

  const [data, setData] = useState<SimulationScenario>(defaultData)
  const [step, setStep] = useState(0)
  const [currentName, setCurrentName] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const createNew = (): void => {
    setStep(0)
    setCurrentName('')
    setData({ ...defaultData })
  }

  const handleSave = (): void => {
    if (!currentName) return
    const newId = data.id || crypto.randomUUID()
    const newScenario = { ...data, id: newId, name: currentName }

    saveSimulation(newScenario)

    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      createNew()
    }, 1500)
  }

  const getCardMetrics = (cenario: SimulationScenario): CardMetrics => {
    const timeline = new CaixaMCMV().calculate(cenario)
    if (!timeline || timeline.length === 0)
      return {
        parcelaEntrada: 0,
        parcelaObraBanco: 0,
        parcelaFinanciamento: 0,
        valorizacao: 0,
        totalJurosObra: 0
      }

    const firstMonth = timeline[0]
    const parcelaEntrada = firstMonth ? firstMonth.builderInstallment || 0 : 0
    const parcelaObraBanco = firstMonth
      ? (firstMonth.bankInterest || 0) + (firstMonth.bankFees || 0)
      : 0

    const firstAmort = timeline.find((t) => t.phase === 'AMORTIZACAO')
    const parcelaFinanciamento = firstAmort ? firstAmort.totalInstallment || 0 : 0

    const totalJurosObra = timeline
      .filter((t) => t.phase === 'OBRA')
      .reduce((acc, curr) => acc + (curr.bankInterest + curr.bankFees), 0)

    let valorizacao = 0
    const originalVal = Number(cenario.propertyValue) || 0
    if (cenario.type === 'MCMV' || cenario.type === 'DIRETO') {
      valorizacao = originalVal * 0.3
    }

    return { parcelaEntrada, parcelaObraBanco, parcelaFinanciamento, valorizacao, totalJurosObra }
  }

  return {
    data,
    setData,
    step,
    setStep,
    currentName,
    setCurrentName,
    showSuccess,
    createNew,
    handleSave,
    getCardMetrics
  }
}
