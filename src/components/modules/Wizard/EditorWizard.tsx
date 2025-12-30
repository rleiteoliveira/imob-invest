import type { ReactElement, Dispatch, SetStateAction } from 'react'
import { ArrowLeft, ArrowRight, Printer, Save } from 'lucide-react'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import Button from '../../ui/Button'
import Step1Selection from './steps/Step1Selection'
import Step2Values from './steps/Step2Values'
import Step3Payment from './steps/Step3Payment'

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
    { title: 'Estruturação do Pagamento', subtitle: 'Ajuste parcelas e taxas' }
  ]

  const currentStep = steps[step] || steps[0]

  return (
    <div className="h-full flex items-center justify-center p-0 md:p-4 bg-gray-50/50">
      <div className="w-full max-w-5xl bg-white md:rounded-3xl shadow-none md:shadow-xl border-x-0 md:border border-gray-200 overflow-hidden flex flex-col h-full md:h-[90vh] md:max-h-[850px] md:min-h-[600px]">

        {/* HEADER */}
        <div className="bg-white px-6 md:px-8 py-6 border-b border-gray-100 relative shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                {data.id ? 'Editando Cenário' : 'Novo Cenário'}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                Passo {step + 1} de 3: {currentStep.title}
              </p>
            </div>
            {/* Progress Indicators */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ${step >= i ? 'bg-gray-900 w-10' : 'bg-gray-200 w-3'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 px-4 md:px-8 py-6 relative">
          {step === 0 && <Step1Selection data={data} setData={setData} />}
          {step === 1 && <Step2Values data={data} setData={setData} />}
          {step === 2 && <Step3Payment data={data} setData={setData} />}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex justify-between items-center shrink-0 z-20">

          <div className="flex gap-2">
            {step > 0 && (
              <Button
                onClick={() => setStep((s) => s - 1)}
                variant="ghost"
                className="gap-2 text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft size={18} /> Voltar
              </Button>
            )}
          </div>

          <div className="flex gap-3 items-center">
            {step < 2 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                size="lg"
                className="pl-8 pr-6 shadow-lg shadow-gray-200 gap-2"
              >
                Próximo <ArrowRight size={18} />
              </Button>
            ) : (
              <div className="flex gap-3 items-center">
                {/* Name Input for Saving */}
                <div className="mr-2 hidden md:block">
                  <input
                    type="text"
                    placeholder="Nome do Cenário..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                  />
                </div>

                <Button
                  onClick={() => onGenerateReport({ ...data, name: currentName || 'Sem Nome' })}
                  variant="secondary"
                  size="lg"
                  className="gap-2 hidden md:inline-flex"
                >
                  <Printer size={18} />
                  Relatório
                </Button>

                <Button
                  onClick={onSave}
                  disabled={!currentName}
                  size="lg"
                  className={`gap-2 px-6 shadow-lg ${!currentName ? 'opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 focus:ring-emerald-600'}`}
                >
                  <Save size={18} /> {data.id ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorWizard
