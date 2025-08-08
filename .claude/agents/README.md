# Multi-Agent Software Team

This directory contains agent definitions for the multi-agent software development workflow.

## Agent Files

- **[pm-agent.md](./pm-agent.md)** - Product Manager agent for requirements, scope, and priorities
- **[dev-agent.md](./dev-agent.md)** - Developer agent for implementation and technical decisions  
- **[cr-agent.md](./cr-agent.md)** - Code Reviewer agent for quality, security, and maintainability
- **[qa-agent.md](./qa-agent.md)** - Test Engineer agent for testing strategy and validation
- **[prompt-optimizer-agent.md](./prompt-optimizer-agent.md)** - Prompt Optimizer agent for creating effective Claude Code prompts

## Usage

Each agent file contains:
- Role definition and responsibilities
- Project-specific context and constraints
- Templates and guidelines
- Communication protocols
- Examples and best practices

## Workflow

1. **[PM]** defines requirements and acceptance criteria
2. **[DEV]** proposes implementation and creates code changes
3. **[CR]** reviews design and code for quality issues
4. **[QA]** defines test strategy and validates implementation
5. Repeat until **[PM]** approves for release

## Project Context

- **Repository:** will-counter
- **Stack:** Kotlin/Gradle backend, React Native + Expo frontend, Supabase database
- **Branch Strategy:** develop → main
- **Quality Gates:** CI must pass, code coverage ≥ 80%, security scan clear