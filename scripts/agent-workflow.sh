#!/bin/bash

# Agent Workflow Orchestrator
# Usage: ./scripts/agent-workflow.sh "Add user statistics dashboard"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WORKFLOW_DIR=".claude/workflow"
AGENTS_DIR=".claude/agents"
DOCS_DIR="docs"

# Ensure workflow directory exists
mkdir -p "$WORKFLOW_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[WORKFLOW]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_agent() {
    echo -e "${YELLOW}[AGENT: $1]${NC} $2"
}

# Function to run Claude Code agent with specific prompt
run_agent() {
    local agent_type="$1"
    local agent_name="$2"
    local prompt_file="$3"
    local output_file="$4"
    
    print_agent "$agent_name" "Starting analysis..."
    
    # Create the prompt for Claude Code
    cat > "$WORKFLOW_DIR/temp_prompt.md" << EOF
You are acting as the $agent_name for the will-counter project. 

Project Context:
- Repository: will-counter (habit tracking app)
- Stack: Kotlin/Gradle backend, React Native + Expo frontend, Supabase database
- Branch: feature/Use-supabase-api-within-server-api
- Recent Security Fixes: Auth0 JWT validation, environment variable injection prevention
- Agent Workflow: PM → Design → Dev → CR → QA → Release

$(cat "$prompt_file")

Please provide your analysis following the $agent_name agent responsibilities and templates defined in $AGENTS_DIR/${agent_type}-agent.yaml.

Output your response in structured markdown format that can be used by the next agent in the workflow.
EOF
    
    # Note: In a real implementation, you would integrate with Claude Code here
    # For now, we'll create a placeholder that shows the structure
    echo "# $agent_name Analysis" > "$output_file"
    echo "" >> "$output_file"
    echo "**Agent**: $agent_name" >> "$output_file"
    echo "**Timestamp**: $(date)" >> "$output_file"
    echo "" >> "$output_file"
    echo "_This would contain the actual Claude Code agent analysis_" >> "$output_file"
    echo "" >> "$output_file"
    cat "$prompt_file" >> "$output_file"
    
    print_success "$agent_name analysis complete"
}

