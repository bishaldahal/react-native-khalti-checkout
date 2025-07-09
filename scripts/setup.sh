#!/bin/bash

# Setup script for git hooks and commit tools

echo "🔧 Setting up Git hooks and commit tools..."

# Install husky git hooks
if command -v npx &> /dev/null; then
    echo "📦 Installing husky..."
    npx husky
    
    # Create .husky directory if it doesn't exist
    mkdir -p .husky
    
    # Add commit-msg hook for commitlint
    echo "🪝 Adding commit-msg hook..."
    echo 'npx --no-install commitlint --edit "$1"' > .husky/commit-msg
    chmod +x .husky/commit-msg
    
    # Add pre-commit hook for lint-staged
    echo "🪝 Adding pre-commit hook..."
    echo 'npx lint-staged' > .husky/pre-commit
    chmod +x .husky/pre-commit
    
    echo "✅ Git hooks setup complete!"
else
    echo "❌ npx not found. Please install Node.js and npm first."
    exit 1
fi

# Make scripts executable
chmod +x scripts/release.sh

echo ""
echo "🎉 Setup complete! You can now:"
echo "  • Use 'npm run commit' for guided commits"
echo "  • Use './scripts/release.sh patch' for releases"
echo "  • Git hooks will validate commit messages and run linting"
echo ""
echo "📖 See RELEASE.md for full documentation"
