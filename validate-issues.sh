#!/bin/bash
# Script to validate issue files are properly formatted
# This helps ensure all issues have the required sections

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Validating issue files...${NC}"
echo ""

# Check if issues directory exists
if [ ! -d "issues" ]; then
    echo -e "${RED}Issues directory not found. Make sure you're in the repository root.${NC}"
    exit 1
fi

# Required sections for validation
required_sections=("Description" "Acceptance Criteria" "Labels" "Effort Estimate")

# Issue files to validate
issue_files=$(ls issues/*.md | grep -E "0[1-8]-.*\.md$" | sort)

if [ -z "$issue_files" ]; then
    echo -e "${RED}No issue files found matching pattern 0[1-8]-*.md${NC}"
    exit 1
fi

total_files=0
valid_files=0
issues_found=0

echo -e "${BLUE}Validating issue files:${NC}"
echo ""

for file in $issue_files; do
    filename=$(basename "$file")
    total_files=$((total_files + 1))
    file_issues=0
    
    echo -e "${YELLOW}Checking $filename...${NC}"
    
    # Check if file has a title (starts with #)
    if ! grep -q "^# " "$file"; then
        echo -e "${RED}  ✗ Missing title (line starting with #)${NC}"
        file_issues=$((file_issues + 1))
    fi
    
    # Check for required sections
    for section in "${required_sections[@]}"; do
        if ! grep -q "## $section" "$file"; then
            echo -e "${RED}  ✗ Missing section: $section${NC}"
            file_issues=$((file_issues + 1))
        fi
    done
    
    # Check if acceptance criteria has checklist items
    if grep -q "## Acceptance Criteria" "$file"; then
        if ! grep -A 10 "## Acceptance Criteria" "$file" | grep -q "- \["; then
            echo -e "${YELLOW}  ⚠ Acceptance Criteria section found but no checklist items (- [])${NC}"
            file_issues=$((file_issues + 1))
        fi
    fi
    
    # Check if file has labels section with actual labels
    if grep -q "## Labels" "$file"; then
        labels_line=$(grep -A 2 "## Labels" "$file" | tail -n 1)
        if [[ "$labels_line" =~ ^[[:space:]]*$ ]]; then
            echo -e "${RED}  ✗ Labels section is empty${NC}"
            file_issues=$((file_issues + 1))
        fi
    fi
    
    if [ $file_issues -eq 0 ]; then
        echo -e "${GREEN}  ✓ Valid${NC}"
        valid_files=$((valid_files + 1))
    else
        echo -e "${RED}  ✗ Found $file_issues issue(s)${NC}"
        issues_found=$((issues_found + file_issues))
    fi
    
    echo ""
done

echo -e "${BLUE}Validation Summary:${NC}"
echo -e "  Total files checked: $total_files"
echo -e "  Valid files: $valid_files"
echo -e "  Files with issues: $((total_files - valid_files))"
echo -e "  Total issues found: $issues_found"

if [ $issues_found -eq 0 ]; then
    echo -e "${GREEN}✓ All issue files are properly formatted!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some issues found. Please review and fix before creating GitHub issues.${NC}"
    exit 1
fi