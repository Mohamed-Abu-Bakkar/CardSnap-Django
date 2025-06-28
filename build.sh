#!/usr/bin/env bash
set -e  # stop on any error

# Set working dir to the script's own location
cd "$(dirname "$0")"

echo "🚀 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "⚛️ Building frontend..."
cd ../frontend
npm install
npm run build

echo "🧹 Cleaning old static and template files..."
rm -rf ../backend/convert/static/*
rm -rf ../backend/convert/templates/*

echo "📁 Copying React build to Django static and templates..."
cp -r dist/assets ../backend/convert/static/
cp dist/index.html ../backend/convert/templates/
cp dist/logo.png ../backend/convert/static/ || true
cp dist/vite.svg ../backend/convert/static/ || true

echo "📦 Collecting static files..."
cd ../backend
python manage.py collectstatic --noinput

echo "✅ Build process completed."
echo "🚀 Starting Django server..."
