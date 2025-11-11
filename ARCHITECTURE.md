# Architecture Documentation

This document explains the architecture and design of typedoc-mintlify.

## Overview

typedoc-mintlify is a TypeDoc plugin that generates Mintlify-compatible markdown documentation. It extends the [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown) plugin and adds Mintlify-specific components and formatting.

## Architecture Diagram

```
TypeDoc Application
       ↓
typedoc-mintlify Plugin (index.js)
       ↓
   ┌────────────────────┐
   │ Plugin Load        │
   │ - Register options │
   │ - Register theme   │
   │ - Add event hooks  │
   └────────┬───────────┘
            ↓
   ┌────────────────────┐
   │ MintlifyTheme      │ (src/theme.js)
   │ - Extends          │
   │   MarkdownTheme    │
   │ - Adds Mintlify    │
   │   context          │
   └────────┬───────────┘
            ↓
   ┌────────────────────────────────────┐
   │ MintlifyPageRenderer               │ (src/renderer.js)
   │ - Adds frontmatter                 │
   │ - Transforms code blocks           │
   │ - Converts callouts to components  │
   │ - Enhances API docs                │
   └────────┬───────────────────────────┘
            ↓
   ┌────────────────────┐
   │ MintlifyComponents │ (src/components.js)
   │ - Accordion        │
   │ - Tabs             │
   │ - Cards            │
   │ - Callouts         │
   │ - ParamField       │
   │ - ResponseField    │
   └────────────────────┘
            ↓
   ┌────────────────────┐
   │ Utilities          │ (src/utils.js)
   │ - MDX escaping     │
   │ - Type formatting  │
   │ - Slugification    │
   │ - Example          │
   │   extraction       │
   └────────────────────┘
            ↓
   ┌────────────────────┐
   │ MintlifyNavigation │ (src/navigation.js)
   │ - Generate         │
   │   mint.json        │
   │ - Build nav tree   │
   └────────────────────┘
            ↓
   Mintlify-compatible Markdown Files
```

## Components

### 1. index.js (Plugin Entry Point)

The main entry point that TypeDoc loads. It:

- Implements the required `load(app)` function
- Registers custom TypeDoc options for Mintlify
- Registers the MintlifyTheme
- Attaches event listeners for rendering lifecycle

**Key functions:**

- `load(app)`: Main plugin initialization

**Events listened to:**

- `beginRender`: Setup before rendering starts
- `endRender`: Generate mint.json after rendering completes

### 2. src/theme.js (MintlifyTheme)

Extends the MarkdownTheme from typedoc-plugin-markdown to provide Mintlify-specific customization.

**Key features:**

- Adds Mintlify component generators to the rendering context
- Overrides `getRenderContext()` to inject Mintlify helpers
- Overrides `render()` to use MintlifyPageRenderer

**Context additions:**

```javascript
{
  mintlify: {
    (accordion, tabs, codeGroup, card, cardGroup, callout, check, info, warning, note);
  }
}
```

### 3. src/renderer.js (MintlifyPageRenderer)

Handles the actual rendering of individual documentation pages with Mintlify enhancements.

**Key transformations:**

1. **Frontmatter**: Adds YAML frontmatter with title and description
2. **Code blocks**: Groups related code examples
3. **Callouts**: Converts markdown blockquotes to Mintlify components
4. **API docs**: Enhances parameter documentation with ParamField components

**Processing pipeline:**

```
Original Content
  → addFrontmatter()
  → transformCodeBlocks()
  → transformCallouts()
  → enhanceApiDocs()
  → Final MDX Content
```

### 4. src/components.js (MintlifyComponents)

Generates Mintlify-specific MDX components. Each method returns properly formatted MDX strings.

**Component generators:**

- `accordion(title, content)`: Single accordion
- `accordionGroup(accordions)`: Group of accordions
- `tabs(tabs)`: Tabbed content
- `codeGroup(codeBlocks)`: Multiple code examples
- `card(title, icon, href)`: Single card
- `cardGroup(cards, cols)`: Grid of cards
- `callout(type, content, title)`: Generic callout
- `check/info/warning/note()`: Specific callout types
- `paramField(name, type, required, desc)`: API parameter
- `responseField(name, type, desc)`: API response field

### 5. src/navigation.js (MintlifyNavigation)

Generates the `mint.json` configuration file that Mintlify uses for navigation.

**Key features:**

- Traverses the TypeDoc project structure
- Groups documentation by kind (Classes, Interfaces, Functions, etc.)
- Generates proper file paths for navigation
- Creates a complete mint.json structure

**Navigation structure:**

```javascript
{
  name: "Project Name",
  navigation: [
    { group: "Getting Started", pages: [...] },
    { group: "Classes", pages: [...] },
    { group: "Interfaces", pages: [...] }
  ]
}
```

