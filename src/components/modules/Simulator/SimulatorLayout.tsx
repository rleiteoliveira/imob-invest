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
  Hotel
} from 'lucide-react'
import DetailedReportView from '../Reports/DetailedReportView'
import ComparisonView from '../Comparison/ComparisonView'
import EditorWizard from '../Wizard/EditorWizard'
import RentabilityView from '../Rentability/RentabilityView'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import { CaixaMCMV } from '../../../core/engines/CaixaMCMV'

interface CardMetrics {
  parcelaEntrada: number
  parcelaObraBanco: number
  parcelaFinanciamento: number
  valorizacao: number
  totalJurosObra: number
}

export default function SimulatorLayout(): ReactElement {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'EDITOR' | 'COMPARE'>('EDITOR')
  const [editorTab, setEditorTab] = useState<'FINANCING' | 'AIRBNB'>('FINANCING')
  const [showSuccess, setShowSuccess] = useState(false)
  const [step, setStep] = useState(0)
  const [currentName, setCurrentName] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [reportScenario, setReportScenario] = useState<SimulationScenario | null>(null)

  const defaultData: SimulationScenario = {
    propertyValue: 350000,
    downPayment: 70000,
    entrySignal: 15000,
    entryInstallments: 36,
    builderBalloons: [],
    type: 'PLANTA',
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
    const newId = data.id || Date.now().toString()
    const newScenario = { ...data, id: newId, name: currentName }
    setScenarios((prev) => {
      const exists = prev.find((s: SimulationScenario) => s.id === newId)
      if (exists) return prev.map((s: SimulationScenario) => (s.id === newId ? newScenario : s))
      return [...prev, newScenario]
    })
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
    if (cenario.type === 'PLANTA') {
      valorizacao = originalVal * 0.3
    }

    return { parcelaEntrada, parcelaObraBanco, parcelaFinanciamento, valorizacao, totalJurosObra }
  }

  return (
    <div className="flex h-[100dvh] bg-white font-sans text-gray-800 overflow-hidden relative selection:bg-blue-100 flex-col md:flex-row">
      {showSuccess && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-emerald-100 scale-110">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Check size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Simulação Salva!</h2>
            <p className="text-gray-500 text-sm mt-1">Sincronizado com sucesso.</p>
          </div>
        </div>
      )}

      {reportScenario && (
        <DetailedReportView scenario={reportScenario} onClose={() => setReportScenario(null)} />
      )}

      <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center z-40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">Simulador Pro</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[45] md:hidden transition-opacity animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 h-[100dvh] md:h-full w-[280px] md:w-80 bg-white border-r border-gray-100 flex flex-col z-50 transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl md:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="p-6 border-b border-gray-50 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Financiamento Pro</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest opacity-70">
                Simulador Imobiliário
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
          <button
            onClick={createNew}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-bold text-sm bg-white active:scale-[0.98]"
          >
            <Plus size={18} /> Nova Simulação
          </button>

          {viewMode === 'EDITOR' && (
            <div className="flex flex-col gap-1 mt-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">
                Modo de Edição
              </h3>
              <button
                onClick={() => setEditorTab('FINANCING')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${editorTab === 'FINANCING' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                <LayoutDashboard size={18} /> Editor Financeiro
              </button>
              <button
                onClick={() => setEditorTab('AIRBNB')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${editorTab === 'AIRBNB' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                <Hotel size={18} /> Análise Airbnb
              </button>
            </div>
          )}

          <div className="space-y-2.5">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-3">
              Minhas Simulações
            </h3>
            {scenarios.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-gray-100 rounded-2xl">
                <p className="text-xs text-gray-400">Nenhum cenário salvo ainda.</p>
              </div>
            ) : (
              scenarios.map((cenario: SimulationScenario) => (
                <div
                  key={cenario.id}
                  className={`group relative border rounded-2xl p-4 transition-all cursor-pointer ${data.id === cenario.id ? 'bg-blue-50/50 border-blue-500/50 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'}`}
                  onClick={() => loadScenario(cenario)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cenario.id!)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(cenario.id!)
                              ? prev.filter((x) => x !== cenario.id!)
                              : [...prev, cenario.id!]
                          )
                        }
                        className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-gray-900 truncate leading-tight">
                          {cenario.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setScenarios((s) => s.filter((x) => x.id !== cenario.id))
                          }}
                          className="text-gray-300 hover:text-red-500 p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${cenario.type === 'PLANTA' ? 'bg-orange-500' : 'bg-blue-500'}`}
                          ></span>
                          <span className="uppercase font-bold text-[9px] text-gray-500 tracking-wide">
                            {cenario.type}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-gray-700">
                          {formatMoney(cenario.propertyValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-50 bg-white">
          <button
            onClick={() => {
              setViewMode('COMPARE')
              setIsMobileMenuOpen(false)
            }}
            disabled={selectedIds.length < 1}
            className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-bold text-white transition-all transform active:scale-95 shadow-lg ${selectedIds.length < 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
          >
            <BarChart3 size={18} /> Comparar ({selectedIds.length})
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative w-full bg-gray-50/30">
        {viewMode === 'COMPARE' ? (
          <ComparisonView
            scenarios={scenarios}
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
