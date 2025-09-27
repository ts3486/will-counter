#!/bin/bash
# Script to create individual GitHub issues from the breakdown
# This script can be used by someone with GitHub CLI access

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Creating individual GitHub issues from breakdown...${NC}"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLI (gh) is not installed. Please install it first.${NC}"
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Check if user is logged in
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Please login to GitHub CLI first:${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Array of issues to create
declare -a issues=(
    "1:Optimize UI layout and components for iPad 13-inch display:enhancement,ui/ux,ios,ipad"
    "2:Update app theme colors for improved visual design:enhancement,ui/ux,design"
    "3:Configure and implement iOS App Clip functionality:enhancement,ios,appclip,feature"
    "4:Implement user account deletion functionality:enhancement,security,privacy,auth"
    "5:Redesign login screen for improved user experience:enhancement,ui/ux,design,auth"
    "6:Clarify popup/modal requirements and implement:question,enhancement,ui/ux,needs-clarification"
    "7:Create App Store screenshots for iPhone and iPad devices:documentation,app-store,marketing"
    "8:Implement support page and help documentation:documentation,support,website"
)

# Function to create issue
create_issue() {
    local issue_num="$1"
    local title="$2"
    local labels="$3"
    
    echo -e "${YELLOW}Creating issue #${issue_num}: ${title}${NC}"
    
    # Read the issue body from the breakdown file
    # This would need to be customized based on the actual content structure
    local body="See ISSUE_BREAKDOWN.md for detailed specifications for issue #${issue_num}"
    
    # Create the issue
    gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        --assignee "@me"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Created issue: ${title}${NC}"
    else
        echo -e "${RED}✗ Failed to create issue: ${title}${NC}"
    fi
    
    # Small delay to avoid rate limiting
    sleep 1
}

# Create each issue
for issue_data in "${issues[@]}"; do
    IFS=':' read -r issue_num title labels <<< "$issue_data"
    create_issue "$issue_num" "$title" "$labels"
done

echo -e "${GREEN}Issue creation completed!${NC}"
echo -e "${YELLOW}Note: Issue descriptions contain references to ISSUE_BREAKDOWN.md${NC}"
echo -e "${YELLOW}You may want to update issue descriptions with full content from the breakdown file.${NC}"

# Show created issues
echo -e "${GREEN}Created issues:${NC}"
gh issue list --limit 10