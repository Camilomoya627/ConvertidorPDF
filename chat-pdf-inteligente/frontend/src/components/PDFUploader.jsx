import { useState, useRef } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
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
      toast.error('Solo se permiten archivos de formato PDF')
      return false
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`El archivo supera el límite crítico de ${MAX_SIZE_MB}MB`)
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
      toast.success(`Indexación Exitosa: ${result.chunks} vectores generados.`)
      onUploadSuccess(result)
      setSelectedFile(null)
      setProgress(0)
    } catch (err) {
      toast.error(err.message || 'Fallo crítico al indexar el PDF')
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
            relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
            transition-all duration-300 select-none group
            ${isDragging
              ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01] shadow-[0_0_15px_rgba(99,102,241,0.15)]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80'
            }
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300
              ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-slate-300'}`}>
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">
                {isDragging ? 'Suelte el archivo de inmediato' : 'Arrastra tu PDF aquí'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                o <span className="text-indigo-400 font-medium group-hover:underline">explora tus archivos</span>
              </p>
              <p className="text-[10px] text-slate-600 mt-2">Límite del sistema: {MAX_SIZE_MB}MB por archivo</p>
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
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 backdrop-blur-sm">
          {/* File info */}
          <div className="flex items-center gap-3 mb-3.5">
            <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-200 truncate text-xs">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!isUploading && (
              <button onClick={clearFile} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="mb-3.5 px-0.5">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                <span className="animate-pulse flex items-center gap-1">Generando embeddings...</span>
                <span className="text-indigo-400">{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-900 border border-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`
              w-full py-2 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-200
              ${isUploading
                ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md active:scale-[0.98]'
              }
            `}
          >
            {isUploading ? 'Procesando Vectores...' : 'Indexar en base de datos'}
          </button>
        </div>
      )}
    </div>
  )
}
