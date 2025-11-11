# Contributing to typedoc-mintlify

Thank you for your interest in contributing to typedoc-mintlify! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/typedoc-mintlify.git
   cd typedoc-mintlify
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run Example**
   ```bash
   cd example
   npm install
   npm run docs
   ```

## Project Structure

```
typedoc-mintlify/
├── index.js              # Main plugin entry point
├── src/
│   ├── theme.js         # Mintlify theme implementation
│   ├── renderer.js      # Page rendering logic
│   ├── components.js    # Mintlify component generators
│   └── navigation.js    # mint.json generation
├── example/             # Example project
└── README.md
```

## Making Changes

1. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the existing code style
   - Add JSDoc comments to new functions
   - Update README if adding new features

3. **Test Your Changes**

   ```bash
   cd example
   npm run docs
   ```

   Check the generated output in `example/mintlify-docs/`

4. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `refactor:` for code refactoring
   - `test:` for test changes

5. **Push and Create PR**

   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a Pull Request on GitHub.

## Adding New Mintlify Components

To add support for a new Mintlify component:

1. Add the component generator to `src/components.js`:

   ```javascript
   /**
    * Generate NewComponent
    * @param {string} title - Component title
    * @returns {string} Mintlify component MDX
    */
   newComponent(title) {
     return `<NewComponent title="${title}">
   Content here
   </NewComponent>`;
   }
   ```

2. Expose it in the theme context in `src/theme.js`:

   ```javascript
   mintlify: {
     // ... existing components
     newComponent: this.components.newComponent.bind(this.components),
   }
   ```

3. Add usage documentation to README.md

4. Add an example in the example project

## Code Style

- Use JSDoc comments for all functions and classes
- Use `@ts-check` at the top of JavaScript files
- Follow ESM module syntax
- Prefer `const` over `let`
- Use descriptive variable and function names

## Testing

Currently, testing is done manually by running the example project. We welcome contributions to add automated testing!

To test manually:

1. Make your changes
2. Run `npm run docs` in the example directory
3. Check the generated markdown files
4. Verify they render correctly in Mintlify

## Documentation

When adding new features:

- Update README.md with usage examples
- Add JSDoc comments to your code
- Update this CONTRIBUTING.md if the development process changes

## Questions?

- Open an issue for bugs or feature requests
- Join the TypeScript Discord #typedoc channel
- Check the [TypeDoc documentation](https://typedoc.org)
- Check the [Mintlify documentation](https://mintlify.com/docs)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
