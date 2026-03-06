#!/bin/bash

echo "🚀 Installing Betclic POC..."
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend
npm install
echo "✅ Backend ready"
echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
cd ../frontend
npm install
echo "✅ Frontend ready"
echo ""

echo "🎉 All dependencies installed!"
echo ""
echo "📖 Quick start:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
