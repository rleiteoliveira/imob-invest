import { useState } from 'react'
import type { ReactElement } from 'react'
import {
  LayoutDashboard,
  Menu,
  X,
  Plus,
  Check,
  Hotel,
  Settings2
} from 'lucide-react'
import DetailedReportView from '../../reports/components/DetailedReportView'
import EditorWizard from './Wizard/EditorWizard'
import RentabilityView from '../../rentability/components/RentabilityView'
import GlobalSettingsModal from '../../settings/components/GlobalSettingsModal'
import type { SimulationScenario } from '../../../types/ScenarioTypes'
import { useSimulation } from '../hooks/useSimulation'
import { useThemeStyles } from '../../../hooks/useThemeStyles'

export default function SimulatorLayout(): ReactElement {

  const { colors } = useThemeStyles()

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
  const [reportScenario, setReportScenario] = useState<SimulationScenario | null>(null)

  return (
    <div className="flex min-h-screen font-sans relative flex-col md:flex-row transition-colors duration-300" style={{ backgroundColor: colors.background, color: colors.text }}>

      {showSuccess && (
        <div
          className="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in"
          style={{ backgroundColor: `${colors.background}B3` }}
        >
          <div
            className="p-8 rounded-2xl shadow-2xl flex flex-col items-center border scale-110"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm"
              style={{ backgroundColor: `${colors.success}1F`, color: colors.success }}
            >
              <Check size={32} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: colors.text }}>Simulação Salva!</h2>
          </div>
        </div>
      )}

      {reportScenario && (
        <DetailedReportView scenario={reportScenario} onClose={() => setReportScenario(null)} />
      )}

      <header
        className="md:hidden border-b p-4 flex justify-between items-center z-40 shrink-0 shadow-sm"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
            style={{ backgroundColor: colors.primary, color: colors.surface }}
          >
            <LayoutDashboard size={18} />
          </div>
          <span className="font-bold tracking-tight" style={{ color: colors.text }}>Imob-Invest</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md theme-hover-surface"
          style={{ color: colors.textMuted }}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 backdrop-blur-md z-[45] md:hidden transition-opacity animate-in fade-in"
          style={{ backgroundColor: 'rgba(9, 9, 11, 0.45)' }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 h-[100dvh] md:h-screen w-[280px] md:w-80 border-r flex flex-col z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: colors.primary, color: colors.surface }}
            >
              <LayoutDashboard size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight" style={{ color: colors.text }}>Imob-Invest</h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                Planejamento
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

          <div className="flex flex-col gap-1">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest ml-2 mb-2" style={{ color: colors.textMuted }}>
              Modo de Edição
            </h3>

            {(() => {
              const isFinancing = viewMode === 'EDITOR' && editorTab === 'FINANCING'
              return (
                <div
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors font-medium text-sm group ${isFinancing ? 'theme-active-surface' : 'theme-hover-surface'}`}
                  style={{ color: isFinancing ? colors.text : colors.textMuted }}
                >
                  <button
                    onClick={() => {
                      setViewMode('EDITOR')
                      setEditorTab('FINANCING')
                    }}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <LayoutDashboard size={18} style={{ color: isFinancing ? colors.primary : 'currentColor' }} /> Editor Financeiro
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      createNew()
                    }}
                    className="p-1 rounded-md transition-all opacity-0 group-hover:opacity-100 theme-hover-surface"
                    style={{ color: colors.textMuted }}
                    title="Nova Simulação (Limpar Editor)"
                    aria-label="Nova Simulação"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )
            })()}

            {(() => {
              const isRental = viewMode === 'EDITOR' && editorTab === 'RENTAL'
              return (
                <button
                  onClick={() => {
                    setViewMode('EDITOR')
                    setEditorTab('RENTAL')
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors font-medium text-sm ${isRental ? 'theme-active-surface' : 'theme-hover-surface'}`}
                  style={{ color: isRental ? colors.text : colors.textMuted }}
                >
                  <Hotel size={18} style={{ color: isRental ? colors.primary : 'currentColor' }} /> Análise Lucro
                </button>
              )
            })()}
          </div>

          {(() => {
            const isSettings = viewMode === 'GLOBAL_SETTINGS'
            return (
              <button
                onClick={() => {
                  setViewMode('GLOBAL_SETTINGS')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors font-medium text-sm ${isSettings ? 'theme-active-surface' : 'theme-hover-surface'}`}
                style={{ color: isSettings ? colors.text : colors.textMuted }}
              >
                <Settings2 size={18} style={{ color: isSettings ? colors.primary : 'currentColor' }} /> Parâmetros Globais
              </button>
            )
          })()}
        </div>
      </aside>

      <main className="flex-1 relative w-full p-0 md:p-6 transition-all duration-500">
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
    </div >
  )
}
