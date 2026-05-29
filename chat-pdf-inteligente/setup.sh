#!/bin/bash
# setup.sh — Instalación rápida de Chat PDF Inteligente

set -e

echo "🚀 Configurando Chat PDF Inteligente..."

# ── Backend ────────────────────────────────────────────────
echo ""
echo "📦 Instalando dependencias del backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  Archivo backend/.env creado. Edítalo con tus claves antes de ejecutar."
fi

cd ..

# ── Frontend ───────────────────────────────────────────────
echo ""
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  Archivo frontend/.env creado. Edítalo si cambias el puerto del backend."
fi

cd ..

echo ""
echo "✅ Instalación completa."
echo ""
echo "📝 Pasos siguientes:"
echo "  1. Ejecutar supabase_schema.sql en tu proyecto Supabase"
echo "  2. Completar backend/.env con OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY"
echo "  3. En una terminal: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  4. En otra terminal: cd frontend && npm run dev"
echo ""
echo "🌐 Backend:  http://localhost:8000/docs"
echo "🎨 Frontend: http://localhost:5173"
