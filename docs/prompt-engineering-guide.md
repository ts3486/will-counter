# Prompt Engineering Guide for Will Counter Development

## 🎯 Overview

This guide provides comprehensive strategies for using Claude AI effectively in Will Counter development. Learn how to create precise prompts, automate workflows, and maximize AI assistance for mobile app development.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Prompt Engineering Principles](#prompt-engineering-principles)
3. [Project-Specific Context](#project-specific-context)
4. [Template Library](#template-library)
5. [Automation Workflows](#automation-workflows)
6. [Best Practices](#best-practices)
7. [Common Use Cases](#common-use-cases)
8. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Choose Your Prompt Type

| Development Task | Recommended Template |
|------------------|---------------------|
| **New Feature** | [Feature Development Workflow](/docs/claude-prompts/workflows/feature-development.md) |
| **Code Review** | [Code Review Template](/docs/claude-prompts/templates/code-review-template.md) |
| **Requirements Analysis** | [Requirements Gathering](/docs/claude-prompts/templates/requirements-gathering.md) |
| **React Native Component** | [Component Generator](/docs/claude-prompts/code-generation/react-native/component-template.md) |
| **Kotlin API Endpoint** | [API Endpoint Generator](/docs/claude-prompts/code-generation/kotlin-ktor/api-endpoint.md) |
| **Bug Investigation** | [Debugging Template](/docs/claude-prompts/templates/debugging-template.md) |

### Basic Usage Pattern

1. **Copy template** → Customize context → Send to Claude
2. **Receive structured response** → Follow implementation steps
3. **Use checklist automation** → Track progress
4. **Iterate and improve** → Update templates

## 🧠 Prompt Engineering Principles

### 1. Clear Role Definition
Always start with a specific role for Claude:

```markdown
**ROLE**: You are a senior React Native developer specializing in TypeScript and Redux, working on the Will Counter mobile application.
```

**Good Examples**:
- "Senior full-stack developer specializing in React Native and Kotlin"
- "Product manager with expertise in mobile UX and user research"
- "DevOps engineer focused on React Native deployment and CI/CD"

**Avoid**:
- Generic "developer" or "assistant" roles
- Unclear expertise areas

### 2. Comprehensive Context
Provide all relevant project information:

```markdown
**PROJECT CONTEXT**:
- **App**: Will Counter - mobile app for tracking willpower exercises
- **Tech Stack**: React Native/Expo, Kotlin/Ktor, Supabase PostgreSQL
- **Architecture**: Redux state management, Auth0 authentication
- **Current State**: [Specific current implementation details]
```

### 3. Documentation References
Always link to relevant documentation:

```markdown
**DOCUMENTATION REFERENCES**:
- Project README: `/will-counter/README.md`
- API Docs: `/will-counter/docs/`
- Database Schema: `/will-counter/shared/database/schema.sql`
- Component Library: `/will-counter/frontend/src/components/`
```

### 4. Specific Output Format
Define exactly what you want Claude to produce:

```markdown
## OUTPUT FORMAT

Please provide:
1. **Analysis Summary** - Overview of the problem
2. **Implementation Steps** - Specific actionable tasks
3. **Code Examples** - Working code snippets
4. **Testing Strategy** - How to validate the solution
5. **Checklist** - Trackable task list
```

### 5. Constraints and Requirements
Be explicit about limitations and requirements:

```markdown
**CONSTRAINTS**:
- Must work offline with online sync
- Should maintain sub-second response times
- Must support iOS 14+ and Android 8+
- Should follow existing Redux patterns
- Must include comprehensive TypeScript types
```

## 🎯 Project-Specific Context

### Will Counter Architecture Context
Include this context block in all prompts:

```markdown
**WILL COUNTER ARCHITECTURE**:

**Frontend** (React Native/Expo):
- State: Redux Toolkit with RTK Query
- Navigation: React Navigation v6
- Styling: StyleSheet with responsive design
- Auth: Auth0 React Native SDK
- Storage: AsyncStorage + MMKV for offline

**Backend** (Kotlin/Ktor):
- Framework: Ktor with Exposed ORM
- Database: Supabase PostgreSQL
- Auth: Auth0 JWT validation
- API: RESTful JSON endpoints

**Database** (Supabase):
- PostgreSQL with Row Level Security
- Real-time subscriptions
- User data isolation
- Automated backups
```

### Tech Stack Specific Patterns

#### React Native Patterns
```markdown
**REACT NATIVE PATTERNS TO FOLLOW**:
- Components in `/frontend/src/components/{category}/{Name}/`
- Hooks in `/frontend/src/hooks/`
- Types in `/frontend/src/types/`
- Redux slices with createAsyncThunk
- StyleSheet with responsive design
- Accessibility with proper labels
```

#### Kotlin/Ktor Patterns
```markdown
**KOTLIN/KTOR PATTERNS TO FOLLOW**:
- Routes in `/api/src/main/kotlin/com/willcounter/api/routes/`
- Services for business logic
- DTOs for request/response objects
- Exposed ORM for database operations
- ApiResponse wrapper for consistent responses
```

### Database Schema Context
```markdown
**DATABASE SCHEMA**:
- `users` table: Auth0 integration with user profiles
- `will_counts` table: Daily count tracking with timestamps
- Row Level Security: User data isolation
- Indexes: Optimized for user queries
- Functions: get_or_create_today_count, increment_will_count
```

## 📋 Template Library

### Core Templates

#### 1. Feature Development Template
**Purpose**: End-to-end feature development  
**File**: `/docs/claude-prompts/workflows/feature-development.md`  
**Use When**: Building new functionality from concept to deployment

#### 2. Code Review Template  
**Purpose**: Comprehensive code reviews  
**File**: `/docs/claude-prompts/templates/code-review-template.md`  
**Use When**: Reviewing PRs or getting feedback on code quality

#### 3. Requirements Gathering Template
**Purpose**: Analyze and document feature requirements  
**File**: `/docs/claude-prompts/templates/requirements-gathering.md`  
**Use When**: Planning new features or clarifying requirements

### Code Generation Templates

#### React Native Components
```markdown
**Template**: /docs/claude-prompts/code-generation/react-native/component-template.md
**Generates**: Complete React Native components with TypeScript
**Includes**: Props interfaces, styling, tests, accessibility
```

#### Kotlin API Endpoints
```markdown
**Template**: /docs/claude-prompts/code-generation/kotlin-ktor/api-endpoint.md
**Generates**: RESTful API endpoints with proper validation
**Includes**: Routes, services, DTOs, error handling
```

#### Supabase Database Patterns
```markdown
**Template**: /docs/claude-prompts/code-generation/supabase/schema-template.md
**Generates**: Database schemas with RLS policies
**Includes**: Tables, indexes, functions, security policies
```

### Workflow Templates

#### Bug Fix Workflow
```markdown
**Purpose**: Systematic bug investigation and fixing
**Phases**: Investigation → Root cause → Fix → Testing → Prevention
**Output**: Step-by-step debugging guide with solution
```

#### Performance Optimization
```markdown
**Purpose**: Identify and fix performance issues
**Focus**: Database queries, React Native rendering, bundle size
**Output**: Optimization plan with metrics and validation
```

## 🔄 Automation Workflows

### 1. Checklist Generation
Convert any Claude analysis into actionable checklists:

```markdown
Input: Claude's feature analysis or recommendations
Process: /docs/claude-prompts/automation/checklist-generator.md
Output: GitHub-ready checklists with time estimates and dependencies
```

### 2. Progress Tracking
Track implementation progress automatically:

```markdown
Template: /docs/claude-prompts/automation/progress-tracker.md
Features: Time tracking, milestone validation, team communication
Integration: GitHub issues, project boards, Slack notifications
```

### 3. Documentation Generation
Auto-generate documentation from code:

```markdown
Input: Code files or implementation details
Process: Documentation template prompts
Output: README updates, API docs, user guides
```

## 🛠️ Best Practices

### Prompt Construction

#### 1. Start with Context
```markdown
✅ Good:
**ROLE**: Senior React Native developer working on Will Counter app
**CONTEXT**: Building user profile screen with Auth0 integration
**CURRENT STATE**: Basic auth working, need to add profile editing

❌ Bad:
Help me build a user profile screen
```

#### 2. Be Specific About Output
```markdown
✅ Good:
Generate a TypeScript React Native component with:
- Props interface with full type safety
- StyleSheet with responsive design
- Unit tests with React Testing Library
- Accessibility labels for screen readers

❌ Bad:
Create a component for user profiles
```

#### 3. Include Relevant Files
```markdown
✅ Good:
**CURRENT IMPLEMENTATION**:
```typescript
// Paste relevant existing code
```
**FILES TO MODIFY**: 
- /frontend/src/components/user/UserProfile.tsx
- /frontend/src/types/user.ts

❌ Bad:
Look at my user component and improve it
```

### Response Processing

#### 1. Validate Suggestions
- Check against project architecture
- Verify TypeScript compatibility
- Ensure mobile best practices
- Confirm accessibility requirements

#### 2. Adapt to Project Patterns
- Match existing code style
- Follow established naming conventions
- Use project-specific utilities
- Integrate with current state management

#### 3. Test Incrementally
- Implement in small chunks
- Test each component separately
- Validate integration points
- Check on both iOS and Android

## 🎯 Common Use Cases

### 1. New Feature Development

**Scenario**: Adding a statistics dashboard

**Prompt Strategy**:
1. Start with requirements gathering template
2. Use feature development workflow
3. Generate components and API endpoints
4. Create implementation checklist
5. Track progress with automation

**Templates Used**:
- Requirements gathering
- Feature development workflow
- React Native component generator
- Kotlin API endpoint generator
- Checklist automation

### 2. Bug Investigation

**Scenario**: App crashes on specific user action

**Prompt Strategy**:
1. Use debugging template with error details
2. Get systematic investigation plan
3. Generate test cases to reproduce
4. Create fix implementation
5. Validate solution thoroughly

**Templates Used**:
- Debugging template
- Testing template
- Code review template

### 3. Performance Optimization

**Scenario**: Slow app startup time

**Prompt Strategy**:
1. Performance analysis prompt
2. Generate profiling strategy
3. Get optimization recommendations
4. Create implementation plan
5. Set up monitoring

### 4. Code Review

**Scenario**: Large PR with new authentication flow

**Prompt Strategy**:
1. Use code review template
2. Focus on security and Auth0 integration
3. Check mobile UX patterns
4. Validate error handling
5. Generate test recommendations

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Generic Responses
**Problem**: Claude gives generic, non-project-specific advice
**Solution**: Add more project context and existing code examples

```markdown
❌ Generic prompt:
"Help me optimize my React Native app"

✅ Specific prompt:
"Optimize Will Counter React Native app startup time. Current implementation uses Redux with 5 slices, AsyncStorage for persistence, and Auth0 for authentication. App takes 3-4 seconds to load on Android devices."
```

#### 2. Incorrect Architecture Assumptions
**Problem**: Claude suggests patterns that don't fit the project
**Solution**: Include current architecture details and constraints

```markdown
**CURRENT ARCHITECTURE**:
- State: Redux Toolkit (not Context API)
- Navigation: React Navigation v6 (not Expo Router)
- Database: Supabase (not Firebase)
- Auth: Auth0 (not custom implementation)
```

#### 3. Missing Implementation Details
**Problem**: High-level advice without specific code
**Solution**: Request specific output format with code examples

```markdown
**OUTPUT REQUIRED**:
1. Complete TypeScript interfaces
2. Working React Native component code
3. Unit test examples
4. Step-by-step implementation guide
```

#### 4. Outdated Technology Suggestions
**Problem**: Claude suggests deprecated or incompatible libraries
**Solution**: Specify current versions and constraints

```markdown
**TECHNOLOGY CONSTRAINTS**:
- React Native 0.72+
- TypeScript 5.0+
- Node.js 18+
- Expo SDK 49+
- Kotlin 1.9+
```

### Prompt Optimization Checklist

Before sending any prompt:

- [ ] **Role defined**: Clear expertise area specified
- [ ] **Context provided**: Project details and current state
- [ ] **Documentation linked**: Relevant files and docs referenced  
- [ ] **Output format specified**: Clear expectations for response
- [ ] **Constraints listed**: Technical and business limitations
- [ ] **Examples included**: Current code or similar implementations

## 📊 Measuring Success

### Prompt Effectiveness Metrics

#### Response Quality
- Relevance to project architecture
- Specificity of recommendations
- Code quality and type safety
- Integration with existing patterns

#### Implementation Success
- Time from prompt to working code
- Number of revisions needed
- Test coverage achieved
- Performance impact

#### Team Adoption
- Frequency of template usage
- Team feedback on prompts
- Process improvement suggestions
- Documentation updates

### Continuous Improvement

#### Monthly Review Process
1. **Analyze prompt usage patterns**
2. **Collect team feedback on templates**
3. **Update templates based on learnings**
4. **Add new templates for common scenarios**
5. **Archive outdated or unused templates**

#### Template Evolution
- Track which templates are most effective
- Update based on project architecture changes
- Add new technology-specific templates
- Simplify overly complex templates

## 🔗 Integration with Development Workflow

### GitHub Integration
```markdown
**Issue Templates**: Link to relevant prompt templates
**PR Templates**: Include code review checklist
**Project Boards**: Use checklist automation for task tracking
**Documentation**: Auto-update from prompt outputs
```

### Development Process
```markdown
1. **Planning**: Use requirements gathering templates
2. **Implementation**: Generate code with templates
3. **Review**: Use code review templates
4. **Testing**: Follow testing templates
5. **Documentation**: Update with prompt outputs
```

### Team Collaboration
```markdown
**Shared Templates**: Team-specific customizations
**Best Practices**: Document successful prompt patterns
**Knowledge Sharing**: Regular template reviews
**Training**: Onboard new team members with guides
```

## 📚 Additional Resources

### Learning Materials
- [Claude AI Documentation](https://docs.anthropic.com/)
- [React Native Best Practices](https://reactnative.dev/)
- [Kotlin/Ktor Documentation](https://ktor.io/)
- [Supabase Documentation](https://supabase.com/docs)

### Will Counter Specific
- [Project Architecture](/docs/system-requirements/README.md)
- [API Documentation](/api/README.md)
- [Frontend Patterns](/frontend/src/README.md)
- [Database Schema](/shared/database/schema.sql)

## 🤝 Contributing to This Guide

### How to Improve Prompts
1. **Try templates** with real development tasks
2. **Collect feedback** from team members
3. **Document improvements** and successful patterns
4. **Submit updates** via pull requests
5. **Share learnings** with the team

### Template Creation Guidelines
- Follow established format patterns
- Include comprehensive context sections
- Provide clear output specifications
- Add relevant documentation links
- Test with actual development scenarios

---

**Remember**: Effective prompt engineering is an iterative process. Start with these templates, customize for your specific needs, and continuously improve based on results and team feedback.