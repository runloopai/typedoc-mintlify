# typedoc-mintlify

A TypeDoc plugin that generates beautiful, Mintlify-compatible markdown documentation from your TypeScript codebase.

This plugin extends [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown) and adds Mintlify-specific components and formatting to create documentation that works seamlessly with [Mintlify](https://mintlify.com).

## Features

- 🎨 **Mintlify Components**: Automatically generates Mintlify MDX components (Accordions, Tabs, Cards, Callouts)
- 📝 **Enhanced Frontmatter**: Adds proper Mintlify frontmatter to all pages
- 🗂️ **Navigation Generation**: Automatically creates `mint.json` navigation file
- 🔧 **API Documentation**: Enhanced parameter and response field documentation
- 🎯 **TypeScript Native**: Full TypeScript support with proper type documentation

## Installation

```bash
npm install typedoc-mintlify typedoc --save-dev
```

Or with yarn:

```bash
yarn add -D typedoc-mintlify typedoc
```

## Usage

### Basic Configuration

Create a `typedoc.json` file in your project root:

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/index.ts"],
  "out": "mintlify-docs",
  "plugin": ["typedoc-mintlify"],
  "theme": "mintlify",
  "readme": "none"
}
```

### Generate Documentation

Run TypeDoc:

```bash
npx typedoc
```

This will generate Mintlify-compatible markdown files in the `mintlify-docs` directory.

### Advanced Configuration

You can customize the plugin behavior with additional options:

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/index.ts"],
  "out": "mintlify-docs",
  "plugin": ["typedoc-mintlify"],
  "theme": "mintlify",
  "mintlifyOutput": "./docs",
  "mintlifyComponents": true,
  "generateMintlifyNav": true,
  "readme": "none"
}
```

### Options

| Option                | Type      | Default           | Description                         |
| --------------------- | --------- | ----------------- | ----------------------------------- |
| `mintlifyOutput`      | `string`  | `./mintlify-docs` | Output directory for Mintlify docs  |
| `mintlifyComponents`  | `boolean` | `true`            | Enable Mintlify-specific components |
| `generateMintlifyNav` | `boolean` | `true`            | Generate mint.json navigation file  |

## Generated Components

This plugin automatically generates the following Mintlify components:

### Callouts

Documentation warnings, notes, and tips are converted to Mintlify callout components:

```mdx
<Warning>This method is deprecated and will be removed in version 2.0</Warning>

<Note>Remember to handle errors appropriately</Note>

<Info>This feature requires authentication</Info>
```

### Parameter Fields

Function and method parameters are enhanced with `ParamField` components:

```mdx
<ParamField path="userId" type="string" required>
  The unique identifier for the user
</ParamField>

<ParamField path="options" type="RequestOptions">
  Optional configuration for the request
</ParamField>
```

### Code Groups

Multiple code examples are grouped together:

````mdx
<CodeGroup>
```typescript Example.ts
const result = await myFunction('hello');
console.log(result);
````

```javascript Example.js
const result = await myFunction('hello');
console.log(result);
```

</CodeGroup>
```

### Cards

Navigation and quick links using card components:

```mdx
<CardGroup cols={2}>
  <Card title="Getting Started" icon="rocket" href="/intro" />
  <Card title="API Reference" icon="code" href="/api" />
</CardGroup>
```

## Project Structure

After running TypeDoc with this plugin, you'll get a structure like:

```
mintlify-docs/
├── mint.json           # Mintlify navigation configuration
├── introduction.mdx    # Main introduction page
├── modules/
│   └── index.mdx
├── classes/
│   ├── MyClass.mdx
│   └── AnotherClass.mdx
├── interfaces/
│   └── MyInterface.mdx
└── functions/
    └── myFunction.mdx
```

## Integration with Mintlify

