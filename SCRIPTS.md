# Available Scripts

This document describes all npm scripts available in the project.

## Development Scripts

### `npm test`

Runs the test suite. Currently runs linting before tests.

```bash
npm test
```

### `npm run test:watch`

Runs tests in watch mode for development.

```bash
npm run test:watch
```

### `npm run lint`

Runs ESLint to check for code quality issues.

```bash
npm run lint
```

### `npm run lint:fix`

Automatically fixes linting issues where possible.

```bash
npm run lint:fix
```

### `npm run format`

Formats all code using Prettier.

```bash
npm run format
```

### `npm run format:check`

Checks if code is properly formatted without making changes.

```bash
npm run format:check
```

## Example Scripts

### `npm run example`

Installs dependencies and generates documentation for the example project.

```bash
npm run example
```

This is useful for testing the plugin locally.

### `npm run example:clean`

Removes generated files and dependencies from the example project.

```bash
npm run example:clean
```

### `npm run docs`

Generates documentation using the example project (alias for running docs in example/).

```bash
npm run docs
```

### `npm run docs:watch`

Generates documentation in watch mode, regenerating on file changes.

```bash
npm run docs:watch
```

## Maintenance Scripts

### `npm run clean`

Removes all node_modules and generated files.

```bash
npm run clean
```

Useful for a fresh start when things go wrong.

### `npm run version:check`

Checks for outdated dependencies.

```bash
npm run version:check
```

### `npm run version:update`

Updates dependencies to their latest versions.

```bash
npm run version:update
```

## Release Scripts

### `npm run release`

Creates a new release with automatic version bumping based on conventional commits.

```bash
npm run release
```

This will:

1. Analyze commits since last release
2. Determine version bump (feat → minor, fix → patch)
3. Update CHANGELOG.md
4. Update package.json version
5. Create git commit
6. Create git tag

### `npm run release:patch`

Creates a patch release (0.1.0 → 0.1.1).

```bash
npm run release:patch
```

### `npm run release:minor`

Creates a minor release (0.1.0 → 0.2.0).

```bash
npm run release:minor
```

### `npm run release:major`

Creates a major release (0.1.0 → 1.0.0).

```bash
npm run release:major
```

### `npm run release:dry`

Performs a dry run of the release process without making changes.

```bash
npm run release:dry
```

Useful for previewing what a release would do.

### `npm run postrelease`

Pushes the release to GitHub and publishes to npm (runs automatically after `npm run release`).

```bash
npm run postrelease
```

⚠️ **Warning**: This publishes to npm. Make sure you want to release before running!

## Automatic Scripts

These scripts run automatically at certain times:

### `npm run pretest`

Runs automatically before `npm test`. Runs linting.

### `npm run prepublishOnly`

Runs automatically before publishing to npm. Ensures code is linted and formatted.

### `npm run prepare`

Runs automatically after `npm install`. Sets up Husky git hooks.

## Git Hooks (via Husky)

### pre-commit

Runs automatically before each commit:

- Runs lint-staged (lints and formats only changed files)

### commit-msg

Runs automatically when creating a commit:

- Validates commit message follows Conventional Commits format

## CI/CD Scripts (GitHub Actions)

### Continuous Integration (.github/workflows/ci.yml)

Runs on every pull request and push to main:

- Lints code
- Checks formatting
- Tests example generation
- Validates commit messages
- Runs security audit

### Release Workflow (.github/workflows/release.yml)

Runs on push to main:

- Creates automatic releases based on commits
- Publishes to npm
- Creates GitHub releases

## Common Workflows

### Local Development

```bash
# Setup
npm install

# Make changes to code
# ...

# Test your changes
npm run example

# Format code
npm run format

# Lint
npm run lint:fix

# Commit (hooks will validate automatically)
git commit -m "feat: add new feature"
```

### Before Committing

```bash
# Format all files
npm run format

# Fix linting issues
npm run lint:fix

# Test the example
npm run example

# Commit
git commit -m "feat: your change"
```

The pre-commit hook will automatically lint and format changed files.

### Creating a Release

```bash
# Make sure everything is committed
git status

# Create release (automatic version)
npm run release

# Or specify version bump
npm run release:minor

# Publish (automatic after release)
# Or manually:
npm run postrelease
```

### Testing Locally

```bash
# Generate example docs
npm run example

# Check the output
cd example/mintlify-docs
ls -la

# Preview with Mintlify
npx mintlify dev
```

### Clean Slate

```bash
# Remove everything
npm run clean
npm run example:clean

# Fresh install
npm install
npm run example
```

## Script Dependencies

Some scripts depend on others:

```
test
  └─ pretest (lint)

release
  └─ postrelease (push + publish)

prepublishOnly
  ├─ lint
  └─ format:check

example
  └─ cd example && npm install && npm run docs
```

## Environment Variables

Some scripts may use environment variables:

- `NODE_ENV`: Set to "production" for production builds
- `GITHUB_TOKEN`: Used by release workflow for GitHub operations
- `NPM_TOKEN`: Used by release workflow for npm publishing

## Troubleshooting

### Husky hooks not running

```bash
# Reinstall husky
npm run prepare
```

### Linting fails

```bash
# Auto-fix what can be fixed
npm run lint:fix

# Then manually fix remaining issues
```

### Example fails to generate

```bash
# Clean and retry
npm run example:clean
npm run example
```

### Release fails

```bash
# Check git status
git status

# Make sure you're on main
git checkout main
git pull

# Try dry run first
npm run release:dry
```

## Adding New Scripts

To add a new script:

1. Add to `package.json` in the `scripts` section
2. Document it in this file
3. Add to appropriate workflow if it should run in CI

Example:

```json
{
  "scripts": {
    "my-script": "echo 'Hello World'"
  }
}
```

## Further Reading

- [npm scripts documentation](https://docs.npmjs.com/cli/v9/using-npm/scripts)
- [Husky documentation](https://typicode.github.io/husky/)
- [standard-version documentation](https://github.com/conventional-changelog/standard-version)
- [Conventional Commits](https://www.conventionalcommits.org/)