### 6. src/utils.js (Utility Functions)

Helper functions used throughout the plugin.

**Key utilities:**

- `escapeMdx(text)`: Escapes MDX special characters
- `sanitizeAttribute(text)`: Prepares text for use in attributes
- `formatType(type)`: Formats TypeDoc types for display
- `extractExamples(comment)`: Pulls code examples from JSDoc
- `slugify(text)`: Creates URL-safe slugs
- `getKindLabel(kind)`: Converts TypeDoc kinds to labels
- `getIconForKind(kind)`: Maps kinds to Mintlify icons
- `groupByKind(reflections)`: Groups reflections by type

## Data Flow

### 1. Plugin Initialization

```
TypeDoc loads plugin
  → load(app) called
  → Options registered
  → Theme registered
  → Event listeners attached
```

### 2. Documentation Generation

```
TypeDoc processes source files
  → Creates reflection tree
  → Fires beginRender event
  → For each documentation page:
      → MintlifyTheme.render() called
      → MintlifyPageRenderer processes content
      → Components generated as needed
      → MDX file written
  → Fires endRender event
  → MintlifyNavigation generates mint.json
```

### 3. Content Transformation

```
TypeDoc markdown content
  → Add frontmatter
  → Transform syntax
      → Blockquotes → Callouts
      → Parameters → ParamField
      → Examples → CodeGroup
  → Generate components
  → Output MDX
```

## Extension Points

### Adding New Components

1. Add generator to `src/components.js`:

```javascript
newComponent(props) {
  return `<NewComponent ${props}>
Content
</NewComponent>`;
}
```

2. Expose in theme context (`src/theme.js`):

```javascript
mintlify: {
  // ...
  newComponent: this.components.newComponent.bind(this.components);
}
```

3. Use in renderer (`src/renderer.js`):

```javascript
content = content.replace(/pattern/, () => {
  return this.theme.components.newComponent(data);
});
```

### Customizing Transformations

Extend `MintlifyPageRenderer` and override transformation methods:

```javascript
class CustomRenderer extends MintlifyPageRenderer {
  transformCodeBlocks(content) {
    // Custom logic
    return super.transformCodeBlocks(content);
  }
}
```

### Adding Options

In `index.js`:

```javascript
app.options.addDeclaration({
  name: 'myOption',
  help: 'Description',
  type: 'boolean',
  defaultValue: true,
});
```

Access in code:

```javascript
const value = app.options.getValue('myOption');
```

## Design Decisions

### Why Extend typedoc-plugin-markdown?

- Reuses proven markdown generation logic
- Avoids reinventing template rendering
- Focus on Mintlify-specific enhancements
- Easier maintenance with upstream updates

### Why ESM?

- TypeDoc 0.25+ is ESM-native
- Better Node.js ecosystem support
- Avoids experimental warnings

### Why Component Generators?

- Type-safe component creation
- Consistent formatting
- Easy to test and modify
- Reusable across different renderers

### Why Separate Utilities?

- Single responsibility principle
- Easier testing
- Reusable across modules
- Clear dependencies

## Performance Considerations

1. **Streaming**: Files written as generated, not all in memory
2. **Lazy loading**: Components generated only when needed
3. **Caching**: Could be added for repeated type formatting
4. **Minimal dependencies**: Only typedoc-plugin-markdown required

## Testing Strategy

Current: Manual testing with example project
Future:

- Unit tests for component generators
- Integration tests for transformations
- Snapshot tests for output
- E2E tests with real TypeScript projects

## Future Enhancements

1. **Template System**: Allow custom templates for pages
2. **Component Library**: More Mintlify components
3. **Incremental Generation**: Only regenerate changed files
4. **Custom Frontmatter**: User-defined frontmatter fields
5. **Multi-language Examples**: Support for multiple programming languages
6. **Search Integration**: Generate search index for Mintlify
7. **Version Support**: Handle versioned documentation

## Dependencies

- **typedoc**: Peer dependency (>=0.25.0)
- **typedoc-plugin-markdown**: Direct dependency (^4.0.0)
- **Node.js**: >=16

## Security Considerations

1. **Input Sanitization**: All user content is escaped for MDX
2. **Path Traversal**: Output paths validated
3. **No Eval**: No dynamic code execution
4. **Dependency Audit**: Regular security updates

## Maintenance

### Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Run tests
4. Create git tag
5. Publish to npm

### Versioning

Following semantic versioning:

- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

### Documentation Updates

- README.md: User-facing documentation
- ARCHITECTURE.md: This file
- CONTRIBUTING.md: Developer guide
- Code comments: Implementation details
