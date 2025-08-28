#!/bin/bash

# Setup script for frontend development environment
echo "Setting up frontend development environment..."

# Switch to the Node version specified in .nvmrc
echo "Switching to Node version specified in .nvmrc..."
nvm use

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
else
    echo "Dependencies already installed."
fi

echo "Frontend environment ready!"
echo "You can now run: pnpm start, pnpm storybook, etc."
