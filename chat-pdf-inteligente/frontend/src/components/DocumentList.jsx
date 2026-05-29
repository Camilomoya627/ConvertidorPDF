import { FileText, Trash2, MessageSquare, Clock } from 'lucide-react'
import { deleteDocument } from '../services/api'
import toast from 'react-hot-toast'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function DocumentList({ documents, activeId, onSelect, onDeleted }) {
  const handleDelete = async (e, doc) => {
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${doc.filename}"?`)) return
    try {
      await deleteDocument(doc.id)
      toast.success('Documento eliminado')
      onDeleted(doc.id)
    } catch (err) {
      toast.error(err.message || 'Error al eliminar')
    }
  }

  if (!documents.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
        <FileText className="w-10 h-10 text-gray-200" />
        <p className="text-sm text-gray-400">Aún no hay documentos</p>
        <p className="text-xs text-gray-300">Sube un PDF para empezar</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelect(doc)}
          className={`
            group w-full text-left rounded-xl p-3 transition-all duration-150
            ${activeId === doc.id
              ? 'bg-brand-50 border border-brand-200'
              : 'hover:bg-gray-50 border border-transparent'
            }
          `}
        >
          <div className="flex items-start gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
              ${activeId === doc.id ? 'bg-brand-100' : 'bg-red-50'}`}>
              <FileText className={`w-4 h-4 ${activeId === doc.id ? 'text-brand-600' : 'text-red-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${activeId === doc.id ? 'text-brand-700' : 'text-gray-700'}`}>
                {doc.filename}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MessageSquare className="w-2.5 h-2.5" />
                  {doc.chunks} chunks
                </span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {formatDate(doc.created_at)}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(e, doc)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-300 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </button>
      ))}
    </div>
  )
}
