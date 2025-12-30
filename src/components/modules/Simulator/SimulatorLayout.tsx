import { useState } from 'react'
import type { ReactElement } from 'react'
import {
  LayoutDashboard,
  Menu,
  X,
  Plus,
  Trash2,
  BarChart3,
  Check,
  Hotel,
  Settings
} from 'lucide-react'
import DetailedReportView from '../Reports/DetailedReportView'
import ComparisonView from '../Comparison/ComparisonView'
import EditorWizard from '../Wizard/EditorWizard'
import RentabilityView from '../Rentability/RentabilityView'
import BrandSettingsModal from '../Brand/BrandSettingsModal'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import { CaixaMCMV } from '../../../core/engines/CaixaMCMV'
import { useSimulationHistory } from '../../../hooks/useSimulationHistory'
import Button from '../../ui/Button'

interface CardMetrics {
  parcelaEntrada: number
  parcelaObraBanco: number
  parcelaFinanciamento: number
  valorizacao: number
  totalJurosObra: number
}

export default function SimulatorLayout(): ReactElement {
  const { recentSimulations, saveSimulation, deleteSimulation } = useSimulationHistory()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'EDITOR' | 'COMPARE'>('EDITOR')
  const [editorTab, setEditorTab] = useState<'FINANCING' | 'AIRBNB'>('FINANCING')
  const [showSuccess, setShowSuccess] = useState(false)
  const [step, setStep] = useState(0)
  const [currentName, setCurrentName] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showBrandSettings, setShowBrandSettings] = useState(false)

  const [reportScenario, setReportScenario] = useState<SimulationScenario | null>(null)

  const defaultData: SimulationScenario = {
    propertyValue: 350000,
    downPayment: 70000,
    entrySignal: 15000,
    entryInstallments: 36,
    builderBalloons: [],
    type: 'MCMV',
    amortizationSystem: 'PRICE',
    interestRate: 8.66,
    termMonths: 420,
    monthlyAdminFee: 25.0,
    insuranceMIP: 30.24,
    insuranceDFI: 24.85,
    hasBalloonPayments: false,
    balloonFrequency: 'UNICA',
    balloonCount: 1,
    balloonValue: 10000,
    balloonStartMonth: 0,
    constructionTime: 36,
    inccRate: 0.45,
    useWorkEvolution: true,
    currentWorkPercent: 30,
    monthsToReady: 24,
    appreciationRate: 10
  }

  const [data, setData] = useState<SimulationScenario>(defaultData)

  const createNew = (): void => {
    setStep(0)
    setCurrentName('')
    setViewMode('EDITOR')
    setEditorTab('FINANCING')
    setData({ ...defaultData })
    setIsMobileMenuOpen(false)
  }
  const handleSave = (): void => {
    if (!currentName) return
    const newId = data.id || crypto.randomUUID()
    const newScenario = { ...data, id: newId, name: currentName }

    saveSimulation(newScenario)

    if (!selectedIds.includes(newId)) setSelectedIds((prev) => [...prev, newId])
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      createNew()
    }, 1500)
  }
  const loadScenario = (cenario: SimulationScenario): void => {
    setData(cenario)
    setCurrentName(cenario.name || '')
    setStep(0)
    setViewMode('EDITOR')
    setEditorTab('FINANCING')
    setIsMobileMenuOpen(false)
  }
  const formatMoney = (val: number | ''): string => {
    if (val === '') return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
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
          <span className="font-bold text-gray-900 tracking-tight">Simulador Pro</span>
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
              <h1 className="text-base font-bold text-gray-900 leading-tight">Financiamento Pro</h1>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                Simulador 2.0
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-white">
          <Button
            onClick={createNew}
            variant="secondary"
            fullWidth
            className="border-dashed h-12 text-gray-500 hover:text-gray-900 hover:border-gray-400"
          >
            <Plus size={16} className="mr-2" /> Nova Simulação
          </Button>

          {viewMode === 'EDITOR' && (
            <div className="flex flex-col gap-1">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2 mb-2">
                Modo de Edição
              </h3>
              <button
                onClick={() => setEditorTab('FINANCING')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all font-medium text-sm ${editorTab === 'FINANCING' ? 'bg-gray-100 text-gray-900' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
              >
                <LayoutDashboard size={18} /> Editor Financeiro
              </button>
              <button
                onClick={() => setEditorTab('AIRBNB')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all font-medium text-sm ${editorTab === 'AIRBNB' ? 'bg-rose-50 text-rose-700' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
              >
                <Hotel size={18} /> Análise Airbnb
              </button>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2 mb-2">
              Histórico
            </h3>
            {recentSimulations.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-gray-100 rounded-lg">
                <p className="text-xs text-gray-400">Nenhum cenário salvo.</p>
              </div>
            ) : (
              recentSimulations.map((item) => (
                <div
                  key={item.id}
                  className={`group relative border rounded-lg p-3 transition-all cursor-pointer ${data.id === item.scenario.id ? 'bg-gray-50 border-gray-300 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                  onClick={() => loadScenario(item.scenario)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.scenario.id!)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(item.scenario.id!)
                              ? prev.filter((x) => x !== item.scenario.id!)
                              : [...prev, item.scenario.id!]
                          )
                        }
                        className="w-4 h-4 rounded text-gray-900 focus:ring-gray-900 border-gray-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm text-gray-900 truncate leading-tight">
                          {item.scenario.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSimulation(item.id)
                          }}
                          className="text-gray-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${['MCMV', 'DIRETO'].includes(item.scenario.type) ? 'bg-orange-500' : 'bg-blue-500'}`}
                          ></span>
                          <span className="uppercase font-bold text-[9px] text-gray-500 tracking-wide">
                            {item.scenario.type}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-xs text-gray-700">
                            {formatMoney(item.scenario.propertyValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-2">
            <Button
              onClick={() => setShowBrandSettings(true)}
              variant="ghost"
              fullWidth
              className="justify-start gap-3"
            >
              <Settings size={18} /> Configurações
            </Button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <Button
            onClick={() => {
              setViewMode('COMPARE')
              setIsMobileMenuOpen(false)
            }}
            disabled={selectedIds.length < 1}
            fullWidth
            className="h-12 shadow-md gap-2"
          >
            <BarChart3 size={18} /> Comparar ({selectedIds.length})
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative w-full bg-gray-50/50">
        {viewMode === 'COMPARE' ? (
          <ComparisonView
            scenarios={recentSimulations.map(item => item.scenario)}
            selectedIds={selectedIds}
            onBack={() => setViewMode('EDITOR')}
            getCardMetrics={getCardMetrics}
            onGenerateReport={(s: SimulationScenario) => setReportScenario(s)}
          />
        ) : editorTab === 'AIRBNB' ? (
          <RentabilityView
            scenario={data}
            onChange={setData}
            financingMonthlyCost={getCardMetrics(data).parcelaFinanciamento}
          />
        ) : (
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
        )}
      </main>
    </div>
  )
}
