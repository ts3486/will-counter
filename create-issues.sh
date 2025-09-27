#!/bin/bash
# Script to create individual GitHub issues from the individual issue files
# This script can be used by someone with GitHub CLI access

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Creating individual GitHub issues from issue files...${NC}"

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

# Check if issues directory exists
if [ ! -d "issues" ]; then
    echo -e "${RED}Issues directory not found. Make sure you're in the repository root.${NC}"
    exit 1
fi

# Array of issue files and their metadata
declare -a issues=(
    "01-ipad-ui-optimization.md:enhancement,ui/ux,ios,ipad"
    "02-theme-color-update.md:enhancement,ui/ux,design" 
    "03-app-clip-configuration.md:enhancement,ios,appclip,feature"
    "04-user-account-deletion.md:enhancement,security,privacy,auth"
    "05-login-screen-redesign.md:enhancement,ui/ux,design,auth"
    "06-popup-modal-clarification.md:question,enhancement,ui/ux,needs-clarification"
    "07-app-store-screenshots.md:documentation,app-store,marketing"
    "08-support-url-implementation.md:documentation,support,website"
)

# Function to extract title from markdown file
get_title_from_file() {
    local filename="$1"
    # Get the first line starting with # and remove the #
    head -n 1 "issues/$filename" | sed 's/^# *//'
}

# Function to create issue from file
create_issue_from_file() {
    local filename="$1"
    local labels="$2"
    local filepath="issues/$filename"
    
    if [ ! -f "$filepath" ]; then
        echo -e "${RED}✗ Issue file not found: $filepath${NC}"
        return 1
    fi
    
    local title=$(get_title_from_file "$filename")
    echo -e "${YELLOW}Creating issue from ${filename}: ${title}${NC}"
    
    # Create the issue using the full content of the markdown file as body
    gh issue create \
        --title "$title" \
        --body-file "$filepath" \
        --label "$labels" \
        --assignee "@me"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Created issue: ${title}${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to create issue: ${title}${NC}"
        return 1
    fi
}

echo -e "${BLUE}Found ${#issues[@]} issues to create:${NC}"
for issue_data in "${issues[@]}"; do
    IFS=':' read -r filename labels <<< "$issue_data"
    title=$(get_title_from_file "$filename")
    echo -e "  - ${filename}: ${title}"
done

echo ""
read -p "Do you want to proceed with creating these issues? (y/N): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Issue creation cancelled.${NC}"
    exit 0
fi

echo -e "${GREEN}Creating issues...${NC}"
echo ""

# Create each issue
created_count=0
failed_count=0

for issue_data in "${issues[@]}"; do
    IFS=':' read -r filename labels <<< "$issue_data"
    
    if create_issue_from_file "$filename" "$labels"; then
        ((created_count++))
    else
        ((failed_count++))
    fi
    
    # Small delay to avoid rate limiting
    sleep 2
done

echo ""
echo -e "${GREEN}Issue creation completed!${NC}"
echo -e "${GREEN}✓ Successfully created: ${created_count} issues${NC}"
if [ $failed_count -gt 0 ]; then
    echo -e "${RED}✗ Failed to create: ${failed_count} issues${NC}"
fi

# Show created issues
echo ""
echo -e "${BLUE}Recent issues in this repository:${NC}"
gh issue list --limit 10