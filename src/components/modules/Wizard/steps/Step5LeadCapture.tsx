import type { ReactElement } from 'react'
import type { SimulationScenario, ClientLead } from '../../../../types/ScenarioTypes'
import { User, Phone, Mail, Building, FileText } from 'lucide-react'

// Helper for labels
const Label = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
)

// Helper for Input wrapper
interface InputWrapperProps {
  children: React.ReactNode
  icon?: React.ElementType
}

const InputWrapper = ({ children, icon: Icon }: InputWrapperProps) => (
  <div className="relative">
    {Icon && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon size={18} />
      </div>
    )}
    {children}
  </div>
)

interface Step4Props {
  data: SimulationScenario
  setData: (d: SimulationScenario) => void
}

export default function Step4LeadCapture({ data, setData }: Step4Props): ReactElement {

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-right-4 pb-20">

      {/* Header Section */}
      <div className="text-center space-y-2 mb-8 mt-4">
        <h2 className="text-2xl font-bold text-gray-900">Personalizar Proposta</h2>
        <p className="text-gray-500 max-w-lg mx-auto text-sm">
          Preencha os dados do cliente para gerar um relatório profissional e exclusivo.
          Essas informações aparecerão no cabeçalho do PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

        {/* Nome (Obrigatório) */}
        <div className="col-span-1 md:col-span-2">
          <Label required>Nome do Cliente</Label>
          <InputWrapper icon={User}>
            <input
              type="text"
              placeholder="Ex: João da Silva"
              value={leadData.name}
              onChange={(e) => updateLead('name', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 shadow-sm text-gray-900"
              autoFocus
            />
          </InputWrapper>
          {!leadData.name && (
            <p className="text-xs text-amber-600 mt-1.5 ml-1 flex items-center gap-1">
              <span>⚠</span> Recomendado para identificar a proposta.
            </p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <Label>Telefone / WhatsApp</Label>
          <InputWrapper icon={Phone}>
            <input
              type="tel"
              placeholder="(00) 00000-0000"
              value={leadData.phone || ''}
              onChange={(e) => updateLead('phone', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 shadow-sm text-gray-900"
            />
          </InputWrapper>
        </div>

        {/* Email */}
        <div>
          <Label>Email</Label>
          <InputWrapper icon={Mail}>
            <input
              type="email"
              placeholder="cliente@email.com"
              value={leadData.email || ''}
              onChange={(e) => updateLead('email', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 shadow-sm text-gray-900"
            />
          </InputWrapper>
        </div>

        {/* Unidade */}
        <div className="col-span-1 md:col-span-2">
          <Label>Unidade de Interesse</Label>
          <InputWrapper icon={Building}>
            <input
              type="text"
              placeholder="Ex: Edifício Horizonte, Apto 402 - Torre B"
              value={leadData.unitOfInterest || ''}
              onChange={(e) => updateLead('unitOfInterest', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 shadow-sm text-gray-900"
            />
          </InputWrapper>
        </div>

        {/* Notas */}
        <div className="col-span-1 md:col-span-2">
          <Label>Observações Internas (Opcional)</Label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FileText size={18} />
            </div>
            <textarea
              placeholder="Ex: Cliente busca financiamento com entrada parcelada..."
              value={leadData.notes || ''}
              onChange={(e) => updateLead('notes', e.target.value)}
              rows={4}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 shadow-sm resize-none text-gray-900"
            />
          </div>
        </div>

      </div>

      <div className="max-w-3xl mx-auto mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900">Pronto para gerar!</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Ao clicar em "Gerar Relatório", criaremos um documento PDF completo com todas as projeções e os dados acima.
          </p>
        </div>
      </div>

    </div>
  )
}
