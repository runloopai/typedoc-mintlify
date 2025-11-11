# Generating Individual Pages for Classes/Interfaces/Functions

## Current Status

The `typedoc-plugin-markdown` plugin is currently generating a **single consolidated file** (`api/index.mdx`) instead of individual pages for each class, interface, function, etc.

## Why Individual Pages Are Needed

For links between classes to work properly in Mintlify, we need:

- Separate `.mdx` files for each class (e.g., `api/classes/UserService.mdx`)
- Separate files for each interface (e.g., `api/interfaces/User.mdx`)
- Separate files for each function (e.g., `api/functions/fetchUser.mdx`)
- Proper cross-references between these files

## Current Behavior

The markdown plugin consolidates everything into a single `index.mdx` file when:

- There's only one entry point/module
- The project structure is simple
- Default configuration is used

## Solutions

### Option 1: Configure Markdown Plugin for Individual Pages

The `typedoc-plugin-markdown` plugin should generate individual pages by default, but may need configuration:

```json
{
  "plugin": ["typedoc-plugin-markdown", "typedoc-mintlify"],
  "theme": "mintlify",
  "flattenOutputFiles": false,
  "entryFileName": "index.md"
}
```

### Option 2: Post-Process Single File

If the plugin continues to generate a single file, we could:

1. Parse the generated `index.mdx`
2. Split it into individual pages based on headings
3. Generate proper file structure
4. Update links to point to individual pages

### Option 3: Use Markdown Theme Directly

Instead of extending the markdown theme, we could:

1. Use the markdown theme directly
2. Hook into page generation events
3. Enhance each page as it's generated

## Next Steps

1. **Investigate markdown plugin version**: Check if version 4.2.9 has different defaults
2. **Check plugin documentation**: Verify the correct configuration for individual pages
3. **Test with multiple modules**: See if multiple entry points trigger individual page generation
4. **Implement post-processing**: If needed, add logic to split the consolidated file

## Testing

To test if individual pages are being generated:

```bash
cd example
npm run docs
find api -type f -name "*.mdx"
```

Expected output should include:

- `api/classes/UserService.mdx`
- `api/interfaces/User.mdx`
- `api/functions/fetchUser.mdx`
- etc.

## References

- [typedoc-plugin-markdown GitHub](https://github.com/tgreyuk/typedoc-plugin-markdown)
- [TypeDoc Themes Documentation](https://typedoc.org/documents/Development.Themes.html)
