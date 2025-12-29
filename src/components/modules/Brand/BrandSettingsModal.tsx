import { ReactElement, useState, useRef, useEffect } from 'react'
import { X, Check, Trash2, Upload, Palette } from 'lucide-react'
import { useBrand } from '../../../context/BrandContext'

const BrandSettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}): ReactElement | null => {
  const { brandColor, companyLogo, setBrandColor, setCompanyLogo, resetBrand } = useBrand()

  const [localColor, setLocalColor] = useState(brandColor)
  const [localLogo, setLocalLogo] = useState<string | null>(companyLogo)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalColor(brandColor)
      setLocalLogo(companyLogo)
    }
  }, [isOpen, brandColor, companyLogo])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check size (optional, stick to basic)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLocalLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    setBrandColor(localColor)
    setCompanyLogo(localLogo)
    onClose()
  }

  const handleReset = () => {
    if (confirm('Deseja realmente restaurar as configurações padrão da marca?')) {
      resetBrand()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            Configurações da Marca
          </h3>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Logo Section */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
              <Upload size={16} /> Logotipo da Empresa
            </label>
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden relative group cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {localLogo ? (
                  <img src={localLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-xs text-gray-400 font-medium text-center px-1">Upload Logo</span>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
                  Alterar
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Selecionar Arquivo
                </button>
                {localLogo && (
                  <button
                    onClick={() => setLocalLogo(null)}
                    className="w-full py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Remover Logo
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Recomendado: Imagem PNG com fundo transparente. Será usada no cabeçalho dos relatórios.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Color Section */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
              <Palette size={16} /> Cor Principal
            </label>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl shadow-sm border border-black/10" style={{ backgroundColor: localColor }}></div>
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={localColor}
                    onChange={(e) => setLocalColor(e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono uppercase"
                  />
                </div>
                <input
                  type="color"
                  value={localColor}
                  onChange={(e) => setLocalColor(e.target.value)}
                  className="w-full h-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Esta cor será aplicada aos títulos, botões e detalhes do relatório PDF.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors"
          >
            Restaurar
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-2.5 text-gray-500 font-bold text-sm hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: localColor }}
            >
              <Check size={18} /> Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandSettingsModal
