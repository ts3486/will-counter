# Agent Workflow System Usage Guide

## Quick Start

The Agent Workflow System automates the complete development process using 6 specialized agents following the pattern:

```
PM Agent → Design Agent → Dev Agent → CR Agent → QA Agent → Release
    ↓         ↓           ↓         ↓        ↓          ↓
Requirements  UX/UI     Implementation  Review   Testing   Deploy
```

## Usage Commands

### Simple Command (Recommended)
```bash
# Run complete agent workflow
npm run agent:workflow "Add user statistics dashboard"
```

### Alternative Commands  
```bash
# Using Node.js directly
node scripts/claude-agent-workflow.js "Implement counter categories"

# Using Bash script (basic version)
./scripts/agent-workflow.sh "Add dark mode support"
```

## Example Usage

```bash
# Feature development example
npm run agent:workflow "Add user statistics dashboard"

# This will:
# 1. PM Agent: Analyze requirements and create user stories
# 2. Design Agent: Create UX/UI specifications 
# 3. Dev Agent: Generate implementation plan with code examples
# 4. CR Agent: Review for security and quality compliance
# 5. QA Agent: Create comprehensive testing strategy
# 6. Generate final implementation plan in docs/
```

## What Gets Generated

After running the workflow, you'll get:

### Complete Implementation Plan
- **Location**: `docs/agent-workflow-[feature]-[timestamp].md`
- **Contains**: All agent analyses, requirements, code examples, and testing strategy

### Individual Agent Outputs
- **Location**: `.claude/workflow/[feature]-[timestamp]/`
- **Files**:
  - `pm-output.md` - Requirements and user stories
  - `designer-output.md` - UX/UI specifications
  - `dev-output.md` - Technical implementation plan
  - `cr-output.md` - Security and quality review
  - `qa-output.md` - Testing strategy

## Agent Responsibilities

### 🎯 PM Agent
- Requirements analysis
- User story creation
- Risk assessment
- Priority and timeline estimation
- Acceptance criteria definition

### 🎨 Design Agent  
- UX/UI specifications
- Design system compliance
- Mobile-first responsive design
- Accessibility requirements (WCAG 2.1 AA)
- Cross-platform considerations

### 💻 Dev Agent
- Technical architecture design
- Security-first implementation
- Code examples and file structure
- Database schema updates
- API endpoint specifications

### 🛡️ CR Agent
- Security vulnerability assessment
- Code quality validation
- Best practice enforcement
- Performance impact analysis
- Compliance verification

### 🧪 QA Agent
- Test strategy development
- Cross-platform testing requirements
- Performance benchmark definition
- Security testing protocols
- Release validation criteria

## Integration with Your Project

The agent workflow system is specifically designed for the will-counter project:

- **Security-First**: Follows your Auth0, JWT, and environment variable patterns
- **Mobile-Optimized**: React Native + iOS/Android considerations
- **Performance-Focused**: <200ms API, <3s launch time targets
- **Quality-Driven**: >85% test coverage requirements

## Advanced Usage

### Custom Agent Prompts
Modify agent configurations in `.claude/agents/`:
- `pm-agent.yaml` - Product Manager templates
- `designer-agent.yaml` - Design system and UX patterns
- `dev-agent.yaml` - Technical implementation guidelines
- `cr-agent.yaml` - Security and quality standards
- `qa-agent.yaml` - Testing frameworks and strategies

### Workflow Customization
Edit `scripts/claude-agent-workflow.js` to:
- Add new agents to the pipeline
- Modify agent prompt templates
- Change output formats
- Integrate with external tools

## Examples

### Simple Features
```bash
npm run agent:workflow "Add user profile picture upload"
npm run agent:workflow "Implement push notifications"
npm run agent:workflow "Add counter export functionality"
```

### Complex Features  
```bash
npm run agent:workflow "Add social sharing with privacy controls"
npm run agent:workflow "Implement offline sync with conflict resolution"
npm run agent:workflow "Add advanced analytics dashboard with charts"
```

### Infrastructure Changes
```bash
npm run agent:workflow "Add Redis caching layer"
npm run agent:workflow "Implement blue-green deployment"
npm run agent:workflow "Add comprehensive monitoring and alerting"
```

## Output Example

After running `npm run agent:workflow "Add user statistics dashboard"`, you get:

```
AGENT WORKFLOW COMPLETE
============================================================
Requirement: Add user statistics dashboard
Workflow ID: add-user-statistics-dashboard-2025-01-20T10-30-00
Agents executed: PM → Design → Dev → CR → QA
Implementation plan: docs/agent-workflow-add-user-statistics-dashboard-2025-01-20T10-30-00.md
All agent outputs: .claude/workflow/add-user-statistics-dashboard-2025-01-20T10-30-00/
============================================================
```

The generated plan includes:
- ✅ Complete requirements analysis
- ✅ UX/UI specifications with design system compliance  
- ✅ Technical implementation with Kotlin + React Native code examples
- ✅ Security review focusing on Auth0/JWT patterns
- ✅ Comprehensive testing strategy for mobile + backend
- ✅ Step-by-step implementation checklist

## Tips for Best Results

### 1. Be Specific
```bash
# Good
npm run agent:workflow "Add weekly habit streak visualization with calendar view"

# Less effective  
npm run agent:workflow "Add some charts"
```

### 2. Consider Your Architecture
The agents are tuned for your stack:
- Kotlin/Gradle backend with Ktor
- React Native/Expo frontend with TypeScript
- Supabase PostgreSQL database
- Auth0 authentication with JWT

### 3. Follow the Generated Plan
The workflow produces actionable implementation plans - follow them step by step for best results.

### 4. Iterate if Needed
Run the workflow again with refined requirements if the first pass needs adjustment.

## Troubleshooting

### Common Issues
- **"Please run from project root"**: Ensure you're in the will-counter directory
- **Node.js version**: Requires Node.js 18+ (check with `node --version`)
- **Permissions**: Make sure scripts are executable (`chmod +x scripts/*.sh`)

### Getting Help
- Check the generated implementation plans for specific guidance
- Review agent configurations in `.claude/agents/`
- Consult the main workflow documentation in `docs/optimized-development-workflow.md`

The Agent Workflow System transforms a simple requirement into a complete, security-reviewed, tested implementation plan ready for development!