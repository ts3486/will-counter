# Claude Actions Documentation

This repository is equipped with automated workflows powered by Claude (Anthropic's LLM) to enhance development productivity and code quality. These "Claude Actions" provide intelligent automation for common development tasks.

## 🤖 Available Claude Workflows

### 1. Claude PR Review (`claude-pr-review.yml`)

**Trigger**: Automatically runs on pull request events (opened, synchronize, reopened)

**What it does**:
- Analyzes code changes in pull requests
- Provides intelligent code review feedback
- Checks for security concerns and best practices
- Posts review comments directly on the PR
- Flags critical security patterns for manual review

**Features**:
- Context-aware reviews for React Native + Kotlin architecture
- Security-focused analysis for Auth0 and Supabase integrations
- TypeScript and Kotlin best practices validation
- Constructive feedback with improvement suggestions

### 2. Claude Issue Analysis (`claude-issue-analysis.yml`)

**Trigger**: Automatically runs when new issues are opened or reopened

**What it does**:
- Analyzes issue content and provides structured triage
- Classifies issues by type, priority, and complexity
- Suggests appropriate labels and next steps
- Identifies which components/modules are affected
- Auto-applies relevant labels based on content analysis

**Benefits**:
- Faster issue triage and prioritization
- Consistent labeling and categorization
- Better initial assessment for maintainers
- Reduced manual overhead for issue management

### 3. Claude Documentation Update (`claude-docs-update.yml`)

**Trigger**: 
- Automatically on pushes to main branch with code changes
- Manually via workflow dispatch with documentation type selection

**What it does**:
- Generates up-to-date API documentation from Kotlin code
- Creates comprehensive frontend documentation from React Native code
- Analyzes recent changes and updates relevant documentation
- Creates pull requests with generated documentation

**Documentation Generated**:
- `docs/api-documentation.md` - Kotlin API endpoints and usage
- `docs/frontend-documentation.md` - React Native architecture and patterns

## 🔧 Setup Instructions

### Prerequisites

1. **Anthropic API Key**: You need an API key from Anthropic to use Claude
   - Sign up at [Anthropic](https://www.anthropic.com/)
   - Generate an API key from your dashboard

### Configuration Steps

1. **Add GitHub Secret**:
   ```
   Repository Settings > Secrets and variables > Actions > New repository secret
   
   Name: ANTHROPIC_API_KEY
   Value: [Your Anthropic API key]
   ```

2. **Repository Permissions**:
   Ensure the repository has the following permissions for GitHub Actions:
   - Contents: Read/Write (for documentation updates)
   - Pull requests: Write (for posting review comments)
   - Issues: Write (for posting analysis comments)

3. **Labels Setup** (Optional):
   Create these labels in your repository for better issue categorization:
   - `bug`, `enhancement`, `documentation`
   - `auth`, `ui/ux`, `backend`, `frontend`, `database`
   - `triage`

### Verification

Once configured, the workflows will automatically trigger on relevant events. You can verify setup by:

1. Creating a test pull request to trigger the review workflow
2. Opening a test issue to trigger the analysis workflow
3. Manually running the documentation workflow via Actions tab

## 🛡️ Security and Privacy

### Data Handling
- **Code Review**: Only the diff content is sent to Claude, not the entire codebase
- **Issue Analysis**: Only the issue title and description are analyzed
- **Documentation**: Only specific source file samples are processed
- **Size Limits**: Large diffs are truncated to respect API limits

### Security Measures
- API keys are stored securely in GitHub Secrets
- Workflows have minimal required permissions
- Security-sensitive patterns trigger additional manual review warnings
- No sensitive data (secrets, credentials) should be included in code being analyzed

### Privacy Considerations
- Code sent to Claude API is subject to Anthropic's privacy policy
- Consider excluding certain file types or directories if needed
- Review generated content before merging documentation PRs

## 🎯 Use Cases and Benefits

### For Developers
- **Faster Code Reviews**: Get immediate feedback on PRs
- **Learning Tool**: Learn best practices from Claude's suggestions
- **Consistency**: Maintain coding standards across the team
- **Documentation**: Always up-to-date technical documentation

### For Maintainers
- **Issue Triage**: Automatic classification and labeling of issues
- **Reduced Overhead**: Less manual work on routine tasks
- **Quality Assurance**: Additional layer of code quality checking
- **Knowledge Transfer**: Documented patterns and practices

### For Project Management
- **Better Visibility**: Structured issue analysis helps with planning
- **Risk Assessment**: Early identification of security concerns
- **Documentation Maintenance**: Automatically updated project docs

## 🔧 Customization Options

### Adjusting Claude Models
You can modify the Claude model used in each workflow:
- `claude-3-haiku-20240307` - Fast, cost-effective (current default)
- `claude-3-sonnet-20240229` - Balanced performance and capability
- `claude-3-opus-20240229` - Most capable, higher cost

### Customizing Prompts
Each workflow contains detailed prompts that can be customized for your specific needs:
- Modify the context descriptions for your project
- Add specific coding standards or practices to check
- Adjust the focus areas based on your priorities

### Workflow Triggers
You can modify when workflows run by changing the trigger conditions:
- Add/remove file path filters
- Change branch targets
- Adjust event types (e.g., only on certain PR events)

## 🐛 Troubleshooting

### Common Issues

**1. "ANTHROPIC_API_KEY secret not configured"**
- Solution: Add the API key to repository secrets as described in setup

**2. API rate limiting errors**
- Solution: Consider using a different Claude model or implementing retry logic
- Monitor your Anthropic API usage dashboard

**3. Workflows not triggering**
- Check that file paths match the workflow triggers
- Verify repository permissions are correctly set
- Review the Actions tab for any error messages

**4. Review comments not posting**
- Ensure the GITHUB_TOKEN has write permissions for pull requests
- Check if the repository has restrictions on automated comments

### Getting Help

1. Check the Actions tab for detailed workflow logs
2. Review the security tab for any permissions issues
3. Test with smaller PRs/issues first to debug configuration
4. Consult Anthropic's API documentation for Claude-specific issues

## 📊 Monitoring and Analytics

### Tracking Usage
Monitor the effectiveness of Claude Actions through:
- GitHub Actions usage metrics
- Anthropic API dashboard for token consumption
- PR review comment feedback from team members
- Issue resolution time improvements

### Cost Management
- Monitor API usage to manage costs
- Consider using different models for different workflows
- Implement usage limits if needed
- Review and optimize prompts for efficiency

## 🚀 Future Enhancements

Potential improvements to consider:
- **Commit Message Generation**: Auto-generate meaningful commit messages
- **Release Notes**: Generate release notes from PR changes
- **Code Quality Metrics**: Track improvements over time
- **Integration Testing**: Generate test cases based on code changes
- **Dependency Analysis**: Review dependency updates and security implications

## 🤝 Contributing

To improve the Claude Actions workflows:
1. Test changes in a fork first
2. Update documentation for any new features
3. Consider the impact on API usage costs
4. Ensure security best practices are maintained

---

*For questions about Claude Actions setup or usage, please create an issue in this repository with the `claude-actions` label.*