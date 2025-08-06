# How to Use the Will Counter Prompts

## Overview
This guide explains how to use the enhanced Claude prompt system for Will Counter development. We now have both legacy prompts and a new enhanced template system for more effective AI assistance.

## 🚀 Quick Start

**New to prompts?** Start with the **[Prompt Engineering Guide](/docs/prompt-engineering-guide.md)** for comprehensive guidance.

**Need specific help?** Choose from the templates below based on your task.

## 📋 Enhanced Template System (Recommended)

### Core Templates
| Template | Purpose | When to Use |
|----------|---------|-------------|
| **[Feature Development](/docs/claude-prompts/workflows/feature-development.md)** | End-to-end feature implementation | Building new functionality from concept to deployment |
| **[Code Review](/docs/claude-prompts/templates/code-review-template.md)** | Comprehensive code analysis | Reviewing PRs or getting feedback on code quality |
| **[Requirements Gathering](/docs/claude-prompts/templates/requirements-gathering.md)** | Feature analysis and planning | Planning new features or clarifying requirements |
| **[Debugging](/docs/claude-prompts/templates/debugging-template.md)** | Systematic troubleshooting | Investigating crashes, performance issues, or bugs |

### Code Generation Templates
| Template | Generates | Use Case |
|----------|-----------|----------|
| **[React Native Component](/docs/claude-prompts/code-generation/react-native/component-template.md)** | Complete TypeScript components | Creating new UI components with tests and styling |
| **[Kotlin API Endpoint](/docs/claude-prompts/code-generation/kotlin-ktor/api-endpoint.md)** | RESTful API endpoints | Adding new backend functionality with proper validation |

### Automation Tools
| Tool | Purpose | Benefit |
|------|---------|---------|
| **[Checklist Generator](/docs/claude-prompts/automation/checklist-generator.md)** | Convert analysis into tasks | Track implementation progress systematically |

## 📚 Legacy Prompts (Still Available)

### Migration and Setup Prompts
| Prompt | Purpose | When to Use |
|--------|---------|-------------|
| **[Supabase Migration](/docs/claude-supabase-migration-prompt.md)** | Migrate API from H2 to Supabase | Connect API to Supabase instead of H2 in-memory database |
| **[Frontend API Integration](/docs/claude-frontend-api-integration-prompt.md)** | Replace mock data with real API calls | Connect frontend to real API endpoints |
| **[Auth0 & RLS Implementation](/docs/claude-auth0-rls-prompt.md)** | Implement Auth0 authentication and Row Level Security | Add user authentication and secure data access |
| **[Auth0 NativeModule Fix](/docs/claude-auth0-native-module-fix-prompt.md)** | Fix Auth0 native module errors | Resolve NativeModule errors during Auth0 login |

## 🎯 How to Use the Enhanced System

### **Step 1: Choose the Right Template**
**For most tasks**, use the enhanced templates:

| What You Want to Do | Use This Template |
|---------------------|------------------|
| **Plan new feature** | [Feature Development Workflow](/docs/claude-prompts/workflows/feature-development.md) |
| **Review code** | [Code Review Template](/docs/claude-prompts/templates/code-review-template.md) |
| **Create React Native component** | [Component Generator](/docs/claude-prompts/code-generation/react-native/component-template.md) |
| **Build API endpoint** | [API Endpoint Generator](/docs/claude-prompts/code-generation/kotlin-ktor/api-endpoint.md) |
| **Fix bugs** | [Debugging Template](/docs/claude-prompts/templates/debugging-template.md) |
| **Convert analysis to tasks** | [Checklist Generator](/docs/claude-prompts/automation/checklist-generator.md) |

**For specific migration tasks**, use legacy prompts:

| Migration Task | Use This Prompt |
|----------------|-----------------|
| Connect API to Supabase | [Supabase Migration](/docs/claude-supabase-migration-prompt.md) |
| Replace mock data with real API | [Frontend API Integration](/docs/claude-frontend-api-integration-prompt.md) |
| Add Auth0 authentication | [Auth0 & RLS](/docs/claude-auth0-rls-prompt.md) |
| Fix Auth0 login errors | [Auth0 NativeModule Fix](/docs/claude-auth0-native-module-fix-prompt.md) |

### **Step 2: Customize the Template**
1. **Copy the template content**
2. **Fill in your specific context**:
   - Replace `[placeholders]` with actual values
   - Add your code snippets or error messages
   - Include relevant file paths
   - Specify your requirements

### **Step 3: Send to Claude**
1. **Paste the customized prompt** into Claude
2. **Include additional context** if needed
3. **Ask follow-up questions** for clarification
4. **Iterate** based on Claude's response

### **Step 4: Use Automation Tools**
1. **Generate checklists** from Claude's analysis
2. **Track progress** with structured task lists
3. **Update documentation** based on implementation
4. **Share learnings** with the team

## 📚 Legacy Prompts Usage

