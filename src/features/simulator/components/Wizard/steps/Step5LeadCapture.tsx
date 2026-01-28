import type { ReactElement } from 'react'
import type { SimulationScenario, ClientLead } from '../../../../../types/ScenarioTypes'
import { User, Phone, Mail, Building, FileText } from 'lucide-react'
import { useThemeStyles } from '../../../../../hooks/useThemeStyles'

// Helper for Input wrapper
interface InputWrapperProps {
  children: React.ReactNode
  icon?: React.ElementType
  colors?: any
}

const InputWrapper = ({ children, icon: Icon, colors }: InputWrapperProps) => (
  <div className="relative">
    {Icon && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors?.textMuted || '#9ca3af' }}>
        <Icon size={18} />
      </div>
    )}
    {children}
  </div>
)

// Label Component adaptable to Theme
const Label = ({ children, required, colors }: { children: React.ReactNode, required?: boolean, colors: any }) => (
  <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
    {children} {required && <span style={{ color: colors.danger }}>*</span>}
  </label>
)

interface Step4Props {
  data: SimulationScenario
  setData: (d: SimulationScenario) => void
}

export default function Step4LeadCapture({ data, setData }: Step4Props): ReactElement {
  const { colors, components } = useThemeStyles()


  const updateLead = (field: keyof ClientLead, value: string) => {
    // Ensure clientLead exists in case of legacy data
    const currentLead = data.clientLead || {
      name: '',
      createdAt: new Date()
    }

    setData({
      ...data,
      clientLead: {
        ...currentLead,
        [field]: value
      }
    })
  }

  // Safety check for rendering
  const leadData = data.clientLead || { name: '' }

  const inputClass = `${components.input.field} pl-10` // Added padding for icons

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-right-4 pb-20">

      {/* Header Section Compacted */}
      <div className="text-center space-y-1 mb-6 mt-2">
        <h2 className="text-xl font-bold" style={{ color: colors.text }}>Personalizar Proposta</h2>
        <p className="max-w-lg mx-auto text-xs" style={{ color: colors.textMuted }}>
          Preencha os dados do cliente para gerar um relatório profissional e exclusivo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">

        {/* Nome */}
        <div className="col-span-1">
          <Label required colors={colors}>Nome do Cliente</Label>
          <InputWrapper icon={User} colors={colors}>
            <input
              type="text"
              placeholder="Ex: João da Silva"
              value={leadData.name}
              onChange={(e) => updateLead('name', e.target.value)}
              className={inputClass}
              autoFocus
            />
          </InputWrapper>
          {!leadData.name && (
            <p className="text-[10px] mt-1 ml-1 flex items-center gap-1" style={{ color: colors.textMuted }}>
              <span>⚠</span> Obrigatório para o PDF.
            </p>
          )}
        </div>

        {/* Telefone */}
        <div className="col-span-1">
          <Label colors={colors}>Telefone / WhatsApp</Label>
          <InputWrapper icon={Phone} colors={colors}>
            <input
              type="tel"
              placeholder="(00) 00000-0000"
              value={leadData.phone || ''}
              onChange={(e) => updateLead('phone', e.target.value)}
              className={inputClass}
            />
          </InputWrapper>
        </div>

        {/* Email */}
        <div className="col-span-1">
          <Label colors={colors}>Email</Label>
          <InputWrapper icon={Mail} colors={colors}>
            <input
              type="email"
              placeholder="cliente@email.com"
              value={leadData.email || ''}
              onChange={(e) => updateLead('email', e.target.value)}
              className={inputClass}
            />
          </InputWrapper>
        </div>

        {/* Unidade */}
        <div className="col-span-1">
          <Label colors={colors}>Unidade de Interesse</Label>
          <InputWrapper icon={Building} colors={colors}>
            <input
              type="text"
              placeholder="Ex: Apto 402 - Torre B"
              value={leadData.unitOfInterest || ''}
              onChange={(e) => updateLead('unitOfInterest', e.target.value)}
              className={inputClass}
            />
          </InputWrapper>
        </div>

        {/* Notas */}
        <div className="col-span-1 md:col-span-2">
          <Label colors={colors}>Observações Internas (Opcional)</Label>
          <div className="relative">
            <div className="absolute left-3 top-3 pointer-events-none" style={{ color: colors.textMuted }}>
              <FileText size={18} />
            </div>
            <textarea
              placeholder="Ex: Cliente busca financiamento com entrada parcelada..."
              value={leadData.notes || ''}
              onChange={(e) => updateLead('notes', e.target.value)}
              rows={3}
              className={`${inputClass} min-h-[80px]`}
            />
          </div>
        </div>

      </div>

      <div className={`max-w-4xl mx-auto mt-4 p-3 flex items-center gap-3 transition-all rounded-lg border ${components.card.wrapper}`} style={{ borderColor: 'rgba(52, 211, 153, 0.3)' }}>
        <div className={`p-1.5 rounded-full shrink-0`} style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#10b981' }}>
          <FileText size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold" style={{ color: colors.text }}>Pronto para gerar!</h4>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            Clique em "Gerar Proposta" para criar o PDF completo.
          </p>
        </div>
      </div>

    </div>
  )
}