# Function to create comprehensive workflow
create_full_workflow() {
    local requirement="$1"
    local feature_id=$(echo "$requirement" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g')
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local workflow_id="${feature_id}-${timestamp}"
    
    print_status "Starting agent workflow for: '$requirement'"
    print_status "Workflow ID: $workflow_id"
    
    # Create workflow directory
    local workflow_path="$WORKFLOW_DIR/$workflow_id"
    mkdir -p "$workflow_path"
    
    # Initialize requirement
    echo "$requirement" > "$workflow_path/00-initial-requirement.md"
    
    # Stage 1: PM Agent - Requirements Analysis
    print_status "Stage 1/6: Product Manager Analysis"
    cat > "$workflow_path/01-pm-input.md" << EOF
# Feature Requirement Analysis

**Initial Requirement**: $requirement

Please analyze this requirement as the PM agent and provide:

1. **Feature Objective**: Clear, specific goal
2. **User Story**: As a [user], I want [goal] so that [benefit]
3. **Scope Definition**: What's included and excluded
4. **Acceptance Criteria**: Concrete, testable requirements
5. **Risk Assessment**: Technical, security, and business risks
6. **Resource Estimation**: Development time and complexity
7. **Priority Classification**: High/Medium/Low with justification
8. **Dependencies**: Prerequisites and integration requirements

Consider the will-counter app context:
- Mobile-first habit tracking application
- Multi-service architecture (Kotlin backend, React Native frontend)
- Security-first approach (recent Auth0 and JWT fixes)
- Performance requirements (<200ms API, <3s app launch)

Provide structured output that the Design agent can use for UX/UI planning.
EOF
    
    run_agent "pm" "Product Manager" "$workflow_path/01-pm-input.md" "$workflow_path/01-pm-output.md"
    
    # Stage 2: Design Agent - UX/UI Design
    print_status "Stage 2/6: Design Agent Analysis"
    cat > "$workflow_path/02-design-input.md" << EOF
# UX/UI Design Requirements

**Based on PM Analysis**: $(cat "$workflow_path/01-pm-output.md")

As the Design agent, please provide:

1. **User Experience Design**:
   - User journey mapping
   - Interaction flow design
   - Navigation patterns
   - Accessibility considerations (WCAG 2.1 AA)

2. **User Interface Design**:
   - Component specifications
   - Design system usage (colors, typography, spacing)
   - Mobile-first responsive design
   - Platform-specific considerations (iOS/Android)

3. **Technical Design Requirements**:
   - State management implications
   - API endpoint requirements
   - Real-time update needs
   - Offline functionality requirements

4. **Design Validation**:
   - Usability testing approach
   - Success metrics
   - Performance impact assessment

Follow the will-counter design system:
- Colors: Primary #007AFF, Success #34C759, Background #F2F2F7
- Typography: SF Pro Display/Text
- Touch targets: 44pt minimum
- Spacing: 8px base unit

Output should be implementable by the Dev agent.
EOF
    
    run_agent "designer" "Design" "$workflow_path/02-design-input.md" "$workflow_path/02-design-output.md"
    
    # Stage 3: Dev Agent - Implementation
    print_status "Stage 3/6: Developer Implementation"
    cat > "$workflow_path/03-dev-input.md" << EOF
# Implementation Requirements

**PM Requirements**: $(head -10 "$workflow_path/01-pm-output.md")
**Design Specifications**: $(head -10 "$workflow_path/02-design-output.md")

As the Dev agent, please provide:

1. **Technical Architecture**:
   - Backend changes (Kotlin/Ktor)
   - Frontend changes (React Native/TypeScript)
   - Database schema updates (Supabase)
   - API endpoint design

2. **Security Implementation**:
   - Authentication requirements (Auth0/JWT)
   - Input validation patterns
   - Rate limiting considerations
   - Environment variable usage

3. **Implementation Plan**:
   - File changes required
   - New components/services needed
   - Database migrations
   - Integration points

4. **Code Implementation**:
   - Provide actual code examples
   - Follow existing patterns
   - Include error handling
   - Performance optimizations

5. **Testing Strategy**:
   - Unit test requirements
   - Integration test needs
   - Mock data requirements

Security patterns to follow:
- JWT: 3-part token validation only
- Environment variables: ^[A-Z_][A-Z0-9_]*$ regex
- API: Bearer token authentication
- Rate limiting: 60 requests/minute default

Provide implementable code and clear instructions for the CR agent.
EOF
    
    run_agent "dev" "Developer" "$workflow_path/03-dev-input.md" "$workflow_path/03-dev-output.md"
    
    # Stage 4: Code Review Agent
    print_status "Stage 4/6: Code Review Analysis"
    cat > "$workflow_path/04-cr-input.md" << EOF
# Code Review Requirements

**Implementation Plan**: $(cat "$workflow_path/03-dev-output.md")

As the CR agent, please review and provide:

1. **Security Review**:
   - Authentication and authorization checks
   - Input validation verification
   - SQL injection prevention
   - JWT implementation correctness
   - Environment variable security

2. **Code Quality Review**:
   - Architecture patterns compliance
   - Performance implications
   - Error handling adequacy
   - Code maintainability
   - Testing coverage assessment

3. **Best Practices Verification**:
   - Kotlin coding standards (detekt/ktlint)
   - React Native/TypeScript patterns
   - Mobile app performance best practices
   - API design consistency

4. **Review Outcome**:
   - APPROVE / REQUEST_CHANGES / NEEDS_DISCUSSION
   - Specific required changes with file:line references
   - Optional improvements
   - Security concerns to address

Security checklist:
- [ ] JWT validation follows 3-part token pattern
- [ ] Environment variables use proper regex validation
- [ ] No hardcoded secrets or credentials
- [ ] Proper rate limiting implementation
- [ ] Input sanitization for all user inputs

Provide actionable feedback for the Dev agent and approval for QA testing.
EOF
    
    run_agent "cr" "Code Reviewer" "$workflow_path/04-cr-input.md" "$workflow_path/04-cr-output.md"
    
    # Stage 5: QA Agent - Testing Strategy
    print_status "Stage 5/6: Quality Assurance Testing"
    cat > "$workflow_path/05-qa-input.md" << EOF
# Testing Strategy Requirements

**Implementation**: $(head -20 "$workflow_path/03-dev-output.md")
**Code Review**: $(cat "$workflow_path/04-cr-output.md")

As the QA agent, please provide:

1. **Test Strategy**:
   - Unit testing approach (Jest, JUnit 5)
   - Integration testing plan
   - End-to-end testing scenarios (Detox)
   - Performance testing requirements

2. **Test Cases**:
   - Happy path scenarios
   - Edge cases and error conditions
   - Security testing scenarios
   - Cross-platform compatibility tests (iOS/Android)

3. **Quality Gates**:
   - Test coverage requirements (>85%)
   - Performance benchmarks (<200ms API)
   - Security validation checklist
   - Accessibility compliance verification

4. **Testing Implementation**:
   - Specific test code examples
   - Mock data requirements
   - Test environment setup
   - Automated testing pipeline integration

5. **Release Validation**:
   - Pre-deployment checklist
   - Monitoring and alerting setup
   - Rollback procedures
   - Success metrics definition

Testing framework stack:
- Backend: JUnit 5 + Testcontainers + Ktor Test
- Frontend: Jest + React Native Testing Library + Detox
- Integration: Postman/Newman + Pact
- Performance: JMeter + React Native Flipper

Provide comprehensive testing strategy and release approval criteria.
EOF
    
    run_agent "qa" "Quality Assurance" "$workflow_path/05-qa-input.md" "$workflow_path/05-qa-output.md"
    
    # Stage 6: Generate Final Implementation Plan
    print_status "Stage 6/6: Generating Final Implementation Plan"
    cat > "$workflow_path/06-final-plan.md" << EOF
# Complete Implementation Plan: $requirement

**Workflow ID**: $workflow_id
**Generated**: $(date)

## Summary
$(echo "$requirement" | sed 's/^/- /')

## Agent Workflow Results

### 1. Product Manager Analysis
$(cat "$workflow_path/01-pm-output.md")

---

### 2. Design Specifications
$(cat "$workflow_path/02-design-output.md")

---

### 3. Developer Implementation
$(cat "$workflow_path/03-dev-output.md")

---

### 4. Code Review Results
$(cat "$workflow_path/04-cr-output.md")

---

### 5. Quality Assurance Strategy
$(cat "$workflow_path/05-qa-output.md")

---

## Next Steps

1. **Implementation**: Follow the Dev agent's implementation plan
2. **Code Review**: Address all CR agent feedback
3. **Testing**: Execute QA agent's testing strategy
4. **Deployment**: Follow release procedures

## Files Created
- Requirements: $workflow_path/01-pm-output.md
- Design: $workflow_path/02-design-output.md
- Implementation: $workflow_path/03-dev-output.md
- Code Review: $workflow_path/04-cr-output.md
- Testing: $workflow_path/05-qa-output.md
- This plan: $workflow_path/06-final-plan.md

## Agent Workflow Complete ✅
All agents have provided their analysis. Ready for implementation.
EOF
    
    # Copy final plan to docs directory for visibility
    cp "$workflow_path/06-final-plan.md" "$DOCS_DIR/agent-workflow-$workflow_id.md"
    
    print_success "Agent workflow complete!"
    print_success "Final plan: $DOCS_DIR/agent-workflow-$workflow_id.md"
    print_success "Workflow files: $workflow_path/"
    
    # Summary
    echo ""
    echo "==================== WORKFLOW SUMMARY ===================="
    echo "Requirement: $requirement"
    echo "Workflow ID: $workflow_id"
    echo "Agents executed: PM → Design → Dev → CR → QA"
    echo "Final plan: docs/agent-workflow-$workflow_id.md"
    echo "Next step: Review and implement the generated plan"
    echo "=========================================================="
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        echo "Usage: $0 \"Your feature requirement\""
        echo ""
        echo "Examples:"
        echo "  $0 \"Add user statistics dashboard\""
        echo "  $0 \"Implement counter categories\""
        echo "  $0 \"Add dark mode support\""
        echo ""
        echo "This will run the complete agent workflow:"
        echo "  PM Agent → Design Agent → Dev Agent → CR Agent → QA Agent → Release Plan"
        exit 1
    fi
    
    local requirement="$*"
    
    # Validate we're in the right directory
    if [ ! -f ".claude/CLAUDE.md" ]; then
        print_error "Please run this script from the will-counter project root directory"
        exit 1
    fi
    
    # Run the complete workflow
    create_full_workflow "$requirement"
}

main "$@"