#!/bin/bash

# Parse arguments
MESSAGE=""
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --message) MESSAGE="$2"; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

# Check if message is provided
if [ -z "$MESSAGE" ]; then
    echo "Error: Commit message is required. Use --message '{your_message}'."
    exit 1
fi

# Store the root directory
ROOT_DIR=$(pwd)
BUILD_DIR="/Users/mac/documents/builds/trs-fe-build"

# Check if we are on the b1 branch, if not, switch to it
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "b1" ]; then
    echo "Not on b1 branch. Switching to b1..."
    git switch b1 || exit 1
fi

# Add changes and commit
echo "Staging changes..."
git add . || exit 1
echo "Committing changes..."
git commit -m "$MESSAGE" || exit 1

# Push changes to b1
echo "Pushing changes to b1..."
git push origin b1 || exit 1

# Switch to master branch and merge b1 into master
echo "Switching to master branch..."
git switch master || exit 1
echo "Merging b1 into master..."
git merge b1 || exit 1
echo "Pushing changes to master..."
git push origin master || exit 1

# Switch back to b1
echo "Switching back to b1 branch..."
git switch b1 || exit 1

# Build the project as a static site for Netlify
echo "Building the project (static export for Netlify)..."
pnpm build || exit 1
pnpm export || exit 1

# Create build directory if it doesn't exist
echo "Creating build directory if it doesn't exist..."
mkdir -p "$BUILD_DIR"

# Copy static export files to build directory
echo "Copying static site files to build directory..."
cp -r out/* "$BUILD_DIR/" || exit 1

# Change to the build directory
echo "Changing to build directory..."
cd "$BUILD_DIR" || exit 1

# Initialize git if needed and commit changes
if [ ! -d .git ]; then
    git init
    git branch -M master
fi

# Add, commit, and push changes in the build directory
echo "Staging changes in build directory..."
git add . || exit 1
echo "Committing changes in build directory..."
git commit -m "$MESSAGE" || exit 1
echo "Pushing changes in build directory..."
git push || exit 1

# Return to the original directory
echo "Returning to the original directory..."
cd "$ROOT_DIR" || exit 1

echo "Deployment process completed successfully!" 