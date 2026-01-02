import Decimal from 'decimal.js'
import type { SimulationScenario, MonthlyResult } from '../../types/ScenarioTypes'
import type { CalculationEngine } from '../interfaces/CalculationEngine'

export class CaixaMCMV implements CalculationEngine {
  calculate(data: SimulationScenario): MonthlyResult[] {
    const propValue = new Decimal(data.propertyValue || 0)
    const downPaymentTotal = new Decimal(data.downPayment || 0)

    const constructionMonths = (data.type === 'MCMV' || data.type === 'DIRETO') ? Number(data.constructionTime) || 0 : 0
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
    const fgts = new Decimal(data.useFGTS ? data.fgtsValue || 0 : 0)

    let totalBuilderManualBalloons = new Decimal(0)
      ; (data.builderBalloons || []).forEach((b) => {
        totalBuilderManualBalloons = totalBuilderManualBalloons.plus(b.value)
      })

    // Dívida com Construtora = EntradaTotal - Sinal - FGTS - FGTS(Mês 0) - Intercaladas Manuais - FGTS(Durante Obra)
    let builderDebtMensal = downPaymentTotal
      .minus(signal)
      .minus(fgts)
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
    const financedAmount = propValue.minus(downPaymentTotal).minus(extraEntryFromBalloonAtZero)

    // ... (Taxas Padrão) ...
    // Se for manual, assume 8% se não houver taxa, pra não quebrar cálculo de juros
    const defaultRate = data.useExternalSimulation ? 8 : 0
    const annualRate = new Decimal(data.interestRate || defaultRate).div(100)
    const monthlyInterestRate = annualRate.div(12)

    // Se for manual, zera taxas pois já estão inclusas na parcela ou ignoradas
    const isManual = !!data.useExternalSimulation
    const monthlyAdminFee = new Decimal(isManual ? 0 : data.monthlyAdminFee || 0)
    const insuranceMIP = new Decimal(isManual ? 0 : data.insuranceMIP || 0)
    const insuranceDFI = new Decimal(isManual ? 0 : data.insuranceDFI || 0)
    const totalBankFees = monthlyAdminFee.plus(insuranceMIP).plus(insuranceDFI)
    const monthlyINCC = new Decimal(data.inccRate || 0).div(100)
    const totalMonths = Number(data.termMonths) || 360

    let currentBankBalance = financedAmount
    if (currentBankBalance.lessThanOrEqualTo(0) && builderDebtMensal.lessThanOrEqualTo(0)) return []

    const timeline: MonthlyResult[] = []
    let accumulatedTotal = signal.plus(extraEntryFromBalloonAtZero).plus(fgts)
    let bankBalloonsPaidCount = 0

    // === FASE 1: OBRA ===
    // === FASE 1: OBRA ===
    const isConstructionScenario = data.type === 'MCMV' || data.type === 'DIRETO'
    if (isConstructionScenario && constructionMonths > 0) {
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

        // --- LÓGICA DIRETO COM INCORPORADORA ---
        if (data.type === 'DIRETO') {
          // Correção do Saldo Devedor pelo INCC
          // Saldo cresce a cada mês pela taxa INCC
          const monthlyINCCDecimal = new Decimal(data.inccRate || 0).div(100)
          currentBankBalance = currentBankBalance.times(new Decimal(1).plus(monthlyINCCDecimal))
        }
        // ----------------------------------------

        // Banco (Evolução / Juros de Obra)
        let bankInterest = new Decimal(0)

        let shouldChargeEvolution = data.useWorkEvolution

        // Lógica de Pré-Obra
        if (data.constructionStatus === 'PRE_OBRA') {
          const gap = Number(data.monthsUntilConstructionStart) || 0

          if (i <= gap) {
            // Fase Pré-Obra: Não cobra juros de obra (Evolução 0%)
            shouldChargeEvolution = false
          } else {
            // Fase Obra Iniciada (após gap)
            if (data.useWorkEvolution) {
              // Recalcula evolução considerando apenas o período efetivo de obra
              // i_obra vai de 1 até constructionDuration
              const i_obra = i - gap
              const duration = Number(data.constructionDuration) || constructionMonths // fallback se não vier preenchido
              const currentProgress = Math.min(i_obra / duration, 1)
              const amountReleased = financedAmount.times(currentProgress)
              bankInterest = amountReleased.times(monthlyInterestRate)
            }
          }
        } else {
          // Lógica Padrão (Obra já iniciada ou não especificado)
          if (shouldChargeEvolution) {
            // Se for DIRETO, a lógica pode ser diferente (juros sobre saldo acumulado total ou liberado?)
            // O pedido diz: "INCC corrige tanto a Entrada quanto o Saldo Devedor... antes de calcular a parcela."
            // Se é financiamento DIRETO, geralmente cobra juros sobre o saldo devedor TOTAL corrigido (Price/SACTable) ou apenas correção?
            // "INCC corrige ... Saldo Devedor ... antes de calcular a parcela."
            // Geralmente, na obra direto com incorporadora, paga-se correção monetária (INCC) sobre o saldo apenas, ou Juros + Correção?
            // Considerando que "bankInterest" aqui é "Juros de Obra" (pago ao banco), no caso DIRETO seria "Juros/Correção pagos à incorporadora".
            // Se o usuário diz "Juros de Obra no banco" para MCMV e "Direto" separado,
            // vamos assumir que no DIRETO a parcela de "Financiamento" durante a obra é composta pelo juro sobre o saldo (se houver juro definido) OU
            // Apenas correção.
            // Mas o código abaixo calcula `bankInterest`.
            // Se DIRETO, o saldo (currentBankBalance) já foi corrigido acima.
            // Se houver interestRate definido, cobramos juros sobre esse saldo corrigido?
            // O padrão geralmente é: Correção Monetária APENAS, e juros só na entrega das chaves.
            // OU Juros + Correção.
            // O usuário não especificou se paga juros mensais NO DIRETO durante a obra, apenas "INCC corrige...".
            // Vou manter o cálculo de Juros (bankInterest) mas usando o saldo corrigido como base se for o caso.
            // Mas cuidado: No MCMV (Caixa), `amountReleased` é gradual (evolução).
            // No DIRETO, a dívida é com a construtora integralmente desde o início? Ou evolução?
            // Geralmente direto é integral.
            // Se for DIRETO, vamos assumir que o saldo TODO sofre incidência de juros se tiver taxa de juros configurada.
            // Se `interestRate` > 0.

            if (data.type === 'DIRETO') {
              // Juros sobre o saldo corrigido integral (sem evolução de obra física afetando liberação financeira, pois a dívida é assumida)
              // Ou mantém evolução? Geralmente "Direto" não tem evolução de repasse (banco), a dívida é total.
              // Vou assumir dívida total para cálculo de juros se houver.
              bankInterest = currentBankBalance.times(monthlyInterestRate)
            } else {
              // MCMV (Caixa) - Mantém Evolução
              const currentProgress = Math.min(startPercent + evolutionStep * i, 1)
              const amountReleased = financedAmount.times(currentProgress)
              bankInterest = amountReleased.times(monthlyInterestRate)
            }
          }
        }

        // Se não houver cobrança de evolução (Juros de Obra), assumimos que também não há cobrança de taxas bancárias (MIP/DFI/Adm)
        // Isso configura um cenário de "Financiamento na Chave" ou "Sem Repasse na Planta"
        let currentMonthBankFees = totalBankFees
        if (!shouldChargeEvolution) {
          currentMonthBankFees = new Decimal(0)
        }

        const totalMonth = monthlyBuilderPmt.plus(bankInterest).plus(currentMonthBankFees)
        accumulatedTotal = accumulatedTotal.plus(totalMonth)

        timeline.push({
          month: i,
          bankBalance: currentBankBalance.toNumber(),
          bankInterest: bankInterest.toNumber(),
          bankAmortization: 0,
          bankFees: currentMonthBankFees.toNumber(),
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

      if (data.useExternalSimulation) {
        const manualVal = new Decimal(data.externalInstallmentValue || 0)
        // Amortização = Valor Manual - Juros
        // Se juro > valor manual, amortização = 0 (não aumenta divida, juro simples acumulado ou pago parcial)
        amortization = manualVal.minus(interest)
        if (amortization.lessThan(0)) amortization = new Decimal(0)

        // Se amortização > saldo, quita
        if (amortization.greaterThan(currentBankBalance)) {
          amortization = currentBankBalance
        }

        // A base da parcela é o valor manual (fixo)
        if (currentBankBalance.lessThanOrEqualTo(0) && amortization.lessThanOrEqualTo(0)) {
          baseInstallment = new Decimal(0)
        } else {
          baseInstallment = manualVal
        }
      } else if (data.amortizationSystem === 'PRICE') {
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

// Export singleton instance or class? User asked for class/logic to implement the interface.
// I will export the class. And maybe a default instance IF needed, but the interface suggests usage by instantiation.
// Or static method like before.
// But the interface has `calculate`. I will make it an instance method.
// To keep backward compatibility if I were just refactoring usage, I'd check how it's used.
// It was `FinancialMath.calculate`.
// In new structure, we can instantiate: `const engine = new CaixaMCMV(); engine.calculate(...)`
