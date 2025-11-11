# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-11-11

### Features

- Initial alpha release of typedoc-mintlify
- Integration with typedoc-plugin-markdown for base markdown generation
- Mintlify theme implementation extending MarkdownTheme
- Support for essential Mintlify components:
  - Accordion and AccordionGroup
  - Tabs
  - CodeGroup for multiple code examples
  - Card and CardGroup for navigation
  - Callouts (Note, Warning, Info, Check)
  - ParamField for API parameter documentation
  - ResponseField for API response documentation
- Automatic mint.json navigation generation
- Frontmatter generation for all documentation pages
- Enhanced parameter documentation with type information
- Code block transformation for better syntax highlighting
- Utility functions for MDX formatting and type handling
- Comprehensive example project demonstrating usage
- Full documentation suite (README, QUICKSTART, ARCHITECTURE, CONTRIBUTING)
- Version management with standard-version
- Code quality tooling (ESLint, Prettier, Husky)
- Conventional Commits enforcement

### Documentation

- Complete README with installation, usage, and examples
- Quick start guide for getting up and running in 5 minutes
- Architecture documentation explaining design decisions
- Contributing guide for developers
- Example TypeScript project with comprehensive JSDoc comments

### Developer Experience

- ESLint configuration for code quality
- Prettier configuration for consistent formatting
- Husky pre-commit hooks for automated checks
- Lint-staged for efficient pre-commit linting
- Conventional Commits validation
- Automated changelog generation
- Semantic versioning with standard-version

---

## Release Types

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes that require user action
- **MINOR** (0.x.0): New features that are backward compatible
- **PATCH** (0.0.x): Bug fixes and minor improvements

## Generating Releases

To create a new release:

```bash
# Automatic version bump based on commits
npm run release

# Or specify the version bump
npm run release:patch  # 0.1.0 -> 0.1.1
npm run release:minor  # 0.1.0 -> 0.2.0
npm run release:major  # 0.1.0 -> 1.0.0

# Preview what would change (dry run)
npm run release:dry
```

## Commit Message Format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Types that trigger version bumps:

- `feat:` → MINOR version bump
- `fix:` → PATCH version bump
- `feat!:` or `BREAKING CHANGE:` → MAJOR version bump

Other types (for changelog organization):

- `docs:` Documentation changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test changes
- `chore:` Maintenance tasks
- `ci:` CI/CD changes
- `build:` Build system changes
