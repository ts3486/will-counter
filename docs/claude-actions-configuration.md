# Claude Actions Configuration Examples

This file provides configuration examples and best practices for customizing Claude Actions workflows.

## 🔧 Basic Configuration

### API Key Setup
```bash
# In your repository settings > Secrets and variables > Actions
ANTHROPIC_API_KEY=sk-ant-api03-...your-key-here...
```

### Required Repository Permissions
```yaml
# Repository Settings > Actions > General > Workflow permissions
permissions:
  contents: read
  pull-requests: write
  issues: write
```

## 🎯 Workflow Customization

### 1. Customizing PR Review Workflow

#### Change Claude Model
```yaml
# In claude-pr-review.yml, modify the API call:
"model": "claude-3-sonnet-20240229"  # More capable but higher cost
# or
"model": "claude-3-haiku-20240307"   # Faster and more cost-effective
```

#### Customize Review Focus
```yaml
# Add to the Claude prompt in claude-pr-review.yml:
**Additional Focus Areas:**
- Performance optimization for mobile devices
- Accessibility compliance (WCAG guidelines)
- React Native specific best practices
- Kotlin coroutine usage patterns
- Supabase query optimization
```

#### Filter File Types
```yaml
# Add path filters to the workflow trigger:
on:
  pull_request:
    paths:
      - 'frontend/src/**/*.{ts,tsx}'
      - 'api/src/**/*.kt'
      - 'shared/**/*.ts'
    paths-ignore:
      - '**/*.test.{ts,tsx,kt}'
      - '**/node_modules/**'
      - '**/build/**'
```

### 2. Customizing Issue Analysis Workflow

#### Add Custom Labels
```yaml
# In the auto-labeling section, add project-specific labels:
if (content.includes('performance') || content.includes('slow') || content.includes('optimization')) {
  labels.push('performance');
}

if (content.includes('accessibility') || content.includes('a11y')) {
  labels.push('accessibility');
}

if (content.includes('redux') || content.includes('state')) {
  labels.push('state-management');
}
```

#### Customize Analysis Prompt
```yaml
# Modify the Claude prompt to include project-specific context:
**Additional Context:**
- This is a B2C mobile app with focus on user engagement
- Target users are individuals working on self-improvement
- Performance and battery life are critical success factors
- Offline-first architecture is a key requirement
```

### 3. Customizing Documentation Workflow

#### Add New Documentation Types
```yaml
# Add new workflow input options:
docs_type:
  description: 'Type of documentation to generate'
  type: choice
  options:
    - api
    - frontend
    - database
    - deployment
    - testing
    - all
```

#### Custom Documentation Templates
```yaml
# Create a new step for database documentation:
- name: Generate Database documentation with Claude
  if: github.event.inputs.docs_type == 'database'
  run: |
    # Collect database schema files
    cat supabase-schema.sql > db_schema.sql
    find shared/database -name "*.sql" >> db_schema.sql
    
    # Create custom prompt for database docs
    cat > claude_db_prompt.txt << 'EOF'
    Generate comprehensive database documentation including:
    - Schema overview and entity relationships
    - Table descriptions and column purposes
    - Row Level Security (RLS) policies
    - Database functions and triggers
    - Migration guidelines
    EOF
```

## 🛠️ Advanced Configuration

### Rate Limiting and Cost Management
```yaml
# Add cost controls to workflows:
- name: Check API usage
  run: |
    # Only run on certain conditions to manage costs
    if [ "${{ github.event.pull_request.changed_files }}" -gt 10 ]; then
      echo "Large PR detected, skipping Claude analysis"
      exit 0
    fi
```

### Multi-Environment Setup
```yaml
# Use different API keys for different environments:
- name: Set API key based on branch
  run: |
    if [ "${{ github.ref }}" = "refs/heads/main" ]; then
      echo "Using production Claude API key"
      API_KEY="${{ secrets.ANTHROPIC_API_KEY_PROD }}"
    else
      echo "Using development Claude API key"
      API_KEY="${{ secrets.ANTHROPIC_API_KEY_DEV }}"
    fi
```

### Custom Security Patterns
```yaml
# Add project-specific security checks:
- name: Check for security patterns
  run: |
    security_patterns=(
      "AUTH0_DOMAIN"
      "SUPABASE_URL"
      "API_KEY"
      "private.*key"
      "password.*="
      "token.*="
    )
    
    for pattern in "${security_patterns[@]}"; do
      if grep -r "$pattern" pr_diff.txt; then
        echo "⚠️ Security pattern detected: $pattern"
      fi
    done
```

