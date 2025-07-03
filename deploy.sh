#!/bin/bash

# Clear the .next folder to ensure a clean build
rm -rf .next

echo -e "\033[0;34m🧹 Cleared .next folder for a clean build.\033[0m"

# Interactive Branch Merge and Push Script
# Usage: ./merge-and-push.sh "Your commit message"

# Configuration
PERSONAL_REPO_REMOTE="personal"  # Default name for personal repo remote
WORK_BRANCH="b1"                 # Working branch
MASTER_BRANCH="master"           # Master branch in org repo
MAIN_BRANCH="main"               # Main branch in personal repo
DEFAULT_PERSONAL_REPO="https://github.com/kigongo-vincent/trs-fe-build.git"  # Default personal repo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: Not in a git repository${NC}"
        exit 1
    fi
}

# Function to display available remotes
display_remotes() {
    echo -e "${CYAN}📋 Current Git Remotes:${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if ! git remote | grep -q .; then
        echo -e "${RED}❌ No remotes found${NC}"
        return 1
    fi
    
    local index=1
    while read -r remote; do
        local url=$(git remote get-url "$remote" 2>/dev/null)
        echo -e "${BLUE}$index.${NC} ${GREEN}$remote${NC} → ${YELLOW}$url${NC}"
        ((index++))
    done < <(git remote)
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to check if default personal repo already exists as a remote
check_default_repo_exists() {
    while read -r remote; do
        local url=$(git remote get-url "$remote" 2>/dev/null)
        if [ "$url" = "$DEFAULT_PERSONAL_REPO" ]; then
            PERSONAL_REPO_REMOTE="$remote"
            return 0
        fi
    done < <(git remote)
    return 1
}

# Function to auto-add default personal repository
auto_add_default_remote() {
    echo -e "${MAGENTA}🔧 Auto-adding default personal repository${NC}"
    echo -e "${CYAN}Adding: ${YELLOW}$DEFAULT_PERSONAL_REPO${NC}"
    
    # Find an available remote name
    local remote_name="$PERSONAL_REPO_REMOTE"
    local counter=1
    
    while git remote get-url "$remote_name" >/dev/null 2>&1; do
        remote_name="${PERSONAL_REPO_REMOTE}${counter}"
        ((counter++))
    done
    
    PERSONAL_REPO_REMOTE="$remote_name"
    
    # Add the remote
    echo -e "${YELLOW}🔄 Adding remote '$PERSONAL_REPO_REMOTE'...${NC}"
    git remote add "$PERSONAL_REPO_REMOTE" "$DEFAULT_PERSONAL_REPO"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Remote '$PERSONAL_REPO_REMOTE' added successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to add remote '$PERSONAL_REPO_REMOTE'${NC}"
        return 1
    fi
}

# Function to setup personal repository remote
setup_personal_remote() {
    echo ""
    echo -e "${MAGENTA}🔧 Adding New Remote${NC}"
    echo ""
    
    echo -e "${YELLOW}Enter your personal repository URL:${NC}"
    echo -e "${CYAN}Examples:${NC}"
    echo -e "${CYAN}  • https://github.com/yourusername/repo-name.git${NC}"
    echo -e "${CYAN}  • git@github.com:yourusername/repo-name.git${NC}"
    echo ""
    echo -e "${YELLOW}URL:${NC} "
    read -r personal_url
    
    if [ -z "$personal_url" ]; then
        echo -e "${RED}❌ No URL provided${NC}"
        return 1
    fi
    
    # Validate URL format
    if [[ ! "$personal_url" =~ ^(https://|git@) ]]; then
        echo -e "${RED}❌ Invalid URL format. Must start with 'https://' or 'git@'${NC}"
        return 1
    fi
    
    # Ask for custom remote name
    echo ""
    echo -e "${YELLOW}Enter remote name (default: '$PERSONAL_REPO_REMOTE'):${NC} "
    read -r remote_name
    
    if [ -n "$remote_name" ]; then
        PERSONAL_REPO_REMOTE="$remote_name"
    fi
    
    # Check if remote name already exists
    if git remote get-url "$PERSONAL_REPO_REMOTE" >/dev/null 2>&1; then
        echo -e "${RED}❌ Remote '$PERSONAL_REPO_REMOTE' already exists${NC}"
        return 1
    fi
    
    # Add the remote
    echo -e "${YELLOW}🔄 Adding remote '$PERSONAL_REPO_REMOTE'...${NC}"
    git remote add "$PERSONAL_REPO_REMOTE" "$personal_url"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Remote '$PERSONAL_REPO_REMOTE' added successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to add remote '$PERSONAL_REPO_REMOTE'${NC}"
        return 1
    fi
}

# Function to ensure b1 branch exists
ensure_b1_branch() {
    if ! git rev-parse --verify "$WORK_BRANCH" >/dev/null 2>&1; then
        echo -e "${YELLOW}🌱 Creating '$WORK_BRANCH' branch...${NC}"
        
        # Make sure we're on master first
        git checkout "$MASTER_BRANCH" 2>/dev/null
        git checkout -b "$WORK_BRANCH" 2>/dev/null
        
        if git rev-parse --verify "$WORK_BRANCH" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Branch '$WORK_BRANCH' created${NC}"
        else
            echo -e "${RED}❌ Failed to create '$WORK_BRANCH' branch${NC}"
            return 1
        fi
    fi
    return 0
}

# Function to check if remote exists and find personal remote
find_personal_remote() {
    # First check if default personal remote exists
    if git remote get-url "$PERSONAL_REPO_REMOTE" >/dev/null 2>&1; then
        return 0
    fi
    
    # Check for other possible personal remotes (not origin)
    while read -r remote; do
        if [ "$remote" != "origin" ]; then
            PERSONAL_REPO_REMOTE="$remote"
            return 0
        fi
    done < <(git remote)
    
    return 1
}

# Check if commit message is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Commit message is required${NC}"
    echo -e "${YELLOW}Usage: $0 \"Your commit message\"${NC}"
    exit 1
fi

COMMIT_MESSAGE="$1"

# Initial setup and checks
echo -e "${BLUE}🚀 Interactive Git Workflow Script${NC}"
echo ""

# Check if we're in a git repository
check_git_repo

# Step 1: Display current remotes
display_remotes
echo ""

# Step 2: Check if default personal repo already exists, if not add it automatically
if ! check_default_repo_exists; then
    echo -e "${YELLOW}⚠️  Default personal repository not found${NC}"
    if ! auto_add_default_remote; then
        echo -e "${RED}❌ Failed to add default personal repository${NC}"
        exit 1
    fi
    echo ""
    echo -e "${CYAN}📋 Updated remotes:${NC}"
    display_remotes
    echo ""
else
    echo -e "${GREEN}✅ Default personal repository found as remote '$PERSONAL_REPO_REMOTE'${NC}"
    echo ""
fi

# Step 3: Check for other personal remotes or offer to add additional ones
if ! find_personal_remote && ! check_default_repo_exists; then
    echo -e "${YELLOW}⚠️  No personal repository remote found${NC}"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo -e "${CYAN}n)${NC} Add new remote"
    echo -e "${CYAN}c)${NC} Continue with existing remotes"
    echo -e "${CYAN}q)${NC} Quit"
    echo ""
    echo -e "${YELLOW}Choose option:${NC} "
    read -r choice
    
    case $choice in
        n|N)
            if ! setup_personal_remote; then
                echo -e "${RED}❌ Failed to setup personal repository remote${NC}"
                exit 1
            fi
            echo ""
            echo -e "${CYAN}📋 Updated remotes:${NC}"
            display_remotes
            echo ""
            ;;
        c|C)
            echo -e "${YELLOW}⚠️ Continuing without additional personal remote${NC}"
            echo ""
            ;;
        q|Q)
            echo -e "${YELLOW}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option${NC}"
            exit 1
            ;;
    esac
fi

# Ensure b1 branch exists
if ! ensure_b1_branch; then
    exit 1
fi

echo -e "${BLUE}🚀 Starting workflow with commit message: ${COMMIT_MESSAGE}${NC}"
echo ""

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"

# Step 3: Switch to b1 and commit changes
echo -e "${YELLOW}📝 Step 1: Switching to $WORK_BRANCH and committing changes...${NC}"
git checkout "$WORK_BRANCH"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to checkout $WORK_BRANCH${NC}"
    exit 1
fi

# Add all changes and commit
git add .
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit on $WORK_BRANCH${NC}"
else
    git commit -m "$COMMIT_MESSAGE"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to commit changes${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Changes committed to $WORK_BRANCH${NC}"
fi

# Step 4: Push b1 to organization repo
echo -e "${YELLOW}📤 Step 2: Pushing $WORK_BRANCH to origin...${NC}"
git push origin "$WORK_BRANCH"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push $WORK_BRANCH to origin${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Pushed $WORK_BRANCH to origin${NC}"

# Step 5: Switch to master
echo -e "${YELLOW}🔄 Step 3: Switching to $MASTER_BRANCH...${NC}"
git checkout "$MASTER_BRANCH"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to checkout $MASTER_BRANCH${NC}"
    exit 1
fi

# Pull latest changes from master first
git pull origin "$MASTER_BRANCH"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to pull latest $MASTER_BRANCH${NC}"
    exit 1
fi

# Step 6: Merge b1 into master
echo -e "${YELLOW}🔄 Step 4: Merging $WORK_BRANCH into $MASTER_BRANCH...${NC}"
git merge "$WORK_BRANCH" --no-ff -m "Merge $WORK_BRANCH: $COMMIT_MESSAGE"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to merge $WORK_BRANCH into $MASTER_BRANCH${NC}"
    echo -e "${YELLOW}You may need to resolve conflicts manually${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Merged $WORK_BRANCH into $MASTER_BRANCH${NC}"

# Step 7: Push master to organization repo
echo -e "${YELLOW}📤 Step 5: Pushing $MASTER_BRANCH to organization repo (origin)...${NC}"
git push origin "$MASTER_BRANCH"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push $MASTER_BRANCH to origin${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Pushed $MASTER_BRANCH to organization repo${NC}"

# Step 8: Force push master to personal repo's main branch
echo -e "${YELLOW}📤 Step 6: Force pushing to personal repo ($PERSONAL_REPO_REMOTE $MAIN_BRANCH)...${NC}"
git push "$PERSONAL_REPO_REMOTE" "$MASTER_BRANCH:$MAIN_BRANCH" --force
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push to personal repo${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Force pushed $MASTER_BRANCH to $PERSONAL_REPO_REMOTE/$MAIN_BRANCH${NC}"

# Step 9: Return to b1 branch
echo -e "${YELLOW}🔄 Step 7: Returning to $WORK_BRANCH...${NC}"
git checkout "$WORK_BRANCH"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to return to $WORK_BRANCH${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Returned to $WORK_BRANCH${NC}"

# Final Summary
echo ""
echo -e "${GREEN}🎉 Workflow completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Committed changes to $WORK_BRANCH${NC}"
echo -e "${GREEN}✅ Pushed $WORK_BRANCH to organization repo${NC}"
echo -e "${GREEN}✅ Merged $WORK_BRANCH into $MASTER_BRANCH${NC}"
echo -e "${GREEN}✅ Pushed $MASTER_BRANCH to organization repo${NC}"
echo -e "${GREEN}✅ Force pushed $MASTER_BRANCH to $PERSONAL_REPO_REMOTE/$MAIN_BRANCH${NC}"
echo -e "${GREEN}✅ Returned to $WORK_BRANCH${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"