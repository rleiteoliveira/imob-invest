import type { ReactElement, Dispatch, SetStateAction } from 'react'
import { ArrowLeft, ArrowRight, Printer, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SimulationScenario } from '../../../../types/ScenarioTypes'
import Button from '../../../../components/ui/Button'
import Step1Selection from './steps/Step1Selection'
import Step2Values from './steps/Step2Values'
import Step3Payment from './steps/Step3Payment'
import Step4Financing from './steps/Step4Financing'
import Step5LeadCapture from './steps/Step5LeadCapture'
import { useThemeStyles } from '../../../../hooks/useThemeStyles'

const EditorWizard = ({
  step,
  setStep,
  data,
  setData,
  currentName,
  setCurrentName,
  onSave,
  onGenerateReport
}: {
  step: number
  setStep: Dispatch<SetStateAction<number>>
  data: SimulationScenario
  setData: (d: SimulationScenario) => void
  currentName: string
  setCurrentName: (n: string) => void
  onSave: () => void
  onGenerateReport: (s: SimulationScenario) => void
}): ReactElement => {

  const steps = [
    { title: 'Seleção de Cenário', subtitle: 'Escolha o modelo de negócio' },
    { title: 'Valores e Simulação', subtitle: 'Defina o valor do imóvel e entrada' },
    { title: 'Estruturação do Pagamento', subtitle: 'Configurar fluxo e FGTS' },
    { title: 'Detalhamento Financeiro', subtitle: 'Ajuste parcelas e taxas' },
    { title: 'Dados do Cliente', subtitle: 'Personalize a proposta final' }
  ]

  const { colors, components } = useThemeStyles()

  const currentStep = steps[step] || steps[0]

  return (
    <div className="min-h-screen flex items-start justify-center p-4 md:py-12" style={{ backgroundColor: colors.background }}>
      <div className={`w-full max-w-5xl flex flex-col h-auto min-h-[600px] transition-all duration-300 ${components.card.wrapper}`}>

        {/* HEADER */}
        <div className="px-6 md:px-8 py-6 border-b relative" style={{ borderColor: colors.border }}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
                {data.id ? 'Editando Cenário' : 'Novo Cenário'}
              </h1>
              <p className="text-xs md:text-sm font-medium" style={{ color: colors.textMuted }}>
                Passo {step + 1} de {steps.length}: {currentStep.title}
              </p>
            </div>
            {/* Progress Indicators */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500`}
                  style={{
                    backgroundColor: step >= i ? colors.primary : colors.border,
                    width: step >= i ? '2.5rem' : '0.75rem'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-4 md:px-8 py-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && <Step1Selection data={data} setData={setData} />}
              {step === 1 && <Step2Values data={data} setData={setData} />}
              {step === 2 && <Step3Payment data={data} setData={setData} />}
              {step === 3 && <Step4Financing data={data} setData={setData} />}
              {step === 4 && <Step5LeadCapture data={data} setData={setData} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 md:p-6 border-t flex justify-between items-center shrink-0 z-20" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>

          <div className="flex gap-2">
            {step > 0 && (
              <Button
                onClick={() => setStep((s) => s - 1)}
                variant="ghost"
                className="gap-2"
                style={{ color: colors.textMuted }}
              >
                <ArrowLeft size={18} /> Voltar
              </Button>
            )}
          </div>

          <div className="flex gap-3 items-center">
            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                size="lg"
                className={`pl-8 pr-6 gap-2 ${components.button.primary}`}
              >
                Próximo <ArrowRight size={18} />
              </Button>
            ) : (
              <div className="flex gap-3 items-center">
                {/* Name Input for Saving */}
                <div className="mr-2 hidden md:block">
                  <input
                    placeholder="Nome do Cenário..."
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      color: colors.text
                    }}
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                  />
                </div>

                {/* Save (Secondary) */}
                <Button
                  onClick={onSave}
                  disabled={!currentName}
                  size="lg"
                  className={`gap-2 px-6 ${components.button.secondary}`}
                >
                  <Save size={18} /> {data.id ? 'Atualizar' : 'Salvar'}
                </Button>

                {/* Report (Primary) */}
                <Button
                  onClick={() => onGenerateReport({ ...data, name: currentName || 'Sem Nome' })}
                  size="lg"
                  className={`gap-2 px-8 ${components.button.primary}`}
                >
                  <Printer size={18} />
                  Gerar Proposta Personalizada
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  )
}


export default EditorWizard
