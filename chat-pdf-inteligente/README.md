#  Chat PDF Inteligente

> Sistema RAG (Retrieval Augmented Generation) para conversar con documentos PDF usando OpenAI y Supabase pgvector.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com/)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase)](https://supabase.com/)

---

##  Características

-  **Subida de PDFs** con extracción de texto (PyMuPDF)
-  **Chunking inteligente** con overlap para mantener contexto
-  **Embeddings semánticos** con `text-embedding-3-small`
-  **Búsqueda vectorial** en Supabase pgvector
-  **Chat contextual** con `gpt-4o-mini`
-  **Historial de conversación** en frontend
-  **Fuentes citadas** con número de página y similitud
-  **Manejo de errores** completo
-  **Deploy listo** para Render + Vercel

---

##  Arquitectura

```
PDF → PyMuPDF → Chunks → OpenAI Embeddings → Supabase pgvector
                                                      ↓
Question → OpenAI Embedding → Búsqueda semántica → Top-K chunks
                                                      ↓
                          OpenAI gpt-4o-mini (RAG) → Respuesta
```

---

## 📁 Estructura del proyecto

```
chat-pdf-inteligente/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── documents.py   # Upload, list, delete
│   │   │   └── chat.py        # RAG question answering
│   │   ├── core/
│   │   │   ├── config.py      # Configuración con pydantic-settings
│   │   │   └── exceptions.py  # Errores personalizados
│   │   ├── models/
│   │   │   └── schemas.py     # Pydantic schemas
│   │   ├── services/
│   │   │   ├── pdf_service.py       # Extracción y chunking
│   │   │   ├── embedding_service.py # OpenAI embeddings
│   │   │   ├── supabase_service.py  # DB operations
│   │   │   └── rag_service.py       # Pipeline RAG completo
│   │   └── main.py
│   ├── requirements.txt
│   ├── render.yaml
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PDFUploader.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── hooks/
│   │   │   └── useChat.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   └── .env.example
└── supabase_schema.sql
```



---

## Instalación local

### Prerrequisitos

- Python 3.11+
- Node.js 18+
- Cuenta OpenAI con API key
- Proyecto Supabase con pgvector habilitado

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/chat-pdf-inteligente.git
cd chat-pdf-inteligente
```

### 2. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar todo el contenido de `supabase_schema.sql`
3. Copiar URL y Service Key de **Settings → API**

### 3. Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

El backend estará en `http://localhost:8000`
Documentación en `http://localhost:8000/docs`

### 4. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# VITE_API_URL=http://localhost:8000

# Iniciar desarrollo
npm run dev
```

El frontend estará en `http://localhost:5173`

---

##  Deploy

### Backend → Render

1. Push del código a GitHub
2. Crear **Web Service** en [render.com](https://render.com)
3. Conectar el repositorio, apuntar al directorio `backend/`
4. Configurar variables de entorno en el dashboard
5. Render usa `render.yaml` automáticamente

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

O conectar el repositorio en [vercel.com](https://vercel.com) y configurar:
- **Root Directory**: `frontend`
- **Variable de entorno**: `VITE_API_URL` → URL del backend en Render

---

##  Variables de entorno

### Backend `.env`

```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
APP_ENV=development
MAX_FILE_SIZE_MB=10
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000
```

---

##  API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/documents/upload` | Sube y procesa un PDF |
| `GET`  | `/api/v1/documents/` | Lista todos los documentos |
| `DELETE` | `/api/v1/documents/{id}` | Elimina un documento |
| `POST` | `/api/v1/chat/` | Hace una pregunta sobre un documento |
| `GET`  | `/health` | Health check |

---

##  Modelos OpenAI usados

| Uso | Modelo | Coste |
|-----|--------|-------|
| Embeddings | `text-embedding-3-small` | ~$0.02/1M tokens |
| Chat | `gpt-4o-mini` | ~$0.15/1M input tokens |

---

##  Licencia

MIT — libre para uso personal y comercial.
