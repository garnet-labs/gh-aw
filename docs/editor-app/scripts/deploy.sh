#!/bin/bash
set -e

# Navigate to editor-app root
cd "$(dirname "$0")/.."

# Ensure WASM loader files from docs/public/wasm are available
if [ ! -f public/wasm/gh-aw.wasm ]; then
  echo "Copying WASM files from docs/public/wasm..."
  mkdir -p public/wasm
  # Copy any files from the docs-level public/wasm that aren't already present
  for f in ../../public/wasm/*; do
    if [ -f "$f" ]; then
      cp -n "$f" public/wasm/ 2>/dev/null || true
    fi
  done
fi

echo "Building for GitHub Pages..."
npx vite build --mode ghpages

echo "Deploying to gh-pages branch..."
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy visual editor - $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Deploy to the external visualizer repo
# NOTE: For cross-repo push, you must have push access to this repository.
# If using HTTPS, set GH_TOKEN or GITHUB_TOKEN env var, or use SSH.
REPO_URL="${DEPLOY_REPO_URL:-https://github.com/Mossaka/gh-aw-editor-visualizer.git}"

if [ -n "$GH_TOKEN" ]; then
  REPO_URL="https://x-access-token:${GH_TOKEN}@github.com/Mossaka/gh-aw-editor-visualizer.git"
elif [ -n "$GITHUB_TOKEN" ]; then
  REPO_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/Mossaka/gh-aw-editor-visualizer.git"
fi

git remote add origin "$REPO_URL"
git push origin gh-pages --force

echo ""
echo "Deployed successfully!"
echo "View at: https://mossaka.github.io/gh-aw-editor-visualizer/"
