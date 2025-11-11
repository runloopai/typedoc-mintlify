# Quick Start Guide

Get up and running with typedoc-mintlify in under 5 minutes!

## Prerequisites

- Node.js 16 or higher
- A TypeScript project with JSDoc comments
- Basic familiarity with TypeDoc

## Installation

```bash
npm install --save-dev typedoc typedoc-mintlify
```

## Basic Setup

### 1. Create TypeDoc Configuration

Create a `typedoc.json` file in your project root:

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/index.ts"],
  "out": "mintlify-docs",
  "plugin": ["typedoc-mintlify"],
  "theme": "mintlify"
}
```

### 2. Add Documentation to Your Code

Ensure your TypeScript code has JSDoc comments:

````typescript
/**
 * Fetches user data from the API
 *
 * @param userId - The unique identifier for the user
 * @param options - Optional request configuration
 * @returns A promise that resolves to the user data
 *
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
export async function fetchUser(userId: string, options?: RequestOptions): Promise<User> {
  // Implementation
}
````

### 3. Generate Documentation

Add a script to your `package.json`:

```json
{
  "scripts": {
    "docs": "typedoc"
  }
}
```

Run the documentation generation:

```bash
npm run docs
```

### 4. Preview with Mintlify

Navigate to the output directory and start Mintlify dev server:

```bash
cd mintlify-docs
npx mintlify dev
```

Open your browser to `http://localhost:3000` to see your documentation!

## What Gets Generated

After running `typedoc`, you'll have:

```
mintlify-docs/
├── mint.json              # Navigation configuration
├── introduction.mdx       # Project introduction
├── classes/
│   └── UserService.mdx    # Class documentation
├── interfaces/
│   ├── User.mdx          # Interface documentation
│   └── RequestOptions.mdx
└── functions/
    ├── fetchUser.mdx     # Function documentation
    └── createUser.mdx
```

Each file includes:

- ✅ Proper Mintlify frontmatter
- ✅ Enhanced parameter documentation with `<ParamField>`
- ✅ Callouts for notes, warnings, and tips
- ✅ Code examples in `<CodeGroup>`
- ✅ Type information and signatures

## Customization

### Enable/Disable Features

```json
{
  "plugin": ["typedoc-mintlify"],
  "theme": "mintlify",
  "mintlifyComponents": true,
  "generateMintlifyNav": true,
  "mintlifyOutput": "./docs"
}
```

### Add to Existing Mintlify Site

If you already have a Mintlify site:

1. Generate docs to a subdirectory:

   ```json
   {
     "out": "docs/api"
   }
   ```

2. Update your existing `mint.json` to include the API docs:
   ```json
   {
     "navigation": [
       {
         "group": "API Reference",
         "pages": ["api/introduction", "api/classes/UserService"]
       }
     ]
   }
   ```

## Common Use Cases

### Document a Library

```bash
# Install
npm install --save-dev typedoc typedoc-mintlify

# Configure typedoc.json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "plugin": ["typedoc-mintlify"],
  "theme": "mintlify"
}

# Generate and deploy
npm run docs
cd docs
npx mintlify deploy
```

### Integrate with CI/CD

Add to your GitHub Actions workflow:

```yaml
name: Generate Docs

on:
  push:
    branches: [main]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run docs
      - uses: mintlify/action@v1
        with:
          docs-path: mintlify-docs
```

### Watch Mode for Development

```bash
# Watch TypeScript files and regenerate docs
npx typedoc --watch
```

In another terminal:

```bash
cd mintlify-docs
npx mintlify dev
```

## Troubleshooting

### Issue: Plugin not loading

**Solution**: Ensure `"type": "module"` is in your package.json, or typedoc-mintlify is listed in plugins array.

### Issue: Components not rendering

**Solution**: Check that `mintlifyComponents` option is set to `true` in typedoc.json.

### Issue: Navigation not generated

**Solution**: Verify `generateMintlifyNav` is `true` and you have proper permissions to write to the output directory.

### Issue: Types not displaying correctly

**Solution**: Ensure your TypeScript code has proper type annotations and JSDoc comments.

## Next Steps

- 📖 Read the [full documentation](README.md)
- 🎨 Explore [Mintlify components](https://mintlify.com/docs/content/components)
- 🔧 Learn about [TypeDoc options](https://typedoc.org/options/)
- 🤝 Check out [contributing guide](CONTRIBUTING.md)
- 🏗️ Review [architecture](ARCHITECTURE.md)

## Examples

See the `example/` directory for a complete working example with:

- TypeScript code with comprehensive documentation
- TypeDoc configuration
- Generated output examples

To run the example:

```bash
cd example
npm install
npm run docs
cd mintlify-docs
npx mintlify dev
```

## Support

- 📝 [GitHub Issues](https://github.com/runloopai/typedoc-mintlify/issues)
- 💬 [TypeScript Discord #typedoc](https://discord.gg/typescript)
- 📚 [Mintlify Documentation](https://mintlify.com/docs)

---

Happy documenting! 🚀
