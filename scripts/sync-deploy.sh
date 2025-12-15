#!/bin/bash
set -e

echo "🚀 Syncing Helm charts to deploy repository..."

# Get current commit SHA
COMMIT_SHA=$(git rev-parse --short HEAD)
echo "📦 Current commit: $COMMIT_SHA"

# Create temp directory
TEMP_DIR=$(mktemp -d)
echo "📁 Using temp directory: $TEMP_DIR"

# Clone deploy repo
echo "⬇️  Cloning deploy repository..."
git clone https://gitlab.com/dav.piatek/job-search-workflow-deploy.git "$TEMP_DIR"

# Copy Helm charts
echo "📋 Copying Helm charts..."
rm -rf "$TEMP_DIR/helm"
mkdir -p "$TEMP_DIR/helm"
cp -r cloud/helm/* "$TEMP_DIR/helm/"

# Update image tags with current commit SHA
echo "🏷️  Updating image tags to $COMMIT_SHA..."
if command -v yq &> /dev/null; then
    yq -i ".image.backend.tag = \"$COMMIT_SHA\"" "$TEMP_DIR/helm/job-search-workflow-app/values-simple.yaml"
    yq -i ".image.frontend.tag = \"$COMMIT_SHA\"" "$TEMP_DIR/helm/job-search-workflow-app/values-simple.yaml"
else
    echo "⚠️  yq not found, skipping tag update"
fi

# Commit and push
cd "$TEMP_DIR"
git add .
git commit -m "sync: $COMMIT_SHA" || echo "No changes to commit"
git push origin main

# Cleanup
cd -
rm -rf "$TEMP_DIR"

echo "✅ Sync complete! ArgoCD will pick up the changes automatically."
echo "🔍 Check ArgoCD: https://argocd.draw-me-the-moon.fr"
