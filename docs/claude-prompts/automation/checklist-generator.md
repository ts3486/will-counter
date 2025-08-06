# Claude Automation: Implementation Checklist Generator

## 🎯 Purpose
Automatically generate actionable implementation checklists from Claude's analysis and recommendations for Will Counter development.

## 📋 Template

Copy and customize this template before sending to Claude:

---

**ROLE**: You are a project management and development automation specialist. Convert development analysis into structured, actionable implementation checklists for the Will Counter project team.

**PROJECT CONTEXT**:
- **Team Size**: Small development team (1-3 developers)
- **Workflow**: GitHub issues and project boards
- **Development**: Feature branch workflow with PR reviews
- **Tracking**: Markdown checklists in issues and documentation

**CHECKLIST REQUIREMENTS**:
- Specific, actionable tasks
- Estimated time commitments
- Clear acceptance criteria
- Dependency relationships
- Priority levels

## INPUT TO PROCESS

**Source Material**: [Paste Claude's analysis, recommendations, or feature specification]

**Context Type**: [Choose one]
- [ ] Feature Development Plan
- [ ] Bug Fix Analysis  
- [ ] Code Review Recommendations
- [ ] Architecture Decisions
- [ ] Performance Optimization
- [ ] Security Enhancement

**Target Audience**: [Who will use this checklist]
- [ ] Frontend Developer
- [ ] Backend Developer
- [ ] Full-Stack Developer
- [ ] Product Manager
- [ ] QA Tester

## CHECKLIST GENERATION REQUEST

Please convert the source material into structured implementation checklists:

### 📋 Main Implementation Checklist
Break down into phases with specific tasks, time estimates, and dependencies.

### 🔧 Technical Task Breakdown
Separate checklists for different technical areas.

### 🧪 Testing & Validation Checklist
Quality assurance and validation tasks.

### 📚 Documentation & Communication
Documentation updates and team communication needs.

## OUTPUT FORMAT

### 🎯 Project Overview
**Feature/Task**: [Name]
**Priority**: [High/Medium/Low] 
**Complexity**: [Simple/Medium/Complex]
**Estimated Total Time**: [Hours/Days]
**Dependencies**: [Blocking items]

### 📋 Phase 1: Planning & Setup
**Estimated Time**: [X hours]
**Dependencies**: [None/Previous tasks]

#### Backend Planning
- [ ] **[Task Name]** *(Est: Xh)* - [Specific description with acceptance criteria]
  - **Acceptance**: [What defines completion]
  - **Files**: [Specific files to modify/create]
  - **Dependencies**: [Blocking tasks]

- [ ] **[Task Name]** *(Est: Xh)* - [Description]
  - **Acceptance**: [Completion criteria]
  - **Files**: [File locations]
  - **Dependencies**: [Prerequisites]

#### Frontend Planning  
- [ ] **[Task Name]** *(Est: Xh)* - [Description]
  - **Acceptance**: [Completion criteria]
  - **Files**: [File locations]
  - **Dependencies**: [Prerequisites]

#### Database Planning
- [ ] **[Task Name]** *(Est: Xh)* - [Description]
  - **Acceptance**: [Completion criteria]
  - **Files**: [Schema files]
  - **Dependencies**: [Prerequisites]

### 🏗️ Phase 2: Core Implementation
**Estimated Time**: [X hours]
**Dependencies**: [Phase 1 completion]

#### Backend Development
- [ ] **Create [Specific API Endpoint]** *(Est: 3h)*
  - **Acceptance**: Endpoint returns proper JSON response with validation
  - **Files**: `/api/src/main/kotlin/com/willcounter/api/routes/[Name]Routes.kt`
  - **Dependencies**: Database schema updates completed
  - **Testing**: Unit tests with 80%+ coverage

- [ ] **Implement [Business Logic]** *(Est: 2h)*
  - **Acceptance**: Logic handles all specified edge cases
  - **Files**: `/api/src/main/kotlin/com/willcounter/api/services/[Name]Service.kt`
  - **Dependencies**: API endpoint structure defined
  - **Testing**: Service layer unit tests

#### Frontend Development
- [ ] **Create [Component Name] Component** *(Est: 4h)*
  - **Acceptance**: Component renders correctly on iOS/Android with proper styling
  - **Files**: `/frontend/src/components/[category]/[ComponentName]/`
  - **Dependencies**: API endpoint available for testing
  - **Testing**: Component unit tests and visual testing

- [ ] **Implement [Screen/Navigation]** *(Est: 2h)*
  - **Acceptance**: Navigation flows work correctly with proper state management
  - **Files**: `/frontend/src/screens/[ScreenName].tsx`
  - **Dependencies**: Components created and tested
  - **Testing**: Navigation integration tests

#### Database Implementation
- [ ] **Create [Table/Schema Updates]** *(Est: 1h)*
  - **Acceptance**: Schema deployed successfully with proper indexes
  - **Files**: `/shared/database/schema.sql`
  - **Dependencies**: Schema design approved
  - **Testing**: Migration tested on staging environment

### 🔌 Phase 3: Integration & Testing
**Estimated Time**: [X hours]
**Dependencies**: [Phase 2 completion]

#### API Integration
- [ ] **Connect Frontend to Backend APIs** *(Est: 3h)*
  - **Acceptance**: All CRUD operations work end-to-end
  - **Files**: `/frontend/src/store/slices/[name]Slice.ts`
  - **Dependencies**: Both frontend and backend components completed
  - **Testing**: Integration tests passing

- [ ] **Implement Error Handling** *(Est: 2h)*
  - **Acceptance**: User-friendly error messages for all failure scenarios
  - **Files**: Error handling components and utilities
  - **Dependencies**: Basic functionality working
  - **Testing**: Error scenario testing

#### Quality Assurance
- [ ] **Unit Test Coverage** *(Est: 2h)*
  - **Acceptance**: 80%+ test coverage for new code
  - **Files**: `***.test.ts` files
  - **Dependencies**: Core functionality implemented
  - **Testing**: All tests passing in CI

- [ ] **Manual Device Testing** *(Est: 3h)*
  - **Acceptance**: Feature works on iOS/Android devices with different screen sizes
  - **Files**: N/A
  - **Dependencies**: Integration completed
  - **Testing**: Test matrix completed

### 🚀 Phase 4: Deployment & Monitoring
**Estimated Time**: [X hours]
**Dependencies**: [Phase 3 completion]

#### Deployment Preparation
- [ ] **Update Documentation** *(Est: 1h)*
  - **Acceptance**: README and API docs reflect new functionality
  - **Files**: `/README.md`, `/docs/`, API documentation
  - **Dependencies**: Feature fully implemented
  - **Testing**: Documentation review completed

- [ ] **Performance Testing** *(Est: 2h)*
  - **Acceptance**: Feature meets performance benchmarks
  - **Files**: Performance test scripts
  - **Dependencies**: Feature deployed to staging
  - **Testing**: Load testing results acceptable

#### Release Management
- [ ] **Create Release PR** *(Est: 0.5h)*
  - **Acceptance**: PR contains all changes with proper description
  - **Files**: All modified files
  - **Dependencies**: All testing completed
  - **Testing**: CI/CD pipeline passing

- [ ] **Monitor Post-Release** *(Est: 1h)*
  - **Acceptance**: No critical issues reported within 24h
  - **Files**: Monitoring dashboards
  - **Dependencies**: Feature released to production
  - **Testing**: Production monitoring confirms stability

### 📊 Success Metrics & Validation

#### Technical Metrics
- [ ] **Response Time**: API endpoints respond within [X]ms
- [ ] **Error Rate**: Less than [X]% error rate in production
- [ ] **Test Coverage**: Minimum [X]% code coverage maintained
- [ ] **Performance**: No regression in app startup time

#### Business Metrics  
- [ ] **User Adoption**: [X]% of users try new feature within first week
- [ ] **User Satisfaction**: [X]+ rating in feedback
- [ ] **Engagement**: [X]% increase in relevant user actions
- [ ] **Retention**: No negative impact on user retention

### 🔧 Troubleshooting Checklist

#### If Backend Issues:
- [ ] Check API logs for error patterns
- [ ] Verify database connections and queries
- [ ] Test authentication/authorization flows
- [ ] Review environment configuration

#### If Frontend Issues:
- [ ] Test on different devices and screen sizes
- [ ] Check Redux state management
- [ ] Verify API integration and error handling
- [ ] Review navigation and user flows

#### If Performance Issues:
- [ ] Profile database query performance
- [ ] Check for memory leaks in React Native
- [ ] Analyze bundle size and loading times
- [ ] Review image optimization and caching

### 📝 Communication Plan

#### Team Updates
- [ ] **Daily Standups**: Report progress on current phase tasks
- [ ] **Weekly Review**: Demo completed functionality to stakeholders
- [ ] **Blockers**: Escalate any issues preventing progress
- [ ] **Documentation**: Update team on any architectural decisions

#### Stakeholder Communication
- [ ] **Progress Reports**: Weekly progress against checklist
- [ ] **Demo Sessions**: Show working functionality at end of each phase
- [ ] **Feedback Collection**: Gather input on user experience and functionality
- [ ] **Release Notes**: Document new features for end users

---

**USAGE INSTRUCTIONS**:
1. Copy this checklist to a GitHub issue or project tracking tool
2. Assign team members to specific sections
3. Update progress regularly with comments and completion status
4. Use time estimates for sprint planning and resource allocation
5. Link to specific pull requests and commits as tasks are completed

## 🔄 Checklist Maintenance

### Regular Updates
- [ ] Review time estimates against actual time spent
- [ ] Add missing tasks discovered during implementation
- [ ] Update acceptance criteria based on feedback
- [ ] Adjust priorities based on changing requirements

### Continuous Improvement
- [ ] Capture lessons learned at end of each phase
- [ ] Update templates based on what worked well
- [ ] Share successful patterns with team
- [ ] Identify process improvements for next project

## 📚 Integration with Project Tools

### GitHub Integration
```markdown
<!-- Link to related issues -->
Related Issues: #123, #456
Depends on: #789
Blocks: #101, #102

<!-- Progress tracking -->
Progress: 15/23 tasks completed (65%)
Time Spent: 25h / 35h estimated
```

### Project Board Cards
```markdown
**Phase**: Implementation
**Assignee**: @developer
**Labels**: frontend, backend, high-priority
**Milestone**: v2.1.0
```

## 💡 Tips for Effective Checklists

1. **Be Specific**: Avoid vague tasks like "improve UI"
2. **Include Time Estimates**: Help with planning and resource allocation
3. **Define Acceptance Criteria**: Clear completion definitions
4. **Track Dependencies**: Identify blocking relationships
5. **Update Regularly**: Keep checklist current with actual progress
6. **Celebrate Progress**: Acknowledge completed milestones