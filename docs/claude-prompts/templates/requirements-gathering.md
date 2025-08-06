# Claude Prompt Template: Requirements Gathering

## 🎯 Purpose
Use Claude to analyze, refine, and document requirements for new features in the Will Counter application.

## 📋 Template

Copy and customize this template before sending to Claude:

---

**ROLE**: You are a senior product manager and technical architect specializing in mobile applications. Help me analyze and document requirements for the Will Counter app.

**PROJECT CONTEXT**:
- **App**: Will Counter - mobile app for tracking willpower exercises through conscious resistance
- **Users**: Individuals working on self-improvement and willpower building
- **Platform**: React Native (iOS/Android), Kotlin API, Supabase database
- **Current Features**: Basic counting, daily statistics, offline support, Auth0 authentication

**DOCUMENTATION REFERENCES**:
- Current Features: `/will-counter/README.md`
- User Stories: `/will-counter/docs/product-requirements/README.md`
- Technical Architecture: `/will-counter/docs/system-requirements/README.md`
- Database Schema: `/will-counter/shared/database/schema.sql`

## FEATURE REQUEST

**Feature Name**: [Name of the feature]

**Initial Description**: 
[Paste your initial feature idea, user feedback, or business requirement]

**Source**: [User feedback/Business need/Technical improvement/etc.]

## ANALYSIS REQUESTED

Please help me with:

### 📝 Requirements Analysis
- [ ] **User Stories**: Break down into specific user stories with acceptance criteria
- [ ] **Functional Requirements**: Detailed feature specifications
- [ ] **Non-Functional Requirements**: Performance, security, usability considerations
- [ ] **Edge Cases**: Identify potential edge cases and error scenarios

### 🎨 User Experience Design
- [ ] **User Journey**: Map the complete user flow
- [ ] **UI/UX Considerations**: Mobile-first design principles
- [ ] **Accessibility**: Ensure inclusive design
- [ ] **Offline Experience**: How feature works without internet

### 🏗️ Technical Architecture
- [ ] **Frontend Components**: React Native components needed
- [ ] **Backend APIs**: New endpoints and modifications
- [ ] **Database Changes**: Schema updates and migrations
- [ ] **Third-party Integrations**: External services required

### 🔄 Integration Points
- [ ] **Existing Features**: How this integrates with current app
- [ ] **Data Flow**: How data moves through the system
- [ ] **State Management**: Redux store updates needed
- [ ] **Authentication**: How it works with Auth0/RLS

## SPECIFIC FOCUS AREAS

[Choose relevant areas for your feature:]

### For Tracking Features:
- Real-time updates and sync
- Offline data storage
- Historical data analysis
- Performance considerations

### For Social Features:
- Privacy and security
- Data sharing mechanisms
- User consent and controls
- Community guidelines

### For Analytics Features:
- Data aggregation methods
- Visualization requirements
- Export capabilities
- Privacy considerations

### For Gamification Features:
- Motivation mechanisms
- Progress tracking
- Achievement systems
- Balance with core purpose

## OUTPUT FORMAT

Please provide analysis in this format:

### 🎯 Feature Summary
**What**: [Clear, concise description]
**Why**: [Business value and user benefit]
**Who**: [Target user personas]

### 📖 User Stories
```
As a [user type]
I want [functionality]
So that [benefit/value]

Acceptance Criteria:
- [ ] [Specific testable criterion 1]
- [ ] [Specific testable criterion 2]
- [ ] [Specific testable criterion 3]
```

### 🔧 Technical Requirements

#### Frontend (React Native)
- **New Components**: [List of components to create]
- **Modified Components**: [Existing components to update]
- **State Management**: [Redux slice changes]
- **Navigation**: [New screens and navigation flow]

#### Backend (Kotlin/Ktor)
- **New Endpoints**: [API endpoints to create]
- **Modified Endpoints**: [Existing endpoints to update]
- **Business Logic**: [Core logic requirements]
- **Validation**: [Input validation rules]

#### Database (Supabase)
- **New Tables**: [Tables to create]
- **Modified Tables**: [Schema changes needed]
- **Indexes**: [Performance indexes required]
- **RLS Policies**: [Security policies needed]

### 📊 Data Flow Diagram
```
[User Action] → [Frontend Component] → [Redux Action] → [API Call] → [Database] → [Response Flow]
```

### 🧪 Testing Strategy
- **Unit Tests**: [Components and functions to test]
- **Integration Tests**: [API and database interactions]
- **E2E Tests**: [User journey testing]
- **Performance Tests**: [Load and performance criteria]

### 📝 Implementation Checklist
- [ ] **Phase 1**: [Core functionality]
- [ ] **Phase 2**: [Enhanced features]
- [ ] **Phase 3**: [Advanced features]

### ⚠️ Risks and Considerations
- **Technical Risks**: [Potential technical challenges]
- **User Experience Risks**: [UX concerns]
- **Performance Risks**: [Scalability and performance]
- **Security Risks**: [Privacy and security considerations]

### 📚 Documentation Needs
- [ ] API documentation updates
- [ ] User guide updates  
- [ ] Technical documentation
- [ ] Migration guides (if needed)

---

**CONSTRAINTS**:
- Must align with Will Counter's core purpose of willpower building
- Should maintain simple, distraction-free user experience
- Must work offline-first with online sync
- Should integrate seamlessly with existing Auth0/Supabase architecture

## 🔄 Follow-up Process

After receiving the analysis:

1. **Review and Refine**: Discuss any unclear or missing requirements
2. **Prioritize**: Rank features by importance and complexity
3. **Create Epic/Issues**: Break down into implementable tasks
4. **Technical Validation**: Validate technical approach with development team
5. **Design Mockups**: Create UI/UX designs based on requirements
6. **Implementation Planning**: Schedule development phases

## 📚 Related Documentation

- [Product Requirements](/docs/product-requirements/README.md)
- [Technical Architecture](/docs/system-requirements/README.md)
- [Implementation Checklist](/docs/implementation-plan-checklist/README.md)
- [User Research and Feedback](../user-research/) [if exists]

## 💡 Tips for Better Requirements

1. **Be User-Centric**: Start with user problems and benefits
2. **Include Context**: Provide background and motivation
3. **Be Specific**: Avoid vague terms like "better" or "improved"
4. **Consider Constraints**: Technical, time, and resource limitations
5. **Think Mobile-First**: Consider touch interactions and screen sizes
6. **Plan for Scale**: Consider how feature grows with user base