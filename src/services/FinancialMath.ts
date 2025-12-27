import Decimal from 'decimal.js'

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

export class FinancialMath {
  static calculate(data: SimulationScenario): MonthlyResult[] {
    const propValue = new Decimal(data.propertyValue || 0)
    const downPaymentTotal = new Decimal(data.downPayment || 0)

    const constructionMonths = data.type === 'PLANTA' ? Number(data.constructionTime) || 0 : 0
    const balloonVal = new Decimal(data.balloonValue || 0)
    const hasBalloon = data.hasBalloonPayments

    // === LÓGICA 1: Separar FGTS/Balões em "Construtora" (Obra) vs "Banco" (Pós-Obra) ===
    let extraEntryFromBalloonAtZero = new Decimal(0) // Mês 0 (Sinal)
    let totalBalloonAmountInConstruction = new Decimal(0) // Durante a obra (Intercalada Auto)

    const startMonth = Number(data.balloonStartMonth || 0)
    const balloonInterval = data.balloonFrequency === 'MENSAL' ? 1 :
      data.balloonFrequency === 'TRIMESTRAL' ? 3 :
        data.balloonFrequency === 'SEMESTRAL' ? 6 :
          data.balloonFrequency === 'ANUAL' ? 12 : 0

    // Função helper para verificar se um mês tem balão
    const isBalloonMonth = (m: number, countPaid: number): boolean => {
      if (!hasBalloon) return false
      if (data.balloonFrequency === 'UNICA') {
        return m === startMonth && startMonth > 0
      }
      const limit = Number(data.balloonCount) || 0
      if (countPaid >= limit) return false
      return (m % balloonInterval === 0)
    }

    // Pré-calcula quanto do FGTS/Balão cai NA OBRA para abater da dívida mensal
    if (hasBalloon) {
      if (data.balloonFrequency === 'UNICA') {
        if (startMonth === 0) {
          extraEntryFromBalloonAtZero = balloonVal
        } else if (startMonth <= constructionMonths) {
          totalBalloonAmountInConstruction = totalBalloonAmountInConstruction.plus(balloonVal)
        }
      } else {
        // Periódico
        let count = 0
        for (let m = 1; m <= constructionMonths; m++) {
          if (isBalloonMonth(m, count)) {
            totalBalloonAmountInConstruction = totalBalloonAmountInConstruction.plus(balloonVal)
            count++
          }
        }
      }
    }

    // === 2. Configuração da Construtora ===
    const signal = new Decimal(data.entrySignal || 0)
    let totalBuilderManualBalloons = new Decimal(0)
      ; (data.builderBalloons || []).forEach((b) => {
        totalBuilderManualBalloons = totalBuilderManualBalloons.plus(b.value)
      })

    // Dívida com Construtora = EntradaTotal - Sinal - FGTS(Mês 0) - Intercaladas Manuais - FGTS(Durante Obra)
    let builderDebtMensal = downPaymentTotal
      .minus(signal)
      .minus(extraEntryFromBalloonAtZero) // Se for Mês 0, abate como sinal
      .minus(totalBuilderManualBalloons)
      .minus(totalBalloonAmountInConstruction) // O "Pulo do Gato": Abate balões que caem na obra

    if (builderDebtMensal.lessThan(0)) builderDebtMensal = new Decimal(0)

    const builderInstallmentsCount = Number(data.entryInstallments) || 0
    let builderBaseInstallment = new Decimal(0)
    if (builderInstallmentsCount > 0) {
      builderBaseInstallment = builderDebtMensal.div(builderInstallmentsCount)
    }

    // === 3. Configuração do Banco ===
    // Financiado = Valor - Entrada
    // (O FGTS Mês 0 tecnicamente compõe a entrada, então já está no downPaymentTotal, 
    // mas se o usuário somou visualmente, aqui garantimos o saldo correto).
    // Na nossa lógica visual, DownPayment é o Recurso Próprio. 
    // Se Mês 0, ele ajuda a pagar a entrada, não altera o financiado diretamente além do que o downPayment já fez.
    // Ajuste: Se o user marcou Mês 0, consideramos que ele quer usar isso para ABATER o FINANCIAMENTO ou ENTRADA?
    // O pedido foi "abatendo junto como sinal".

    // Para simplificar: Valor Financiado = Valor Imóvel - Entrada Total Declarada.
    // Se o FGTS (Mês 0) for extra entrada, o usuário deve somar no input "Entrada".
    // Se for abater financiado, subtraímos aqui. Vamos subtrair aqui para garantir.
    const financedAmount = propValue.minus(downPaymentTotal).minus(extraEntryFromBalloonAtZero)

    // ... (Taxas Padrão) ...
    const annualRate = new Decimal(data.interestRate || 0).div(100)
    const monthlyInterestRate = annualRate.div(12)
    const monthlyAdminFee = new Decimal(data.monthlyAdminFee || 0)
    const insuranceMIP = new Decimal(data.insuranceMIP || 0)
    const insuranceDFI = new Decimal(data.insuranceDFI || 0)
    const totalBankFees = monthlyAdminFee.plus(insuranceMIP).plus(insuranceDFI)
    const monthlyINCC = new Decimal(data.inccRate || 0).div(100)
    const totalMonths = Number(data.termMonths) || 360

    let currentBankBalance = financedAmount
    if (currentBankBalance.lessThanOrEqualTo(0) && builderDebtMensal.lessThanOrEqualTo(0)) return []

    const timeline: MonthlyResult[] = []
    let accumulatedTotal = signal.plus(extraEntryFromBalloonAtZero)
    let bankBalloonsPaidCount = 0

    // === FASE 1: OBRA ===
    if (data.type === 'PLANTA' && constructionMonths > 0) {
      const startPercent = Number(data.currentWorkPercent || 0) / 100
      const remainingPercent = 1.0 - startPercent
      const evolutionStep = remainingPercent / constructionMonths

      for (let i = 1; i <= constructionMonths; i++) {
        const correctionFactor = new Decimal(1).plus(monthlyINCC).pow(i)
        let monthlyBuilderPmt = new Decimal(0)

        // 1. Mensal Base
        if (i <= builderInstallmentsCount) {
          monthlyBuilderPmt = monthlyBuilderPmt.plus(builderBaseInstallment.times(correctionFactor))
        }
        // 2. Intercalada Manual
        const manualBalloon = (data.builderBalloons || []).find((b) => b.month === i)
        if (manualBalloon) {
          monthlyBuilderPmt = monthlyBuilderPmt.plus(new Decimal(manualBalloon.value).times(correctionFactor))
        }
        // 3. FGTS/Balão Automático (Se cair neste mês)
        // Nota: Se é UNICA, count não importa. Se é periodica, verificamos o count.
        let isAutoBalloon = false
        if (hasBalloon) {
          if (data.balloonFrequency === 'UNICA') {
            if (i === startMonth) isAutoBalloon = true
          } else {
            if (i % balloonInterval === 0 && bankBalloonsPaidCount < (Number(data.balloonCount) || 0)) {
              isAutoBalloon = true
              bankBalloonsPaidCount++ // Consome a cota de balões
            }
          }
        }

        if (isAutoBalloon) {
          // Adiciona na parcela da construtora (corrigido pelo INCC pois estava "devendo")
          monthlyBuilderPmt = monthlyBuilderPmt.plus(balloonVal.times(correctionFactor))
        }

        // Banco (Evolução)
        let bankInterest = new Decimal(0)
        if (data.useWorkEvolution) {
          const currentProgress = Math.min(startPercent + evolutionStep * i, 1)
          const amountReleased = financedAmount.times(currentProgress)
          bankInterest = amountReleased.times(monthlyInterestRate)
        }

        const totalMonth = monthlyBuilderPmt.plus(bankInterest).plus(totalBankFees)
        accumulatedTotal = accumulatedTotal.plus(totalMonth)

        timeline.push({
          month: i,
          bankBalance: currentBankBalance.toNumber(),
          bankInterest: bankInterest.toNumber(),
          bankAmortization: 0,
          bankFees: totalBankFees.toNumber(),
          builderInstallment: monthlyBuilderPmt.toNumber(),
          builderBalance: 0,
          totalInstallment: totalMonth.toNumber(),
          accumulatedPaid: accumulatedTotal.toNumber(),
          phase: 'OBRA'
        })
      }
    }

    // === FASE 2: AMORTIZAÇÃO ===
    const amortizationMonths = totalMonths
    let pricePMT = new Decimal(0)

    if (data.amortizationSystem === 'PRICE') {
      const iRate = monthlyInterestRate.toNumber()
      const n = amortizationMonths
      if (iRate > 0) {
        pricePMT = new Decimal(currentBankBalance.toNumber() * ((iRate * Math.pow(1 + iRate, n)) / (Math.pow(1 + iRate, n) - 1)))
      } else {
        pricePMT = currentBankBalance.div(n)
      }
    }
    const sacAmortization = currentBankBalance.div(amortizationMonths)

    for (let i = 1; i <= amortizationMonths; i++) {
      const globalMonth = constructionMonths + i
      const interest = currentBankBalance.times(monthlyInterestRate)
      let amortization = new Decimal(0)
      let baseInstallment = new Decimal(0)

      if (data.amortizationSystem === 'PRICE') {
        baseInstallment = pricePMT
        amortization = baseInstallment.minus(interest)
        if (amortization.greaterThan(currentBankBalance)) {
          amortization = currentBankBalance
          baseInstallment = amortization.plus(interest)
        }
      } else {
        amortization = sacAmortization
        if (amortization.greaterThan(currentBankBalance)) amortization = currentBankBalance
        baseInstallment = amortization.plus(interest)
      }

      // Balões (Agora só conta se NÃO caiu na fase de obra)
      let currentBalloon = new Decimal(0)
      let isAutoBalloon = false

      if (hasBalloon) {
        if (data.balloonFrequency === 'UNICA') {
          if (globalMonth === startMonth) isAutoBalloon = true
        } else {
          // Verifica se ainda tem balões disponíveis e se é o mês
          if (globalMonth % balloonInterval === 0 && bankBalloonsPaidCount < (Number(data.balloonCount) || 0)) {
            isAutoBalloon = true
            bankBalloonsPaidCount++
          }
        }
      }

      if (isAutoBalloon) {
        currentBalloon = balloonVal
      }

      // Construtora Pós-Obra (Se configurou parcelas manuais além da obra)
      let monthlyBuilderPmt = new Decimal(0)
      if (globalMonth <= builderInstallmentsCount) {
        const correctionFactor = new Decimal(1).plus(monthlyINCC).pow(globalMonth)
        monthlyBuilderPmt = monthlyBuilderPmt.plus(builderBaseInstallment.times(correctionFactor))
      }
      const balloonBuilderNow = (data.builderBalloons || []).find((b) => b.month === globalMonth)
      if (balloonBuilderNow) {
        const correctionFactor = new Decimal(1).plus(monthlyINCC).pow(globalMonth)
        monthlyBuilderPmt = monthlyBuilderPmt.plus(new Decimal(balloonBuilderNow.value).times(correctionFactor))
      }

      const finalBankInstallment = baseInstallment.plus(totalBankFees).plus(currentBalloon)
      const totalMonth = finalBankInstallment.plus(monthlyBuilderPmt)

      currentBankBalance = currentBankBalance.minus(amortization).minus(currentBalloon)
      if (currentBankBalance.lessThan(0)) currentBankBalance = new Decimal(0)

      accumulatedTotal = accumulatedTotal.plus(totalMonth)

      timeline.push({
        month: globalMonth,
        bankBalance: currentBankBalance.toNumber(),
        bankInterest: interest.toNumber(),
        bankAmortization: amortization.toNumber(),
        bankFees: totalBankFees.toNumber(),
        builderInstallment: monthlyBuilderPmt.toNumber(),
        builderBalance: 0,
        totalInstallment: totalMonth.toNumber(),
        accumulatedPaid: accumulatedTotal.toNumber(),
        phase: 'AMORTIZACAO'
      })

      if (currentBankBalance.toNumber() <= 0.01 && monthlyBuilderPmt.toNumber() <= 0.01) break
    }

    return timeline
  }
}