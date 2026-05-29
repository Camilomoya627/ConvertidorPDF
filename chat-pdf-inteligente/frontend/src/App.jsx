import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { BrainCircuit, FileText, Sparkles, Menu, X, RotateCcw } from 'lucide-react'
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

  // Cargar documentos al iniciar
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const data = await getDocuments()
      setDocuments(data.documents)
    } catch (_) {
      // Silencioso — el backend podría no estar listo
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
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '12px', fontSize: '13px' },
          duration: 4000,
        }}
      />

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`
        ${sidebarOpen ? 'w-72' : 'w-0'}
        flex-shrink-0 bg-white border-r border-gray-100 flex flex-col
        transition-all duration-300 overflow-hidden
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Chat PDF</h1>
            <p className="text-[11px] text-gray-400">Inteligente</p>
          </div>
        </div>

        {/* Upload */}
        <div className="p-4 border-b border-gray-100">
          <PDFUploader onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
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

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {activeDoc ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{activeDoc.filename}</p>
                <p className="text-xs text-gray-400">{activeDoc.pages} páginas · {activeDoc.chunks} fragmentos</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-gray-600">Selecciona un documento para chatear</span>
            </div>
          )}

          {/* Clear chat */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600
                px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar chat
            </button>
          )}
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Empty state */}
            {!activeDoc && (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-3xl
                  flex items-center justify-center">
                  <BrainCircuit className="w-10 h-10 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Chat PDF Inteligente</h2>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Sube un PDF y hazle preguntas. La IA responderá usando únicamente el contenido del documento.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {['RAG', 'OpenAI', 'pgvector', 'Supabase'].map((tag) => (
                    <span key={tag} className="text-xs bg-brand-50 text-brand-600 border border-brand-200
                      px-2.5 py-1 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Document selected but no messages */}
            {activeDoc && messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-brand-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Listo para responder</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Haz una pregunta sobre <span className="font-medium">{activeDoc.filename}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Typing indicator */}
            {isLoading && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        {activeDoc && (
          <div className="border-t border-gray-100 bg-white px-4 py-4">
            <div className="max-w-2xl mx-auto">
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
