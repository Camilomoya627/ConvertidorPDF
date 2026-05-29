import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadPDF } from '../services/api'
import toast from 'react-hot-toast'

const MAX_SIZE_MB = 10

export function PDFUploader({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const inputRef = useRef(null)

  const validateFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Solo se permiten archivos PDF')
      return false
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`El archivo supera el límite de ${MAX_SIZE_MB}MB`)
      return false
    }
    return true
  }

  const handleFile = (file) => {
    if (!validateFile(file)) return
    setSelectedFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setProgress(0)

    try {
      const result = await uploadPDF(selectedFile, setProgress)
      toast.success(`¡PDF procesado! ${result.chunks} fragmentos indexados.`)
      onUploadSuccess(result)
      setSelectedFile(null)
      setProgress(0)
    } catch (err) {
      toast.error(err.message || 'Error al subir el PDF')
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
            transition-all duration-200 select-none
            ${isDragging
              ? 'border-brand-500 bg-brand-50 scale-[1.01]'
              : 'border-gray-200 hover:border-brand-400 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
              ${isDragging ? 'bg-brand-100' : 'bg-gray-100'}`}>
              <Upload className={`w-7 h-7 ${isDragging ? 'text-brand-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {isDragging ? 'Suelta el PDF aquí' : 'Arrastra tu PDF aquí'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                o <span className="text-brand-600 font-medium">haz clic para seleccionar</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">Solo PDF · Máximo {MAX_SIZE_MB}MB</p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-2xl p-5 bg-white">
          {/* File info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate text-sm">{selectedFile.name}</p>
              <p className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!isUploading && (
              <button onClick={clearFile} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Procesando PDF...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`
              w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
              ${isUploading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-[0.98]'
              }
            `}
          >
            {isUploading ? 'Procesando...' : 'Subir y procesar PDF'}
          </button>
        </div>
      )}
    </div>
  )
}
