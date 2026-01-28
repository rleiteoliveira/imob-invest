import { useState } from 'react'
import type { ReactElement } from 'react'
import {
  LayoutDashboard,
  Menu,
  X,
  Plus,
  Check,
  Hotel,
  Settings,
  Settings2
} from 'lucide-react'
import DetailedReportView from '../../reports/components/DetailedReportView'
import EditorWizard from './Wizard/EditorWizard'
import RentabilityView from '../../rentability/components/RentabilityView'
import BrandSettingsModal from '../../settings/components/BrandSettingsModal'
import GlobalSettingsModal from '../../settings/components/GlobalSettingsModal'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import { useSimulation } from '../hooks/useSimulation'
import Button from '../../../components/ui/Button'

export default function SimulatorLayout(): ReactElement {
  const {
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
  } = useSimulation()

  const [viewMode, setViewMode] = useState<'EDITOR' | 'GLOBAL_SETTINGS'>('EDITOR')
  const [editorTab, setEditorTab] = useState<'FINANCING' | 'RENTAL'>('FINANCING')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showBrandSettings, setShowBrandSettings] = useState(false)
  const [reportScenario, setReportScenario] = useState<SimulationScenario | null>(null)

  return (
    <div className="flex h-[100dvh] bg-gray-50/50 font-sans text-gray-800 overflow-hidden relative selection:bg-blue-100 flex-col md:flex-row">
      {showSuccess && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center border border-gray-100 scale-110">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Check size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Simulação Salva!</h2>
          </div>
        </div>
      )}

      {reportScenario && (
        <DetailedReportView scenario={reportScenario} onClose={() => setReportScenario(null)} />
      )}

      <BrandSettingsModal isOpen={showBrandSettings} onClose={() => setShowBrandSettings(false)} />

      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-40 shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white shadow-sm">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">Imob-Invest</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-[45] md:hidden transition-opacity animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 h-[100dvh] md:h-full w-[280px] md:w-80 bg-white border-r border-gray-200 flex flex-col z-50 transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl md:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center text-white shadow-sm">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Imob-Invest</h1>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                Planejamento Financeiro
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-white">

          <div className="flex flex-col gap-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2 mb-2">
              Modo de Edição
            </h3>
            <div
              className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all font-medium text-sm group ${viewMode === 'EDITOR' && editorTab === 'FINANCING' ? 'bg-gray-100 text-gray-900' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              <button
                onClick={() => {
                  setViewMode('EDITOR')
                  setEditorTab('FINANCING')
                }}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <LayoutDashboard size={18} /> Editor Financeiro
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  createNew()
                }}
                className="p-1 rounded-md text-gray-400 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100"
                title="Nova Simulação (Limpar Editor)"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => {
                setViewMode('EDITOR')
                setEditorTab('RENTAL')
              }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all font-medium text-sm ${viewMode === 'EDITOR' && editorTab === 'RENTAL' ? 'bg-rose-50 text-rose-700' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              <Hotel size={18} /> Análise Lucro
            </button>
          </div>

          <div className="mt-2 space-y-1">
            <Button
              onClick={() => {
                setViewMode('GLOBAL_SETTINGS')
                setIsMobileMenuOpen(false)
              }}
              variant="ghost"
              fullWidth
              className={`justify-start gap-3 text-gray-600 ${viewMode === 'GLOBAL_SETTINGS' ? 'bg-gray-100 text-gray-900 font-bold' : ''}`}
            >
              <Settings2 size={18} /> Parâmetros Globais
            </Button>
            <Button
              onClick={() => setShowBrandSettings(true)}
              variant="ghost"
              fullWidth
              className="justify-start gap-3 text-gray-600"
            >
              <Settings size={18} /> Config. Marca
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative w-full bg-gray-50/50">
        {viewMode === 'GLOBAL_SETTINGS' ? (
          <div className="h-full overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <GlobalSettingsModal
              isOpen={true}
              onClose={() => setViewMode('EDITOR')}
              variant="page"
            />
          </div>
        ) : editorTab === 'RENTAL' ? (
          <RentabilityView
            scenario={data}
            onChange={setData}
            financingMonthlyCost={getCardMetrics(data).parcelaFinanciamento}
          />
        ) : (
          <div className="flex h-full gap-6 p-4 md:p-6 max-w-[1600px] mx-auto">
            {/* Main Wizard Area */}
            <div className={`flex-1 flex flex-col h-full transition-all duration-500 ${viewMode === 'EDITOR' && editorTab === 'FINANCING' ? 'w-full lg:w-3/4' : 'w-full'}`}>
              <EditorWizard
                step={step}
                setStep={setStep}
                data={data}
                setData={setData}
                currentName={currentName}
                setCurrentName={setCurrentName}
                onSave={handleSave}
                onGenerateReport={(scenarioData: SimulationScenario) => setReportScenario(scenarioData)}
              />
            </div>

            {/* Quick Summary Sidebar (Desktop Only) */}
            {viewMode === 'EDITOR' && editorTab === 'FINANCING' && (
              <div className="hidden lg:flex w-80 shrink-0 flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl flex flex-col gap-6 sticky top-6">
                  <div className="flex items-center gap-2 border-b border-gray-100/50 pb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm">
                      <LayoutDashboard size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">Resumo Rápido</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Tempo Real</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Valor do Imóvel</p>
                      <p className="text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(data.propertyValue) || 0)}
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                      <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Entrada Total</p>
                      <p className="text-lg font-bold text-emerald-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(data.downPayment) || 0)}
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Parcela Inicial (Est.)</p>
                      <p className="text-lg font-bold text-blue-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getCardMetrics(data).parcelaFinanciamento)}
                      </p>
                      <p className="text-[10px] text-blue-400 mt-1">
                        {data.amortizationSystem} - {data.termMonths}x
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
