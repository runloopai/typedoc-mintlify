import type {
  Reflection,
  DeclarationReflection,
  SignatureReflection,
  ParameterReflection,
  Comment,
  Type,
} from 'typedoc';
import { formatType, sanitizeAttribute } from './utils.js';
import { MintlifyComponents } from './components.js';

/**
 * Renders TypeDoc reflections directly to MDX without text transformations
 */
export class MintlifyReflectionRenderer {
  private components: MintlifyComponents;
  private typeToUrlMap: Map<string, string> = new Map();
  private currentPageUrl?: string;
  private frontmatterDescription?: string;
  private indexPageUrl: string = '/api/index';

  constructor() {
    this.components = new MintlifyComponents();
  }

  /**
   * Set the type-to-URL mapping for generating links
   */
  setTypeToUrlMap(map: Map<string, string>): void {
    this.typeToUrlMap = map;
  }

  /**
   * Set the index page URL for back links
   */
  setIndexPageUrl(url: string): void {
    this.indexPageUrl = url;
  }

  /**
   * Helper to format types with link generation
   */
  private formatTypeWithLinks(type: Type | null | undefined): string {
    return formatType(type, this.typeToUrlMap, this.currentPageUrl);
  }

  /**
   * Main render method - dispatches to appropriate renderer based on reflection kind
   */
  render(reflection: Reflection, currentPageUrl?: string): string {
    if (!('kind' in reflection)) {
      return '';
    }

    const decl = reflection as DeclarationReflection;
    const kind = decl.kind;

    // Generate frontmatter
    const frontmatter = this.renderFrontmatter(decl);
    let content = frontmatter;

    // Store the frontmatter description to avoid duplicating it in the body
    const descMatch = frontmatter.match(/description: "([^"]+)"/);
    this.frontmatterDescription = descMatch ? descMatch[1] : undefined;

    // Store current page URL for relative link generation
    this.currentPageUrl = currentPageUrl;

    // Add back link to index or parent
    content += this.renderBackLink(decl);

    // Render based on kind
    if (kind === 128) {
      // Class
      content += this.renderClass(decl);
    } else if (kind === 256) {
      // Interface
      content += this.renderInterface(decl);
    } else if (kind === 64) {
      // Function
      content += this.renderFunction(decl);
    } else if (kind === 8) {
      // Enum
      content += this.renderEnum(decl);
    } else if (kind === 2097152) {
      // Type Alias
      content += this.renderTypeAlias(decl);
    } else {
      // Default: render summary and description
      content += this.renderSummary(decl);
      content += this.renderComments(decl.comment);
    }

