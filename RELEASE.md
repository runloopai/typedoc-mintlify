# Release Process

This document describes how to create and publish releases for typedoc-mintlify.

## Prerequisites

1. **Permissions**: You must have publish access to the npm package
2. **Authentication**: Be logged in to npm (`npm login`)
3. **Clean state**: Working directory should be clean (no uncommitted changes)
4. **Main branch**: Should be on the `main` branch
5. **Up to date**: Local branch synced with remote (`git pull`)

## Release Workflow

### 1. Ensure Quality

Before releasing, make sure:

```bash
# Run linting
npm run lint

# Format code
npm run format

# Test the example
npm run example

# Check for outdated dependencies
npm run version:check
```

### 2. Choose Release Type

Determine the appropriate version bump based on changes:

- **Patch (0.1.x)**: Bug fixes, documentation updates, minor improvements
- **Minor (0.x.0)**: New features, new components, backward-compatible changes
- **Major (x.0.0)**: Breaking changes, API changes, removed features

### 3. Create Release

#### Automatic Version Bump

The easiest way is to let standard-version determine the version based on commits:

```bash
npm run release
```

This will:

1. Analyze commits since last release
2. Determine version bump (feat → minor, fix → patch)
3. Update CHANGELOG.md
4. Update package.json version
5. Create git commit with release
6. Create git tag

#### Manual Version Bump

Specify the version bump explicitly:

```bash
# Patch release (0.1.0 → 0.1.1)
npm run release:patch

# Minor release (0.1.0 → 0.2.0)
npm run release:minor

# Major release (0.1.0 → 1.0.0)
npm run release:major
```

#### Preview Changes (Dry Run)

See what would happen without making changes:

```bash
npm run release:dry
```

### 4. Review Changes

Before publishing, review:

```bash
# Check the generated commit
git log -1

# Check the changelog
cat CHANGELOG.md

# Verify package.json version
cat package.json | grep version
```

### 5. Publish to npm

After the release commit and tag are created:

```bash
npm run postrelease
```

This will:

1. Push commits to GitHub
2. Push tags to GitHub
3. Publish to npm

Or do it manually:

```bash
git push --follow-tags origin main
npm publish
```

### 6. Create GitHub Release

Go to GitHub and create a release:

1. Go to: `https://github.com/runloopai/typedoc-mintlify/releases`
2. Click "Draft a new release"
3. Select the tag that was just created
4. Title: Same as tag (e.g., `v0.2.0`)
5. Description: Copy from CHANGELOG.md for this version
6. Click "Publish release"

## Version Guidelines

### Patch Releases (0.1.x)

Use for:

- Bug fixes
- Documentation improvements
- Dependency updates (non-breaking)
- Code refactoring (no API changes)
- Performance improvements

Example commits:

```
fix: correct frontmatter parsing issue
docs: update README examples
perf: optimize type formatting
```

### Minor Releases (0.x.0)

Use for:

- New features
- New Mintlify components
- New configuration options
- Backward-compatible enhancements

Example commits:

```
feat: add Steps component support
feat: add custom frontmatter fields
feat(components): add Frame component
```

### Major Releases (x.0.0)

Use for:

- Breaking API changes
- Removed features or options
- Changed default behavior
- Required migration steps

Example commits:

```
feat!: change default theme behavior
fix!: remove deprecated options

BREAKING CHANGE: The `mintlifyOutput` option now defaults to `docs/` instead of `mintlify-docs/`
```

## Commit Message Guidelines

All commits **must** follow Conventional Commits format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature (triggers MINOR bump)
- `fix`: Bug fix (triggers PATCH bump)
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Reverting changes

### Examples

```bash
# Feature (minor bump)
git commit -m "feat: add accordion component support"

# Bug fix (patch bump)
git commit -m "fix: resolve MDX escaping issue"

# Breaking change (major bump)
git commit -m "feat!: change plugin initialization"
git commit -m "feat: update API

BREAKING CHANGE: Plugin now requires TypeDoc 0.26+"

# With scope
git commit -m "fix(renderer): correct frontmatter generation"
git commit -m "docs(readme): add installation examples"
```

## Rollback

If something goes wrong after publishing:

### Unpublish from npm (within 72 hours)

```bash
npm unpublish typedoc-mintlify@<version>
```

⚠️ **Warning**: Unpublishing is discouraged. Only use for serious issues.

### Publish a Patch

Better approach - publish a fix:

```bash
# Fix the issue
git commit -m "fix: resolve critical bug"

# Release patch
npm run release:patch

# Publish
npm run postrelease
```

### Deprecate Version

If version has issues but can't unpublish:

```bash
npm deprecate typedoc-mintlify@<version> "This version has issues. Please upgrade to <fixed-version>"
```

## Automation (Future)

Consider setting up GitHub Actions to automate:

1. **PR Checks**:
   - Run linting
   - Run tests
   - Check commit messages

2. **Release Automation**:
   - Create release on tag push
   - Auto-publish to npm
   - Generate release notes

3. **Changelog Updates**:
   - Auto-update changelog from commits
   - Link to relevant PRs and issues

Example workflow location: `.github/workflows/release.yml`

## Checklist

Use this checklist for each release:

- [ ] All tests passing
- [ ] Linting passes (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] Example works (`npm run example`)
- [ ] CHANGELOG.md updated (automatic)
- [ ] Version bumped (automatic)
- [ ] Git commit created (automatic)
- [ ] Git tag created (automatic)
- [ ] Pushed to GitHub (`git push --follow-tags`)
- [ ] Published to npm (`npm publish`)
- [ ] GitHub release created
- [ ] Release notes added to GitHub
- [ ] Documentation updated if needed
- [ ] Announced in relevant channels (if major release)

## Support

For questions about releases:

- Check existing releases: https://github.com/runloopai/typedoc-mintlify/releases
- View CHANGELOG: https://github.com/runloopai/typedoc-mintlify/blob/main/CHANGELOG.md
- Open issue: https://github.com/runloopai/typedoc-mintlify/issues
