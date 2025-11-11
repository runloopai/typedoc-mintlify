# How to Regenerate Documentation

## Quick Command

To regenerate the documentation in the example project:

```bash
cd example
rm -rf api          # Remove old generated files
npm run docs        # Regenerate documentation
```

## Current Behavior

Currently, the documentation generates a **single consolidated file** (`api/index.mdx`) instead of individual files for each type. This is a known limitation with the current theme implementation.

## Why Individual Files Aren't Generated

The `typedoc-plugin-markdown` plugin should generate individual files when configured with:

- `outputFileStrategy: "members"`
- `membersWithOwnFile: ["Class", "Interface", "Function", "Enum", "TypeAlias"]`

However, when using our custom `MintlifyTheme` that extends `MarkdownTheme`, the markdown plugin may not be properly generating individual pages. This is because:

1. The markdown plugin's page generation logic may not be fully compatible with our theme extension
2. The `render()` method override might be interfering with page generation
3. Version 4.2.9 of `typedoc-plugin-markdown` may have different behavior

## Workaround: Using the Consolidated File

For now, the single `api/index.mdx` file contains all documentation and works with Mintlify. The links between types still work within the single file.

## Future Solution

To generate individual files, we would need to:

1. **Post-process the consolidated file**: Split `index.mdx` into individual files based on headings
2. **Use page events**: Hook into TypeDoc's page generation events instead of overriding `render()`
3. **Update theme implementation**: Ensure proper delegation to markdown theme's URL generation

## Checking Generated Files

```bash
cd example
find api -type f -name "*.mdx" | sort
```

Expected: Currently shows only `api/index.mdx`

Desired: Should show individual files like:

- `api/classes/UserService.mdx`
- `api/interfaces/User.mdx`
- `api/functions/fetchUser.mdx`
- etc.
