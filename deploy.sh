#!/bin/bash

# Variables (edit these if needed)
PERSONAL_REPO_REMOTE="personal"
ORG_REPO_REMOTE="origin"
WORK_BRANCH="b1"
DEVELOP_BRANCH="develop"
MASTER_BRANCH="master"
MAIN_BRANCH="main"

# Get commit message and optional flag
COMMIT_MSG="$1"
FLAG="$2"

if [ -z "$COMMIT_MSG" ]; then
  echo "❌ Commit message is required."
  exit 1
fi

# Helper: Commit and push current branch
commit_and_push_branch() {
  local branch=$1
  git checkout "$branch" || exit 1
  git add .
  git commit -m "$COMMIT_MSG" 2>/dev/null
  git push "$ORG_REPO_REMOTE" "$branch"
}

# Helper: Force push b1 to personal develop
sync_b1_to_personal_develop() {
  echo "📤 Syncing $WORK_BRANCH to $PERSONAL_REPO_REMOTE/$DEVELOP_BRANCH"
  git push "$PERSONAL_REPO_REMOTE" "$WORK_BRANCH:$DEVELOP_BRANCH" --force
}

# Helper: Sync master to personal main
sync_master_to_main() {
  echo "📤 Syncing $MASTER_BRANCH to $PERSONAL_REPO_REMOTE/$MAIN_BRANCH"
  git checkout "$MASTER_BRANCH"
  git pull "$ORG_REPO_REMOTE" "$MASTER_BRANCH"
  git push "$ORG_REPO_REMOTE" "$MASTER_BRANCH"
  git push "$PERSONAL_REPO_REMOTE" "$MASTER_BRANCH:$MAIN_BRANCH" --force
}

# Helper: Merge b1 into master and push
merge_b1_to_master() {
  git checkout "$MASTER_BRANCH"
  git pull "$ORG_REPO_REMOTE" "$MASTER_BRANCH"
  git merge "$WORK_BRANCH" --no-ff -m "Merge $WORK_BRANCH into $MASTER_BRANCH"
  git push "$ORG_REPO_REMOTE" "$MASTER_BRANCH"
}

# Helper: Rebase develop onto b1 and push to personal main
rebase_develop_onto_b1_and_push() {
  git fetch "$PERSONAL_REPO_REMOTE"
  git checkout -b temp_develop "$PERSONAL_REPO_REMOTE/$DEVELOP_BRANCH"
  git rebase "$WORK_BRANCH"
  git push "$PERSONAL_REPO_REMOTE" "temp_develop:$MAIN_BRANCH" --force-with-lease
  git checkout "$WORK_BRANCH"
  git branch -D temp_develop
}

# Main logic
if [ -z "$FLAG" ]; then
  echo "🚀 No flag provided: Syncing $WORK_BRANCH to personal $DEVELOP_BRANCH"
  commit_and_push_branch "$WORK_BRANCH"
  sync_b1_to_personal_develop
elif [ "$FLAG" == "1" ]; then
  echo "🚀 Flag = 1: Syncing master to personal main"
  sync_master_to_main
elif [ "$FLAG" == "2" ]; then
  echo "🚀 Flag = 2: Full sync"
  commit_and_push_branch "$WORK_BRANCH"
  sync_b1_to_personal_develop
  merge_b1_to_master
  rebase_develop_onto_b1_and_push
else
  echo "❌ Invalid flag provided. Use none, 1, or 2."
  exit 1
fi