1. **Initialize Mintlify** (if you haven't already):

   ```bash
   npx mintlify init
   ```

2. **Generate TypeDoc documentation**:

   ```bash
   npx typedoc
   ```

3. **Update your mint.json**: The plugin automatically generates a `mint.json` file with your API documentation structure. You can merge this with your existing Mintlify configuration.

4. **Preview locally**:

   ```bash
   npx mintlify dev
   ```

5. **Deploy**: Push to your repository and Mintlify will automatically deploy your docs.

## Examples

### Example TypeScript Code

````typescript
/**
 * Fetches user data from the API
 * @param userId - The unique identifier for the user
 * @param options - Optional request configuration
 * @returns A promise that resolves to the user data
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

### Generated Mintlify Documentation

````mdx
---
title: 'fetchUser'
description: 'Fetches user data from the API'
---

# fetchUser

Fetches user data from the API

## Parameters

<ParamField path="userId" type="string" required>
  The unique identifier for the user
</ParamField>

<ParamField path="options" type="RequestOptions">
  Optional request configuration
</ParamField>

## Returns

`Promise<User>` - A promise that resolves to the user data

## Example

```typescript
const user = await fetchUser('123');
console.log(user.name);
```
````

````

## Customization

### Custom Theme

You can extend the Mintlify theme to customize rendering:

```javascript
// custom-theme.js
import { MintlifyTheme } from 'typedoc-mintlify/src/theme.js';

export class CustomMintlifyTheme extends MintlifyTheme {
  // Override methods to customize behavior
}
````

Then in your `typedoc.json`:

```json
{
  "theme": "./custom-theme.js"
}
```

## Development

### Available Scripts

The project includes comprehensive npm scripts for development and maintenance:

**Development & Testing:**

```bash
npm test              # Run tests with linting
npm run lint          # Check code quality
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run example       # Generate docs from example project
npm run docs:watch    # Watch mode for documentation
```

**Release Management:**

```bash
npm run release         # Create release (auto version bump)
npm run release:patch   # Patch release (0.1.0 → 0.1.1)
npm run release:minor   # Minor release (0.1.0 → 0.2.0)
npm run release:major   # Major release (0.1.0 → 1.0.0)
npm run release:dry     # Preview release without changes
```

**Maintenance:**

```bash
npm run clean           # Remove all generated files
npm run version:check   # Check for outdated dependencies
npm run version:update  # Update dependencies
```

See [SCRIPTS.md](SCRIPTS.md) for complete documentation of all available scripts.

### Version Management

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) for automated versioning and changelog generation based on [Conventional Commits](https://www.conventionalcommits.org/).

**Commit Message Format:**

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types:**

- `feat:` New feature (triggers MINOR version bump)
- `fix:` Bug fix (triggers PATCH version bump)
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test changes
- `chore:` Maintenance tasks

**Breaking Changes:**
Use `!` after type or add `BREAKING CHANGE:` in footer for MAJOR version bump:

```bash
git commit -m "feat!: change plugin API"
# or
git commit -m "feat: new feature

BREAKING CHANGE: This changes the API"
```

**Examples:**

```bash
git commit -m "feat: add Steps component support"
git commit -m "fix(renderer): resolve frontmatter parsing"
git commit -m "docs: update README examples"
```

### Git Hooks

Husky is configured to run checks automatically:

- **pre-commit**: Runs `lint-staged` to lint and format changed files
- **commit-msg**: Validates commit message follows Conventional Commits

### CI/CD

GitHub Actions workflows are configured for:

- **CI** (`.github/workflows/ci.yml`): Runs on PRs
  - Linting and formatting checks
  - Example generation tests
  - Commit message validation
  - Security audit
  - Tests on Node.js 16, 18, 20

- **Release** (`.github/workflows/release.yml`): Runs on main branch
  - Automatic version bumping
  - Changelog generation
  - npm publishing
  - GitHub release creation

### Creating a Release

1. Make your changes following Conventional Commits
2. Push to main branch or merge PR
3. Manually trigger release (or let CI handle it):
   ```bash
   npm run release
   ```
4. Push tags and publish:
   ```bash
   npm run postrelease
   ```

See [RELEASE.md](RELEASE.md) for detailed release process documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © Alexander Dines

## Links

- [TypeDoc Documentation](https://typedoc.org)
- [TypeDoc Plugin Markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
- [Mintlify Documentation](https://mintlify.com/docs)
- [Mintlify Components](https://mintlify.com/docs/content/components)

## Support

For issues and questions:

- [GitHub Issues](https://github.com/runloopai/typedoc-mintlify/issues)
- [TypeDoc Discord](https://discord.gg/typescript)

---

Made with ❤️ by [Runloop AI](https://github.com/runloopai)
