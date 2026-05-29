import ReactMarkdown from 'react-markdown'
import { Bot, User, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

function SourcesPanel({ sources }) {
  const [open, setOpen] = useState(false)
  if (!sources?.length) return null

  return (
    <div className="mt-3 border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          {sources.length} fragmento{sources.length > 1 ? 's' : ''} consultado{sources.length > 1 ? 's' : ''}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {sources.map((src, i) => (
            <div key={i} className="px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                  Pág. {src.page}
                </span>
                <span className="text-xs text-gray-400">
                  {Math.round(src.similarity * 100)}% relevante
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{src.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
        ${isUser ? 'bg-brand-600' : 'bg-gray-100'}`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-gray-600" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`
          rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
          }
        `}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && (
          <div className="w-full mt-1">
            <SourcesPanel sources={message.sources} />
          </div>
        )}

        {/* Model tag */}
        {!isUser && message.model && (
          <span className="text-[10px] text-gray-400 mt-1 px-1 font-mono">
            {message.model}
          </span>
        )}
      </div>
    </div>
  )
}
