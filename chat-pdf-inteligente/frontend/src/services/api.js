import axios from 'axios'

const api = axios.create({
  // 👇 AQUÍ CAMBIAMOS EL NOMBRE DE LA VARIABLE:
  baseURL: import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 60000, // 60s para uploads grandes
})

// Interceptor global de errores
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.message ||
      'Error de conexión con el servidor'
    return Promise.reject(new Error(message))
  }
)

// ── Documents ─────────────────────────────────────────────────────────────────

export const uploadPDF = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post('/api/v1/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
  return data
}

export const getDocuments = async () => {
  const { data } = await api.get('/api/v1/documents/')
  return data
}

export const deleteDocument = async (documentId) => {
  const { data } = await api.delete(`/api/v1/documents/${documentId}`)
  return data
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export const sendMessage = async (documentId, question, history = []) => {
  const { data } = await api.post('/api/v1/chat/', {
    document_id: documentId,
    question,
    history,
  })
  return data
}

// ── Health ────────────────────────────────────────────────────────────────────

export const checkHealth = async () => {
  const { data } = await api.get('/health')
  return data
}
