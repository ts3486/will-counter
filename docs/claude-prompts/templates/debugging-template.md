# Claude Prompt Template: Debugging & Troubleshooting

## 🎯 Purpose
Get systematic debugging assistance from Claude for Will Counter app issues including crashes, performance problems, and integration failures.

## 📋 Template

Copy and customize this template before sending to Claude:

---

**ROLE**: You are a senior mobile app debugging specialist with expertise in React Native, Kotlin/Ktor, and Supabase integration. Help me systematically investigate and resolve issues in the Will Counter application.

**PROJECT CONTEXT**:
- **App**: Will Counter - mobile app for tracking willpower exercises
- **Tech Stack**: React Native/Expo frontend, Kotlin/Ktor API, Supabase PostgreSQL
- **Architecture**: Redux state management, Auth0 authentication, offline-first design
- **Platforms**: iOS and Android with cross-platform components

**DEBUGGING ENVIRONMENT**:
- **Development Setup**: [Local dev/Staging/Production]
- **Devices Tested**: [iOS Simulator, Android Emulator, Physical devices]
- **Current Version**: [App version and build number]
- **Last Working State**: [When did this work correctly?]

**DOCUMENTATION REFERENCES**:
- Error Logs: [Relevant log files or console output]
- App Architecture: `/will-counter/README.md`
- API Documentation: `/will-counter/api/README.md`
- Component Structure: `/will-counter/frontend/src/components/`
- Database Schema: `/will-counter/shared/database/schema.sql`

## ISSUE DESCRIPTION

**Issue Type**: [Choose one]
- [ ] **App Crash** - Application terminates unexpectedly
- [ ] **Performance Issue** - Slow loading, lag, or memory problems
- [ ] **UI Bug** - Visual or interaction problems
- [ ] **API Integration** - Backend communication failures
- [ ] **Database Issue** - Data persistence or retrieval problems
- [ ] **Authentication** - Auth0 login or session problems
- [ ] **Offline Sync** - Data synchronization failures

**Issue Summary**: 
[Brief description of what's happening vs. what should happen]

**Reproduction Steps**:
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Issue occurs]

**Expected Behavior**: 
[What should happen instead]

**Actual Behavior**: 
[What actually happens]

**Frequency**: 
- [ ] Always happens
- [ ] Happens sometimes (X% of the time)
- [ ] Happened once
- [ ] Only on specific devices/conditions

**Error Messages**: 
```
[Paste exact error messages, stack traces, or console output]
```

**Affected Code Areas**: 
[Specific files, components, or functions you suspect]

## DEBUGGING CONTEXT

### Environment Details
**Frontend**:
- React Native Version: [Version]
- Expo SDK: [Version]
- Running on: [iOS/Android/Both]
- Device: [Specific device models and OS versions]

**Backend** (if relevant):
- Kotlin Version: [Version]
- Ktor Version: [Version]
- Database: Supabase PostgreSQL
- Deployment: [Local/Staging/Production]

**Network**:
- Internet connectivity: [Online/Offline/Intermittent]
- API endpoint: [Which API calls are failing]
- Authentication status: [Logged in/out/expired]

### Recent Changes
**Code Changes**: 
[Any recent commits, PRs, or updates that might be related]

**Environment Changes**: 
[Package updates, configuration changes, deployment changes]

**External Factors**: 
[Third-party service issues, device updates, network changes]

## DEBUGGING ASSISTANCE REQUESTED

Please help me with:

### 🔍 Issue Analysis
- [ ] **Root Cause Investigation**: Systematic analysis of potential causes
- [ ] **Error Pattern Analysis**: Understanding error frequency and conditions
- [ ] **Code Review**: Examine suspect code areas for issues
- [ ] **Architecture Analysis**: Check if issue relates to overall design

### 🧪 Debugging Strategy
- [ ] **Reproduction Plan**: Reliable steps to reproduce the issue
- [ ] **Isolation Techniques**: Narrow down the problem area
- [ ] **Logging Strategy**: What additional logging to add
- [ ] **Testing Approach**: How to validate the fix

### 🛠️ Solution Development
- [ ] **Fix Implementation**: Specific code changes needed
- [ ] **Alternative Approaches**: Different ways to solve the problem
- [ ] **Prevention Measures**: How to avoid similar issues
- [ ] **Testing Plan**: Validate the solution works

### 📊 Performance Analysis (if performance issue)
- [ ] **Memory Usage**: Check for memory leaks or excessive usage
- [ ] **CPU Performance**: Identify bottlenecks and optimization opportunities
- [ ] **Network Efficiency**: Optimize API calls and data transfer
- [ ] **Rendering Performance**: React Native rendering optimization

## SPECIFIC FOCUS AREAS

