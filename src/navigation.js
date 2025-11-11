// @ts-check
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Generates Mintlify's mint.json navigation file
 */
export class MintlifyNavigation {
  /**
   * @param {any} project
   * @param {string} outputDir
   */
  constructor(project, outputDir) {
    this.project = project;
    this.outputDir = outputDir;
  }

  /**
   * Generate mint.json configuration file
   * @returns {any} The mint.json configuration
   */
  generate() {
    const navigation = {
      name: this.project.name || 'Documentation',
      logo: {
        light: '/logo/light.svg',
        dark: '/logo/dark.svg'
      },
      favicon: '/favicon.png',
      colors: {
        primary: '#0D9373',
        light: '#07C983',
        dark: '#0D9373'
      },
      topbarLinks: [
        {
          name: 'Documentation',
          url: 'https://docs.example.com'
        }
      ],
      topbarCtaButton: {
        name: 'Get Started',
        url: 'https://example.com'
      },
      navigation: this.buildNavigation(),
      footerSocials: {
        github: 'https://github.com/example/repo'
      }
    };

    return navigation;
  }

  /**
   * Build the navigation structure from TypeDoc project
   * @returns {any[]} Navigation array for mint.json
   */
  buildNavigation() {
    /** @type {any[]} */
    const nav = [
      {
        group: 'Getting Started',
        pages: ['introduction']
      }
    ];

    // Add modules
    if (this.project.children && this.project.children.length > 0) {
      const modulePages = this.project.children
        .filter((/** @type {any} */ child) => child.kindString === 'Module')
        .map((/** @type {any} */ module) => this.getModulePath(module));

      if (modulePages.length > 0) {
        nav.push({
          group: 'Modules',
          pages: modulePages
        });
      }

      // Add classes
      const classPages = this.project.children
        .filter((/** @type {any} */ child) => child.kindString === 'Class')
        .map((/** @type {any} */ cls) => this.getClassPath(cls));

      if (classPages.length > 0) {
        nav.push({
          group: 'Classes',
          pages: classPages
        });
      }

      // Add interfaces
      const interfacePages = this.project.children
        .filter((/** @type {any} */ child) => child.kindString === 'Interface')
        .map((/** @type {any} */ iface) => this.getInterfacePath(iface));

      if (interfacePages.length > 0) {
        nav.push({
          group: 'Interfaces',
          pages: interfacePages
        });
      }

      // Add functions
      const functionPages = this.project.children
        .filter((/** @type {any} */ child) => child.kindString === 'Function')
        .map((/** @type {any} */ func) => this.getFunctionPath(func));

      if (functionPages.length > 0) {
        nav.push({
          group: 'Functions',
          pages: functionPages
        });
      }

      // Add type aliases
      const typePages = this.project.children
        .filter((/** @type {any} */ child) => child.kindString === 'Type alias')
        .map((/** @type {any} */ type) => this.getTypePath(type));

      if (typePages.length > 0) {
        nav.push({
          group: 'Types',
          pages: typePages
        });
      }
    }

    return nav;
  }

  /**
   * Get the file path for a module
   * @param {any} module
   * @returns {string}
   */
  getModulePath(module) {
    const slug = this.slugify(module.name);
    // Handle index/README files - these are typically the main entry point
    // The actual filename depends on typedoc-plugin-markdown's entryFileName option
    // Default is "README", but can be set to "index" in typedoc.json
    if (slug === 'index' || slug === 'readme') {
      // Check if we have entryFileName option (would need to be passed to constructor)
      // For now, default to "index" as it's more common for API docs
      // Users can override in their mint.json if needed
      return 'api/index';
    }
    return `modules/${slug}`;
  }

  /**
   * Get the file path for a class
   * @param {any} cls
   * @returns {string}
   */
  getClassPath(cls) {
    return `classes/${this.slugify(cls.name)}`;
  }

  /**
   * Get the file path for an interface
   * @param {any} iface
   * @returns {string}
   */
  getInterfacePath(iface) {
    return `interfaces/${this.slugify(iface.name)}`;
  }

  /**
   * Get the file path for a function
   * @param {any} func
   * @returns {string}
   */
  getFunctionPath(func) {
    return `functions/${this.slugify(func.name)}`;
  }

  /**
   * Get the file path for a type
   * @param {any} type
   * @returns {string}
   */
  getTypePath(type) {
    return `types/${this.slugify(type.name)}`;
  }

  /**
   * Convert a name to a URL-safe slug
   * @param {string} text
   * @returns {string}
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Write the mint.json file
   */
  write() {
    const config = this.generate();
    const filePath = join(this.outputDir, 'mint.json');
    
    writeFileSync(
      filePath,
      JSON.stringify(config, null, 2),
      'utf-8'
    );

    return filePath;
  }
}

