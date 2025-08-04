# Claude Prompts Directory

This directory contains enhanced Claude prompts and templates for efficient AI-assisted development of the Will Counter application.

## Directory Structure

```
claude-prompts/
├── README.md                           # This file
├── templates/                          # Reusable prompt templates
│   ├── code-review-template.md         # Code review prompts
│   ├── requirements-gathering.md       # Requirements analysis
│   ├── debugging-template.md           # Debugging assistance
│   └── testing-template.md             # Test generation
├── code-generation/                    # Code generation templates
│   ├── react-native/                   # React Native patterns
│   ├── kotlin-ktor/                    # Kotlin/Ktor patterns
│   └── supabase/                       # Database patterns
├── workflows/                          # Complete workflow prompts
│   ├── feature-development.md          # End-to-end feature development
│   ├── bug-fix-workflow.md             # Bug investigation and fixing
│   └── api-integration.md              # API integration workflow
└── automation/                         # Automation helpers
    ├── checklist-generator.md          # Generate implementation checklists
    └── progress-tracker.md             # Track development progress
```

## Quick Start

1. **Choose the right template** based on your task:
   - Code review → `templates/code-review-template.md`
   - New feature → `workflows/feature-development.md`
   - Bug fixing → `workflows/bug-fix-workflow.md`
   - Code generation → `code-generation/{technology}/`

2. **Copy the template** and customize with your specific context
3. **Paste into Claude** and follow the structured guidance
4. **Use automation tools** to track progress and generate checklists

## Enhanced Features

### 🎯 Precise Context
- Technology-specific templates
- Project structure awareness
- Clear role definitions for Claude

### 📚 Documentation Links
- Direct references to project docs
- Architecture diagrams
- API specifications

### 🔄 Automated Workflows
- Checklist generation from Claude output
- Progress tracking templates
- Implementation verification steps

### 🛠️ Code Generation
- Boilerplate templates for common patterns
- Type-safe code generation
- Best practice implementations

## Usage Examples

### Code Review
```bash
# Copy the code review template
cat docs/claude-prompts/templates/code-review-template.md

# Customize with your PR details and paste to Claude
```

### Feature Development
```bash
# Use the complete feature workflow
cat docs/claude-prompts/workflows/feature-development.md

# Follow the step-by-step guidance
```

### Code Generation
```bash
# Generate React Native component
cat docs/claude-prompts/code-generation/react-native/component-template.md

# Generate Kotlin API endpoint
cat docs/claude-prompts/code-generation/kotlin-ktor/api-endpoint.md
```

## Best Practices

1. **Always specify project context** - Include relevant file paths and current state
2. **Use structured templates** - Follow the provided formats for consistency
3. **Link to documentation** - Reference specific docs and requirements
4. **Track progress** - Use checklist automation for complex tasks
5. **Iterate and improve** - Update templates based on experience

## Migration from Legacy Prompts

Legacy prompts in `/docs/` are preserved for compatibility:
- `claude-prompt.md` → Use `workflows/feature-development.md`
- `claude-supabase-migration-prompt.md` → Use `workflows/api-integration.md`
- `claude-frontend-api-integration-prompt.md` → Use `workflows/api-integration.md`

The new templates provide enhanced structure and automation features.