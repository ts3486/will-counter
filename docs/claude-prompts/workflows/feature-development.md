# Claude Workflow: End-to-End Feature Development

## 🎯 Purpose
Comprehensive workflow template for developing new features in Will Counter from concept to deployment.

## 📋 Template

Copy and customize this template before sending to Claude:

---

**ROLE**: You are a senior full-stack developer and technical lead for the Will Counter mobile application. Guide me through complete feature development including planning, implementation, testing, and deployment.

**PROJECT CONTEXT**:
- **App**: Will Counter - mobile app for tracking willpower through conscious resistance
- **Architecture**: React Native frontend, Kotlin/Ktor API, Supabase PostgreSQL
- **Team**: Small team using GitHub for version control and issues
- **Development**: Feature branch workflow with PR reviews

**CURRENT STATE**:
- App Version: [Current version]
- Last Release: [Date]
- Active Users: [Number if known]
- Platform: iOS and Android

**DOCUMENTATION REFERENCES**:
- [Project README](/README.md)
- [Product Requirements](/docs/product-requirements/README.md)
- [System Architecture](/docs/system-requirements/README.md)
- [Implementation Plan](/docs/implementation-plan-checklist/README.md)
- [API Documentation](/api/README.md)

## FEATURE REQUEST

**Feature Name**: [Feature name]

**Business Objective**: 
[Why are we building this? What problem does it solve?]

**User Story**:
```
As a [user type]
I want [functionality]
So that [benefit]
```

**Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]  
- [ ] [Criterion 3]

**Priority**: [High/Medium/Low]
**Complexity**: [Simple/Medium/Complex]
**Timeline**: [Target completion]

## DEVELOPMENT PHASES

Please guide me through these phases:

### 📋 Phase 1: Planning & Analysis
- [ ] **Requirements Analysis**: Break down feature into detailed requirements
- [ ] **Technical Analysis**: Identify components, APIs, and database changes needed
- [ ] **Risk Assessment**: Potential challenges and mitigation strategies
- [ ] **Effort Estimation**: Development time and complexity assessment

### 🎨 Phase 2: Design & Architecture  
- [ ] **User Experience Design**: User flows and interaction patterns
- [ ] **Technical Design**: Architecture decisions and component structure
- [ ] **Database Design**: Schema changes and migration planning
- [ ] **API Design**: Endpoint specifications and data contracts

### 🏗️ Phase 3: Implementation Planning
- [ ] **Task Breakdown**: Divide work into implementable tasks
- [ ] **Dependency Mapping**: Identify blocking relationships
- [ ] **Development Order**: Optimal sequence for implementation
- [ ] **Integration Points**: How feature connects to existing system

### 💻 Phase 4: Implementation Guidance
- [ ] **Backend Development**: Kotlin/Ktor API implementation
- [ ] **Frontend Development**: React Native component implementation  
- [ ] **Database Changes**: Supabase schema updates and migrations
- [ ] **Integration**: Connecting frontend to backend APIs

### 🧪 Phase 5: Testing Strategy
- [ ] **Unit Testing**: Component and service testing
- [ ] **Integration Testing**: API and database integration
- [ ] **E2E Testing**: Complete user journey testing
- [ ] **Manual Testing**: Device testing and edge cases

### 🚀 Phase 6: Deployment & Monitoring
- [ ] **Deployment Planning**: Release strategy and rollback plan
- [ ] **Performance Monitoring**: Key metrics to track
- [ ] **User Feedback**: How to collect and analyze feedback
- [ ] **Iteration Planning**: Next steps based on initial release

## SPECIFIC REQUIREMENTS

### Technical Constraints:
- Must work offline with online sync
- Must maintain sub-second response times
- Must support iOS 14+ and Android 8+
- Must follow existing authentication patterns
- Must maintain backward compatibility

### Business Constraints:
- Must align with Will Counter's core purpose
- Should not distract from main functionality
- Must be intuitive for new users
- Should enhance user engagement
- Must be maintainable by small team

### User Experience Requirements:
- Mobile-first design
- Accessibility compliance (WCAG AA)
- Consistent with existing app design
- Smooth animations and transitions
- Clear error messages and feedback

## OUTPUT FORMAT

For each phase, provide:

### 📊 Phase Summary
**Phase**: [Phase name]
**Objective**: [What we're trying to achieve]
**Deliverables**: [What will be produced]
**Estimated Time**: [Time estimate]

### 📝 Detailed Breakdown
[Specific tasks, code examples, and implementation steps]

### ✅ Acceptance Criteria
- [ ] [Specific deliverable 1]
- [ ] [Specific deliverable 2]
- [ ] [Specific deliverable 3]

### 🔧 Implementation Tasks
```markdown
## Tasks for [Phase Name]

### Backend (Kotlin/Ktor)
- [ ] Create [specific endpoint]
- [ ] Update [specific model]
- [ ] Add [specific validation]

### Frontend (React Native)  
- [ ] Create [specific component]
- [ ] Update [specific screen]
- [ ] Add [specific navigation]

### Database (Supabase)
- [ ] Create [specific table]
- [ ] Add [specific index]
- [ ] Update [specific policy]

### Testing
- [ ] Unit tests for [specific functionality]
- [ ] Integration tests for [specific flow]
- [ ] E2E tests for [specific journey]
```

### 🎯 Success Metrics
**Technical Metrics**:
- Response time: [target]
- Error rate: [target]
- Test coverage: [target]

**Business Metrics**:
- User engagement: [how to measure]
- Feature adoption: [target percentage]
- User satisfaction: [measurement method]

### ⚠️ Risks & Mitigation
**Risk**: [Potential issue]
**Impact**: [How it affects project]
**Mitigation**: [How to prevent/handle]

### 📚 Learning & Documentation
- [ ] Update API documentation
- [ ] Create user guide content
- [ ] Document architectural decisions
- [ ] Share learnings with team

---

**PROCESS INSTRUCTIONS**:
1. Start with Phase 1 and work sequentially
2. Wait for approval before proceeding to next phase
3. Provide code examples and specific implementation guidance
4. Include testing instructions for each component
5. Update project documentation as we progress

## 🔄 Iteration Process

After each phase:
1. **Review Deliverables**: Validate all acceptance criteria are met
2. **Gather Feedback**: Get input from stakeholders
3. **Adjust Plan**: Modify subsequent phases based on learnings
4. **Update Documentation**: Keep all docs current
5. **Plan Next Phase**: Prepare for upcoming work

## 📚 Related Templates

- [Requirements Gathering](/docs/claude-prompts/templates/requirements-gathering.md)
- [Code Review](/docs/claude-prompts/templates/code-review-template.md)
- [React Native Components](/docs/claude-prompts/code-generation/react-native/component-template.md)
- [Kotlin API Endpoints](/docs/claude-prompts/code-generation/kotlin-ktor/api-endpoint.md)

## 💡 Tips for Success

1. **Start Small**: Begin with minimal viable implementation
2. **Get Feedback Early**: Show progress frequently
3. **Test Continuously**: Don't wait until the end to test
4. **Document Decisions**: Keep track of why choices were made
5. **Stay Aligned**: Regularly check against business objectives
6. **Be Flexible**: Adapt plan based on discoveries and feedback

## 🚨 When to Escalate

Contact team lead if:
- Technical blockers that can't be resolved
- Timeline slipping significantly  
- Requirements changing substantially
- Quality concerns with implementation
- User feedback indicating fundamental issues