    return content;
  }

  /**
   * Render a back link to the index page or parent
   */
  private renderBackLink(reflection: DeclarationReflection): string {
    // Find parent module or class
    let parent: Reflection | undefined = reflection.parent;
    let parentUrl: string | undefined;

    // Walk up the parent chain to find a module, class, or interface
    while (parent) {
      if (parent.kind === 2) {
        // Module - link to index
        parentUrl = this.indexPageUrl;
        break;
      } else if (parent.kind === 128 || parent.kind === 256) {
        // Class or Interface - link to parent page
        const parentName = (parent as DeclarationReflection).name;
        parentUrl = this.typeToUrlMap.get(parentName);
        if (parentUrl) {
          parentUrl = `/${parentUrl}`;
        }
        break;
      }
      parent = parent.parent;
    }

    // Default to index page if no parent found
    if (!parentUrl) {
      parentUrl = this.indexPageUrl;
    }

    // Determine link text based on what we're linking to
    let linkText = '← Back to API Reference';
    if (parent && (parent.kind === 128 || parent.kind === 256)) {
      const parentName = (parent as DeclarationReflection).name;
      linkText = `← Back to ${parentName}`;
    }

    // Use a simple text link instead of Info callout to avoid multiple Info blocks
    return `[${linkText}](${parentUrl})\n\n`;
  }

  /**
   * Generate YAML frontmatter from reflection
   */
  renderFrontmatter(reflection: DeclarationReflection): string {
    const title = reflection.name || 'Documentation';
    let description = '';

    // Extract description from comment
    if (reflection.comment?.summary) {
      const summaryText = reflection.comment.summary
        .map((part) => part.text || '')
        .join('')
        .trim();
      description = summaryText;
    }

    // Generate default description if none exists
    if (!description) {
      const kindString = this.getKindString(reflection.kind);
      if (kindString === 'Class') {
        description = `Use the ${title} class to manage ${this.getPluralName(title)}.`;
      } else if (kindString === 'Interface') {
        description = `The ${title} interface defines the structure for ${this.getPluralName(title)}.`;
      } else if (kindString === 'Function') {
        description = `Call ${title} to ${this.getActionFromName(title)}.`;
      } else if (kindString === 'Enum') {
        description = `Use ${title} to specify ${this.getPluralName(title)}.`;
      } else {
        description = `Documentation for ${title}.`;
      }
    }

    // Ensure description ends with period
    if (description && !description.endsWith('.')) {
      description += '.';
    }

    // Escape quotes in description
    const safeDescription = description.replace(/"/g, '\\"').replace(/\n/g, ' ').trim();

    return `---
title: "${title}"
description: "${safeDescription}"
---

`;
  }

  /**
   * Render a class reflection
   */
  renderClass(reflection: DeclarationReflection): string {
    let content = '';

    // Render summary/description
    content += this.renderSummary(reflection);
    content += this.renderComments(reflection.comment);

    // Build TOC
    const tocItems: string[] = [];
    const constructors = (reflection.children || []).filter(
      (child) => child.kind === 512 // Constructor
    ) as DeclarationReflection[];
    const properties = (reflection.children || []).filter(
      (child) => child.kind === 1024 // Property
    ) as DeclarationReflection[];
    const methods = (reflection.children || []).filter(
      (child) => child.kind === 2048 // Method
    ) as DeclarationReflection[];

    if (constructors.length > 0) {
      tocItems.push('Constructor');
    }
    if (properties.length > 0) {
      tocItems.push('Properties');
    }
    if (methods.length > 0) {
      tocItems.push('Methods');
    }

    if (tocItems.length > 0) {
      content += this.renderToc(tocItems);
    }

    // Render constructor
    if (constructors.length > 0) {
      content += '### Constructor\n\n';
      for (const constructor of constructors) {
        if (constructor.signatures && constructor.signatures.length > 0) {
          const sig = constructor.signatures[0];
          // Use Expandable if constructor has parameters
          if (sig.parameters && sig.parameters.length > 0) {
            const sigContent = this.renderSignature(constructor.name, sig, true, true);
            content += sigContent;
          } else {
            content += this.renderSignature(constructor.name, sig, true, false);
          }
        }
      }
      content += '\n';
    }

    // Render properties - use AccordionGroup if more than 5
    if (properties.length > 0) {
      content += '### Properties\n\n';
      if (properties.length > 5) {
        const accordions = properties.map((prop) => {
          const propContent = this.renderProperty(prop);
          return {
            title: prop.name,
            content: propContent.trim(),
          };
        });
        content += `${this.components.accordionGroup(accordions)}\n\n`;
      } else {
        for (const prop of properties) {
          content += this.renderProperty(prop);
        }
        content += '\n';
      }
    }

    // Render methods - use AccordionGroup if more than 3
    if (methods.length > 0) {
      content += '### Methods\n\n';
      if (methods.length > 3) {
        const accordions = methods
          .map((method) => {
            if (method.signatures && method.signatures.length > 0) {
              const sig = method.signatures[0];
              const params = sig.parameters || [];
              const paramList = params
                .map((p) => {
                  const optional = p.flags.isOptional ? '?' : '';
                  return `${p.name}${optional}: ${this.formatTypeWithLinks(p.type)}`;
                })
                .join(', ');
              const returnType = sig.type ? this.formatTypeWithLinks(sig.type) : 'void';
              const title = `${method.name}(${paramList}): ${returnType}`;
              const methodContent = this.renderSignature(method.name, sig, false, true);
              return {
                title,
                content: methodContent.trim(),
              };
            }
            return { title: method.name, content: '' };
          })
          .filter((acc) => acc.content);
        content += `${this.components.accordionGroup(accordions)}\n\n`;
      } else {
        for (const method of methods) {
          if (method.signatures && method.signatures.length > 0) {
            const sig = method.signatures[0];
            content += this.renderSignature(method.name, sig, false, true);
          }
        }
        content += '\n';
      }
    }

    return content;
  }

  /**
   * Render an interface reflection
   */
  renderInterface(reflection: DeclarationReflection): string {
    let content = '';

    // Render summary/description
    content += this.renderSummary(reflection);
    content += this.renderComments(reflection.comment);

    // Render properties
    const properties = (reflection.children || []).filter(
      (child) => child.kind === 1024 // Property
    ) as DeclarationReflection[];

    if (properties.length > 0) {
      content += this.renderToc(['Properties']);
      // Use AccordionGroup if more than 5 properties
      if (properties.length > 5) {
        const accordions = properties.map((prop) => {
          const propContent = this.renderInterfaceProperty(prop);
          return {
            title: prop.name,
            content: propContent.trim(),
          };
        });
        content += `${this.components.accordionGroup(accordions)}\n\n`;
      } else {
        for (const prop of properties) {
          content += this.renderInterfaceProperty(prop);
        }
      }
    }

    return content;
  }

  /**
   * Render a function reflection
   */
  renderFunction(reflection: DeclarationReflection): string {
    let content = '';

    // Render summary/description
    content += this.renderSummary(reflection);
    content += this.renderComments(reflection.comment);

    // Build TOC
    const tocItems: string[] = [];
    if (reflection.signatures && reflection.signatures.length > 0) {
      const sig = reflection.signatures[0];
      if (sig.parameters && sig.parameters.length > 0) {
        tocItems.push('Parameters');
      }
      if (sig.type) {
        tocItems.push('Returns');
      }
    }

    if (tocItems.length > 0) {
      content += this.renderToc(tocItems);
    }

    // Render function signature(s) - use Expandable for parameters and returns
    if (reflection.signatures && reflection.signatures.length > 0) {
      for (const sig of reflection.signatures) {
        content += this.renderSignature(reflection.name, sig, false, true);
      }
    }

    return content;
  }

  /**
   * Render an enum reflection
   */
  renderEnum(reflection: DeclarationReflection): string {
    let content = '';

    // Render summary/description
    content += this.renderSummary(reflection);
    content += this.renderComments(reflection.comment);

    // Render enum members
    const members = (reflection.children || []).filter(
      (child) => child.kind === 16 // Enum Member
    ) as DeclarationReflection[];

    if (members.length > 0) {
      content += this.renderToc(['Members']);
      content += '### Members\n\n';

      // Use a compact table format for better readability
      content += '| Name | Value | Description |\n';
      content += '|------|-------|-------------|\n';

      for (const member of members) {
        const name = member.name;
        const value = member.defaultValue || name;
        const description = this.extractCommentText(member.comment?.summary) || '—';
        content += `| \`${name}\` | \`${value}\` | ${description} |\n`;
      }

      content += '\n';
    }

    return content;
  }

  /**
   * Render a type alias reflection
   */
  renderTypeAlias(reflection: DeclarationReflection): string {
    let content = '';

    // Render summary/description
    content += this.renderSummary(reflection);
    content += this.renderComments(reflection.comment);

    // Render type
    if (reflection.type) {
      const typeStr = this.formatTypeWithLinks(reflection.type);
      // If type contains links, don't put it in backticks (links don't work in code blocks)
      // But we need to escape curly braces to prevent MDX parsing issues
      if (typeStr.includes('[') && typeStr.includes('](')) {
        // Escape curly braces for MDX (they would be parsed as JSX otherwise)
        const escapedType = typeStr.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
        content += `**Type:** ${escapedType}\n\n`;
      } else {
        content += `**Type:** \`${typeStr}\`\n\n`;
      }
    }

    return content;
  }

  /**
   * Render a function/method signature
   */
  renderSignature(
    name: string,
    signature: SignatureReflection,
    isConstructor: boolean,
    useExpandable: boolean = false
  ): string {
    let content = '';

    // Render signature header
    const params = signature.parameters || [];
    // For code blocks, use plain type names (links don't work in code)
    const paramList = params
      .map((p) => {
        const optional = p.flags.isOptional ? '?' : '';
        const plainType = formatType(p.type); // Plain type for code block
        return `${p.name}${optional}: ${plainType}`;
      })
      .join(', ');

    const returnType = signature.type ? formatType(signature.type) : 'void'; // Plain type for code block
    const sigText = isConstructor
      ? `new ${name}(${paramList})`
      : `${name}(${paramList}): ${returnType}`;

    content += `\`${sigText}\`\n\n`;

    // Render description from signature comment
    if (signature.comment) {
      const summary = this.extractCommentText(signature.comment.summary);
      if (summary) {
        content += `${summary}\n\n`;
      }
    }

    // Render parameters - use Expandable if useExpandable is true
    if (params.length > 0) {
      const paramsContent = this.renderParameters(params);
      if (useExpandable) {
        content += `${this.components.expandable('Parameters', paramsContent.trim())}\n\n`;
      } else {
        content += '#### Parameters\n\n';
        content += paramsContent;
        content += '\n';
      }
    }

    // Render return type - use Expandable if useExpandable is true
    if (signature.type && !isConstructor) {
      const returnsContent = this.renderReturnType(signature);
      if (useExpandable) {
        content += `${this.components.expandable('Returns', returnsContent.trim())}\n\n`;
      } else {
        content += '#### Returns\n\n';
        content += returnsContent;
        content += '\n';
      }
    }

    return content;
  }

  /**
   * Render parameters as ParamField components
   */
  renderParameters(parameters: ParameterReflection[]): string {
    let content = '';

    for (const param of parameters) {
      const name = param.name;
      const type = this.formatTypeWithLinks(param.type);
      const required = !param.flags.isOptional;
      let description =
        this.extractCommentText(param.comment?.summary) ||
        this.generateParameterDescription(name, type);

      // Include type with links in description if it contains links
      // (ParamField type attribute doesn't support markdown)
      if (type.includes('[') && type.includes('](')) {
        // Type has links, add it to description
        const typeName = type.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        if (!description.toLowerCase().includes(typeName.toLowerCase().split('<')[0])) {
          description = `${description} Type: ${type}.`;
        }
      }

      // Determine parameter location
      const location = this.determineParameterLocation(name);

      // Generate ParamField
      const locationAttr =
        location === 'path'
          ? 'path'
          : location === 'query'
            ? 'query'
            : location === 'header'
              ? 'header'
              : 'body';

      // For ParamField, extract plain type name for attribute (links are in description)
      const typeForAttribute = type.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      content += `<ParamField ${locationAttr}="${sanitizeAttribute(name)}" type="${sanitizeAttribute(typeForAttribute)}"${required ? ' required' : ''}>\n`;
      content += `${description}\n`;
      content += `</ParamField>\n\n`;
    }

    return content;
  }

  /**
   * Render return type as ResponseField component
   */
  renderReturnType(signature: SignatureReflection): string {
    if (!signature.type) {
      return '';
    }

    const type = this.formatTypeWithLinks(signature.type);
    const returnsComment = this.extractCommentText(
      signature.comment?.blockTags?.find((t) => t.tag === '@returns')?.content
    );

    // Build description - always include type with links for clarity
    // The type parameter in ResponseField doesn't support markdown, so links go in description
    let description: string;
    if (returnsComment) {
      // Always append the type so links are visible, even if description mentions it
      description = `${returnsComment} Returns ${type}.`;
    } else {
      description = `Returns ${type}.`;
    }

    // For ResponseField, we need to escape the type if it contains markdown links
    // But keep the link in the description
    const typeForAttribute = type.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    return `<ResponseField name="returns" type="${sanitizeAttribute(typeForAttribute)}">\n${description}\n</ResponseField>\n\n`;
  }

  /**
   * Render an interface property as ResponseField
   */
  renderInterfaceProperty(property: DeclarationReflection): string {
    const name = property.name;
    const type = this.formatTypeWithLinks(property.type);
    const required = !property.flags.isOptional;
    let description = this.extractCommentText(property.comment?.summary) || `The ${name} property.`;

    // Include type with links in description if not already mentioned
    const typeName = type.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    if (!description.toLowerCase().includes(typeName.toLowerCase().split('<')[0])) {
      description = `${description} Type: ${type}.`;
    }

    // Use bold text instead of H5 heading (Mintlify only supports up to H4)
    let content = `**${name}**\n\n`;
    // For ResponseField, extract plain type name for attribute (links will be in description)
    const typeForAttribute = type.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    content += `<ResponseField name="${sanitizeAttribute(name)}" type="${sanitizeAttribute(typeForAttribute)}"${required ? ' required' : ''}>\n`;
    content += `${description}\n`;
    content += `</ResponseField>\n\n`;

    return content;
  }

  /**
   * Render a class property
   */
  renderProperty(property: DeclarationReflection): string {
    const name = property.name;
    const type = this.formatTypeWithLinks(property.type);
    const description =
      this.extractCommentText(property.comment?.summary) || `The ${name} property.`;

    // Use bold text instead of H5 heading (Mintlify only supports up to H4)
    let content = `**${name}**\n\n`;
    // If type contains links, don't put it in backticks (links don't work in code blocks)
    // Otherwise, use backticks for code formatting
    if (type.includes('[') && type.includes('](')) {
      content += `**Type:** ${type}\n\n`;
    } else {
      content += `**Type:** \`${type}\`\n\n`;
    }
    if (description) {
      content += `${description}\n\n`;
    }

    return content;
  }

  /**
   * Render an enum member (used for accordions in index page)
   */
  renderEnumMember(member: DeclarationReflection): string {
    const name = member.name;
    const value = member.defaultValue || name;
    const description = this.extractCommentText(member.comment?.summary);

    let content = `**Value:** \`${value}\``;
    if (description) {
      content += `\n\n${description}`;
    }

    return content;
  }

  /**
   * Render summary/description from comment
   * Skips if the summary is the same as the frontmatter description to avoid duplication
   */
  renderSummary(reflection: DeclarationReflection): string {
    if (!reflection.comment?.summary) {
      return '';
    }

    const summary = this.extractCommentText(reflection.comment.summary);
    if (!summary) {
      return '';
    }

    // Don't render summary if it's the same as frontmatter description (already shown)
    // Compare normalized versions (trim and remove trailing periods for comparison)
    if (this.frontmatterDescription) {
      const normalizedSummary = summary.trim().replace(/\.$/, '');
      const normalizedFrontmatter = this.frontmatterDescription.trim().replace(/\.$/, '');
      if (normalizedSummary === normalizedFrontmatter) {
        return '';
      }
    }

    return `${summary}\n\n`;
  }

  /**
   * Render comments (callouts, examples, etc.)
   */
  renderComments(comment: Comment | undefined): string {
    if (!comment) {
      return '';
    }

    let content = '';

    // Process block tags
    if (comment.blockTags) {
      const examples: Array<{ language: string; code: string }> = [];

      for (const tag of comment.blockTags) {
        if (tag.tag === '@remarks') {
          const text = this.extractCommentText(tag.content);
          if (text) {
            content += `${this.components.info(text)}\n\n`;
          }
        } else if (tag.tag === '@warning') {
          const text = this.extractCommentText(tag.content);
          if (text) {
            content += `${this.components.warning(text)}\n\n`;
          }
        } else if (tag.tag === '@note') {
          const text = this.extractCommentText(tag.content);
          if (text) {
            content += `${this.components.note(text)}\n\n`;
          }
        } else if (tag.tag === '@example') {
          const exampleText = this.extractCommentText(tag.content);
          if (exampleText) {
            // Try to extract code blocks
            const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
            let match;
            while ((match = codeBlockRegex.exec(exampleText)) !== null) {
              examples.push({
                language: match[1] || 'typescript',
                code: match[2].trim(),
              });
            }
            // If no code blocks, treat as plain code
            if (examples.length === 0 && exampleText.trim()) {
              examples.push({
                language: 'typescript',
                code: exampleText.trim(),
              });
            }
          }
        }
      }

      // Render code examples in CodeGroup if multiple, otherwise as single code block
      if (examples.length > 0) {
        if (examples.length > 1) {
          content += `${this.components.codeGroup(
            examples.map((ex) => ({
              title: ex.language.charAt(0).toUpperCase() + ex.language.slice(1),
              code: ex.code,
              language: ex.language,
            }))
          )}\n\n`;
        } else {
          content += `\`\`\`${examples[0].language}\n${examples[0].code}\n\`\`\`\n\n`;
        }
      }
    }

    return content;
  }

  /**
   * Extract text from comment content array
   */
  private extractCommentText(content: Array<{ text?: string; kind?: string }> | undefined): string {
    if (!content) {
      return '';
    }

    return content
      .map((part) => {
        if (part.kind === 'code' && part.text) {
          return `\`${part.text}\``;
        }
        return part.text || '';
      })
      .join('')
      .trim();
  }

  /**
   * Determine parameter location for ParamField
   */
  private determineParameterLocation(name: string): 'path' | 'query' | 'header' | 'body' {
    const nameLower = name.toLowerCase();

    if (
      nameLower.includes('id') &&
      !nameLower.includes('userid') &&
      !nameLower.includes('accountid')
    ) {
      return 'path';
    }
    if (
      nameLower.includes('header') ||
      nameLower === 'authorization' ||
      nameLower === 'auth' ||
      nameLower === 'apikey'
    ) {
      return 'header';
    }
    if (
      nameLower.includes('query') ||
      nameLower.includes('limit') ||
      nameLower.includes('offset') ||
      nameLower.includes('page') ||
      nameLower.includes('sort') ||
      nameLower.includes('filter')
    ) {
      return 'query';
    }
    if (
      nameLower.includes('body') ||
      nameLower.includes('data') ||
      nameLower.includes('payload') ||
      nameLower.includes('request')
    ) {
      return 'body';
    }

    return 'path';
  }

  /**
   * Generate parameter description if none exists
   */
  private generateParameterDescription(name: string, type: string): string {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('id')) {
      return 'Unique identifier for the resource.';
    } else if (nameLower.includes('url') || nameLower.includes('endpoint')) {
      return 'The API endpoint URL.';
    } else if (
      nameLower.includes('key') ||
      nameLower.includes('token') ||
      nameLower.includes('auth')
    ) {
      return 'Authentication credentials or API key.';
    } else if (nameLower.includes('options') || nameLower.includes('config')) {
      return 'Configuration options for the request.';
    } else if (
      nameLower.includes('data') ||
      nameLower.includes('body') ||
      nameLower.includes('payload')
    ) {
      return 'Request payload data.';
    } else if (nameLower.includes('limit')) {
      return 'Maximum number of results to return.';
    } else if (nameLower.includes('offset') || nameLower.includes('skip')) {
      return 'Number of results to skip.';
    } else if (nameLower.includes('timeout')) {
      return 'Request timeout in milliseconds.';
    } else if (type === 'string') {
      return `The ${name} value.`;
    } else if (type === 'number') {
      return `Numeric value for ${name}.`;
    } else if (type === 'boolean') {
      return `Whether ${name} is enabled.`;
    }

    return `The ${name} parameter.`;
  }

  /**
   * Get kind string from kind number
   */
  private getKindString(kind: number): string {
    const kindMap: Record<number, string> = {
      128: 'Class',
      256: 'Interface',
      64: 'Function',
      8: 'Enum',
      2097152: 'Type Alias',
    };
    return kindMap[kind] || 'Unknown';
  }

  /**
   * Get plural form of a name
   */
  private getPluralName(name: string): string {
    const lower = name.toLowerCase();
    if (lower.endsWith('y')) {
      return `${lower.slice(0, -1)}ies`;
    } else if (lower.endsWith('s') || lower.endsWith('x') || lower.endsWith('z')) {
      return `${lower}es`;
    }
    return `${lower}s`;
  }

  /**
   * Get action verb from function name
   */
  private getActionFromName(name: string): string {
    const lower = name.toLowerCase();
    if (lower.startsWith('get')) {
      return `retrieve ${lower.replace(/^get/, '').toLowerCase()}`;
    } else if (lower.startsWith('create')) {
      return `create ${lower.replace(/^create/, '').toLowerCase()}`;
    } else if (lower.startsWith('update')) {
      return `update ${lower.replace(/^update/, '').toLowerCase()}`;
    } else if (lower.startsWith('delete')) {
      return `delete ${lower.replace(/^delete/, '').toLowerCase()}`;
    } else if (lower.startsWith('fetch')) {
      return `fetch ${lower.replace(/^fetch/, '').toLowerCase()}`;
    }
    return lower
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .trim();
  }

  /**
   * Render a Table of Contents component
   */
  private renderToc(items: string[]): string {
    if (items.length === 0) {
      return '';
    }

    // Generate TOC links - Mintlify uses anchor links based on heading text
    const tocLinks = items
      .map((item) => {
        // Convert section name to anchor (lowercase, replace spaces with hyphens)
        const anchor = item.toLowerCase().replace(/\s+/g, '-');
        return `- [${item}](#${anchor})`;
      })
      .join('\n');

    return `<Toc>\n${tocLinks}\n</Toc>\n\n`;
  }
}
