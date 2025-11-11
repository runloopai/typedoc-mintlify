import { createRequire } from 'module';
import type {
  Renderer,
  PageEvent,
  Reflection,
  ProjectReflection,
  DeclarationReflection,
} from 'typedoc';
import { MintlifyReflectionRenderer } from './reflection-renderer.js';
import { MintlifyComponents } from './components.js';

const require = createRequire(import.meta.url);
const markdownPlugin = require('typedoc-plugin-markdown');
const { MarkdownTheme } = markdownPlugin;

/**
 * Custom Mintlify theme that extends the markdown theme
 * Generates MDX directly from TypeDoc reflections instead of transforming markdown text
 */
export class MintlifyTheme extends MarkdownTheme {
  components: MintlifyComponents;
  reflectionRenderer: MintlifyReflectionRenderer;
  private typeToUrlMap: Map<string, string> = new Map();

  constructor(renderer: Renderer) {
    super(renderer);
    this.components = new MintlifyComponents();
    this.reflectionRenderer = new MintlifyReflectionRenderer();
  }

  /**
   * Override to customize the rendering context
   */
  getRenderContext(page: PageEvent<unknown>): Record<string, unknown> {
    const context = super.getRenderContext(page);

    // Add Mintlify-specific helpers to the context
    return {
      ...context,
      mintlify: {
        accordion: this.components.accordion.bind(this.components),
        tabs: this.components.tabs.bind(this.components),
        codeGroup: this.components.codeGroup.bind(this.components),
        card: this.components.card.bind(this.components),
        cardGroup: this.components.cardGroup.bind(this.components),
        callout: this.components.callout.bind(this.components),
        check: this.components.check.bind(this.components),
        info: this.components.info.bind(this.components),
        warning: this.components.warning.bind(this.components),
        note: this.components.note.bind(this.components),
      },
    };
  }

