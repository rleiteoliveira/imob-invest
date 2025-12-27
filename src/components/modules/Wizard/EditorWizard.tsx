import { ReactElement, Dispatch, SetStateAction } from 'react'
import { Save, ArrowLeft, ArrowRight, Printer, Check } from 'lucide-react'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import UnifiedEditor from '../UnifiedEditor'

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
  return (
    <div className="h-full flex items-center justify-center p-0 md:p-4 bg-gray-50">
      <div className="w-full max-w-4xl bg-white md:rounded-3xl shadow-none md:shadow-xl border-x-0 md:border border-gray-100 overflow-hidden flex flex-col h-[100dvh] md:h-[85vh] md:max-h-[800px] md:min-h-[500px]">
        <div className="bg-white px-6 md:px-8 py-6 border-b border-gray-100 relative shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                {data.id ? 'Editando' : 'Novo Cenário'}
              </h1>
              <p className="text-xs md:text-sm text-gray-400">
                {step === 0 && 'Configuração Completa do Negócio'}
                {step === 1 && 'Finalização'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600 w-6' : 'bg-gray-200 w-2'}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 px-4 md:px-8 py-6">
          {step === 0 && <UnifiedEditor data={data} setData={setData} />}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-100">
                <Save size={36} />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Finalizar Simulação</h2>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">
                  Identifique esta proposta para consultar ou comparar depois.
                </p>
              </div>
              <div className="w-full max-w-sm">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
                  Nome do Cliente / Unidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva - Apto 302"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-center shadow-sm"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
          {step > 0 ? (
            <button
              onClick={() => setStep((s: number) => s - 1)}
              className="text-gray-500 font-bold flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 1 ? (
            <button
              onClick={() => setStep((s: number) => s + 1)}
              className="bg-gray-900 hover:bg-black text-white flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold shadow-lg shadow-gray-300 transition-all active:scale-95 text-sm md:text-base"
            >
              Salvar e Continuar <ArrowRight size={18} />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => onGenerateReport({ ...data, name: currentName })}
                disabled={!currentName}
                className={`flex items-center gap-2 px-6 md:px-6 py-3 md:py-3.5 rounded-xl font-bold text-gray-700 border border-gray-300 shadow-sm transition-all text-sm md:text-base ${!currentName ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300'}`}
              >
                <Printer size={18} />{' '}
                <span className="hidden md:inline">Pré-visualizar Relatório</span>
              </button>

              <button
                onClick={onSave}
                disabled={!currentName}
                className={`flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold text-white shadow-lg transition-all text-sm md:text-base ${!currentName ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 active:scale-95'}`}
              >
                <Check size={18} /> {data.id ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditorWizard
