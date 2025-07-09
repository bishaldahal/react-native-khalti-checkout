# Release Process Documentation

This document describes the versioning and release process for the React Native Khalti Checkout package.

## Overview

We use **semantic versioning** with automated changelog generation based on **conventional commits**. The release process is powered by:

- [standard-version](https://github.com/conventional-changelog/standard-version) for automated versioning
- [conventional commits](https://www.conventionalcommits.org/) for structured commit messages
- [commitizen](https://github.com/commitizen/cz-cli) for guided commit message creation
- [commitlint](https://commitlint.js.org/) for commit message validation

## Commit Message Format

We follow the conventional commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scopes

- **android**: Android platform
- **ios**: iOS platform
- **core**: Core functionality
- **types**: TypeScript types
- **docs**: Documentation
- **example**: Example app
- **ci**: CI/CD
- **deps**: Dependencies

### Examples

```bash
feat(android): add support for custom payment methods
fix(core): resolve payment callback timing issue
docs: update installation instructions
chore(deps): update expo-modules-core to latest version
```

## Making Commits

### Using Commitizen (Recommended)

Use the interactive commit tool for guided commit message creation:

```bash
npm run commit
```

This will prompt you to:
1. Select the type of change
2. Choose an optional scope
3. Write a short description
4. Add a longer description (optional)
5. Note any breaking changes (optional)
6. Reference any issues being closed (optional)

### Manual Commits

If you prefer writing commit messages manually, ensure they follow the conventional format:

```bash
git add .
git commit -m "feat(android): add payment timeout configuration"
```

## Release Process

### Automated Release (Recommended)

#### 1. Local Release Script

Use the provided release script for guided releases:

```bash
# Patch release (1.0.0 -> 1.0.1)
./scripts/release.sh patch

# Minor release (1.0.0 -> 1.1.0)
./scripts/release.sh minor

# Major release (1.0.0 -> 2.0.0)
./scripts/release.sh major

# Prerelease (1.0.0 -> 1.0.1-0)
./scripts/release.sh prerelease

# Alpha prerelease (1.0.0 -> 1.0.1-alpha.0)
./scripts/release.sh alpha

# Beta prerelease (1.0.0 -> 1.0.1-beta.0)
./scripts/release.sh beta

# Dry run to see what would happen
./scripts/release.sh patch --dry-run

# First release (for new projects)
./scripts/release.sh --first
```

#### 2. GitHub Actions Workflow

You can also trigger releases through GitHub Actions:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Manual Release" workflow
3. Click "Run workflow"
4. Choose your version bump type and options
5. Click "Run workflow"

### Manual Release

If you need to create a release manually:

```bash
# Install dependencies and run tests
npm ci
npm run test
npm run build

# Create release with standard-version
npm run release:patch  # or minor, major, prerelease, alpha, beta

# Push changes and tags
git push --follow-tags origin main
```

### NPM Scripts

The following NPM scripts are available for releases:

```bash
npm run release                 # Automatic version bump based on commits
npm run release:patch          # Force patch release
npm run release:minor          # Force minor release
npm run release:major          # Force major release
npm run release:prerelease     # Create prerelease
npm run release:alpha          # Create alpha prerelease
npm run release:beta           # Create beta prerelease
npm run release:dry            # Dry run to preview changes
npm run release:first          # First release (no previous tags)
npm run changelog              # Generate changelog only
```

## Automated Publishing

When you push a git tag (e.g., `v1.0.0`), GitHub Actions will automatically:

1. Build the package
2. Run tests
3. Publish to NPM with appropriate tags:
   - Regular releases → `latest` tag
   - Alpha releases → `alpha` tag
   - Beta releases → `beta` tag
   - Other prereleases → `next` tag
4. Create a GitHub release with changelog

## Changelog

The changelog is automatically generated based on conventional commits and follows the [Keep a Changelog](https://keepachangelog.com/) format.

### Sections

- **Features**: New features (`feat` commits)
- **Bug Fixes**: Bug fixes (`fix` commits)
- **Performance Improvements**: Performance improvements (`perf` commits)
- **Code Refactoring**: Code refactoring (`refactor` commits)
- **Documentation**: Documentation changes (`docs` commits)
- **Build System**: Build system changes (`build` commits)
- **Continuous Integration**: CI changes (`ci` commits)

Hidden sections (not shown in changelog):
- `chore`, `style`, `test` commits

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner
- **PATCH** version when you make backwards compatible bug fixes

### Prerelease Versions

- **Alpha**: `1.0.0-alpha.0` - Early development, may have bugs
- **Beta**: `1.0.0-beta.0` - Feature complete, but may have bugs
- **RC**: `1.0.0-rc.0` - Release candidate, ready for release

## Workflow Files

The project includes several GitHub Actions workflows:

### 1. CI Workflow (`.github/workflows/ci.yml`)
- Runs on every push and pull request
- Tests multiple Node.js versions
- Validates commit messages
- Builds the package

### 2. Release Workflow (`.github/workflows/release.yml`)
- Triggers on git tags
- Publishes to NPM
- Creates GitHub releases

### 3. Manual Release Workflow (`.github/workflows/manual-release.yml`)
- Manual trigger from GitHub Actions UI
- Creates releases with specified version bump

### 4. Android Build Workflow (`.github/workflows/android.yml`)
- Builds and tests Android components
- Runs on Android-related file changes

### 5. Dependency Updates Workflow (`.github/workflows/dependencies.yml`)
- Weekly automated dependency checks
- Creates issues for outdated packages
- Security vulnerability scanning

## Configuration Files

- `.versionrc.json` - standard-version configuration
- `commitlint.config.js` - commit message linting rules
- `.cz-config.js` - commitizen configuration
- `package.json` - npm scripts and dependencies

## Best Practices

1. **Always use conventional commits** for automatic changelog generation
2. **Test locally before releasing** using dry-run option
3. **Use meaningful commit messages** that explain the change
4. **Group related changes** into single commits when appropriate
5. **Use scopes** to indicate which part of the codebase is affected
6. **Mark breaking changes** appropriately for major version bumps
7. **Review the generated changelog** before finalizing releases

## Troubleshooting

### Common Issues

1. **Commit message validation fails**
   - Use `npm run commit` for guided message creation
   - Check the conventional commits format

2. **Release script fails**
   - Ensure you have uncommitted changes
   - Check that you're on the main branch
   - Verify tests pass before releasing

3. **NPM publish fails**
   - Check that you're logged into NPM
   - Verify the package name is available
   - Ensure you have publish permissions

4. **GitHub Actions fails**
   - Check that `NPM_TOKEN` secret is configured
   - Verify GitHub token permissions
   - Review the workflow logs for specific errors

For more help, check the existing issues or create a new one.
