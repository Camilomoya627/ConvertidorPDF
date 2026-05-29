import { useState, useCallback, useRef } from 'react'
import { sendMessage } from '../services/api'
import toast from 'react-hot-toast'

export function useChat(documentId) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const sendQuestion = useCallback(
    async (question) => {
      if (!question.trim() || isLoading || !documentId) return

      // Agregar mensaje del usuario
      const userMsg = { role: 'user', content: question, id: Date.now() }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)
      scrollToBottom()

      try {
        // Preparar historial sin IDs internos
        const history = messages.map(({ role, content }) => ({ role, content }))

        const response = await sendMessage(documentId, question, history)

        const assistantMsg = {
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
          model: response.model,
          id: Date.now() + 1,
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch (err) {
        toast.error(err.message || 'Error al procesar tu pregunta')
        // Remover el mensaje del usuario si hubo error
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
      } finally {
        setIsLoading(false)
        scrollToBottom()
      }
    },
    [documentId, messages, isLoading]
  )

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, isLoading, sendQuestion, clearChat, bottomRef }
}
