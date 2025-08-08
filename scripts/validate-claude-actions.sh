#!/bin/bash

# Claude Actions Validation Script
# This script helps validate that Claude Actions are properly configured

set -e

echo "🤖 Claude Actions Validation Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".github/workflows" ]; then
    echo "❌ Error: Run this script from the repository root directory"
    exit 1
fi

echo "✅ Repository structure verified"

# Check if workflow files exist
WORKFLOWS=("claude-pr-review.yml" "claude-issue-analysis.yml" "claude-docs-update.yml")
echo ""
echo "📁 Checking workflow files..."

for workflow in "${WORKFLOWS[@]}"; do
    if [ -f ".github/workflows/$workflow" ]; then
        echo "✅ $workflow exists"
    else
        echo "❌ $workflow missing"
        exit 1
    fi
done

# Validate YAML syntax (if yamllint is available)
if command -v yamllint &> /dev/null; then
    echo ""
    echo "🔍 Validating YAML syntax..."
    
    for workflow in "${WORKFLOWS[@]}"; do
        if yamllint ".github/workflows/$workflow" &> /dev/null; then
            echo "✅ $workflow syntax valid"
        else
            echo "❌ $workflow has syntax errors"
            yamllint ".github/workflows/$workflow"
            exit 1
        fi
    done
else
    echo "ℹ️  yamllint not available, skipping YAML validation"
fi

# Check documentation files
echo ""
echo "📚 Checking documentation..."

DOCS=(
    ".github/workflows/README.md"
    "docs/claude-actions-security.md"
    "docs/claude-actions-configuration.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $doc exists"
    else
        echo "❌ $doc missing"
        exit 1
    fi
done

# Check for required tools
echo ""
echo "🛠️  Checking required tools..."

TOOLS=("jq" "curl" "git")
for tool in "${TOOLS[@]}"; do
    if command -v "$tool" &> /dev/null; then
        echo "✅ $tool available"
    else
        echo "❌ $tool not found (required for workflows)"
        exit 1
    fi
done

# Test API key configuration (optional)
echo ""
echo "🔑 API Key Configuration Test"
echo "Note: This requires ANTHROPIC_API_KEY to be set as a repository secret"
echo "The workflows will gracefully handle missing API keys during actual runs"

# Check GitHub CLI availability for testing
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI available for workflow testing"
    
    # List workflows
    echo ""
    echo "📋 Available workflows:"
    gh workflow list --repo . 2>/dev/null || echo "ℹ️  Run 'gh auth login' to view workflows"
else
    echo "ℹ️  GitHub CLI not available (optional for testing)"
fi

# Generate example test files
echo ""
echo "📝 Generating test files..."

# Create a sample PR diff for testing
cat > /tmp/test_pr_diff.txt << 'EOF'
diff --git a/frontend/src/components/WillCounter.tsx b/frontend/src/components/WillCounter.tsx
index 1234567..abcdefg 100644
--- a/frontend/src/components/WillCounter.tsx
+++ b/frontend/src/components/WillCounter.tsx
@@ -10,6 +10,10 @@ const WillCounter: React.FC = () => {
   const dispatch = useAppDispatch();
   const { todayCount, loading } = useAppSelector(state => state.willCounter);
 
+  const handleIncrement = useCallback(() => {
+    dispatch(incrementWillCount());
+  }, [dispatch]);
+
   return (
     <View style={styles.container}>
       <Text style={styles.countText}>{todayCount}</Text>
EOF

echo "✅ Sample PR diff created at /tmp/test_pr_diff.txt"

# Create a sample issue for testing
cat > /tmp/test_issue.md << 'EOF'
# Bug Report: Counter not incrementing on offline mode

## Description
When the app is in offline mode, tapping the increment button doesn't update the counter. The counter should work offline and sync when connection is restored.

## Steps to Reproduce
1. Turn off wifi/cellular data
2. Open the app
3. Tap the increment button
4. Notice the counter doesn't change

## Expected Behavior
Counter should increment locally and sync when online.

## Environment
- iOS 17.0
- React Native 0.72
- Auth0 integration enabled
EOF

echo "✅ Sample issue created at /tmp/test_issue.md"

# Provide next steps
echo ""
echo "🎉 Validation Complete!"
echo ""
echo "Next Steps:"
echo "1. 🔑 Add ANTHROPIC_API_KEY to repository secrets:"
echo "   - Go to Repository Settings > Secrets and variables > Actions"
echo "   - Add new secret: ANTHROPIC_API_KEY"
echo "   - Get your API key from: https://console.anthropic.com/"
echo ""
echo "2. 🧪 Test the workflows:"
echo "   - Create a test pull request to trigger PR review"
echo "   - Open a test issue to trigger issue analysis"
echo "   - Manually run documentation workflow from Actions tab"
echo ""
echo "3. 📖 Read the documentation:"
echo "   - Setup guide: .github/workflows/README.md"
echo "   - Security guidelines: docs/claude-actions-security.md"
echo "   - Configuration examples: docs/claude-actions-configuration.md"
echo ""
echo "4. 🎯 Customize for your needs:"
echo "   - Modify prompts in workflow files"
echo "   - Adjust triggers and file filters"
echo "   - Add project-specific labels and patterns"
echo ""
echo "Happy coding with Claude Actions! 🤖✨"