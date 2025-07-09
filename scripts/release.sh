#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print usage
show_usage() {
    echo -e "${BLUE}React Native Khalti Checkout Release Script${NC}"
    echo ""
    echo "Usage: $0 [patch|minor|major|prerelease] [--dry-run] [--push-only]"
    echo ""
    echo "Options:"
    echo "  patch       Increment patch version (1.0.0 -> 1.0.1)"
    echo "  minor       Increment minor version (1.0.0 -> 1.1.0)"
    echo "  major       Increment major version (1.0.0 -> 2.0.0)"
    echo "  prerelease  Increment prerelease version (1.0.0 -> 1.0.1-0)"
    echo "  alpha       Create alpha prerelease (1.0.0 -> 1.0.1-alpha.0)"
    echo "  beta        Create beta prerelease (1.0.0 -> 1.0.1-beta.0)"
    echo ""
    echo "  --dry-run   Show what would be done without making changes"
    echo "  --push-only Push existing tags and commits without version bump"
    echo "  --first     First release (no previous tags)"
    echo ""
    echo "Examples:"
    echo "  $0 patch              # Release a patch version"
    echo "  $0 minor --dry-run    # Preview a minor version release"
    echo "  $0 alpha              # Create alpha prerelease"
    echo "  $0 --push-only        # Push existing changes and tags"
    echo "  $0 --first            # First release"
}

# Parse arguments
VERSION_TYPE=""
DRY_RUN=false
PUSH_ONLY=false
FIRST_RELEASE=false

for arg in "$@"; do
    case $arg in
        patch|minor|major|prerelease|alpha|beta)
            VERSION_TYPE=$arg
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
        --push-only)
            PUSH_ONLY=true
            ;;
        --first)
            FIRST_RELEASE=true
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown argument: $arg${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Validate arguments
if [ "$PUSH_ONLY" = false ] && [ "$FIRST_RELEASE" = false ] && [ -z "$VERSION_TYPE" ]; then
    echo -e "${RED}Error: Version type is required${NC}"
    show_usage
    exit 1
fi

if [ "$PUSH_ONLY" = true ] && [ -n "$VERSION_TYPE" ]; then
    echo -e "${RED}Error: Cannot use --push-only with version type${NC}"
    show_usage
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if [ "$PUSH_ONLY" = false ] && [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}Error: You have uncommitted changes. Please commit or stash them first.${NC}"
    git status --short
    exit 1
fi

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${YELLOW}Warning: You're not on the main branch (current: $CURRENT_BRANCH)${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}Current version: $CURRENT_VERSION${NC}"

if [ "$PUSH_ONLY" = true ]; then
    echo -e "${YELLOW}Push-only mode: Pushing existing commits and tags...${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Would run:${NC}"
        echo "  git push origin $CURRENT_BRANCH"
        echo "  git push origin --tags"
    else
        echo -e "${GREEN}Pushing commits and tags...${NC}"
        git push origin "$CURRENT_BRANCH"
        git push origin --tags
        echo -e "${GREEN}✅ Successfully pushed commits and tags${NC}"
    fi
    exit 0
fi

# Preview what will happen
if [ "$FIRST_RELEASE" = true ]; then
    echo -e "${YELLOW}This will create the first release:${NC}"
    echo "  1. Run tests and build"
    echo "  2. Generate CHANGELOG.md"
    echo "  3. Create initial tag"
    echo "  4. Push commits and tags to GitHub"
else
    echo -e "${YELLOW}This will:${NC}"
    echo "  1. Run tests and build"
    echo "  2. Bump version from $CURRENT_VERSION ($VERSION_TYPE)"
    echo "  3. Update CHANGELOG.md with conventional commits"
    echo "  4. Create a git tag"
    echo "  5. Push commits and tags to GitHub"
fi

if [ "$DRY_RUN" = false ]; then
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Release cancelled${NC}"
        exit 0
    fi
fi

# Function to run command with dry-run support
run_cmd() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Would run: $*${NC}"
    else
        echo -e "${GREEN}Running: $*${NC}"
        "$@"
        local exit_code=$?
        if [ $exit_code -ne 0 ]; then
            echo -e "${RED}Command failed with exit code $exit_code${NC}"
            exit $exit_code
        fi
    fi
}

# Run the release process
echo -e "${GREEN}Starting release process...${NC}"

# 1. Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
run_cmd npm ci

# 2. Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
run_cmd npm run test

# 3. Build the package
echo -e "${BLUE}🔨 Building package...${NC}"
run_cmd npm run build

# 4. Version bump with standard-version
echo -e "${BLUE}📈 Creating release with standard-version...${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}[DRY RUN] Would run standard-version${NC}"
    run_cmd npm run release:dry
elif [ "$FIRST_RELEASE" = true ]; then
    run_cmd npm run release:first
elif [ "$VERSION_TYPE" = "patch" ]; then
    run_cmd npm run release:patch
elif [ "$VERSION_TYPE" = "minor" ]; then
    run_cmd npm run release:minor
elif [ "$VERSION_TYPE" = "major" ]; then
    run_cmd npm run release:major
elif [ "$VERSION_TYPE" = "alpha" ]; then
    run_cmd npm run release:alpha
elif [ "$VERSION_TYPE" = "beta" ]; then
    run_cmd npm run release:beta
elif [ "$VERSION_TYPE" = "prerelease" ]; then
    run_cmd npm run release:prerelease
else
    run_cmd npm run release
fi

if [ "$DRY_RUN" = false ]; then
    NEW_VERSION=$(node -p "require('./package.json').version")
    echo -e "${GREEN}Version bumped to: $NEW_VERSION${NC}"
    
    # 5. Push changes
    echo -e "${BLUE}📤 Pushing changes...${NC}"
    run_cmd git push --follow-tags origin "$CURRENT_BRANCH"
    
    echo -e "${GREEN}✅ Release completed successfully!${NC}"
    echo -e "${GREEN}New version: $NEW_VERSION${NC}"
    echo -e "${BLUE}The GitHub Actions workflow will automatically publish to NPM when the tag is pushed${NC}"
else
    echo -e "${YELLOW}[DRY RUN] Release simulation completed${NC}"
    echo -e "${YELLOW}No actual changes were made${NC}"
fi
