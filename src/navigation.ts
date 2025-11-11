import { writeFileSync } from 'fs';
import { join } from 'path';
import type { ProjectReflection, DeclarationReflection } from 'typedoc';

interface NavigationGroup {
  group: string;
  pages: string[];
}

interface MintlifyConfig {
  name: string;
  logo: {
    light: string;
    dark: string;
  };
  favicon: string;
  colors: {
    primary: string;
    light: string;
    dark: string;
  };
  topbarLinks: Array<{
    name: string;
    url: string;
  }>;
  topbarCtaButton: {
    name: string;
    url: string;
  };
  navigation: NavigationGroup[];
  footerSocials: {
    github: string;
  };
}

/**
 * Generates Mintlify's mint.json navigation file
 */
export class MintlifyNavigation {
  private project: ProjectReflection;
  private outputDir: string;

  constructor(project: ProjectReflection, outputDir: string) {
    this.project = project;
    this.outputDir = outputDir;
  }

  /**
   * Generate mint.json configuration file
   */
  generate(): MintlifyConfig {
    const navigation: MintlifyConfig = {
      name: this.project.name || 'Documentation',
      logo: {
        light: '/logo/light.svg',
        dark: '/logo/dark.svg',
      },
      favicon: '/favicon.png',
      colors: {
        primary: '#0D9373',
        light: '#07C983',
        dark: '#0D9373',
      },
      topbarLinks: [
        {
          name: 'Documentation',
          url: 'https://docs.example.com',
        },
      ],
      topbarCtaButton: {
        name: 'Get Started',
        url: 'https://example.com',
      },
      navigation: this.buildNavigation(),
      footerSocials: {
        github: 'https://github.com/example/repo',
      },
    };

    return navigation;
  }

  /**
   * Build the navigation structure from TypeDoc project
   */
  buildNavigation(): NavigationGroup[] {
    const nav: NavigationGroup[] = [
      {
        group: 'Getting Started',
        pages: ['introduction'],
      },
    ];

    // Add modules
    if (this.project.children && this.project.children.length > 0) {
      const modulePages = this.project.children
        .filter(
          (child): child is DeclarationReflection =>
            'kindString' in child && child.kindString === 'Module'
        )
        .map((module) => this.getModulePath(module));

      if (modulePages.length > 0) {
        nav.push({
          group: 'Modules',
          pages: modulePages,
        });
      }

      // Add classes
      const classPages = this.project.children
        .filter(
          (child): child is DeclarationReflection =>
            'kindString' in child && child.kindString === 'Class'
        )
        .map((cls) => this.getClassPath(cls));

      if (classPages.length > 0) {
        nav.push({
          group: 'Classes',
          pages: classPages,
        });
      }

      // Add interfaces
      const interfacePages = this.project.children
        .filter(
          (child): child is DeclarationReflection =>
            'kindString' in child && child.kindString === 'Interface'
        )
        .map((iface) => this.getInterfacePath(iface));

      if (interfacePages.length > 0) {
        nav.push({
          group: 'Interfaces',
          pages: interfacePages,
        });
      }

      // Add functions
      const functionPages = this.project.children
        .filter(
          (child): child is DeclarationReflection =>
            'kindString' in child && child.kindString === 'Function'
        )
        .map((func) => this.getFunctionPath(func));

      if (functionPages.length > 0) {
        nav.push({
          group: 'Functions',
          pages: functionPages,
        });
      }

      // Add type aliases
      const typePages = this.project.children
        .filter(
          (child): child is DeclarationReflection =>
            'kindString' in child && child.kindString === 'Type alias'
        )
        .map((type) => this.getTypePath(type));

      if (typePages.length > 0) {
        nav.push({
          group: 'Types',
          pages: typePages,
        });
      }
    }

    return nav;
  }

  /**
   * Get the file path for a module
   */
  private getModulePath(module: DeclarationReflection): string {
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
   */
  private getClassPath(cls: DeclarationReflection): string {
    return `classes/${this.slugify(cls.name)}`;
  }

  /**
   * Get the file path for an interface
   */
  private getInterfacePath(iface: DeclarationReflection): string {
    return `interfaces/${this.slugify(iface.name)}`;
  }

  /**
   * Get the file path for a function
   */
  private getFunctionPath(func: DeclarationReflection): string {
    return `functions/${this.slugify(func.name)}`;
  }

  /**
   * Get the file path for a type
   */
  private getTypePath(type: DeclarationReflection): string {
    return `types/${this.slugify(type.name)}`;
  }

  /**
   * Convert a name to a URL-safe slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Write the mint.json file
   */
  write(): string {
    const config = this.generate();
    const filePath = join(this.outputDir, 'mint.json');

    writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');

    return filePath;
  }
}
