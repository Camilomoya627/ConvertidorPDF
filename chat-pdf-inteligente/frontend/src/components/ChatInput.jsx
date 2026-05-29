import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

const SUGGESTED_QUESTIONS = [
  '¿De qué trata este documento?',
  '¿Cuáles son los puntos principales?',
  '¿Qué conclusiones se presentan?',
]

export function ChatInput({ onSend, isLoading, hasMessages }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = () => {
    const q = value.trim()
    if (!q || isLoading) return
    onSend(q)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [value])

  return (
    <div className="space-y-3">
      {/* Suggested questions — solo cuando no hay mensajes */}
      {!hasMessages && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => onSend(q)}
              disabled={isLoading}
              className="text-xs bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-300
                text-gray-600 hover:text-brand-700 px-3 py-1.5 rounded-full transition-all duration-150"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm
        focus-within:border-brand-400 focus-within:shadow-brand-100 focus-within:shadow-md transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Haz una pregunta sobre el documento..."
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent
            leading-relaxed max-h-28 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className={`
            flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150
            ${value.trim() && !isLoading
              ? 'bg-brand-600 hover:bg-brand-700 text-white active:scale-95'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          {isLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />
          }
        </button>
      </div>
      <p className="text-[11px] text-center text-gray-300">
        Enter para enviar · Shift+Enter para nueva línea
      </p>
    </div>
  )
}
