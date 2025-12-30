import type { ReactElement, Dispatch, SetStateAction } from 'react'
import { Save, ArrowLeft, ArrowRight, Printer, Check } from 'lucide-react'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import UnifiedEditor from '../UnifiedEditor'
import Button from '../../ui/Button'

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
    <div className="h-full flex items-center justify-center p-0 md:p-4 bg-gray-50/50">
      <div className="w-full max-w-4xl bg-white md:rounded-3xl shadow-none md:shadow-xl border-x-0 md:border border-gray-200 overflow-hidden flex flex-col h-full md:h-[85vh] md:max-h-[800px] md:min-h-[500px]">
        <div className="bg-white px-6 md:px-8 py-6 border-b border-gray-100 relative shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                {data.id ? 'Editando' : 'Novo Cenário'}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                {step === 0 && 'Configuração Completa do Negócio'}
                {step === 1 && 'Finalização'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-gray-900 w-8' : 'bg-gray-200 w-2'}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 px-4 md:px-8 py-6">
          {step === 0 && <UnifiedEditor data={data} setData={setData} />}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                <Save size={40} />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Finalizar Simulação</h2>
                <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm">
                  Identifique esta proposta para consultar ou comparar depois.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block ml-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-gray-900 shadow-sm transition-all"
                    value={data.clientName || ''}
                    onChange={(e) => setData({ ...data, clientName: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block ml-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      placeholder="(00) 00000-0000"
                      className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-gray-900 shadow-sm transition-all"
                      value={data.clientPhone || ''}
                      onChange={(e) => setData({ ...data, clientPhone: e.target.value })}
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block ml-1">
                      Unidade
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 302-A"
                      className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-gray-900 shadow-sm transition-all"
                      value={data.unitName || ''}
                      onChange={(e) => setData({ ...data, unitName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block ml-1">
                    Nome da Simulação (Salvar como)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Proposta Inicial"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-lg text-center text-gray-900 shadow-sm transition-all"
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
          {step > 0 ? (
            <Button
              onClick={() => setStep((s: number) => s - 1)}
              variant="ghost"
              className="gap-2"
            >
              <ArrowLeft size={18} /> Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < 1 ? (
            <Button
              onClick={() => setStep((s: number) => s + 1)}
              size="lg"
              className="px-8 shadow-lg shadow-gray-200"
            >
              Salvar e Continuar <ArrowRight size={18} className="ml-2" />
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => onGenerateReport({ ...data, name: currentName })}
                disabled={!currentName}
                variant="secondary"
                size="lg"
                className="gap-2 hidden md:inline-flex"
              >
                <Printer size={18} />
                Pré-visualizar
              </Button>

              <Button
                onClick={onSave}
                disabled={!currentName}
                size="lg"
                className={`gap-2 px-8 shadow-lg ${!currentName ? '' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 focus:ring-emerald-600'}`}
              >
                <Check size={18} /> {data.id ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditorWizard
