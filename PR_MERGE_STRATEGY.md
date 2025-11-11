# PR Merge Strategy for Releases

## How standard-version Works

`standard-version` analyzes **all commits** between the last git tag and HEAD to determine:

- Version bump (patch/minor/major)
- Changelog entries
- Release notes

## Merge Strategy: Squash and Merge ✅

**This project uses Squash and Merge as the preferred merge strategy.**

### What Happens

- All PR commits are squashed into ONE commit on main
- Only the squash commit message is analyzed by standard-version
- The squash commit message MUST follow conventional commits format
- One changelog entry per PR (consolidated)

### How to Format Squash Commit Messages

When creating a PR, ensure the squash commit message follows this format:

```
<type>[optional scope]: <description>

[optional body with details]
```

#### Single Feature PR

If your PR has one main feature:

```
feat(renderer): add automatic type linking

- Generate links for referenced types
- Support generics and complex types
- Add type-to-URL mapping
```

#### Multiple Features/Fixes PR

If your PR has multiple related changes, combine them:

```
feat(renderer,theme): improve type handling and MDX escaping

- Add automatic type linking in renderer
- Fix MDX escaping issues for complex types
- Simplify type attributes in ResponseField components
- Update documentation
```

#### Multiple Unrelated Changes

If your PR has unrelated changes, use the most significant type:

```
feat: major improvements to type rendering

Features:
- Add automatic type linking
- Improve MDX escaping
- Simplify complex type handling

Fixes:
- Correct ResponseField type attributes
- Fix parsing errors with object literals
```

### Examples

**Example 1: Single Feature**

```
feat(navigation): add back links to all pages

- Generate back links to parent or index page
- Support class/interface parent navigation
- Add back link component
```

**Example 2: Multiple Related Changes**

```
fix(renderer): resolve MDX parsing issues with complex types

- Escape angle brackets in type attributes
- Use backticks for complex types in descriptions
- Simplify type attributes to base names
- Fix RequestOptions interface rendering
```

**Example 3: Mixed Changes**

```
feat: enhance type rendering and fix MDX issues

Features:
- Add automatic type linking
- Improve type formatting for complex types

Fixes:
- Resolve MDX parsing errors
- Correct ResponseField type attributes
```

### Best Practices

1. **Use descriptive scope**: `feat(renderer)` or `feat(renderer,theme)` for multiple areas
2. **Include details in body**: List key changes for better changelog readability
3. **Choose the right type**: Use the highest priority type (feat > fix > docs)
4. **Be comprehensive**: Include all significant changes in the message

### What Gets in the Changelog

After squash merge, standard-version will:

- Analyze the ONE squash commit
- Add ONE entry to CHANGELOG.md under the appropriate section
- Use the commit message as the changelog entry

**Example:**

```
### Features

* **renderer,theme:** improve type handling and MDX escaping ([abc123](...))
```

### Automatic Formatting

This project has automated tools to help format squash commit messages:

#### 1. GitHub Settings (Recommended)

Configure GitHub to use PR title as the default squash commit message:

1. Go to repository **Settings** → **Pull Requests**
2. Under "Allow squash merging", select **"Default to PR title for squash merge commits"**

This means:

- Your PR title becomes the squash commit message
- Make sure your PR title follows conventional commits format
- Example PR title: `feat(renderer,navigation): fix interface rendering and add back links`

#### 2. GitHub Action Validation

A GitHub Action automatically:

- ✅ Validates PR titles follow conventional commits format
- ✅ Suggests a squash commit message based on your PR commits
- ✅ Comments on your PR with the suggested message

The action runs on every PR and will fail if the PR title doesn't match the format.

#### 3. Manual Editing

Even with automation, you can still edit the squash commit message when merging:

1. Click "Squash and merge" in GitHub
2. Edit the commit message field
3. Ensure it follows conventional commits format
4. Click "Confirm squash and merge"

### Checking Your Squash Commit

Before merging, you can preview what the squash commit will look like:

1. Check the PR title (if using GitHub's default setting)
2. Review the suggested message in the PR comments (from GitHub Action)
3. Edit the message when merging if needed
4. Ensure it matches conventional commits format

## Current Workflow

Looking at `.github/workflows/release.yml`, the release process:

1. Checks commits since last tag: `git log $(git describe --tags --abbrev=0)..HEAD`
2. Runs `standard-version` which analyzes all commits
3. Generates CHANGELOG.md from all commits

**With Squash and Merge:**

- Only the squash commit is analyzed
- One changelog entry per PR
- Clean, consolidated history

## Best Practice for Your PR

If your PR has commits like:

- `feat(renderer): interface-rendering-fix`
- `feat(navigation): added back links`
- `fix: misc`

**Format the squash commit as:**

```
feat(renderer,navigation): fix interface rendering and add back links

- Fix interface property rendering with complex types
- Add back links to all generated pages
- Resolve MDX parsing issues
- Miscellaneous bug fixes
```

**Or if one is more significant:**

```
feat(renderer): fix interface rendering and add navigation improvements

- Fix interface property rendering with complex types
- Add back links to all generated pages
- Resolve MDX parsing issues
- Miscellaneous bug fixes
```

This ensures:

1. ✅ Proper conventional commits format
2. ✅ All changes are documented
3. ✅ Clear changelog entry
4. ✅ Correct version bump (feat → minor)

## Checking Your Merge Strategy

To see what commits standard-version will analyze:

```bash
# See commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Dry run to see what would be in changelog
npm run release:dry
```
