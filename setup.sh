#!/bin/bash

echo "🎮 Overwatch Tank Tracker - Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null
then
    echo "⚠️  MongoDB not found. Please install MongoDB and start it with 'mongod'"
fi

echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
npm install
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file (edit if needed)"
fi
cd ..

echo ""
echo "📦 Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start MongoDB:        mongod"
echo "2. Create a season:      curl -X POST http://localhost:5000/api/seasons \\"
echo "                         -H 'Content-Type: application/json' \\"
echo "                         -d '{\"name\":\"Season 14\",\"startDate\":\"2025-01-01\",\"isActive\":true}'"
echo "3. Start Backend:        cd backend && npm run dev"
echo "4. Start Frontend:       cd frontend && npm start"
echo ""
echo "🎯 Access the app at http://localhost:3000"
echo ""
