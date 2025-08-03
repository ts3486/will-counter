# Claude Actions: Security and Privacy Guidelines

This document outlines the security and privacy considerations for using Claude AI-powered GitHub Actions in the Will Counter repository.

## 🔒 Security Overview

### Data Transmission Security
- All communications with Claude API use HTTPS encryption
- API keys are stored securely in GitHub Secrets, never in plain text
- Workflow logs do not expose sensitive API responses

### Access Controls
- Workflows run with minimal required GitHub permissions:
  - `contents: read` - To access repository code
  - `pull-requests: write` - To post review comments
  - `issues: write` - To post analysis comments
  - `contents: write` - Only for documentation updates

### Code Analysis Scope
- **PR Reviews**: Only the diff (changed lines) is sent to Claude
- **Issue Analysis**: Only issue title and description are analyzed
- **Documentation**: Only selected source file samples, not entire codebase

## 🛡️ Data Protection Measures

### Sensitive Data Filtering
```yaml
# Automatic exclusions applied:
- Environment files (.env, .env.*)
- Configuration files with credentials
- Certificate and key files
- Large binary files
- Generated/build artifacts
```

### Size Limitations
- PR diffs are limited to 50KB to prevent excessive data transmission
- Source code samples are limited to first 50 lines per file
- API responses are capped at reasonable token limits

### Content Sanitization
Before sending to Claude API, content is checked for:
- Hardcoded passwords or API keys
- Database connection strings
- Personal identifiable information (PII)
- Other sensitive patterns

## 🔐 API Key Management

### GitHub Secrets Configuration
```bash
# Required secret in repository settings:
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Best Practices
- ✅ Use a dedicated API key for GitHub Actions
- ✅ Regularly rotate API keys
- ✅ Monitor API usage through Anthropic dashboard
- ✅ Set appropriate rate limits
- ❌ Never commit API keys to repository
- ❌ Don't share API keys between projects unnecessarily

### Key Rotation Process
1. Generate new API key in Anthropic dashboard
2. Update GitHub repository secret
3. Test workflows with new key
4. Revoke old API key
5. Monitor for any failures

## 📋 Privacy Considerations

### What Data is Sent to Claude
**PR Reviews:**
- Git diff content (changed lines only)
- File paths and names
- Commit messages (not included)
- Repository metadata (name, structure)

**Issue Analysis:**
- Issue title and description
- Issue author username
- Repository context and tech stack info

**Documentation Generation:**
- Selected source code samples
- File structure information
- Recent change summaries

### What Data is NOT Sent
- Complete source code files
- Git history and commit details
- User personal information beyond GitHub usernames
- Environment variables or secrets
- Database content or logs
- External service credentials

### Anthropic Privacy Policy
Data sent to Claude is subject to [Anthropic's Privacy Policy](https://www.anthropic.com/privacy). Key points:
- Anthropic does not use customer data to train models
- Data may be temporarily retained for safety monitoring
- Conversations are not used for marketing or advertising

## 🚨 Security Monitoring

### Automated Checks
Each workflow includes security monitoring:

```yaml
# Example security check in PR review workflow
- name: Check for critical issues
  run: |
    critical_patterns="(password|secret|key|token|auth|credential)"
    if grep -iE "$critical_patterns" pr_diff.txt; then
      echo "⚠️ Potential security-sensitive changes detected"
    fi
```

### Manual Review Triggers
Automatic warnings are posted when:
- Security-sensitive patterns are detected in code changes
- Authentication or authorization code is modified
- Database schema or migration files are changed
- Configuration files are updated

### Security Incident Response
If sensitive data is accidentally exposed:
1. Immediately revoke the affected API key
2. Review Anthropic logs if available
3. Rotate any potentially compromised secrets
4. Update security measures to prevent recurrence
5. Notify team members if necessary

## 🔍 Compliance and Governance

### Regulatory Considerations
- **GDPR**: Minimal personal data processing
- **SOC 2**: Anthropic maintains SOC 2 Type II compliance
- **HIPAA**: Not applicable for this use case
- **Industry Standards**: Following security best practices

### Audit Trail
- All workflow executions are logged in GitHub Actions
- API usage is tracked in Anthropic dashboard
- Security alerts are automatically generated and logged

### Access Logging
Monitor who has access to:
- Repository secrets and settings
- GitHub Actions workflow configurations
- Anthropic API dashboard and usage data

## ⚠️ Risk Assessment

### Low Risk Activities
- Analyzing public code changes
- Generating documentation from public APIs
- Reviewing open-source compatible code patterns

### Medium Risk Activities
- Processing proprietary business logic
- Analyzing authentication flows
- Reviewing database integration code

### High Risk Activities (Avoid)
- Sending production credentials or keys
- Analyzing customer data or PII
- Processing financial or health information

## 🛠️ Configuration Security

### Secure Workflow Configuration
```yaml
# Recommended security settings
on:
  pull_request:
    types: [opened, synchronize]
    # Limit to specific branches
    branches: [main, develop]
    # Exclude sensitive paths
    paths-ignore:
      - '.env*'
      - 'config/secrets/**'
      - 'certs/**'

permissions:
  # Minimal required permissions
  contents: read
  pull-requests: write
  # Never use 'write-all' or overly broad permissions
```

### Environment Restrictions
- Workflows should only run on public repositories or with explicit approval
- Consider using environment protection rules for sensitive operations
- Implement approval workflows for documentation updates in production

## 📞 Incident Reporting

### When to Report Security Issues
- Suspected data leakage to external services
- Unauthorized access to API keys or secrets
- Unexpected workflow behavior or permissions escalation
- Discovery of sensitive data in logs or outputs

### Reporting Process
1. **Immediate**: Revoke affected credentials
2. **Document**: Record the incident details
3. **Notify**: Alert repository maintainers
4. **Investigate**: Determine root cause and impact
5. **Remediate**: Implement fixes and preventive measures
6. **Review**: Update security policies if needed

### Contact Information
- **Repository Security**: Create issue with `security` label
- **Anthropic Support**: [support@anthropic.com](mailto:support@anthropic.com)
- **GitHub Security**: [GitHub Security Advisories](https://github.com/security/advisories)

## 📚 Additional Resources

### Security Documentation
- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Anthropic Safety Documentation](https://www.anthropic.com/safety)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

### Regular Security Reviews
Schedule regular reviews of:
- API key usage and rotation
- Workflow permissions and configurations
- Data processing patterns and content filtering
- Team access to repository secrets
- Compliance with organizational security policies

---

*This document should be reviewed and updated regularly as security practices and requirements evolve.*