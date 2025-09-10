#!/bin/bash

# 5/3/1 Tracker Setup Script
echo "🏋️ Setting up 5/3/1 Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Please install Yarn and try again."
    exit 1
fi

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your database credentials before continuing."
    echo "   Edit .env and set your DATABASE_URL and JWT_SECRET"
    read -p "Press Enter when you've updated .env..."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database is accessible
echo "🗄️  Testing database connection..."
if npx prisma db push --accept-data-loss; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your DATABASE_URL in .env"
    exit 1
fi

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

# Run tests
echo "🧪 Running tests..."
yarn test

# Build the application
echo "🏗️  Building application..."
yarn build

echo ""
echo "🎉 Setup complete! Your 5/3/1 Tracker is ready to use."
echo ""
echo "To start the development server:"
echo "  yarn dev"
echo ""
echo "To start the production server:"
echo "  yarn start"
echo ""
echo "To view the database:"
echo "  npx prisma studio"
echo ""
echo "Happy lifting! 💪"
