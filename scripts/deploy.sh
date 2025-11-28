#!/bin/bash

# Deployment script for Stock Portfolio
# Pushes changes to GitHub repository

set -e  # Exit on error

echo "🚀 Starting deployment to GitHub..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
    exit 0
fi

# Get commit message from argument or use default
COMMIT_MSG="${1:-Update: Changes from Cursor}"

echo "📝 Staging changes..."
git add .

echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

echo "📤 Pushing to GitHub..."
git push origin master

echo "✅ Deployment complete!"
echo "📍 Repository: https://github.com/drace3000/Stock-Portfolio"

