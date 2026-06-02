import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { BrainCircuit, FileText, Sparkles, Menu, X, RotateCcw, HelpCircle, MessageSquare } from 'lucide-react'
import { PDFUploader } from './components/PDFUploader'
import { DocumentList } from './components/DocumentList'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { TypingIndicator } from './components/TypingIndicator'
import { useChat } from './hooks/useChat'
import { getDocuments } from './services/api'

export default function App() {
  const [documents, setDocuments] = useState([])
  const [activeDoc, setActiveDoc] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { messages, isLoading, sendQuestion, clearChat, bottomRef } = useChat(activeDoc?.id)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const data = await getDocuments()
      setDocuments(data.documents)
    } catch (_) {
      // Silencioso
    }
  }

  const handleUploadSuccess = (result) => {
    const newDoc = {
      id: result.document_id,
      filename: result.filename,
      pages: result.pages,
      chunks: result.chunks,
      created_at: new Date().toISOString(),
    }
    setDocuments((prev) => [newDoc, ...prev])
    setActiveDoc(newDoc)
    clearChat()
  }

  const handleSelectDoc = (doc) => {
    if (doc.id === activeDoc?.id) return
    setActiveDoc(doc)
    clearChat()
  }

  const handleDocDeleted = (docId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
    if (activeDoc?.id === docId) {
      setActiveDoc(null)
      clearChat()
    }
  }

  return (
    <div className="h-screen flex bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '16px', fontSize: '13px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' },
          duration: 4000,
        }}
      />

      {/* ── Sidebar (Modo Oscuro Premium) ────────────────────────────────── */}
      <aside className={`
        ${sidebarOpen ? 'w-80' : 'w-0'}
        flex-shrink-0 bg-slate-900 border-r border-slate-800/60 flex flex-col
        transition-all duration-300 overflow-hidden relative z-10
      `}>
        {/* Logo con destello sutil */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/50">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 blur opacity-40"></div>
            <div className="relative w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-700/50">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-slate-200 text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
              Chat PDF
            </h1>
            <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Inteligente</p>
          </div>
        </div>

        {/* Zona de Subida */}
        <div className="p-5 border-b border-slate-800/50 bg-slate-900/40">
          <PDFUploader onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Listado de Documentos */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="px-3 py-2 mb-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Documentos ({documents.length})
            </p>
          </div>
          <DocumentList
            documents={documents}
            activeId={activeDoc?.id}
            onSelect={handleSelectDoc}
            onDeleted={handleDocDeleted}
          />
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Adornos de fondo estilo Glow de IA */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/60 flex items-center px-6 gap-4 flex-shrink-0 relative z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/30 text-slate-400 hover:text-slate-200 transition-all"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {activeDoc ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{activeDoc.filename}</p>
                <p className="text-xs text-slate-500 font-medium">{activeDoc.pages} páginas · {activeDoc.chunks} fragmentos indexados</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium tracking-wide uppercase text-slate-500">Módulo de IA en espera</span>
            </div>
          )}

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200
                px-3 py-1.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/30 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar Chat
            </button>
          )}
        </header>

        {/* Chat / Central Screen Workspace */}
        <div className="flex-1 overflow-y-auto px-6 py-8 relative z-10">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* NUEVO ESTADO VACÍO (Reemplaza las etiquetas aburridas por sugerencias Pro) */}
            {!activeDoc && (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="relative mb-6">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur opacity-50 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-center">
                    <BrainCircuit className="w-10 h-10 text-indigo-400" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  Chat PDF Inteligente
                </h2>
                <p className="text-slate-400 text-sm max-w-sm mt-2 leading-relaxed">
                  Sube un archivo técnico, contrato o apunte en el panel izquierdo y extrae información al instante a través de un modelo RAG avanzado.
                </p>

                {/* Grid Interactivo de Casos de Uso */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 max-w-2xl w-full text-left">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2 group-hover:bg-indigo-500/20 transition-all">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Análisis Técnico</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Haz preguntas complejas, solicita resúmenes ejecutivos o contrasta datos específicos del documento.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2 group-hover:bg-purple-500/20 transition-all">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Aislamiento de Contexto</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">La red neuronal se entrena temporalmente y responderá usando <span className="text-slate-400">únicamente</span> la información de tu PDF.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Documento listo pero sin interacciones */}
            {activeDoc && messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative">
                  <div className="absolute -inset-0.5 rounded-2xl bg-indigo-500 opacity-20 blur-sm"></div>
                  <Sparkles className="w-6 h-6 text-indigo-400 relative z-10 animate-bounce" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Contexto Cargado Exitosamente</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs">
                    El agente inteligente está listo. Introduce tu pregunta sobre <span className="text-indigo-400 font-medium truncate inline-block max-w-[150px] align-bottom">{activeDoc.filename}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Mensajes de Chat */}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Indicador de escritura */}
            {isLoading && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input con diseño de burbuja flotante oscura */}
        {activeDoc && (
          <div className="border-t border-slate-800/60 bg-slate-900/40 backdrop-blur-md px-6 py-5 relative z-10">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={sendQuestion}
                isLoading={isLoading}
                hasMessages={messages.length > 0}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
