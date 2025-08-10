# Multi-Agent Software Team

This directory contains agent definitions for the multi-agent software development workflow. Each agent is defined using YAML files following Claude Code's agent format.

## Agent Files

- **[pm-agent.yaml](./pm-agent.yaml)** - Product Manager agent for requirements, scope, and priorities
- **[designer-agent.yaml](./designer-agent.yaml)** - UI/UX Designer agent for user experience and visual design
- **[dev-agent.yaml](./dev-agent.yaml)** - Developer agent for implementation and technical decisions  
- **[cr-agent.yaml](./cr-agent.yaml)** - Code Reviewer agent for quality, security, and maintainability
- **[qa-agent.yaml](./qa-agent.yaml)** - Test Engineer agent for testing strategy and validation
- **[prompt-optimizer-agent.yaml](./prompt-optimizer-agent.yaml)** - Prompt Optimizer agent for creating effective Claude Code prompts

## Agent Format

Each agent YAML file contains:
- **Basic metadata**:
  - `name`: Agent display name
  - `description`: Agent role and purpose
  - `tools`: Available Claude Code tools
  - `project_context`: Project-specific information
  - `responsibilities`: Key responsibilities list
- **Structured configuration**:
  - Templates for common tasks
  - Guidelines and procedures
  - Communication protocols
  - Best practices and patterns

## Workflow

1. **[PM]** defines requirements and acceptance criteria
2. **[DESIGN]** creates user experience and visual design solutions
3. **[DEV]** proposes implementation and creates code changes
4. **[CR]** reviews design and code for quality issues
5. **[QA]** defines test strategy and validates implementation
6. Repeat until **[PM]** approves for release

## Project Context

- **Repository:** will-counter
- **Stack:** Kotlin/Gradle backend, React Native + Expo frontend, Supabase database
- **Branch Strategy:** develop → main
- **Quality Gates:** CI must pass, code coverage ≥ 80%, security scan clear