## 🎨 Custom Prompts

### Enhanced PR Review Prompt
```markdown
You are a senior mobile app developer reviewing code for Will Counter, a React Native app focused on willpower tracking and personal development.

**Project Standards:**
- TypeScript strict mode enabled
- Functional components with hooks preferred
- Redux Toolkit for state management
- Auth0 for authentication with secure token handling
- Supabase for backend with RLS policies
- Offline-first architecture patterns
- Accessibility compliance (WCAG 2.1 AA)
- Performance optimization for older devices

**Code Review Checklist:**
□ Type safety and proper TypeScript usage
□ Error handling and edge cases
□ Performance implications for mobile
□ Accessibility considerations
□ Security best practices
□ Code organization and maintainability
□ Test coverage for new functionality
□ Documentation updates if needed

**Focus Areas by Component:**
- **Auth**: Token security, biometric integration, logout flows
- **Data**: Offline sync, caching strategies, RLS compliance
- **UI**: Performance, accessibility, responsive design
- **API**: Error handling, rate limiting, data validation

Please provide specific, actionable feedback with examples where possible.
```

### Custom Issue Analysis Prompt
```markdown
Analyze this issue for the Will Counter mobile app with these priorities:

**Business Impact Assessment:**
1. User Experience Impact (Critical/High/Medium/Low)
2. Feature Area Affected (Core counting, Auth, Data sync, UI/UX)
3. User Segment Impact (New users, Power users, All users)

**Technical Assessment:**
1. Implementation Complexity (1-5 scale)
2. Dependencies and Blockers
3. Testing Requirements
4. Performance Implications

**Prioritization Factors:**
- Core functionality > Nice-to-have features
- Security issues = Highest priority
- User onboarding issues = High priority
- Data integrity issues = High priority
- UI polish = Medium priority

Please categorize and provide implementation guidance.
```

## 📊 Monitoring and Analytics

### Workflow Success Tracking
```yaml
# Add success metrics tracking:
- name: Track workflow metrics
  run: |
    echo "Claude API calls: ${{ steps.claude-api.outputs.api_calls }}"
    echo "Review length: $(wc -w < claude_review.md) words"
    echo "Security alerts: ${{ steps.check-critical.outputs.alerts_count }}"
```

### Cost Monitoring
```yaml
# Monitor API usage and costs:
- name: Log API usage
  run: |
    echo "Tokens used: estimated $(wc -w < claude_prompt.txt) input tokens"
    echo "Model used: claude-3-haiku-20240307"
    echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

## 🔧 Troubleshooting Configuration

### Debug Mode
```yaml
# Add debug steps to workflows:
- name: Debug workflow
  if: env.DEBUG == 'true'
  run: |
    echo "GitHub context:"
    echo "${{ toJson(github) }}"
    echo "Files changed:"
    cat changed_files.txt
    echo "Prompt length: $(wc -c < claude_prompt.txt) characters"
```

### Fallback Behavior
```yaml
# Handle API failures gracefully:
- name: Handle Claude API failure
  if: failure()
  run: |
    echo "Claude API unavailable. Posting fallback comment."
    cat > fallback_comment.md << 'EOF'
    ## 🤖 Claude Review Unavailable
    
    The automated Claude review could not be completed due to API issues.
    Please ensure manual review covers:
    - [ ] Code quality and best practices
    - [ ] Security considerations
    - [ ] Performance implications
    - [ ] Test coverage
    EOF
```

## 📝 Testing Configuration

### Test Workflows Locally
```bash
# Use act to test workflows locally:
npm install -g @github/act

# Test PR review workflow:
act pull_request -s ANTHROPIC_API_KEY=your-test-key

# Test issue analysis workflow:
act issues -s ANTHROPIC_API_KEY=your-test-key
```

### Validate Workflow Syntax
```bash
# Use GitHub CLI to validate workflow files:
gh workflow view claude-pr-review.yml
gh workflow view claude-issue-analysis.yml
gh workflow view claude-docs-update.yml
```

---

*These configuration examples can be adapted to your specific needs and requirements. Always test changes in a development environment first.*