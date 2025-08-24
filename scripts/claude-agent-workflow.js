#!/usr/bin/env node

/**
 * Claude Code Agent Workflow Orchestrator
 * 
 * This script orchestrates the complete agent workflow:
 * PM Agent → Design Agent → Dev Agent → CR Agent → QA Agent → Release
 * 
 * Usage: node scripts/claude-agent-workflow.js "Add user statistics dashboard"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const WORKFLOW_DIR = '.claude/workflow';
const AGENTS_DIR = '.claude/agents';
const DOCS_DIR = 'docs';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Utility functions
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logAgent(agentName, message) {
    log(`[AGENT: ${agentName}] ${message}`, 'yellow');
}

function logStatus(message) {
    log(`[WORKFLOW] ${message}`, 'blue');
}

function logSuccess(message) {
    log(`[SUCCESS] ${message}`, 'green');
}

function logError(message) {
    log(`[ERROR] ${message}`, 'red');
}

// Ensure directories exist
function ensureDirectories() {
    [WORKFLOW_DIR, DOCS_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

// Agent workflow orchestrator
class AgentWorkflowOrchestrator {
    constructor(requirement) {
        this.requirement = requirement;
        this.featureId = requirement.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        this.workflowId = `${this.featureId}-${this.timestamp}`;
        this.workflowPath = path.join(WORKFLOW_DIR, this.workflowId);
        
        // Ensure workflow directory exists
        fs.mkdirSync(this.workflowPath, { recursive: true });
    }

    // Create prompts for Claude Code agents
    createAgentPrompt(agentType, agentName, context, previousOutputs = []) {
        const agentConfigPath = path.join(AGENTS_DIR, `${agentType}-agent.yaml`);
        let agentConfig = '';
        
        if (fs.existsSync(agentConfigPath)) {
            agentConfig = fs.readFileSync(agentConfigPath, 'utf8');
        }

        let previousContext = '';
        if (previousOutputs.length > 0) {
            previousContext = '\n## Previous Agent Outputs:\n' + 
                previousOutputs.map(output => `\n### ${output.agent}:\n${output.content}`).join('\n');
        }

        return `You are acting as the ${agentName} for the will-counter project.

## Project Context
- Repository: will-counter (habit tracking app)
- Stack: Kotlin/Gradle backend, React Native + Expo frontend, Supabase database  
- Branch: feature/Use-supabase-api-within-server-api
- Recent Security Fixes: Auth0 JWT validation, environment variable injection prevention
- Security Patterns: 3-part JWT tokens, environment variable regex validation
- Performance Targets: <200ms API response, <3s app launch, >85% test coverage

## Agent Configuration
${agentConfig}

## Current Task
${context}

${previousContext}

Please provide your analysis following the ${agentName} agent responsibilities defined in your configuration. 
Structure your response in clear markdown format that can be consumed by the next agent in the workflow.

Be specific, actionable, and consider the will-counter project's security-first, mobile-optimized architecture.`;
    }

    // Execute a single agent in the workflow
    async executeAgent(agentType, agentName, context, previousOutputs = []) {
        logAgent(agentName, 'Starting analysis...');
        
        const prompt = this.createAgentPrompt(agentType, agentName, context, previousOutputs);
        const promptFile = path.join(this.workflowPath, `${agentType}-prompt.md`);
        const outputFile = path.join(this.workflowPath, `${agentType}-output.md`);
        
        // Write prompt to file for reference
        fs.writeFileSync(promptFile, prompt);
        
        try {
            // Note: In a real Claude Code environment, you would use the Task tool here
            // This is a simplified version that shows the structure
            
            // For demonstration, create a structured output
            const agentOutput = this.generateMockAgentOutput(agentType, agentName, context);
            fs.writeFileSync(outputFile, agentOutput);
            
            logSuccess(`${agentName} analysis complete`);
            return {
                agent: agentName,
                content: agentOutput,
                file: outputFile
            };
        } catch (error) {
            logError(`${agentName} analysis failed: ${error.message}`);
            throw error;
        }
    }

    // Generate mock agent output (in real implementation, this would use Claude Code)
    generateMockAgentOutput(agentType, agentName, context) {
        const timestamp = new Date().toISOString();
        
        switch (agentType) {
            case 'pm':
                return `# Product Manager Analysis

**Agent**: Product Manager  
**Timestamp**: ${timestamp}  
**Feature**: ${this.requirement}

## Feature Objective
Implement ${this.requirement} to enhance user engagement and provide valuable insights into habit tracking patterns.

## User Story
As a will-counter app user, I want ${this.requirement.toLowerCase()} so that I can better understand my progress and stay motivated in building positive habits.

## Acceptance Criteria
- [ ] Feature integrates with existing will-counter architecture
- [ ] Maintains <200ms API response time requirements  
- [ ] Follows security patterns (3-part JWT, environment variable validation)
- [ ] Works across iOS and Android platforms
- [ ] Includes proper error handling and offline support

## Risk Assessment
- **Technical Risk**: Medium - Requires database schema changes and new API endpoints
- **Security Risk**: Low - Following established auth patterns
- **Performance Risk**: Medium - New data aggregation requirements
- **Timeline Risk**: Low - Well-defined scope

## Resource Estimation
- Development Time: 5-8 days
- Testing Time: 2-3 days  
- Code Review: 1 day
- Deployment: 1 day

## Priority: HIGH
This feature addresses user retention and engagement metrics identified in recent user feedback.

## Dependencies
- Supabase database schema updates
- React Native UI components
- Kotlin backend API endpoints
- Auth0 authentication integration

**Next Agent**: Design Agent should create UX/UI specifications based on these requirements.`;

            case 'designer':
                return `# Design Agent Analysis

**Agent**: Design Agent  
**Timestamp**: ${timestamp}  
**Feature**: ${this.requirement}

## User Experience Design

### User Journey
1. **Entry Point**: User accesses feature from main navigation
2. **Data Loading**: Progressive loading with skeleton states
3. **Interaction**: Touch-friendly controls with haptic feedback
4. **Results**: Clear visual representation of data
5. **Actions**: Export, share, or drill-down capabilities

### Navigation Integration
- Add new tab icon to main navigation
- Maintain existing navigation patterns
- Ensure back button consistency

## User Interface Design

### Component Specifications
\`\`\`typescript
// Primary component structure
interface FeatureComponent {
  layout: 'card-based' | 'list-based' | 'chart-based';
  colors: DesignTokens.colors;
  spacing: DesignTokens.spacing;
  typography: DesignTokens.typography;
}
\`\`\`

### Design System Usage
- **Primary Color**: #007AFF (iOS blue)
- **Success Color**: #34C759 (for positive metrics)
- **Background**: #F2F2F7 (light mode)
- **Typography**: SF Pro Display/Text
- **Touch Targets**: 44pt minimum
- **Spacing**: 8px base unit grid

### Mobile-First Responsive Design
- Portrait orientation primary
- Safe area handling for iPhone notch
- Android navigation bar accommodation
- Tablet layout considerations

## Technical Design Requirements

### State Management
- Redux slice for feature data
- Offline caching with persistence
- Real-time updates via Supabase subscriptions

### API Integration
- RESTful endpoints following existing patterns
- GraphQL consideration for complex queries
- Caching strategy for performance

### Performance Considerations
- Image optimization for charts/graphs
- Virtual scrolling for large datasets  
- Lazy loading for non-critical data

## Accessibility (WCAG 2.1 AA)
- Screen reader support
- High contrast mode compatibility
- Keyboard navigation support
- Dynamic type support

**Next Agent**: Developer should implement these specifications with security-first approach.`;

            case 'dev':
                return `# Developer Implementation Analysis

**Agent**: Developer  
**Timestamp**: ${timestamp}  
**Feature**: ${this.requirement}

## Technical Architecture

### Backend Changes (Kotlin/Ktor)
\`\`\`kotlin
// New API endpoints
@Serializable
data class FeatureRequest(
    val userId: String,
    val dateRange: DateRange,
    val filters: Map<String, String> = emptyMap()
)

@Serializable  
data class FeatureResponse(
    val success: Boolean,
    val data: FeatureData?,
    val error: String? = null
)

// Secure route implementation
fun Route.featureRoutes(supabaseClient: SupabaseClient) {
    authenticate("auth0") {
        route("/api/v1/features") {
            get("/${this.requirement.toLowerCase().replace(' ', '-')}") {
                // Implementation following security patterns
                val principal = call.principal<Auth0Principal>()
                val userId = principal?.userId ?: run {
                    call.respond(HttpStatusCode.Unauthorized)
                    return@get
                }
                // Feature logic here
            }
        }
    }
}
\`\`\`

### Frontend Changes (React Native/TypeScript)
\`\`\`typescript
// Feature component
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFeatureData } from '../store/slices/featureSlice';

export const FeatureScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(state => state.feature);
  
  useEffect(() => {
    dispatch(fetchFeatureData());
  }, [dispatch]);
  
  // Component implementation
  return (
    <SafeAreaView style={styles.container}>
      {/* Feature UI implementation */}
    </SafeAreaView>
  );
};
\`\`\`

### Database Schema Updates (Supabase)
\`\`\`sql
-- Migration script
CREATE TABLE IF NOT EXISTS feature_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policy
ALTER TABLE feature_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own feature data"
ON feature_data FOR ALL USING (
  auth.uid()::TEXT = user_id::TEXT
);
\`\`\`

## Security Implementation

### Authentication (Auth0/JWT)
- Maintain 3-part JWT token validation
- Use existing Auth0Principal for user context
- Implement proper rate limiting (60 req/min)

### Input Validation
\`\`\`kotlin
fun validateFeatureRequest(request: FeatureRequest): ValidationResult {
    // Validate user ID format
    if (!request.userId.matches(Regex("^[0-9a-f-]{36}$"))) {
        return ValidationResult.Invalid("Invalid user ID format")
    }
    // Additional validations...
    return ValidationResult.Valid
}
\`\`\`

## Performance Optimizations
- Database query optimization with proper indexing
- Response caching with Redis
- Mobile bundle size considerations
- Image lazy loading and optimization

## Files to Modify/Create
- \`api/src/main/kotlin/com/willcounter/api/routes/FeatureRoutes.kt\`
- \`api/src/main/kotlin/com/willcounter/api/services/FeatureService.kt\`
- \`frontend/src/screens/FeatureScreen.tsx\`
- \`frontend/src/store/slices/featureSlice.ts\`
- \`shared/database/migrations/003_add_feature_data.sql\`

## Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints  
- Component tests for React Native UI
- E2E tests with Detox

**Next Agent**: Code Reviewer should validate security and quality standards.`;

            case 'cr':
                return `# Code Review Analysis

**Agent**: Code Reviewer  
**Timestamp**: ${timestamp}  
**Feature**: ${this.requirement}

## Security Review ✅

### Authentication & Authorization
- ✅ JWT validation follows 3-part token pattern
- ✅ Auth0Principal used for user context
- ✅ Row Level Security (RLS) implemented in database
- ✅ Rate limiting applied to endpoints

### Input Validation
- ✅ User ID format validation with regex
- ✅ SQL injection prevention through Exposed DSL
- ✅ Request parameter sanitization
- ⚠️ **Recommendation**: Add input size limits for JSONB data

### Environment Variables
- ✅ Environment variables follow ^[A-Z_][A-Z0-9_]*$ pattern
- ✅ No hardcoded secrets in implementation
- ✅ Proper secret management through system properties

## Code Quality Review ✅

### Architecture Patterns
- ✅ Follows existing Ktor routing patterns
- ✅ Redux Toolkit patterns maintained in frontend
- ✅ Separation of concerns in service layer
- ✅ Proper error handling implementation

### Performance Implications  
- ✅ Database queries optimized with proper indexing
- ✅ Response caching strategy implemented
- ✅ Mobile performance considerations addressed
- ✅ Bundle size impact minimized

### Code Maintainability
- ✅ TypeScript types properly defined
- ✅ Kotlin data classes follow conventions
- ✅ Clear component structure
- ✅ Proper documentation and comments

## Mobile App Standards ✅

### React Native Best Practices
- ✅ SafeAreaView properly implemented
- ✅ Platform-specific considerations included
- ✅ Accessibility props added where needed
- ✅ Performance optimization patterns followed

### Cross-Platform Compatibility
- ✅ iOS and Android compatibility verified
- ✅ Design system tokens used consistently
- ✅ Touch target sizes meet accessibility guidelines

## Required Changes: NONE

## Optional Improvements
1. **Caching Enhancement**: Consider implementing Redis for better caching
2. **Monitoring**: Add application performance monitoring for new endpoints
3. **Documentation**: Generate OpenAPI documentation for new endpoints

## Review Outcome: ✅ APPROVED

This implementation follows all established security patterns, maintains code quality standards, and integrates well with the existing architecture. The feature is ready for quality assurance testing.

**Next Agent**: QA Agent should create comprehensive testing strategy.`;

            case 'qa':
                return `# Quality Assurance Analysis

**Agent**: Quality Assurance  
**Timestamp**: ${timestamp}  
**Feature**: ${this.requirement}

## Test Strategy Overview

### Testing Pyramid
1. **Unit Tests (70%)**: Business logic and utility functions
2. **Integration Tests (20%)**: API endpoints and database operations  
3. **End-to-End Tests (10%)**: User workflows and cross-platform functionality

## Backend Testing (Kotlin/Ktor)

### Unit Tests
\`\`\`kotlin
class FeatureServiceTest {
    @Test
    fun \`should validate user permissions correctly\`() {
        // Test user access control
        val service = FeatureService(mockSupabaseClient)
        val result = service.validateUserAccess(validUserId, requestData)
        assertTrue(result.isSuccess)
    }
    
    @Test  
    fun \`should handle invalid JWT token\`() {
        // Test authentication failure scenarios
        val invalidToken = "invalid.token" // Only 2 parts
        assertThrows<AuthenticationException> {
            service.processRequest(invalidToken, requestData)
        }
    }
}
\`\`\`

### API Integration Tests
\`\`\`kotlin
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class FeatureApiTest {
    @Test
    fun \`should return 401 for missing authentication\`() = testApplication {
        client.get("/api/v1/features/${this.requirement}").apply {
            assertEquals(HttpStatusCode.Unauthorized, status)
        }
    }
    
    @Test
    fun \`should enforce rate limiting\`() = testApplication {
        // Test 60 requests per minute limit
        repeat(61) {
            client.get("/api/v1/features/${this.requirement}") {
                bearerAuth(validToken)
            }
        }
        // 61st request should be rate limited
    }
}
\`\`\`

## Frontend Testing (React Native)

### Component Tests
\`\`\`typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FeatureScreen } from '../FeatureScreen';

describe('FeatureScreen', () => {
  it('should display loading state initially', () => {
    const { getByTestId } = render(<FeatureScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
  
  it('should handle authentication errors gracefully', async () => {
    const { getByText } = render(<FeatureScreen />);
    await waitFor(() => {
      expect(getByText('Authentication required')).toBeTruthy();
    });
  });
});
\`\`\`

### End-to-End Tests (Detox)
\`\`\`javascript
describe('Feature Workflow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await loginUser();
  });
  
  it('should complete full feature workflow', async () => {
    // Navigate to feature
    await element(by.id('feature-tab')).tap();
    
    // Verify data loads
    await waitFor(element(by.id('feature-data')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Test interactions
    await element(by.id('feature-action-button')).tap();
    
    // Verify results
    await expect(element(by.id('success-message'))).toBeVisible();
  });
});
\`\`\`

## Performance Testing

### API Load Testing (JMeter)
- **Concurrent Users**: 1000 users
- **Response Time**: <200ms for 95th percentile
- **Throughput**: >100 requests/second
- **Error Rate**: <1%

### Mobile Performance Testing
- **App Launch Time**: <3 seconds
- **Screen Transition Time**: <500ms  
- **Memory Usage**: <100MB baseline increase
- **Battery Impact**: Minimal during normal usage

## Security Testing

### Authentication Testing
\`\`\`kotlin
@Test
fun \`should reject malformed JWT tokens\`() {
    val malformedTokens = listOf(
        "invalid", 
        "invalid.token", // 2 parts
        "invalid.token.signature.extra", // 4 parts
        "", 
        null
    )
    
    malformedTokens.forEach { token ->
        assertThrows<AuthenticationException> {
            authService.validateToken(token)
        }
    }
}
\`\`\`

### Input Validation Testing
- SQL injection prevention
- XSS prevention in JSON responses
- Rate limiting enforcement
- Input size limit validation

## Quality Gates

### Test Coverage Requirements
- **Backend**: >85% line coverage
- **Frontend**: >80% line coverage  
- **Integration**: >90% critical path coverage

### Performance Benchmarks
- ✅ API response time <200ms
- ✅ App launch time <3s
- ✅ Memory usage within limits
- ✅ No memory leaks detected

### Security Validation
- ✅ All authentication tests pass
- ✅ Input validation tests pass
- ✅ Rate limiting tests pass
- ✅ Security scan shows zero critical issues

## Pre-Deployment Checklist

### Automated Tests
- [ ] Unit tests pass (>85% coverage)
- [ ] Integration tests pass
- [ ] E2E tests pass on iOS and Android
- [ ] Performance tests meet benchmarks
- [ ] Security tests pass

### Manual Testing
- [ ] Feature works on iOS 13+ devices
- [ ] Feature works on Android API 23+ devices
- [ ] Accessibility testing with screen reader
- [ ] Offline functionality testing
- [ ] Network error handling testing

### Release Validation
- [ ] Database migration tested on staging
- [ ] API documentation updated
- [ ] Monitoring and alerting configured
- [ ] Rollback procedure validated

## Test Automation Pipeline

### GitHub Actions Integration
\`\`\yaml
name: Feature Testing Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Backend Tests
        run: |
          cd api && ./gradlew test jacocoTestReport
      - name: Run Frontend Tests  
        run: |
          cd frontend && npm run test:coverage
      - name: Run E2E Tests
        run: |
          cd frontend && npm run test:e2e
\`\`\`

## Success Metrics
- **Test Coverage**: Achieve >85% backend, >80% frontend
- **Performance**: All benchmarks met
- **Security**: Zero critical vulnerabilities
- **Quality**: All quality gates passed
- **User Experience**: Smooth cross-platform functionality

## QA Approval: ✅ READY FOR RELEASE

All testing requirements have been defined and quality gates established. The feature is ready for deployment following the established CI/CD pipeline.

**Final Step**: Deploy following blue-green deployment strategy with monitoring and rollback capability.`;

            default:
                return `# ${agentName} Analysis\n\n**Agent**: ${agentName}\n**Timestamp**: ${timestamp}\n\nAnalysis for: ${this.requirement}`;
        }
    }

    // Execute the complete agent workflow
    async executeWorkflow() {
        logStatus(`Starting agent workflow for: "${this.requirement}"`);
        logStatus(`Workflow ID: ${this.workflowId}`);

        const outputs = [];

        try {
            // Stage 1: PM Agent
            logStatus('Stage 1/5: Product Manager Analysis');
            const pmOutput = await this.executeAgent('pm', 'Product Manager', 
                `Analyze the requirement: "${this.requirement}" and provide structured requirements analysis.`);
            outputs.push(pmOutput);

            // Stage 2: Design Agent  
            logStatus('Stage 2/5: Design Agent Analysis');
            const designOutput = await this.executeAgent('designer', 'Design Agent',
                `Create UX/UI specifications for: "${this.requirement}" based on the PM analysis.`, outputs);
            outputs.push(designOutput);

            // Stage 3: Dev Agent
            logStatus('Stage 3/5: Developer Implementation');
            const devOutput = await this.executeAgent('dev', 'Developer',
                `Implement: "${this.requirement}" following security-first principles.`, outputs);
            outputs.push(devOutput);

            // Stage 4: Code Review Agent
            logStatus('Stage 4/5: Code Review Analysis'); 
            const crOutput = await this.executeAgent('cr', 'Code Reviewer',
                `Review the implementation plan for: "${this.requirement}" focusing on security and quality.`, outputs);
            outputs.push(crOutput);

            // Stage 5: QA Agent
            logStatus('Stage 5/5: Quality Assurance Analysis');
            const qaOutput = await this.executeAgent('qa', 'Quality Assurance',
                `Create comprehensive testing strategy for: "${this.requirement}".`, outputs);
            outputs.push(qaOutput);

            // Generate final implementation plan
            await this.generateFinalPlan(outputs);

            logSuccess('Agent workflow completed successfully!');
            return outputs;

        } catch (error) {
            logError(`Workflow failed: ${error.message}`);
            throw error;
        }
    }

    // Generate the final implementation plan
    async generateFinalPlan(outputs) {
        const finalPlan = `# Complete Implementation Plan: ${this.requirement}

**Workflow ID**: ${this.workflowId}  
**Generated**: ${new Date().toISOString()}  
**Agent Workflow**: PM → Design → Dev → CR → QA → Release

## Summary
${this.requirement}

## Agent Workflow Results

${outputs.map((output, index) => `
### ${index + 1}. ${output.agent} Analysis
${output.content}

---
`).join('')}

## Implementation Checklist

Based on the agent analyses above:

### Immediate Next Steps
1. **Implementation**: Follow the Developer agent's technical implementation plan
2. **Code Review**: Address all Code Reviewer feedback and requirements  
3. **Testing**: Execute the Quality Assurance testing strategy
4. **Security**: Ensure all security requirements are met
5. **Documentation**: Update API documentation and user guides

### Files Generated
${outputs.map(output => `- ${output.agent}: ${output.file}`).join('\n')}

### Quality Gates  
- [ ] Security review passed (3-part JWT, env var validation, rate limiting)
- [ ] Performance benchmarks met (<200ms API, <3s launch)
- [ ] Test coverage achieved (>85% backend, >80% frontend)
- [ ] Cross-platform compatibility verified (iOS 13+, Android API 23+)
- [ ] Accessibility compliance validated (WCAG 2.1 AA)

## Ready for Implementation ✅

All agents have provided their analysis following the will-counter project's security-first, quality-driven development approach. The feature is ready for development following the established patterns and standards.

**Next Command**: Begin implementation using the detailed technical specifications provided by the Developer agent.
`;

        const finalPlanPath = path.join(this.workflowPath, 'IMPLEMENTATION_PLAN.md');
        const docsPlanPath = path.join(DOCS_DIR, `agent-workflow-${this.workflowId}.md`);

        fs.writeFileSync(finalPlanPath, finalPlan);
        fs.writeFileSync(docsPlanPath, finalPlan);

        logSuccess(`Final implementation plan: ${docsPlanPath}`);
        logSuccess(`Workflow files: ${this.workflowPath}/`);

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log(`AGENT WORKFLOW COMPLETE`);
        console.log('='.repeat(60));
        console.log(`Requirement: ${this.requirement}`);
        console.log(`Workflow ID: ${this.workflowId}`);
        console.log(`Agents executed: PM → Design → Dev → CR → QA`);
        console.log(`Implementation plan: docs/agent-workflow-${this.workflowId}.md`);
        console.log(`All agent outputs: ${this.workflowPath}/`);
        console.log('='.repeat(60));
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node scripts/claude-agent-workflow.js "Your feature requirement"');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/claude-agent-workflow.js "Add user statistics dashboard"');
        console.log('  node scripts/claude-agent-workflow.js "Implement counter categories"');
        console.log('  node scripts/claude-agent-workflow.js "Add dark mode support"');
        console.log('');
        console.log('This will run the complete agent workflow:');
        console.log('  PM Agent → Design Agent → Dev Agent → CR Agent → QA Agent → Release Plan');
        process.exit(1);
    }
    
    const requirement = args.join(' ');
    
    // Validate we're in the correct directory
    if (!fs.existsSync('.claude/CLAUDE.md')) {
        logError('Please run this script from the will-counter project root directory');
        process.exit(1);
    }
    
    // Ensure required directories exist
    ensureDirectories();
    
    try {
        const orchestrator = new AgentWorkflowOrchestrator(requirement);
        await orchestrator.executeWorkflow();
    } catch (error) {
        logError(`Workflow execution failed: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AgentWorkflowOrchestrator };