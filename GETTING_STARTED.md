# Getting Started with typedoc-mintlify

This guide will help you get the example documentation site up and running.

## Prerequisites

✅ Node.js 16 or higher  
✅ npm, yarn, or pnpm

## Installation & Setup

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

This installs all the plugin dependencies.

### 2. Set Up the Example

Navigate to the example directory and install dependencies:

```bash
cd example
npm install
```

### 3. Generate Documentation

Generate the API documentation from the TypeScript source code:

```bash
npm run docs
```

This will:

- Read the TypeScript code from `src/index.ts`
- Extract JSDoc comments
- Generate Mintlify-compatible markdown files in the `api/` directory
- Add proper frontmatter, components, and formatting

### 4. Preview with Mintlify

Start the Mintlify development server:

```bash
npm run preview
```

Or generate docs and preview in one command:

```bash
npm start
```

### 5. View Your Documentation

Open your browser to:

```
http://localhost:3000
```

You should see a beautiful documentation site with:

- **Introduction** page with overview
- **Installation** guide
- **Quick Start** tutorial
- **API Reference** with auto-generated docs

## What You'll See

### Navigation Structure

The example includes:

**Getting Started Section:**

- Introduction
- Installation
- Quick Start

**API Documentation Section:**

- Classes (UserService, ApiError)
- Interfaces (User, RequestOptions)
- Functions (fetchUser, createUser)
- Enums (ApiErrorType)

### Auto-Generated Features

From the TypeScript code, you'll see:

✅ **Parameter Documentation** - Each parameter with type and description  
✅ **Return Types** - Full type information for return values  
✅ **Code Examples** - Working examples from @example tags  
✅ **Callouts** - Notes and warnings from JSDoc comments  
✅ **Type Links** - Clickable links between related types  
✅ **Mintlify Components** - ParamField, Warning, Note, etc.

## Project Structure

```
example/
├── src/
│   └── index.ts           # TypeScript source with JSDoc
├── api/                   # Generated API docs
│   ├── classes/          # Class documentation
│   ├── interfaces/       # Interface documentation
│   ├── functions/        # Function documentation
│   └── enums/            # Enum documentation
├── introduction.mdx       # Custom welcome page
├── installation.mdx       # Installation guide
├── quickstart.mdx        # Quick start guide
├── mint.json             # Mintlify configuration
└── package.json          # Dependencies & scripts
```

## Customization

### Change Colors & Branding

Edit `example/mint.json`:

```json
{
  "colors": {
    "primary": "#YOUR_COLOR",
    "light": "#YOUR_LIGHT_COLOR",
    "dark": "#YOUR_DARK_COLOR"
  }
}
```

### Add Custom Pages

Create new `.mdx` files in the example directory:

```mdx custom-page.mdx
---
title: My Custom Page
---

# My Custom Page

Add your content here!
```

Then add to `mint.json` navigation:

```json
{
  "navigation": [
    {
      "group": "Getting Started",
      "pages": ["introduction", "custom-page"]
    }
  ]
}
```

### Modify TypeScript Code

1. Edit `example/src/index.ts`
2. Update JSDoc comments
3. Run `npm run docs` to regenerate
4. Refresh browser to see changes

## Available Scripts

### In Root Directory

```bash
npm install           # Install plugin dependencies
npm run lint          # Check code quality
npm run format        # Format code
npm run example       # Generate docs in example/
```

### In Example Directory

```bash
npm install           # Install example dependencies
npm run docs          # Generate API documentation
npm run docs:watch    # Regenerate on file changes
npm run preview       # Start Mintlify dev server
npm start            # Generate + preview
```

## Troubleshooting

### Port Already in Use

If port 3000 is busy:

```bash
PORT=3001 npm run preview
```

### Documentation Not Updating

1. Stop the preview server (Ctrl+C)
2. Regenerate docs: `npm run docs`
3. Restart preview: `npm run preview`

### TypeDoc Errors

Make sure your TypeScript code is valid:

```bash
cd example
npx tsc --noEmit
```

### Mintlify Not Found

Install Mintlify globally:

```bash
npm install -g mintlify
```

Or use npx:

```bash
npx mintlify dev
```

## Next Steps

Now that you have the example running:

1. **📖 Explore the Docs** - Navigate through the generated API documentation
2. **🎨 Customize** - Edit colors, branding, and navigation
3. **✍️ Add Content** - Create custom MDX pages
4. **🚀 Deploy** - Push to GitHub and deploy with Mintlify

## Learn More

- [README](README.md) - Full plugin documentation
- [QUICKSTART](QUICKSTART.md) - 5-minute guide
- [ARCHITECTURE](ARCHITECTURE.md) - Technical details
- [TypeDoc Docs](https://typedoc.org) - TypeDoc documentation
- [Mintlify Docs](https://mintlify.com/docs) - Mintlify documentation

## Need Help?

- 💬 [GitHub Issues](https://github.com/runloopai/typedoc-mintlify/issues)
- 📧 [GitHub Discussions](https://github.com/runloopai/typedoc-mintlify/discussions)
- 🐦 [Twitter @runloopai](https://twitter.com/runloopai)

---

Happy documenting! 🎉
