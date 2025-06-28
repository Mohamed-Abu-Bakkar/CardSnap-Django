#!/usr/bin/env bash

echo "🚀 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "⚛️ Building frontend..."
cd ../frontend
npm install
npm run build

echo "📁 Copying React build to Django static and templates..."
cp -r dist/assets ../backend/convert/static/
cp dist/index.html ../backend/convert/templates/

echo "📦 Collecting static files..."
cd ../backend
python manage.py collectstatic --noinput

echo "✅ Build process completed."
echo "🚀 Starting Django server..."