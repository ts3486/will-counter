# How to Use the Will Counter Prompts

## Overview
This guide explains how to use the various prompts created for implementing features in your Will Counter application.

## Available Prompts

### 1. **Supabase Setup Prompt**
**File**: `docs/claude-supabase-migration-prompt.md`
**Purpose**: Migrate API from H2 to Supabase database
**When to use**: When you want to connect your API to Supabase instead of H2 in-memory database

### 2. **Frontend API Integration Prompt**
**File**: `docs/claude-frontend-api-integration-prompt.md`
**Purpose**: Replace mock data with real API calls
**When to use**: When you want your frontend to call real API endpoints instead of using mock data

### 3. **Auth0 & RLS Implementation Prompt**
**File**: `docs/claude-auth0-rls-prompt.md`
**Purpose**: Implement Auth0 authentication and Row Level Security
**When to use**: When you want to add user authentication and secure data access

### 4. **Auth0 NativeModule Fix Prompt**
**File**: `docs/claude-auth0-native-module-fix-prompt.md`
**Purpose**: Fix Auth0 native module errors in React Native/Expo
**When to use**: When you get NativeModule errors during Auth0 login

## How to Use These Prompts

### **Step 1: Choose the Right Prompt**
Based on what you want to implement:

| What You Want to Do | Use This Prompt |
|---------------------|-----------------|
| Connect API to Supabase | `claude-supabase-migration-prompt.md` |
| Replace mock data with real API | `claude-frontend-api-integration-prompt.md` |
| Add Auth0 authentication | `claude-auth0-rls-prompt.md` |
| Fix Auth0 login errors | `claude-auth0-native-module-fix-prompt.md` |

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

1. **Choose the prompt** you need
2. **Copy and paste** to Claude
3. **Follow the implementation** steps
4. **Test your changes**
5. **Move to the next feature** if needed

Remember: These prompts are designed to be self-contained and provide everything needed for successful implementation! 