### For React Native Issues:
- Component lifecycle and state management
- Redux store issues and async operations
- Navigation and screen transitions
- Platform-specific code (iOS vs Android)
- Third-party library integration
- Bundle size and loading performance

### For API/Backend Issues:
- HTTP request/response handling
- Database query performance
- Authentication and authorization
- Error handling and status codes
- Concurrent request handling
- Environment configuration

### For Database Issues:
- Query performance and indexing
- Row Level Security policies
- Data migration and schema issues
- Connection pooling and timeouts
- Backup and recovery

### For Auth0 Integration:
- JWT token validation
- User profile synchronization
- Session management
- Login/logout flows
- Permission and role handling

## OUTPUT FORMAT

Please provide debugging assistance in this format:

### 🎯 Issue Analysis
**Likely Root Cause**: [Primary hypothesis about what's causing the issue]
**Contributing Factors**: [Secondary factors that might be involved]
**Affected Systems**: [Which parts of the app are impacted]

### 🔬 Debugging Plan
**Phase 1: Information Gathering**
- [ ] [Specific step 1 - what to check or measure]
- [ ] [Specific step 2 - additional logging to add]
- [ ] [Specific step 3 - test scenarios to run]

**Phase 2: Issue Isolation**
- [ ] [Step to narrow down the problem]
- [ ] [Method to test specific hypothesis]
- [ ] [Way to eliminate potential causes]

**Phase 3: Solution Implementation**
- [ ] [Specific fix to implement]
- [ ] [Code changes required]
- [ ] [Configuration updates needed]

### 💻 Code Analysis
**Suspect Code Areas**:
```typescript
// Identify problematic code patterns
// Highlight potential issues
// Suggest improvements
```

**Recommended Changes**:
```typescript
// Show specific code fixes
// Include error handling improvements
// Add performance optimizations
```

### 🧪 Testing Strategy
**Unit Tests**: [Tests to verify individual components work]
**Integration Tests**: [Tests to verify system interaction]
**Manual Testing**: [Specific scenarios to test manually]
**Performance Tests**: [Metrics to measure and validate]

### 📝 Implementation Checklist
- [ ] **Immediate Fix**: [Quick solution to stop the issue]
- [ ] **Root Cause Fix**: [Comprehensive solution]
- [ ] **Prevention**: [Changes to prevent recurrence]
- [ ] **Monitoring**: [Add logging/alerts for early detection]
- [ ] **Documentation**: [Update docs to reflect changes]

### 🚨 Risk Assessment
**Fix Complexity**: [Simple/Medium/Complex]
**Potential Side Effects**: [What else might be affected]
**Testing Requirements**: [How thoroughly to test]
**Rollback Plan**: [How to undo changes if needed]

### 📊 Success Metrics
**How to Validate Fix**:
- [ ] Issue no longer reproduces in test scenarios
- [ ] Performance metrics within acceptable ranges
- [ ] No new issues introduced
- [ ] User experience improved

---

**CONSTRAINTS**:
- Fix should not break existing functionality
- Must work on both iOS and Android
- Should maintain offline-first architecture
- Must preserve user data integrity
- Should follow existing code patterns

## 🔄 Follow-up Process

After receiving debugging guidance:

1. **Implement Suggested Logging**: Add debugging information
2. **Reproduce with Better Data**: Follow reproduction plan
3. **Test Hypotheses**: Validate suspected causes
4. **Implement Fix**: Apply recommended solution
5. **Validate Solution**: Confirm issue is resolved
6. **Monitor for Recurrence**: Watch for similar issues

## 📚 Related Documentation

- [Error Handling Patterns](/docs/error-handling.md) [if exists]
- [Performance Guidelines](/docs/performance.md) [if exists]
- [Testing Strategy](/docs/testing.md) [if exists]
- [Deployment Guide](/docs/deployment.md) [if exists]
- [Monitoring and Alerts](/docs/monitoring.md) [if exists]

## 💡 Debugging Tips

### Effective Bug Reports
1. **Be Specific**: Include exact error messages and steps
2. **Provide Context**: Environment details and recent changes
3. **Include Screenshots**: Visual issues need visual evidence
4. **Test Across Platforms**: Check if issue is platform-specific
5. **Document Attempts**: What you've already tried

### Common Will Counter Issues

#### Authentication Problems
- Check Auth0 token expiration
- Verify JWT validation in API
- Confirm user profile synchronization
- Test login/logout flows

#### Offline Sync Issues
- Validate AsyncStorage data
- Check network detection logic
- Verify sync queue processing
- Test conflict resolution

#### Performance Issues
- Profile React Native rendering
- Check Redux store size
- Analyze bundle size
- Monitor memory usage

#### Database Problems
- Review RLS policies
- Check query performance
- Validate data migration
- Test connection handling