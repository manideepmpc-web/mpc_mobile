#!/bin/bash

# MPC HRMS - Setup Script for Render Deployment

echo "🚀 MPC HRMS Render Deployment Setup"
echo "===================================="
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    exit 1
fi

cd backend

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - MPC HRMS Backend"
    git branch -M main
    echo "✅ Git repository created"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/mpc-hrms-backend.git"
echo "   git push -u origin main"
echo ""
echo "2. Go to https://render.com"
echo "3. Create new Web Service from GitHub"
echo "4. Set environment variables (see RENDER_SETUP.md)"
echo "5. Deploy!"
echo ""
echo "6. Once deployed, update config.js with Render URL"
echo "7. Rebuild APK: ./gradlew assembleRelease"
echo ""
echo "✅ Setup complete!"