  /**
   * Override render to generate MDX directly from reflections
   */
  render(page: PageEvent<unknown>, template: (page: PageEvent<unknown>) => string): string {
    // Access the reflection model directly
    const model = page.model;

    // Check if this is a DeclarationReflection (class, interface, function, etc.)
    if (model && typeof model === 'object' && 'kind' in model) {
      const reflection = model as Reflection;
      // Use reflection renderer for DeclarationReflection types that should have their own pages
      if (
        'kind' in reflection &&
        (reflection.kind === 128 || // Class
          reflection.kind === 256 || // Interface
          reflection.kind === 64 || // Function
          reflection.kind === 8 || // Enum
          reflection.kind === 2097152) // Type Alias
      ) {
        // Pass the type-to-URL map to the renderer for link generation
        this.reflectionRenderer.setTypeToUrlMap(this.typeToUrlMap);
        // Build the current page URL from the reflection
        const fileExtension = this.application.options.getValue('fileExtension') || '.mdx';
        const flattenOutputFiles = this.application.options.getValue(
          'flattenOutputFiles'
        ) as boolean;
        const kindMap: Record<number, string> = {
          128: 'classes', // Class
          256: 'interfaces', // Interface
          64: 'functions', // Function
          8: 'enums', // Enum
          2097152: 'type-aliases', // Type Alias
        };
        const folder = kindMap[reflection.kind] || 'modules';
        const fileName = flattenOutputFiles ? reflection.name : `${folder}/${reflection.name}`;
        const pageUrl = `${fileName}${fileExtension}`.replace(/\.mdx$/, '');
        return this.reflectionRenderer.render(reflection, pageUrl);
      }
    }

    // For index/project pages, get parent render and add frontmatter + TOC
    // Check if this is the index page first
    const isIndexPage =
      model && typeof model === 'object' && 'kind' in model && (model as Reflection).kind === 1;

    let parentContent = '';
    let readmeContent = '';

    if (isIndexPage) {
      // First, get the parent render which may include README content
      const parentRender = super.render(page, template);

      // Check if parent render includes README content
      // TypeDoc typically includes README at the beginning of the index page
      // The README content usually comes before any API documentation sections
      // Look for common patterns: README content ends before "##" API sections
      const apiSectionMatch = parentRender.match(
        /\n## (Classes|Interfaces|Functions|Enumerations|Type Aliases|Modules)/
      );

      if (apiSectionMatch) {
        // Split README content from API content
        const apiSectionIndex = parentRender.indexOf(apiSectionMatch[0]);
        readmeContent = parentRender.substring(0, apiSectionIndex).trim();
        // Generate our simplified API overview
        parentContent = this.generateIndexPageContent(model as ProjectReflection);
      } else {
        // No clear API sections, check if there's substantial content
        // If parent render has content but no API sections, it might be just README
        if (parentRender.trim().length > 100) {
          readmeContent = parentRender.trim();
          // Still generate API overview
          parentContent = this.generateIndexPageContent(model as ProjectReflection);
        } else {
          // No README content, just generate API overview
          parentContent = this.generateIndexPageContent(model as ProjectReflection);
        }
      }
    } else {
      parentContent = super.render(page, template);
    }

    // Add frontmatter if this is the index page
    if (isIndexPage) {
      // This is a ProjectReflection (index page)
      const project = model as ProjectReflection;
      const title = project.name || 'API Documentation';
      // Use README description if available, otherwise use project comment
      let description = 'API documentation generated with TypeDoc and Mintlify.';
      if (readmeContent) {
        // Try to extract description from README (first paragraph or H1/H2)
        const firstParagraph = readmeContent.match(/^# .+?\n\n(.+?)(?:\n\n|$)/s);
        if (firstParagraph) {
          description = firstParagraph[1].trim().replace(/\n/g, ' ').substring(0, 200);
        } else {
          const h1Match = readmeContent.match(/^# (.+?)$/m);
          if (h1Match) {
            description = h1Match[1];
          }
        }
      } else if (project.comment?.summary?.[0]?.text) {
        description = project.comment.summary[0].text;
      }

      const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"').replace(/\n/g, ' ').trim()}"
---

`;

      // Extract TOC items from the content (look for main sections)
      const tocItems: string[] = [];
      if (readmeContent) {
        // Extract headings from README for TOC
        const readmeHeadings = readmeContent.match(/^##? (.+)$/gm);
        if (readmeHeadings) {
          readmeHeadings.slice(0, 5).forEach((heading) => {
            const text = heading.replace(/^##? /, '').trim();
            tocItems.push(text);
          });
        }
      }
      if (parentContent.includes('## Enumerations')) {
        tocItems.push('Enumerations');
      }
      if (parentContent.includes('## Classes')) {
        tocItems.push('Classes');
      }
      if (parentContent.includes('## Interfaces')) {
        tocItems.push('Interfaces');
      }
      if (parentContent.includes('## Type Aliases')) {
        tocItems.push('Type Aliases');
      }
      if (parentContent.includes('## Functions')) {
        tocItems.push('Functions');
      }

      let toc = '';
      if (tocItems.length > 0) {
        const tocLinks = tocItems
          .map((item) => {
            const anchor = item.toLowerCase().replace(/\s+/g, '-');
            return `- [${item}](#${anchor})`;
          })
          .join('\n');
        toc = `<Toc>\n${tocLinks}\n</Toc>\n\n`;
      }

      // Combine README content and API overview
      let result = '';

      // Add README content first if present
      if (readmeContent) {
        // Remove any existing frontmatter from README
        let cleanReadme = readmeContent;
        if (cleanReadme.startsWith('---')) {
          cleanReadme = cleanReadme.replace(/^---[\s\S]*?---\n\n?/, '');
        }
        result = `${cleanReadme.trim()}\n\n`;
      }

      // Add API overview section
      if (parentContent) {
        // If we have README, add a separator heading
        if (readmeContent && parentContent.trim()) {
          result += '## API Reference\n\n';
        }
        result += parentContent;
      }

      // If content already has frontmatter, replace it
      if (result.startsWith('---')) {
        result = result.replace(/^---[\s\S]*?---\n\n?/, '');
      }

      // Organize API Reference sections into AccordionGroups for better readability
      // Only process the API Reference part, not the README part
      const apiReferenceMatch = result.match(/## API Reference\n\n([\s\S]*)$/);
      if (apiReferenceMatch) {
        const apiContent = apiReferenceMatch[1];
        let sections: Array<{ title: string; content: string }> = [];

        // Extract Enumerations section
        const enumMatch = apiContent.match(/## Enumerations\n\n([\s\S]*?)(?=\n## |$)/);
        if (enumMatch) {
          sections.push({ title: 'Enumerations', content: enumMatch[1].trim() });
        }

        // Extract Classes section
        const classMatch = apiContent.match(/## Classes\n\n([\s\S]*?)(?=\n## |$)/);
        if (classMatch) {
          sections.push({ title: 'Classes', content: classMatch[1].trim() });
        }

        // Extract Interfaces section
        const interfaceMatch = apiContent.match(/## Interfaces\n\n([\s\S]*?)(?=\n## |$)/);
        if (interfaceMatch) {
          sections.push({ title: 'Interfaces', content: interfaceMatch[1].trim() });
        }

        // Extract Type Aliases section
        const typeMatch = apiContent.match(/## Type Aliases\n\n([\s\S]*?)(?=\n## |$)/);
        if (typeMatch) {
          sections.push({ title: 'Type Aliases', content: typeMatch[1].trim() });
        }

        // Extract Functions section
        const funcMatch = apiContent.match(/## Functions\n\n([\s\S]*?)(?=\n## |$)/);
        if (funcMatch) {
          sections.push({ title: 'Functions', content: funcMatch[1].trim() });
        }

        // Simplify index page content - show overview only, details are on individual pages
        // Transform enum displays to be more concise BEFORE wrapping in accordions
        sections = sections.map((section) => ({
          title: section.title,
          content: this.simplifyIndexSection(section.title, section.content),
        }));

        // If we have multiple sections, use AccordionGroup
        if (sections.length > 1) {
          // Get the intro content (before first section) from API content
          const introMatch = apiContent.match(/^([\s\S]*?)(?=\n## )/);
          const intro = introMatch ? introMatch[1].trim() : '';

          // Build accordion group
          const accordions = sections.map((section) => ({
            title: section.title,
            content: section.content,
          }));

          const organizedApiContent = `${(intro ? `${intro}\n\n` : '') + this.components.accordionGroup(accordions)}\n\n`;

          // Replace the API Reference section with organized content
          result = result.replace(
            /## API Reference\n\n[\s\S]*$/,
            `## API Reference\n\n${organizedApiContent}`
          );
        } else if (sections.length === 1) {
          // Single section, just simplify it
          const simplified = this.simplifyIndexSection(sections[0].title, sections[0].content);
          result = result.replace(
            /## API Reference\n\n[\s\S]*$/,
            `## API Reference\n\n${simplified}\n\n`
          );
        }
      } else {
        // No API Reference section, but we might have sections directly
        // This happens when there's no README content
        let sections: Array<{ title: string; content: string }> = [];

        // Extract Enumerations section
        const enumMatch = result.match(/## Enumerations\n\n([\s\S]*?)(?=\n## |$)/);
        if (enumMatch) {
          sections.push({ title: 'Enumerations', content: enumMatch[1].trim() });
        }

        // Extract Classes section
        const classMatch = result.match(/## Classes\n\n([\s\S]*?)(?=\n## |$)/);
        if (classMatch) {
          sections.push({ title: 'Classes', content: classMatch[1].trim() });
        }

        // Extract Interfaces section
        const interfaceMatch = result.match(/## Interfaces\n\n([\s\S]*?)(?=\n## |$)/);
        if (interfaceMatch) {
          sections.push({ title: 'Interfaces', content: interfaceMatch[1].trim() });
        }

        // Extract Type Aliases section
        const typeMatch = result.match(/## Type Aliases\n\n([\s\S]*?)(?=\n## |$)/);
        if (typeMatch) {
          sections.push({ title: 'Type Aliases', content: typeMatch[1].trim() });
        }

        // Extract Functions section
        const funcMatch = result.match(/## Functions\n\n([\s\S]*?)(?=\n## |$)/);
        if (funcMatch) {
          sections.push({ title: 'Functions', content: funcMatch[1].trim() });
        }

        // Simplify index page content - show overview only, details are on individual pages
        sections = sections.map((section) => ({
          title: section.title,
          content: this.simplifyIndexSection(section.title, section.content),
        }));

        // If we have multiple sections, use AccordionGroup
        if (sections.length > 1) {
          // Get the intro content (before first section)
          const introMatch = result.match(/^([\s\S]*?)(?=\n## )/);
          const intro = introMatch ? introMatch[1].trim() : '';

          // Build accordion group
          const accordions = sections.map((section) => ({
            title: section.title,
            content: section.content,
          }));

          result = `${intro}\n\n${this.components.accordionGroup(accordions)}\n\n`;
        }
      }

      // Transform type references to links
      result = this.addTypeLinksToIndexPage(result);

      // Flatten heading hierarchy to follow Mintlify's 4-level limit (H1-H4 only)
      result = this.flattenHeadings(result);

      // Combine frontmatter, TOC, and content
      result = frontmatter + (toc || '') + result;

      return result;
    }

    return parentContent;
  }

  /**
   * Ensure we use the parent's URL generation to get individual pages
   * This is critical - the markdown plugin uses this to determine which pages to generate
   * If the markdown plugin doesn't generate individual pages, we'll add them ourselves
   */
  getUrls(project: unknown): unknown {
    // Check configuration
    const outputFileStrategy = this.application.options.getValue('outputFileStrategy');
    const membersWithOwnFile = this.application.options.getValue('membersWithOwnFile') as string[];

    // Get file extension and entry file name from options
    const fileExtension = this.application.options.getValue('fileExtension') || '.mdx';
    const entryFileName = this.application.options.getValue('entryFileName') || 'index';
    const indexUrl = `${entryFileName}${fileExtension}`;

    // Delegate to parent to ensure individual pages are generated
    const urls = super.getUrls(project) as Array<{ url: string; model: Reflection }>;

    // ALWAYS ensure index page exists - check for various possible index file names
    // This must be done before processing individual pages
    const hasIndex = urls.some(
      (url) =>
        url.url === indexUrl ||
        url.url === 'index.mdx' ||
        url.url === 'index.md' ||
        url.url === 'README.md' ||
        url.url === 'README.mdx' ||
        url.url.startsWith('index.') ||
        (url.model &&
          typeof url.model === 'object' &&
          'kind' in url.model &&
          (url.model as Reflection).kind === 1)
    );
    if (!hasIndex && project && typeof project === 'object' && 'kind' in project) {
      const projectReflection = project as ProjectReflection;
      // Always add index at the beginning so it's rendered first
      urls.unshift({ url: indexUrl, model: projectReflection });
    }

    // If outputFileStrategy is "members" but no individual pages were generated,
    // we need to generate them ourselves
    if (outputFileStrategy === 'members' && Array.isArray(urls)) {
      const hasIndividualPages = urls.some(
        (url) =>
          url.url !== 'index.mdx' &&
          (url.url.includes('classes/') ||
            url.url.includes('interfaces/') ||
            url.url.includes('functions/') ||
            url.url.includes('enums/'))
      );

      if (!hasIndividualPages && project && typeof project === 'object' && 'kind' in project) {
        const projectReflection = project as ProjectReflection;

        // Generate URLs for individual pages based on membersWithOwnFile
        const fileExtension = this.application.options.getValue('fileExtension') || '.mdx';
        const flattenOutputFiles = this.application.options.getValue(
          'flattenOutputFiles'
        ) as boolean;

        // Helper to get URL for a reflection
        const getUrlForReflection = (reflection: DeclarationReflection): string => {
          const kindMap: Record<number, string> = {
            128: 'classes', // Class
            256: 'interfaces', // Interface
            64: 'functions', // Function
            8: 'enums', // Enum
            2097152: 'type-aliases', // Type Alias
          };

          const folder = kindMap[reflection.kind] || 'modules';
          const fileName = flattenOutputFiles ? reflection.name : `${folder}/${reflection.name}`;
          return `${fileName}${fileExtension}`;
        };

        // Find all reflections that should have their own files
        const reflectionsToDocument: DeclarationReflection[] = [];

        const visitReflection = (reflection: Reflection) => {
          if (reflection.kind === 128 && membersWithOwnFile?.includes('Class')) {
            // Class
            reflectionsToDocument.push(reflection as DeclarationReflection);
          } else if (reflection.kind === 256 && membersWithOwnFile?.includes('Interface')) {
            // Interface
            reflectionsToDocument.push(reflection as DeclarationReflection);
          } else if (reflection.kind === 64 && membersWithOwnFile?.includes('Function')) {
            // Function
            reflectionsToDocument.push(reflection as DeclarationReflection);
          } else if (reflection.kind === 8 && membersWithOwnFile?.includes('Enum')) {
            // Enum
            reflectionsToDocument.push(reflection as DeclarationReflection);
          } else if (reflection.kind === 2097152 && membersWithOwnFile?.includes('TypeAlias')) {
            // Type Alias
            reflectionsToDocument.push(reflection as DeclarationReflection);
          }

          // Visit children
          if (
            'children' in reflection &&
            reflection.children &&
            Array.isArray(reflection.children)
          ) {
            reflection.children.forEach((child: Reflection) => visitReflection(child));
          }
        };

        // Visit all reflections in the project
        if (projectReflection.children) {
          projectReflection.children.forEach((child) => visitReflection(child));
        }

        // Add URLs for individual pages and build type-to-URL map
        reflectionsToDocument.forEach((reflection) => {
          const url = getUrlForReflection(reflection);
          urls.push({ url, model: reflection });
          // Store mapping from type name to URL for link generation
          const cleanUrl = url.replace(/\.mdx$/, '');
          const urlWithApi = cleanUrl.startsWith('api/') ? cleanUrl : `api/${cleanUrl}`;
          this.typeToUrlMap.set(reflection.name, urlWithApi);
        });

        // Ensure index page exists when individual pages are generated
        const hasIndexAfter = urls.some(
          (url) =>
            url.url === indexUrl ||
            url.url === 'index.mdx' ||
            url.url === 'index.md' ||
            url.url === 'README.md' ||
            url.url === 'README.mdx' ||
            url.url.startsWith('index.')
        );
        if (!hasIndexAfter && project && typeof project === 'object' && 'kind' in project) {
          const projectReflection = project as ProjectReflection;
          urls.unshift({ url: indexUrl, model: projectReflection });
        }
      }
    }

    return urls;
  }

  /**
   * Add links to type references in the index page content
   */
  private addTypeLinksToIndexPage(content: string): string {
    if (this.typeToUrlMap.size === 0) {
      return content;
    }

    // Build a regex pattern for all known types
    const typeNames = Array.from(this.typeToUrlMap.keys()).sort((a, b) => b.length - a.length); // Sort by length descending to match longer names first

    // Transform type references in various contexts
    let result = content;

    for (const typeName of typeNames) {
      const url = this.typeToUrlMap.get(typeName)!;
      // Use absolute path from docs root for Mintlify routing
      // Format: /api/classes/UserService (absolute path with leading slash)
      // Files are in the api/ directory, so we need to prepend /api/
      const cleanUrl = url.replace(/\.mdx$/, ''); // Remove .mdx extension
      // Ensure the URL includes the api/ prefix for Mintlify routing
      const urlWithApi = cleanUrl.startsWith('api/') ? cleanUrl : `api/${cleanUrl}`;
      const absoluteUrl = `/${urlWithApi}`;

      // Pattern 1: Type in backticks (code): `TypeName` -> `[TypeName](../path/to/TypeName)`
      // But we need to be careful not to break code blocks (```...```)
      // We'll process line by line to better detect code blocks
      const lines = result.split('\n');
      let inCodeBlock = false;
      const processedLines = lines.map((line) => {
        // Check if this line starts/ends a code block
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          return line; // Don't process code block markers
        }

        // Don't process inside code blocks
        if (inCodeBlock) {
          return line;
        }

        // Process inline code (single backticks) but not code blocks
        // For types in backticks that should be linked, we need to remove backticks
        // because links don't work inside code blocks in markdown
        // Pattern: `Promise<TypeName>` -> Promise&lt;[TypeName](../path)&gt;
        // We need to escape angle brackets for MDX to avoid JSX parsing errors
        const genericInCodePattern = new RegExp(`\`([^\`]*?<)(${typeName})(>[^\`]*?)\``, 'g');
        line = line.replace(genericInCodePattern, (match, before, type, after) => {
          // Remove backticks, add link, and escape angle brackets for MDX
          // Replace < with &lt; and > with &gt; to avoid MDX parsing errors
          const escapedBefore = before.replace(/</g, '&lt;');
          const escapedAfter = after.replace(/>/g, '&gt;');
          return `${escapedBefore}[${type}](${absoluteUrl})${escapedAfter}`;
        });

        // Pattern: Standalone type in backticks: `TypeName` -> [TypeName](../path)
        // Only if it's not part of a larger expression (has whitespace or punctuation around it)
        const standaloneTypePattern = new RegExp(`(^|\\s)\`(${typeName})\`(\\s|$|[.,;:)>])`, 'g');
        line = line.replace(standaloneTypePattern, (match, before, type, after) => {
          // Make it a link without backticks
          return `${before}[${type}](${absoluteUrl})${after}`;
        });

        return line;
      });
      result = processedLines.join('\n');

      // Pattern 2 & 3: Handle types in generics and promises that are already processed above
      // These are now handled in the inline code processing

      // Pattern 4: Type in parameter lists: `options?: TypeName` -> `options?: [TypeName](../path/to/TypeName)`
      // This is trickier, we'll handle it in the context of parameter descriptions
      const paramTypePattern = new RegExp(`(\\*\\*\\w+\\*\\*|\\w+\\??): \`(${typeName})\``, 'g');
      result = result.replace(paramTypePattern, (match, param, type) => {
        // Check if already a link
        const beforeMatch = result.substring(0, result.indexOf(match));
        if (beforeMatch.includes(`[${type}]`)) {
          return match; // Already linked
        }
        return `${param}: [\`${type}\`](${absoluteUrl})`;
      });
    }

    return result;
  }

  /**
   * Make enum displays more concise and engineer-friendly
   */
  private makeEnumsConcise(content: string): string {
    // Transform verbose enum member format to compact table format
    // Pattern: ### ApiErrorType\n\nDescription\n\n#### Enumeration Members\n\n##### NOT\_FOUND\n\n> **NOT\_FOUND**: `"NOT_FOUND"`\n\nDescription\n\n###### Defined in\n\nindex.ts:172\n\n***

    // Match each enum section
    return content.replace(
      /### ([A-Za-z_][A-Za-z0-9_]*)\n\n([^\n]+)\n\n#### Enumeration Members\n\n([\s\S]*?)(?=\n### |\n## |$)/g,
      (match, enumName, description, membersSection) => {
        // Extract all enum members - handle escaped underscores and various formats
        const memberPattern =
          /##### ([A-Z_\\]+)\s*\n\n> \*\*[A-Z_\\]+\*\*: `(.+?)`\s*\n\n([^\n]+(?:\n(?!#####|###|##|#|######|[*]{3})[^\n]+)*)/g;
        const members: Array<{ name: string; value: string; description: string }> = [];
        let memberMatch;

        // Reset regex lastIndex
        memberPattern.lastIndex = 0;

        while ((memberMatch = memberPattern.exec(membersSection)) !== null) {
          const name = memberMatch[1].replace(/\\_/g, '_'); // Unescape underscores
          const value = memberMatch[2];
          // Get description and clean it up
          let desc = memberMatch[3] || '';

          // Remove "Defined in" sections that might follow
          const afterMatch = membersSection.substring(memberPattern.lastIndex);
          const definedInMatch = afterMatch.match(/^\n###### Defined in\n\n[^\n]+\n\n\*\*\*/);
          if (definedInMatch) {
            memberPattern.lastIndex += definedInMatch[0].length;
          }

          // Clean description
          desc = desc
            .replace(/\n###### Defined in[\s\S]*?index\.ts:\d+/g, '')
            .replace(/\n\*\*\*/g, '')
            .trim();

          if (!desc) {
            desc = '—';
          }

          members.push({ name, value, description: desc });
        }

        if (members.length === 0) {
          return match; // No members found, return original
        }

        // Build compact table format
        let result = `### ${enumName}\n\n${description}\n\n`;
        result += '| Name | Value | Description |\n';
        result += '|------|-------|-------------|\n';

        for (const member of members) {
          result += `| \`${member.name}\` | \`${member.value}\` | ${member.description} |\n`;
        }

        result += '\n';
        return result;
      }
    );
  }

  /**
   * Simplify index page sections to show overview only (H3/H4 max)
   * Individual pages have full detail, index page should be a summary
   */
  private simplifyIndexSection(sectionTitle: string, content: string): string {
    if (sectionTitle === 'Enumerations') {
      // Enums are already simplified to tables
      return this.makeEnumsConcise(content);
    }

    // For classes, interfaces, functions, type aliases
    // Extract just the main items (H3) with their descriptions
    // Remove all the detailed subsections (H4-H6)

    const lines = content.split('\n');
    const result: string[] = [];
    let i = 0;
    let inDetailedSection = false;
    let currentItem: { name: string; description: string; link?: string } | null = null;

    while (i < lines.length) {
      const line = lines[i];

      // H3 headings are the main items (classes, interfaces, functions)
      if (line.match(/^### [A-Za-z_][A-Za-z0-9_]*/)) {
        // Save previous item if exists
        if (currentItem) {
          result.push(`### ${currentItem.name}`);
          if (currentItem.description) {
            result.push('');
            result.push(currentItem.description);
          }
          if (currentItem.link) {
            result.push('');
            result.push(`[View full documentation →](${currentItem.link})`);
          }
          result.push('');
        }

        const name = line.replace(/^### /, '').trim();
        // Try to find link to individual page
        const link = this.typeToUrlMap.get(name);
        const linkUrl = link ? `/${link}` : undefined;

        currentItem = { name, description: '', link: linkUrl };
        inDetailedSection = false;
        i++;
        continue;
      }

      // H4 headings start detailed sections - skip everything after
      if (line.match(/^#### /)) {
        inDetailedSection = true;
        // If we have a current item, save it before skipping
        if (currentItem && !currentItem.description) {
          // Try to get description from previous lines
          let j = i - 1;
          while (j >= 0 && lines[j].trim() && !lines[j].match(/^### |^#### /)) {
            if (lines[j].trim() && !lines[j].startsWith('>') && !lines[j].startsWith('`')) {
              currentItem.description = lines[j].trim();
              break;
            }
            j--;
          }
        }
        // Skip all detailed content until next H3
        while (i < lines.length && !lines[i].match(/^### /)) {
          i++;
        }
        continue;
      }

      // Collect description for current item (before H4 sections)
      if (currentItem && !inDetailedSection && !line.match(/^### |^#### /)) {
        if (
          line.trim() &&
          !line.startsWith('>') &&
          !line.startsWith('`') &&
          !line.startsWith('*')
        ) {
          if (!currentItem.description) {
            currentItem.description = line.trim();
          }
        }
      }

      i++;
    }

    // Add last item
    if (currentItem) {
      result.push(`### ${currentItem.name}`);
      if (currentItem.description) {
        result.push('');
        result.push(currentItem.description);
      }
      if (currentItem.link) {
        result.push('');
        result.push(`[View full documentation →](${currentItem.link})`);
      }
      result.push('');
    }

    return result.length > 0 ? result.join('\n') : content;
  }

  /**
   * Generate simplified index page content from individual pages
   * Shows overview with links to individual pages, respecting H3/H4 limit
   */
  private generateIndexPageContent(project: ProjectReflection): string {
    const sections: Array<{
      title: string;
      items: Array<{ name: string; description: string; link: string }>;
    }> = [];

    // Group reflections by kind
    const classes: DeclarationReflection[] = [];
    const interfaces: DeclarationReflection[] = [];
    const functions: DeclarationReflection[] = [];
    const enums: DeclarationReflection[] = [];
    const typeAliases: DeclarationReflection[] = [];

    const visitReflection = (reflection: Reflection) => {
      if (reflection.kind === 128) {
        // Class
        classes.push(reflection as DeclarationReflection);
      } else if (reflection.kind === 256) {
        // Interface
        interfaces.push(reflection as DeclarationReflection);
      } else if (reflection.kind === 64) {
        // Function
        functions.push(reflection as DeclarationReflection);
      } else if (reflection.kind === 8) {
        // Enum
        enums.push(reflection as DeclarationReflection);
      } else if (reflection.kind === 2097152) {
        // Type Alias
        typeAliases.push(reflection as DeclarationReflection);
      }

      if ('children' in reflection && reflection.children && Array.isArray(reflection.children)) {
        reflection.children.forEach((child: Reflection) => visitReflection(child));
      }
    };

    if (project.children) {
      project.children.forEach((child) => visitReflection(child));
    }

    // Build sections with simplified content
    if (enums.length > 0) {
      const items = enums.map((enumRef) => {
        const url = this.typeToUrlMap.get(enumRef.name);
        const link = url ? `/${url}` : '#';
        const description = this.extractDescription(enumRef);
        return { name: enumRef.name, description, link };
      });
      sections.push({ title: 'Enumerations', items });
    }

    if (classes.length > 0) {
      const items = classes.map((classRef) => {
        const url = this.typeToUrlMap.get(classRef.name);
        const link = url ? `/${url}` : '#';
        const description = this.extractDescription(classRef);
        return { name: classRef.name, description, link };
      });
      sections.push({ title: 'Classes', items });
    }

    if (interfaces.length > 0) {
      const items = interfaces.map((interfaceRef) => {
        const url = this.typeToUrlMap.get(interfaceRef.name);
        const link = url ? `/${url}` : '#';
        const description = this.extractDescription(interfaceRef);
        return { name: interfaceRef.name, description, link };
      });
      sections.push({ title: 'Interfaces', items });
    }

    if (typeAliases.length > 0) {
      const items = typeAliases.map((typeRef) => {
        const url = this.typeToUrlMap.get(typeRef.name);
        const link = url ? `/${url}` : '#';
        const description = this.extractDescription(typeRef);
        return { name: typeRef.name, description, link };
      });
      sections.push({ title: 'Type Aliases', items });
    }

    if (functions.length > 0) {
      const items = functions.map((funcRef) => {
        const url = this.typeToUrlMap.get(funcRef.name);
        const link = url ? `/${url}` : '#';
        const description = this.extractDescription(funcRef);
        return { name: funcRef.name, description, link };
      });
      sections.push({ title: 'Functions', items });
    }

    // Generate markdown content with simplified structure (H2 for sections, H3 for items)
    // Use AccordionGroup for better organization
    if (sections.length === 0) {
      return '';
    }

    if (sections.length > 1) {
      // Use AccordionGroup for multiple sections
      const accordions = sections.map((section) => {
        let sectionContent = '';
        for (const item of section.items) {
          sectionContent += `### ${item.name}\n\n`;
          if (item.description) {
            sectionContent += `${item.description}\n\n`;
          }
          sectionContent += `[View full documentation →](${item.link})\n\n`;
        }
        return {
          title: section.title,
          content: sectionContent.trim(),
        };
      });
      return `${this.components.accordionGroup(accordions)}\n\n`;
    } else {
      // Single section, no need for accordion
      let content = `## ${sections[0].title}\n\n`;
      for (const item of sections[0].items) {
        content += `### ${item.name}\n\n`;
        if (item.description) {
          content += `${item.description}\n\n`;
        }
        content += `[View full documentation →](${item.link})\n\n`;
      }
      return content;
    }
  }

  /**
   * Extract description from a reflection
   */
  private extractDescription(reflection: DeclarationReflection): string {
    if (reflection.comment?.summary) {
      const summary = reflection.comment.summary
        .map((part) => part.text || '')
        .join('')
        .trim();
      if (summary) {
        return summary;
      }
    }
    return '';
  }

  /**
   * Flatten heading hierarchy to follow Mintlify's 4-level limit (H1-H4 only)
   * Converts H5 and H6 headings to bold text
   */
  private flattenHeadings(content: string): string {
    // Convert H5 (#####) to bold text
    content = content.replace(/^##### (.+)$/gm, '**$1**');

    // Convert H6 (######) to bold text
    content = content.replace(/^###### (.+)$/gm, '**$1**');

    return content;
  }
}