### **Step 2: Copy the Prompt Content**
```bash
# View the prompt content
cat docs/[prompt-filename].md

# Or open in your editor
code docs/[prompt-filename].md
```

### **Step 3: Send to Claude**
1. **Copy the entire content** of the prompt file
2. **Paste it into Claude** (any AI assistant)
3. **Add your specific context** if needed
4. **Ask Claude to implement** the changes

### **Step 4: Follow Implementation**
Claude will provide step-by-step instructions to:
- Modify specific files
- Install dependencies
- Configure settings
- Test the implementation

## Example Usage

### **Example 1: Setting up Supabase**
```bash
# 1. Copy the prompt
cat docs/claude-supabase-migration-prompt.md

# 2. Paste to Claude with context:
"Please help me implement this. My current setup is:
- API: Kotlin/Ktor with H2 database
- Frontend: React Native/Expo
- Target: Connect to Supabase PostgreSQL"
```

### **Example 2: Fixing Auth0 Errors**
```bash
# 1. Copy the fix prompt
cat docs/claude-auth0-native-module-fix-prompt.md

# 2. Paste to Claude with your error:
"Please fix this Auth0 error. I'm getting:
ERROR Login failed: [Error: Missing NativeModule...]"
```

## Prompt Structure

Each prompt follows this structure:

### **1. Context Section**
- Explains what the prompt is for
- Describes the current state
- Lists prerequisites

### **2. Required Changes**
- Specific files to modify
- Code examples to implement
- Configuration steps

### **3. Implementation Steps**
- Step-by-step instructions
- Commands to run
- Files to create/modify

### **4. Testing Instructions**
- How to verify the implementation
- Expected outcomes
- Troubleshooting tips

## Best Practices

### **Before Using a Prompt:**
1. **Backup your code** (commit to git)
2. **Read the entire prompt** first
3. **Check prerequisites** are met
4. **Understand the changes** that will be made

### **During Implementation:**
1. **Follow steps in order**
2. **Test after each major step**
3. **Keep your API running** if needed
4. **Check console logs** for errors

### **After Implementation:**
1. **Test the complete flow**
2. **Verify data in Supabase** (if applicable)
3. **Check authentication** (if applicable)
4. **Commit working changes** to git

## Troubleshooting

### **If a Prompt Doesn't Work:**
1. **Check your current setup** matches the prompt's assumptions
2. **Verify all prerequisites** are met
3. **Look for error messages** in console/logs
4. **Try a simpler approach** first

### **If You Need Help:**
1. **Share the specific error** you're getting
2. **Include your current code** state
3. **Mention which prompt** you used
4. **Describe what step** failed

## Customizing Prompts

### **To Modify a Prompt:**
1. **Copy the prompt file**
2. **Edit for your specific needs**
3. **Add your project details**
4. **Include specific requirements**

### **Example Customization:**
```markdown
# Original prompt content...

## My Specific Requirements:
- My API runs on port 9000 (not 8080)
- I'm using a different Auth0 domain
- My Supabase project has a different URL

## Modified Steps:
1. Update API_BASE_URL to http://localhost:9000
2. Use my Auth0 domain: myapp.auth0.com
3. Use my Supabase URL: https://myproject.supabase.co
```

## Quick Reference

### **Common Commands:**
```bash
# View all prompts
ls docs/claude-*.md

# Copy prompt to clipboard (macOS)
cat docs/claude-supabase-migration-prompt.md | pbcopy

# Copy prompt to clipboard (Linux)
cat docs/claude-supabase-migration-prompt.md | xclip -selection clipboard

# Search for specific prompt
grep -r "Auth0" docs/
```

### **File Locations:**
- **Prompts**: `docs/claude-*.md`
- **API Code**: `api/src/main/kotlin/`
- **Frontend Code**: `frontend/src/`
- **Configuration**: `.env` files

## Next Steps

### **For Comprehensive Guidance**
📚 **Read the [Prompt Engineering Guide](/docs/prompt-engineering-guide.md)** for in-depth strategies, best practices, and advanced techniques.

### **Getting Started**
1. **Choose the appropriate template** based on your task
2. **Customize with your specific context** and requirements
3. **Send to Claude** and follow the structured guidance
4. **Use automation tools** to track progress and generate checklists
5. **Iterate and improve** your prompts based on results

### **Template Progression**
- **Start Simple**: Use basic templates for straightforward tasks
- **Add Complexity**: Combine templates for complex workflows
- **Create Custom**: Develop project-specific prompt variations
- **Share Learnings**: Contribute improvements back to the team

### **Integration with Development Workflow**
- **Planning**: Use requirements and feature development templates
- **Implementation**: Leverage code generation templates
- **Review**: Apply code review templates systematically
- **Debugging**: Follow structured troubleshooting approaches
- **Documentation**: Update guides based on successful implementations

Remember: Effective AI assistance comes from clear, specific prompts with comprehensive context. The enhanced template system provides the structure, you provide the specifics! 