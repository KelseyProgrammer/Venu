#!/bin/bash

# Venu Development Environment Setup
# This script sets up the required environment variables for development

echo "🔧 Setting up Venu development environment..."

# Set required environment variables for development
export JWT_SECRET="your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-development-only"
export JWT_EXPIRES_IN="7d"
export JWT_ISSUER="venu-api"
export JWT_AUDIENCE="venu-app"
export MONGODB_URI="mongodb://localhost:27017/venu"
export PORT="3001"
export NODE_ENV="development"

echo "✅ Environment variables set:"
echo "   JWT_SECRET: ${JWT_SECRET:0:20}..."
echo "   MONGODB_URI: $MONGODB_URI"
echo "   PORT: $PORT"
echo "   NODE_ENV: $NODE_ENV"

# Start the development servers
echo ""
echo "🚀 Starting development servers..."
./start-dev.sh
