# Claude Prompt Template: Code Review

## 🎯 Purpose
Get comprehensive, actionable code reviews from Claude for Will Counter development with focus on TypeScript, React Native, Kotlin, and Supabase integration.

## 📋 Template

Copy and customize this template before sending to Claude:

---

**ROLE**: You are a senior full-stack developer specializing in React Native, TypeScript, Kotlin/Ktor, and Supabase. Review my code for the Will Counter application.

**PROJECT CONTEXT**:
- **App**: Will Counter - mobile app for tracking willpower exercises
- **Tech Stack**: React Native/Expo frontend, Kotlin/Ktor API, Supabase PostgreSQL
- **Architecture**: Redux for state management, Auth0 for authentication, Row Level Security
- **Repository**: [Include specific file paths being reviewed]

**DOCUMENTATION REFERENCES**:
- Project README: `/will-counter/README.md`
- API Documentation: `/will-counter/docs/`
- Database Schema: `/will-counter/shared/database/schema.sql`
- Frontend Architecture: `/will-counter/frontend/src/`
- Backend Architecture: `/will-counter/api/src/main/kotlin/`

## CODE TO REVIEW

**File(s)**: [Specify exact file paths]
**Branch/PR**: [Specify branch or PR number]
**Change Type**: [New feature/Bug fix/Refactor/Performance]

```[language]
[PASTE YOUR CODE HERE]
```

**Context**: [Explain what this code is supposed to do]

## REVIEW FOCUS AREAS

Please review for:

### 🔍 Functional Requirements
- [ ] **Correctness**: Does the code do what it's supposed to do?
- [ ] **Business Logic**: Aligns with Will Counter requirements
- [ ] **Edge Cases**: Handles error scenarios appropriately
- [ ] **Data Integrity**: Proper validation and constraints

### 🏗️ Architecture & Design  
- [ ] **Component Design**: Follows React Native best practices
- [ ] **API Design**: RESTful endpoints with proper HTTP methods
- [ ] **Database Design**: Efficient queries and proper indexing
- [ ] **State Management**: Proper Redux patterns and immutability

### 🛡️ Security & Performance
- [ ] **Authentication**: Proper Auth0 integration and JWT handling
- [ ] **Authorization**: Row Level Security (RLS) implementation
- [ ] **SQL Injection**: Parameterized queries in Kotlin code
- [ ] **Performance**: Efficient database queries and React rendering

### 🔧 Code Quality
- [ ] **TypeScript**: Proper type safety and interfaces
- [ ] **Error Handling**: Comprehensive try/catch and user feedback
- [ ] **Testing**: Unit test coverage and test quality
- [ ] **Documentation**: Code comments and API documentation

### 📱 Mobile Specific
- [ ] **User Experience**: Intuitive mobile interactions
- [ ] **Offline Support**: Graceful offline/online state handling
- [ ] **Performance**: Smooth animations and fast loading
- [ ] **Accessibility**: Screen reader and accessibility support

## SPECIFIC QUESTIONS

[Add any specific questions about the code, e.g.:]
- Is this the best way to handle offline sync?
- Should I use a different Redux pattern here?
- Is this Kotlin code following best practices?
- Are there potential security issues?

## OUTPUT FORMAT

Please provide your review in this format:

### ✅ Strengths
[What's done well]

### ⚠️ Issues Found
[Critical issues that must be fixed]

### 💡 Suggestions  
[Improvements and optimizations]

### 🔧 Code Examples
[Specific code improvements with examples]

### 📝 Action Items
- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] [Specific task 3]

### 🧪 Testing Recommendations
[Specific tests to add or modify]

---

**CONSTRAINTS**: 
- Focus on Will Counter specific patterns and requirements
- Consider mobile-first development practices
- Ensure suggestions align with existing architecture
- Provide actionable, specific feedback with code examples

## 🔄 Follow-up Actions

After receiving the review:

1. **Create Issues**: Convert action items into GitHub issues
2. **Update Code**: Implement suggested improvements
3. **Add Tests**: Follow testing recommendations
4. **Document**: Update relevant documentation
5. **Re-review**: Submit updated code for additional review if needed

## 📚 Related Documentation

- [Feature Requirements](/docs/product-requirements/README.md)
- [System Architecture](/docs/system-requirements/README.md) 
- [Implementation Plan](/docs/implementation-plan-checklist/README.md)
- [API Integration Guide](/docs/claude-frontend-api-integration-prompt.md)
- [Database Schema](/shared/database/schema.sql)

## 💡 Tips for Better Reviews

1. **Be Specific**: Include exact file paths and line numbers
2. **Provide Context**: Explain the purpose and requirements
3. **Include Tests**: Share related test files for comprehensive review
4. **Ask Questions**: Don't hesitate to ask for clarification
5. **Iterate**: Use reviews for learning and continuous improvement