#!/bin/bash

echo "Starting Report Mapper Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the frontend directory."
    exit 1
fi

# Check for environment configuration
if [ ! -f ".env.local" ]; then
    echo "No .env.local file found. Creating from example..."
    if [ -f "env.example" ]; then
        cp env.example .env.local
        echo "Created .env.local from env.example"
    else
        echo "Warning: No env.example file found. Using default configuration."
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo "Starting development server..."
echo "The frontend will be available at: http://localhost:3000"
echo "Make sure your backend API is running on: http://localhost:8080"
echo "Make sure your Keycloak is running on: http://localhost:9003"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
