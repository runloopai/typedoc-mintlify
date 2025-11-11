// @ts-check
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

/**
 * Handles rendering of individual pages with Mintlify-specific formatting
 * Following Mintlify API documentation patterns and best practices
 */
export class MintlifyPageRenderer {
  /**
   * @param {any} theme
   * @param {any} page
   */
  constructor(theme, page) {
    this.theme = theme;
    this.page = page;
  }

  /**
   * Render the page with Mintlify enhancements
   * @param {Function} template - The template function
   * @returns {string} Rendered markdown with Mintlify components
   */
  render(template) {
    let content = template(this.page);
    return this.enhanceContent(content);
  }

  /**
   * Enhance existing content (used when content is already rendered)
   * @param {string} content - Already rendered markdown content
   * @returns {string} Enhanced content
   */
  enhanceContent(content) {
    // Apply comprehensive Mintlify transformations in order
    // IMPORTANT: transformEnums must run BEFORE transformInterfaces to prevent
    // enum members from being incorrectly matched as interface properties
    content = this.addFrontmatter(content);
    content = this.cleanupMarkdown(content);
    content = this.rewriteForUserFocus(content);
    content = this.transformCallouts(content);
    content = this.transformParameters(content);
    content = this.transformReturns(content);
    content = this.transformExamples(content);
    content = this.transformApiDocs(content);
    content = this.transformEnums(content); // Run before transformInterfaces
    content = this.transformInterfaces(content);
    content = this.transformClasses(content);
    content = this.transformLinks(content);
    content = this.beautifyStructure(content);

    return content;
  }

  /**
   * Add Mintlify frontmatter with keyword-rich titles and descriptions
   * @param {string} content
   * @returns {string}
   */
  addFrontmatter(content) {
    const model = this.page.model;
    const name = model?.name || 'Documentation';
    
    // Create keyword-rich title based on type
    let title = name;
    if (model?.kindString === 'Class') {
      title = `${name}`;
    } else if (model?.kindString === 'Interface') {
      title = `${name}`;
    } else if (model?.kindString === 'Function') {
      title = `${name}`;
    } else if (model?.kindString === 'Enum') {
      title = `${name}`;
    }
    
    // Create user-focused description
    const summary = model?.comment?.summary?.[0]?.text || '';
    let description = summary.trim();
    
    // Improve description to be more user-focused and actionable
    if (description && !description.endsWith('.')) {
      description += '.';
    }
    if (!description) {
      if (model?.kindString === 'Class') {
        description = `Use the ${name} class to manage ${this.getPluralName(name)}.`;
      } else if (model?.kindString === 'Interface') {
        description = `The ${name} interface defines the structure for ${this.getPluralName(name)}.`;
      } else if (model?.kindString === 'Function') {
        description = `Call ${name} to ${this.getActionFromName(name)}.`;
      } else if (model?.kindString === 'Enum') {
        description = `Use ${name} to specify ${this.getPluralName(name)}.`;
      } else {
        description = `Documentation for ${name}.`;
      }
    }
    
    const frontmatter = `---
title: "${title}"
description: "${description.replace(/"/g, '\\"').replace(/\n/g, ' ').trim()}"
---

`;

    // If content already has frontmatter, replace it
    if (content.startsWith('---')) {
      content = content.replace(/^---[\s\S]*?---\n/, frontmatter);
    } else {
      content = frontmatter + content;
    }

    return content;
  }

  /**
   * Get plural form of a name
   * @param {string} name
   * @returns {string}
   */
  getPluralName(name) {
    const lower = name.toLowerCase();
    if (lower.endsWith('y')) {
      return lower.slice(0, -1) + 'ies';
    } else if (lower.endsWith('s') || lower.endsWith('x') || lower.endsWith('z')) {
      return lower + 'es';
    }
    return lower + 's';
  }

  /**
   * Get action verb from function name
   * @param {string} name
   * @returns {string}
   */
  getActionFromName(name) {
    const lower = name.toLowerCase();
    if (lower.startsWith('get')) {
      return 'retrieve ' + lower.replace(/^get/, '').toLowerCase();
    } else if (lower.startsWith('create')) {
      return 'create ' + lower.replace(/^create/, '').toLowerCase();
    } else if (lower.startsWith('update')) {
      return 'update ' + lower.replace(/^update/, '').toLowerCase();
    } else if (lower.startsWith('delete')) {
      return 'delete ' + lower.replace(/^delete/, '').toLowerCase();
    } else if (lower.startsWith('fetch')) {
      return 'fetch ' + lower.replace(/^fetch/, '').toLowerCase();
    }
    return lower.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
  }

  /**
   * Rewrite content to be more user-focused (second person, active voice)
   * @param {string} content
   * @returns {string}
   */
  rewriteForUserFocus(content) {
    // Remove version badges and unnecessary metadata
    content = content.replace(/\*\*.*?v\d+\.\d+\.\d+.*?\*\* • \*\*.*?\*\*\n\n/g, '');
    
    // Transform to be more user-focused
    content = content.replace(/^This (class|function|interface|enum) /gm, 'This $1 ');
    content = content.replace(/You can use this (class|function|interface|enum) provides/gm, 'This $1 provides');
    
    // Remove "Defined in" lines (not user-focused)
    content = content.replace(/#### Defined in\n\n.*?\n\n/g, '');
    content = content.replace(/###### Defined in\n\n.*?\n\n/g, '');
    content = content.replace(/#### Defined in\n\n.*$/gm, '');
    content = content.replace(/###### Defined in\n\n.*$/gm, '');
    
    // Remove "Overrides" sections (implementation detail, not user-focused)
    content = content.replace(/###### Overrides\n\n.*?\n\n/g, '');
    
    // Remove "Extends" sections for now (can be added back if needed)
    content = content.replace(/#### Extends\n\n.*?\n\n/g, '');
    
    // Improve type alias descriptions
    content = content.replace(
      /> \*\*(\w+)\*\*: (.+?)\n\n(.+?)(?=\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ name, /** @type {string} */ type, /** @type {string} */ description) => {
        if (description.trim() && !description.includes('####') && !description.includes('###')) {
          let desc = description.trim();
          if (!desc.endsWith('.')) {
            desc += '.';
          }
          return `**Type:** \`${type.trim()}\`\n\n${desc}\n\n`;
        }
        return match;
      }
    );
    
    return content;
  }

  /**
   * Clean up markdown formatting
   * @param {string} content
   * @returns {string}
   */
  cleanupMarkdown(content) {
    // Remove excessive horizontal rules
    content = content.replace(/\n\*\*\*\n/g, '\n\n');
    
    // Clean up empty parameter sections
    content = content.replace(/###### Parameters\n\n\n/g, '');
    
    // Remove version info from headers
    content = content.replace(/# .+ v\d+\.\d+\.\d+/g, (match) => {
      return match.replace(/ v\d+\.\d+\.\d+/, '');
    });
    
    return content;
  }

  /**
   * Transform parameter sections to use ParamField components following Mintlify patterns
   * @param {string} content
   * @returns {string}
   */
  transformParameters(content) {
    // Match parameter sections: ###### Parameters followed by bullet points
    const paramSectionPattern = /###### Parameters\n\n([\s\S]*?)(?=\n###### |\n##### |\n#### |\n### |\n## |\n# |$)/g;
    
    return content.replace(paramSectionPattern, (/** @type {string} */ match, /** @type {string} */ paramsSection) => {
      const paramLines = paramsSection.split('\n').filter((/** @type {string} */ line) => line.trim());
      /** @type {Array<{name: string, type: string, description: string, required: boolean, location: string}>} */
      const paramFields = [];
      
      for (const line of paramLines) {
        // Match: • **name**: `type` Description
        const paramMatch = line.match(/• \*\*(.+?)\*\*: `(.+?)`\s*(.*)/);
        if (paramMatch) {
          const [, name, type, description] = paramMatch;
          // Check if optional (has ? or contains "optional")
          const optionalMatch = line.match(/`(.+?)\?`/);
          const required = !optionalMatch && !line.toLowerCase().includes('optional');
          
          // Determine parameter location based on name and context
          let location = 'path';
          const nameLower = name.toLowerCase();
          if (nameLower.includes('header') || nameLower === 'authorization' || nameLower === 'auth') {
            location = 'header';
          } else if (nameLower.includes('query') || nameLower.includes('limit') || nameLower.includes('offset') || nameLower.includes('page') || nameLower.includes('sort')) {
            location = 'query';
          } else if (nameLower.includes('body') || nameLower.includes('data') || nameLower.includes('payload') || nameLower.includes('request')) {
            location = 'body';
          } else if (nameLower.includes('id') && !nameLower.includes('userid') && !nameLower.includes('accountid')) {
            location = 'path';
          }
          
          // Improve description to be user-focused
          let improvedDesc = description.trim();
          if (!improvedDesc) {
            // Generate smart descriptions based on parameter name and type
            improvedDesc = this.generateParameterDescription(name, type);
          } else {
            // Ensure description ends with period
            if (!improvedDesc.endsWith('.')) {
              improvedDesc += '.';
            }
          }
          
          paramFields.push({
            name: name.trim(),
            type: type.trim(),
            description: improvedDesc,
            required,
            location
          });
        }
      }
      
      if (paramFields.length > 0) {
        let result = '###### Parameters\n\n';
        for (const param of paramFields) {
          // Use Mintlify's ParamField with proper location attribute
          const locationAttr = param.location === 'path' ? `path` : 
                              param.location === 'query' ? `query` :
                              param.location === 'header' ? `header` : `body`;
          
          // Clean description - remove trailing periods that might cause issues
          let cleanDesc = param.description.trim();
          if (cleanDesc.endsWith('..')) {
            cleanDesc = cleanDesc.slice(0, -1);
          }
          
          result += `<ParamField ${locationAttr}="${param.name}" type="${param.type}"${param.required ? ' required' : ''}>\n`;
          result += `${cleanDesc}\n`;
          result += `</ParamField>\n\n`;
        }
        return result;
      }
      
      return match;
    });
  }

  /**
   * Generate user-focused parameter description
   * @param {string} name
   * @param {string} type
   * @returns {string}
   */
  generateParameterDescription(name, type) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('id')) {
      return `Unique identifier for the resource.`;
    } else if (nameLower.includes('url') || nameLower.includes('endpoint')) {
      return `The API endpoint URL.`;
    } else if (nameLower.includes('key') || nameLower.includes('token') || nameLower.includes('auth')) {
      return `Authentication credentials or API key.`;
    } else if (nameLower.includes('options') || nameLower.includes('config')) {
      return `Configuration options for the request.`;
    } else if (nameLower.includes('data') || nameLower.includes('body') || nameLower.includes('payload')) {
      return `Request payload data.`;
    } else if (nameLower.includes('limit')) {
      return `Maximum number of results to return.`;
    } else if (nameLower.includes('offset') || nameLower.includes('skip')) {
      return `Number of results to skip.`;
    } else if (nameLower.includes('timeout')) {
      return `Request timeout in milliseconds.`;
    } else if (nameLower.includes('retry')) {
      return `Retry configuration for failed requests.`;
    } else if (nameLower.includes('headers')) {
      return `Custom headers to include in the request.`;
    } else if (nameLower.includes('message') || nameLower.includes('msg')) {
      return `Descriptive message or error text.`;
    } else if (nameLower.includes('type')) {
      return `Type or category identifier.`;
    } else if (nameLower.includes('status')) {
      return `HTTP status code.`;
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
   * Transform return type sections to use ResponseField following Mintlify patterns
   * @param {string} content
   * @returns {string}
   */
  transformReturns(content) {
    // Transform standalone Returns sections to ResponseField
    content = content.replace(
      /###### Returns\n\n`([^`]+)`\n\n([^\n]+(?:\n(?!######|#####|####|###|##|#)[^\n]+)*)/gs,
      (/** @type {string} */ match, /** @type {string} */ returnType, /** @type {string} */ description) => {
        // Clean up return type (remove line breaks and extra spaces)
        const cleanType = returnType.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
        let cleanDesc = description.trim();
        
        // Improve description to be user-focused
        if (!cleanDesc) {
          cleanDesc = `Returns ${cleanType}.`;
        } else {
          if (!cleanDesc.endsWith('.')) {
            cleanDesc += '.';
          }
        }
        
        if (cleanDesc && !cleanDesc.match(/^######|^#####|^####|^###|^##|^#/)) {
          return `###### Returns\n\n<ResponseField name="returns" type="${cleanType}">\n${cleanDesc}\n</ResponseField>\n\n`;
        }
        return `###### Returns\n\n\`${cleanType}\`\n\n`;
      }
    );
    
    return content;
  }

  /**
   * Transform code examples to use CodeGroup and improve formatting
   * @param {string} content
   * @returns {string}
   */
  transformExamples(content) {
    // Find all code blocks
    const codeBlocks = [];
    const codeBlockPattern = /```(\w+)([^\n]*)\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockPattern.exec(content)) !== null) {
      codeBlocks.push({
        fullMatch: match[0],
        language: match[1],
        title: match[2].trim(),
        code: match[3],
        index: match.index
      });
    }
    
    // Group consecutive code blocks (likely same concept in different languages)
    if (codeBlocks.length > 1) {
      const groups = [];
      let currentGroup = [codeBlocks[0]];
      
      for (let i = 1; i < codeBlocks.length; i++) {
        const prevBlock = codeBlocks[i - 1];
        const currBlock = codeBlocks[i];
        const distance = currBlock.index - (prevBlock.index + prevBlock.fullMatch.length);
        
        // Group blocks that are close together (within 200 chars)
        if (distance < 200) {
          currentGroup.push(currBlock);
        } else {
          groups.push(currentGroup);
          currentGroup = [currBlock];
        }
      }
      groups.push(currentGroup);
      
      // Replace groups with CodeGroup (process in reverse to maintain indices)
      for (let g = groups.length - 1; g >= 0; g--) {
        const group = groups[g];
        if (group.length > 1) {
          let codeGroup = '<CodeGroup>\n';
          for (const block of group) {
            // Use language as title if no title provided, capitalize it
            const title = block.title || block.language.charAt(0).toUpperCase() + block.language.slice(1);
            codeGroup += `\`\`\`${block.language} ${title}\n${block.code}\`\`\`\n\n`;
          }
          codeGroup += '</CodeGroup>\n';
          
          // Replace the group in content
          // Find the start (beginning of first code block) and end (end of last code block)
          const firstBlock = group[0];
          const lastBlock = group[group.length - 1];
          const startIndex = firstBlock.index;
          const endIndex = lastBlock.index + lastBlock.fullMatch.length;
          
          // Get text before the first block to preserve spacing
          const beforeStart = Math.max(0, startIndex - 1);
          const charBefore = content[beforeStart];
          const needsLeadingNewline = charBefore && charBefore !== '\n';
          
          content = content.slice(0, startIndex) + 
                    (needsLeadingNewline ? '\n' : '') + 
                    codeGroup + 
                    content.slice(endIndex);
        }
      }
    }
    
    return content;
  }

  /**
   * Transform API documentation to use RequestExample/ResponseExample
   * @param {string} content
   * @returns {string}
   */
  transformApiDocs(content) {
    const model = this.page.model;
    
    // For functions/methods, wrap examples in RequestExample/ResponseExample if appropriate
    if (model?.kindString === 'Function' || model?.kindString === 'Method') {
      // Check if there are code examples that look like API calls
      content = content.replace(
        /(###### Example\n\n)(```[\s\S]*?```)/g,
        (match, prefix, codeBlock) => {
          // Check if it looks like an API request
          if (codeBlock.includes('fetch') || codeBlock.includes('axios') || codeBlock.includes('request') || codeBlock.includes('http')) {
            return `${prefix}<RequestExample>\n${codeBlock}\n</RequestExample>\n\n<ResponseExample>\n\`\`\`json Success\n{\n  "success": true,\n  "data": {}\n}\n\`\`\`\n</ResponseExample>\n\n`;
          }
          return match;
        }
      );
    }
    
    return content;
  }

  /**
   * Transform interface documentation with Expandable for nested properties
   * @param {string} content
   * @returns {string}
   */
  transformInterfaces(content) {
    // Transform interface properties to use ResponseField
    // First handle User interface format: ##### propName\n\n> **propName**: `type`\n\nDescription
    content = content.replace(
      /##### (\w+)\n\n> \*\*(\w+)\*\*: `(.+?)`\n\n(.+?)(?=\n##### |\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ name1, /** @type {string} */ name2, /** @type {string} */ type, /** @type {string} */ description) => {
        // Skip if already transformed or if it's a class property (check context)
        if (description.includes('<ResponseField') || description.includes('**Type:**')) {
          return match;
        }
        
        // Skip enum members - they should have been transformed by transformEnums already
        // Enum members typically have ALL_CAPS names and string literal values
        // Check if this looks like an enum member (already transformed to code block format)
        if (description.includes('```') || description.match(/^`[^`]+`$/m)) {
          // Already transformed by transformEnums - skip
          return match;
        }
        // Also check for enum pattern: ALL_CAPS name with string literal type
        if (name1 === name2 && name1 === name1.toUpperCase() && /^"[A-Z_]+"$/.test(type)) {
          return match;
        }
        
        let desc = description.trim();
        // Remove trailing "#." or "#" artifacts
        desc = desc.replace(/#+\.?$/g, '').trim();
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        
        // Clean type (remove line breaks and strip surrounding quotes from string literals)
        let cleanType = type.replace(/\n/g, '').trim();
        // Strip surrounding quotes if it's a string literal (e.g., "UNAUTHORIZED" -> UNAUTHORIZED)
        if (cleanType.startsWith('"') && cleanType.endsWith('"')) {
          cleanType = cleanType.slice(1, -1);
        }
        const cleanName = name2.replace('?', '');
        
        // Use ResponseField for interface properties
        return `##### ${cleanName}\n\n<ResponseField name="${cleanName}" type="${cleanType}" required>\n${desc}\n</ResponseField>\n\n`;
      }
    );
    
    // Then handle RequestOptions format: ##### propName?\n\n> `optional` **propName**: `type`\n\nDescription
    content = content.replace(
      /##### (\w+[?]?)\n\n(> `optional` )?\*\*(\w+)\*\*: `(.+?)`\n\n(.+?)(?=\n##### |\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ name1, /** @type {string} */ optional, /** @type {string} */ name2, /** @type {string} */ type, /** @type {string} */ description) => {
        // Skip if already transformed
        if (description.includes('<ResponseField')) {
          return match;
        }
        
        // Skip enum members - check if already transformed or matches enum pattern
        if (description.includes('```') || description.match(/^`[^`]+`$/m)) {
          return match;
        }
        if (name1 === name2 && name1 === name1.toUpperCase() && /^"[A-Z_]+"$/.test(type)) {
          return match;
        }
        
        const isOptional = name1.includes('?') || optional;
        let desc = description.trim();
        // Remove trailing "#." or "#" artifacts
        desc = desc.replace(/#+\.?$/g, '').trim();
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        
        // Clean type (remove line breaks and strip surrounding quotes from string literals)
        let cleanType = type.replace(/\n/g, '').trim();
        // Strip surrounding quotes if it's a string literal (e.g., "UNAUTHORIZED" -> UNAUTHORIZED)
        if (cleanType.startsWith('"') && cleanType.endsWith('"')) {
          cleanType = cleanType.slice(1, -1);
        }
        const cleanName = name2.replace('?', '');
        
        // Use ResponseField for interface properties
        const requiredAttr = isOptional ? '' : ' required';
        return `##### ${cleanName}\n\n<ResponseField name="${cleanName}" type="${cleanType}"${requiredAttr}>\n${desc}\n</ResponseField>\n\n`;
      }
    );
    
    // Also handle the format: ##### propName?\n\n> `optional` **propName**: `type`\n\nDescription (with > at start)
    content = content.replace(
      /##### (\w+[?]?)\n\n> (`optional` )?\*\*(\w+)\*\*: `(.+?)`\n\n(.+?)(?=\n##### |\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ name1, /** @type {string} */ optional, /** @type {string} */ name2, /** @type {string} */ type, /** @type {string} */ description) => {
        // Skip if already transformed
        if (description.includes('<ResponseField')) {
          return match;
        }
        
        // Skip enum members - check if already transformed or matches enum pattern
        if (description.includes('```') || description.match(/^`[^`]+`$/m)) {
          return match;
        }
        if (name1 === name2 && name1 === name1.toUpperCase() && /^"[A-Z_]+"$/.test(type)) {
          return match;
        }
        
        const isOptional = name1.includes('?') || optional;
        let desc = description.trim();
        // Remove trailing "#." or "#" artifacts
        desc = desc.replace(/#+\.?$/g, '').trim();
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        
        // Clean type (remove line breaks and strip surrounding quotes from string literals)
        let cleanType = type.replace(/\n/g, '').trim();
        // Strip surrounding quotes if it's a string literal (e.g., "UNAUTHORIZED" -> UNAUTHORIZED)
        if (cleanType.startsWith('"') && cleanType.endsWith('"')) {
          cleanType = cleanType.slice(1, -1);
        }
        const cleanName = name2.replace('?', '');
        
        // Use ResponseField for interface properties
        const requiredAttr = isOptional ? '' : ' required';
        return `##### ${cleanName}\n\n<ResponseField name="${cleanName}" type="${cleanType}"${requiredAttr}>\n${desc}\n</ResponseField>\n\n`;
      }
    );
    
    // Handle retry object specifically - it has nested properties
    // DON'T close it immediately - nested properties should be inside it
    content = content.replace(
      /##### retry\?\n\n> `optional` \*\*retry\*\*: `Object`\n\n(.+?)(?=\n##### |\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ description) => {
        let desc = description.trim();
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        // Open the ResponseField but DON'T close it - nested properties will be added inside
        // The closing tag will be added later by the retry object fix logic
        return `##### retry\n\n<ResponseField name="retry" type="object">\n${desc}\n\n`;
      }
    );
    
    // Fix retry object - remove premature closing tags and ensure proper structure
    // First, remove any premature closing of retry ResponseField (before nested properties)
    // Pattern: retry opens, description, closes, then nested properties start
    content = content.replace(
      /(<ResponseField name="retry" type="object">\n[^\n]+\n)\n<\/ResponseField>\s*\n\n(######)/g,
      (/** @type {string} */ match, /** @type {string} */ open, /** @type {string} */ next) => {
        // Remove the premature closing tag - retry should stay open for nested properties
        return open + '\n\n' + next;
      }
    );
    
    // Also handle the case where retry closes and then immediately has nested properties on next line
    content = content.replace(
      /(<ResponseField name="retry" type="object">\n[^\n]+)\n<\/ResponseField>\s*\n\n(###### \w+)/g,
      (/** @type {string} */ match, /** @type {string} */ open, /** @type {string} */ next) => {
        // Remove the premature closing tag
        return open + '\n\n' + next;
      }
    );
    
    // Fix retry object - ensure it has a closing tag after nested properties
    // Match: <ResponseField name="retry"...>...nested properties...next section
    content = content.replace(
      /(<ResponseField name="retry" type="object">\n[^\n]+\n\n)([\s\S]*?)(?=\n##### |\n#### |\n### |\n## |\n# |$)/g,
      (/** @type {string} */ match, /** @type {string} */ open, /** @type {string} */ nested) => {
        // Remove any premature closing tags within nested content
        let fixedNested = nested.replace(/<\/ResponseField>\s*\n\n(?=######)/g, '\n\n');
        
        // Check if the retry ResponseField is already closed
        const nestedOpens = (fixedNested.match(/<ResponseField/g) || []).length;
        const nestedCloses = (fixedNested.match(/<\/ResponseField>/g) || []).length;
        
        // If all nested ResponseFields are closed, we need to close the parent retry
        if (nestedOpens === nestedCloses && nestedOpens > 0) {
          // Check if there's already a closing tag right before the next section
          const lastPart = fixedNested.trim().slice(-50);
          if (!lastPart.includes('</ResponseField>')) {
            // No closing tag before next section, add it
            return open + fixedNested + '\n</ResponseField>\n\n';
          }
        }
        // If nested ResponseFields aren't all closed, or retry is already closed, return as-is
        return match;
      }
    );
    
    // Additional fix: ensure retry ResponseField is closed if it's not
    // Look for unclosed retry ResponseField before next top-level section
    content = content.replace(
      /(<ResponseField name="retry" type="object">\n[^\n]+\n\n)([\s\S]*?)(\n### [A-Z])/g,
      (/** @type {string} */ match, /** @type {string} */ open, /** @type {string} */ nested, /** @type {string} */ nextSection) => {
        // Count opening and closing ResponseField tags in nested content
        const nestedOpens = (nested.match(/<ResponseField/g) || []).length;
        const nestedCloses = (nested.match(/<\/ResponseField>/g) || []).length;
        
        // If we have nested ResponseFields but they're all closed, we need to close the parent
        if (nestedOpens === nestedCloses && nestedOpens > 0) {
          // All nested tags are closed, but parent retry might not be
          // Check if the last thing before nextSection is a closing tag
          const lastPart = nested.trim().slice(-20);
          if (!lastPart.includes('</ResponseField>')) {
            return open + nested + '\n</ResponseField>\n\n' + nextSection;
          }
        }
        return match;
      }
    );
    
    // Handle nested properties (like retry.delay, retry.maxAttempts) - these should use Expandable
    content = content.replace(
      /###### (\w+)\n\n(> \*\*(\w+)\*\*: `(.+?)`\n\n)?(.+?)(?=\n###### |\n##### |\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ propName, /** @type {string} */ typeLine, /** @type {string} */ typeName, /** @type {string} */ type, /** @type {string} */ description) => {
        let desc = description.trim();
        // Remove trailing "#." or "#" artifacts
        desc = desc.replace(/#+\.?$/g, '').trim();
        
        // If there's a type in the description, extract it
        const typeMatch = desc.match(/<ResponseField name="(\w+)" type="([^"]+)"([^>]*)>/);
        if (typeMatch) {
          // Already has ResponseField, but check if it's closed
          desc = desc.replace(/#+\.?$/g, '').trim();
          // If the ResponseField is not closed, close it
          // The description stops before the next heading due to the regex lookahead
          if (!desc.includes('</ResponseField>')) {
            // Extract the content after the opening tag
            const contentMatch = desc.match(/<ResponseField[^>]*>\n?(.+)/s);
            if (contentMatch) {
              const content = contentMatch[1].trim();
              // Rebuild with closing tag
              desc = `<ResponseField name="${typeMatch[1]}" type="${typeMatch[2]}"${typeMatch[3]}>\n${content}\n</ResponseField>`;
            } else {
              // Fallback: just add closing tag at the end
              desc += '\n</ResponseField>';
            }
          }
          return `###### ${propName}\n\n${desc}\n\n`;
        }
        
        // If there's a type from the match, use ResponseField
        if (type) {
          const cleanType = type.replace(/\n/g, '').trim();
          if (!desc.endsWith('.')) {
            desc += '.';
          }
          return `###### ${propName}\n\n<ResponseField name="${propName}" type="${cleanType}">\n${desc}\n</ResponseField>\n\n`;
        }
        
        // Otherwise just format the description
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        return `###### ${propName}\n\n${desc}\n\n`;
      }
    );
    
    return content;
  }

  /**
   * Transform class documentation with better structure
   * @param {string} content
   * @returns {string}
   */
  transformClasses(content) {
    // Clean up constructor formatting
    content = content.replace(
      /##### new (\w+)\(\)\n\n> \*\*new \w+\*\*\(([^)]*)\): `(\w+)`\n\n(.+?)(?=\n###### |\n##### |\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ className, /** @type {string} */ params, /** @type {string} */ returnType, /** @type {string} */ description) => {
        let desc = description.trim();
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        return `##### Constructor\n\n\`new ${className}(${params}): ${returnType}\`\n\n${desc}\n\n`;
      }
    );
    
    // Transform method signatures to be cleaner
    content = content.replace(
      /> \*\*(\w+)\(([^)]*)\)\*\*: `(.+?)`\n\n(.+?)(?=\n###### |\n##### |\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ methodName, /** @type {string} */ params, /** @type {string} */ returnType, /** @type {string} */ description) => {
        if (methodName === 'new') return match;
        const cleanType = returnType.replace(/\n/g, '').trim();
        let desc = description.trim();
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        return `\`${methodName}(${params}): ${cleanType}\`\n\n${desc}\n\n`;
      }
    );
    
    // Transform class properties from blockquote format to clean format
    // Match: ##### propName\n\n> **propName**: `type`\n\nDescription
    content = content.replace(
      /##### (\w+)\n\n> \*\*(\w+)\*\*: `(.+?)`\n\n(.+?)(?=\n##### |\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ name1, /** @type {string} */ name2, /** @type {string} */ type, /** @type {string} */ description) => {
        // Skip if already has ResponseField (interfaces)
        if (description.includes('<ResponseField')) {
          return match;
        }
        
        let desc = description.trim();
        // Remove trailing "#." or "#" artifacts
        desc = desc.replace(/#+\.?$/g, '').trim();
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        
        const cleanType = type.replace(/\n/g, '').trim();
        return `##### ${name2}\n\n**Type:** \`${cleanType}\`\n\n${desc}\n\n`;
      }
    );
    
    // Remove ResponseField from class properties (they should just be properties, not response fields)
    // Class properties like statusCode, type should not use ResponseField - only interfaces use ResponseField
    // Match class properties that come after "#### Classes" or "### ClassName" sections
    // Look for patterns like: ##### propName\n\n<ResponseField...> in class contexts
    content = content.replace(
      /(#### Classes[\s\S]*?### \w+\n\n[^\n]+\n\n(?:<Info>[\s\S]*?<\/Info>\n\n)?(?:#### \w+\n\n)*##### (\w+)\n\n)<ResponseField name="\2" type="([^"]+)"([^>]*)>\n(.+?)\n<\/ResponseField>\n\n/g,
      (/** @type {string} */ match, /** @type {string} */ prefix, /** @type {string} */ propName, /** @type {string} */ type, /** @type {string} */ required, /** @type {string} */ description) => {
        let desc = description.trim();
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        return prefix + `**Type:** \`${type}\`\n\n${desc}\n\n`;
      }
    );
    
    // Also handle class properties that appear after constructors/methods
    // Match: ##### propName\n\n<ResponseField...> when not in interface section
    content = content.replace(
      /(##### (\w+)\n\n)<ResponseField name="\2" type="([^"]+)"([^>]*)>\n(.+?)\n<\/ResponseField>\n\n(?=##### |#### |### |## |# |$)/g,
      (/** @type {string} */ match, /** @type {string} */ prefix, /** @type {string} */ propName, /** @type {string} */ type, /** @type {string} */ required, /** @type {string} */ description) => {
        // Check if we're in an interface section by looking backwards
        const beforeMatch = content.substring(0, content.indexOf(match));
        const isInterface = beforeMatch.includes('#### Interfaces') || beforeMatch.includes('### RequestOptions') || beforeMatch.includes('### User');
        
        // Only transform if NOT in interface section
        if (!isInterface) {
          let desc = description.trim();
          if (!desc.endsWith('.')) {
            desc += '.';
          }
          return prefix + `**Type:** \`${type}\`\n\n${desc}\n\n`;
        }
        return match;
      }
    );
    
    return content;
  }

  /**
   * Transform enum documentation with better formatting
   * @param {string} content
   * @returns {string}
   */
  transformEnums(content) {
    // Clean up enum member formatting with better structure
    content = content.replace(
      /##### ([A-Z_]+)\n\n> \*\*([A-Z_]+)\*\*: `(.+?)`\n\n(.+?)(?=\n##### |\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ name1, /** @type {string} */ name2, /** @type {string} */ value, /** @type {string} */ description) => {
        let desc = description.trim();
        // Remove any trailing "#." or "#" artifacts
        desc = desc.replace(/#+\.?$/g, '').trim();
        // Remove standalone "#." lines
        desc = desc.replace(/^#\.$/gm, '').trim();
        if (desc && desc !== '#.') {
          if (!desc.endsWith('.')) {
            desc += '.';
          }
          return `##### ${name2}\n\n\`${value}\`\n\n${desc}\n\n`;
        }
        return `##### ${name2}\n\n\`${value}\`\n\n`;
      }
    );
    
    return content;
  }

  /**
   * Transform blockquotes to Mintlify callout components
   * @param {string} content
   * @returns {string}
   */
  transformCallouts(content) {
    // Transform > **Note:** to <Note>
    content = content.replace(
      /^> \*\*Note:\*\* (.+)$/gm,
      '<Note>\n$1\n</Note>'
    );

    // Transform > **Warning:** to <Warning>
    content = content.replace(
      /^> \*\*Warning:\*\* (.+)$/gm,
      '<Warning>\n$1\n</Warning>'
    );

    // Transform > **Info:** to <Info>
    content = content.replace(
      /^> \*\*Info:\*\* (.+)$/gm,
      '<Info>\n$1\n</Info>'
    );

    // Transform > **Tip:** to <Tip>
    content = content.replace(
      /^> \*\*Tip:\*\* (.+)$/gm,
      '<Tip>\n$1\n</Tip>'
    );

    // Transform Remarks to Info callouts with better formatting
    content = content.replace(
      /#### Remarks\n\n(.+?)(?=\n#### |\n### |\n## |\n# |$)/gs,
      (/** @type {string} */ match, /** @type {string} */ text) => {
        const cleanText = text.trim();
        if (cleanText) {
          return `<Info>\n${cleanText}\n</Info>\n\n`;
        }
        return match;
      }
    );

    return content;
  }

  /**
   * Transform markdown links to work with Mintlify
   * @param {string} content
   * @returns {string}
   */
  transformLinks(content) {
    // Map TypeScript types to their file paths
    /** @type {Record<string, string>} */
    const typeToPath = {
      'User': 'interfaces/user',
      'RequestOptions': 'interfaces/requestoptions',
      'UserService': 'classes/userservice',
      'ApiError': 'classes/apierror',
      'ApiErrorType': 'enums/apierrortype',
      'UserResult': 'types/userresult'
    };
    
    // Convert TypeDoc-style links to Mintlify links
    content = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (/** @type {string} */ match, /** @type {string} */ text, /** @type {string} */ path) => {
        // If it's already an absolute path or external link, keep it
        if (path.startsWith('http') || path.startsWith('/')) {
          return match;
        }
        // Convert relative paths to Mintlify paths
        const cleanPath = path.replace(/\.mdx?$/, '').replace(/^\.\//, '');
        // If it's a type reference, link to it
        if (!path.includes('/') && !path.includes('.')) {
          const typePath = typeToPath[text] || cleanPath.toLowerCase();
          return `[\`${text}\`](/api/${typePath})`;
        }
        return `[${text}](/api/${cleanPath})`;
      }
    );
    
    // Convert type references in backticks to links (but not in code blocks)
    const lines = content.split('\n');
    const result = [];
    let inCodeBlock = false;
    
    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        result.push(line);
        continue;
      }
      
      if (!inCodeBlock) {
        // Convert type references
        let processedLine = line;
        for (const [typeName, path] of Object.entries(typeToPath)) {
          // Match `TypeName` but not if it's already a link
          const typePattern = new RegExp(`\\\`${typeName}\\\``, 'g');
          processedLine = processedLine.replace(typePattern, (/** @type {string} */ match) => {
            // Check if it's already part of a link
            const before = processedLine.substring(0, processedLine.indexOf(match));
            const after = processedLine.substring(processedLine.indexOf(match) + match.length);
            if (before.includes('[') && after.includes(']')) {
              return match; // Already a link
            }
            return `[\`${typeName}\`](/api/${path})`;
          });
        }
        result.push(processedLine);
      } else {
        result.push(line);
      }
    }
    
    return result.join('\n');
  }

  /**
   * Beautify overall structure and ensure proper tag matching
   * @param {string} content
   * @returns {string}
   */
  beautifyStructure(content) {
    // Fix broken return types (Promise<User> split across lines)
    content = content.replace(/`Promise\s*\n\s*<(\w+)>\s*\n\s*`/g, '`Promise<$1>`');
    content = content.replace(/`([A-Z]\w+)\s*\n\s*<(\w+)>\s*\n\s*`/g, '`$1<$2>`');
    
    // Remove orphaned closing tags (closing tags without opening tags)
    // But be careful with CodeGroup and other components that might have content between tags
    const lines = content.split('\n');
    const tagStack = [];
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const openTagMatch = line.match(/<([A-Z]\w+)([^>]*?)(?:\s*\/>|>)/);
      const closeTagMatch = line.match(/<\/([A-Z]\w+)>/);
      
      if (openTagMatch) {
        const tagName = openTagMatch[1];
        // Check if it's a self-closing tag
        const isSelfClosing = line.includes('/>');
        if (!isSelfClosing) {
          tagStack.push(tagName);
        }
        result.push(line);
      } else if (closeTagMatch) {
        const tagName = closeTagMatch[1];
        const lastOpenTag = tagStack[tagStack.length - 1];
        if (lastOpenTag === tagName) {
          tagStack.pop();
          result.push(line);
        } else {
          // Check if this tag exists earlier in the stack (nested or out of order)
          const tagIndex = tagStack.lastIndexOf(tagName);
          if (tagIndex !== -1) {
            // Found matching tag, remove everything up to it
            tagStack.splice(tagIndex);
            result.push(line);
          } else {
            // Truly orphaned - but keep CodeGroup closing tags as they might be valid
            if (tagName === 'CodeGroup') {
              result.push(line);
            }
            // Otherwise skip orphaned closing tags
          }
        }
      } else {
        result.push(line);
      }
    }
    
    content = result.join('\n');
    
    // Remove excessive blank lines
    content = content.replace(/\n{4,}/g, '\n\n\n');
    
    // Clean up spacing around components
    content = content.replace(/\n\n\n(<[A-Z]\w+[^>]*>)/g, '\n\n$1');
    content = content.replace(/(<\/[A-Z]\w+>)\n\n\n/g, '$1\n\n');
    
    // Ensure proper spacing after components
    content = content.replace(/(<\/[A-Z]\w+>)(\n)([^\n])/g, '$1\n\n$3');
    
    // Remove empty sections
    content = content.replace(/### \w+\n\n\n/g, '');
    
    // Clean up trailing whitespace
    content = content.replace(/[ \t]+$/gm, '');
    
    // Remove duplicate Returns sections
    content = content.replace(/###### Returns\n\n`(.+?)`\n\n(.+?)\n\n###### Returns\n\n`(.+?)`/gs, 
      '###### Returns\n\n`$1`\n\n$2\n\n');
    
    // Clean up empty ParamField/ResponseField
    content = content.replace(/<ParamField[^>]*>\s*<\/ParamField>/g, '');
    content = content.replace(/<ResponseField[^>]*>\s*<\/ResponseField>/g, '');
    
    // Remove standalone "Type:" lines that are redundant with ResponseField
    content = content.replace(/\*\*Type:\*\* `(.+?)`\n\n(?=<ResponseField)/g, '');
    
    // Clean up duplicate type information
    content = content.replace(/(<ResponseField[^>]*type="([^"]+)"[^>]*>)\n\n\*\*Type:\*\* `\2`\n\n/g, '$1\n');
    
    // Remove trailing "#." or "#" artifacts that appear on their own lines - do this more aggressively
    // First, remove from descriptions before they get into the content
    content = content.replace(/#\./g, '');
    // Then clean up any remaining artifacts
    content = content.replace(/^#\.\n\n/gm, '');
    content = content.replace(/^#\.$/gm, '');
    content = content.replace(/\n#\.\n\n/g, '\n\n');
    content = content.replace(/\n#\.$/gm, '');
    content = content.replace(/\n#\.\n/g, '\n');
    // Remove standalone "#." lines anywhere
    content = content.split('\n').filter(line => line.trim() !== '#.').join('\n');
    
    // Remove lines that are just "#" or "##" etc BEFORE trying to add periods
    // This prevents creating "#." artifacts
    content = content.replace(/^#+\n\n/gm, '');
    content = content.replace(/^#+$/gm, '');
    content = content.replace(/\n#+\n\n/g, '\n\n');
    content = content.replace(/\n#+$/gm, '');
    
    // Now safely remove trailing "##" or "#" that might appear at the END of text (not standalone lines)
    // Only match if there's actual text before the #
    content = content.replace(/([^\n\s])##+\n\n/g, '$1.\n\n');
    content = content.replace(/([^\n\s])#\n\n/g, '$1.\n\n');
    
    // Remove trailing periods after code blocks
    content = content.replace(/```\n\n\./g, '```\n\n');
    content = content.replace(/```\.\n/g, '```\n');
    
    // Remove trailing periods after closing tags
    content = content.replace(/(<\/[A-Z]\w+>)\.\n\n/g, '$1\n\n');
    content = content.replace(/(<\/[A-Z]\w+>)\.\n/g, '$1\n');
    
    // Remove trailing periods after links in Returns sections
    content = content.replace(/(\[`[^\]]+`\]\([^)]+\))\.\n\n/g, '$1\n\n');
    content = content.replace(/(\[`[^\]]+`\]\([^)]+\))\.\n/g, '$1\n');
    
    // Ensure CodeGroup has proper spacing (blank line before and after)
    content = content.replace(/([^\n])\n(<CodeGroup>)/g, '$1\n\n$2');
    content = content.replace(/(<\/CodeGroup>)\n([^\n])/g, '$1\n\n$2');
    
    // Fix functions to use ParamField instead of bullet points
    content = this.transformFunctionParameters(content);
    
    // Final cleanup: Fix class properties that still have ResponseField
    // ApiError class properties (statusCode, type) should not use ResponseField
    // Match both statusCode and type separately to be more reliable
    content = content.replace(
      /(##### statusCode\n\n)<ResponseField name="statusCode" type="([^"]+)"([^>]*)>\n(.+?)\n<\/ResponseField>\n\n/g,
      (/** @type {string} */ match, /** @type {string} */ prefix, /** @type {string} */ type, /** @type {string} */ required, /** @type {string} */ description) => {
        let desc = description.trim();
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        return prefix + `**Type:** \`${type}\`\n\n${desc}\n\n`;
      }
    );
    
    content = content.replace(
      /(##### type\n\n)<ResponseField name="type" type="([^"]+)"([^>]*)>\n(.+?)\n<\/ResponseField>\n\n/g,
      (/** @type {string} */ match, /** @type {string} */ prefix, /** @type {string} */ type, /** @type {string} */ required, /** @type {string} */ description) => {
        let desc = description.trim();
        if (!desc.endsWith('.')) {
          desc += '.';
        }
        return prefix + `**Type:** \`${type}\`\n\n${desc}\n\n`;
      }
    );
    
    // Fix triple closing ResponseField tags (retry object)
    while (content.includes('</ResponseField>\n</ResponseField>\n</ResponseField>')) {
      content = content.replace(/<\/ResponseField>\n<\/ResponseField>\n<\/ResponseField>/g, '</ResponseField>');
    }
    
    // Fix unclosed ResponseField tags in nested structures
    // Pattern: ResponseField with description, then next heading without closing tag
    // This handles cases like maxAttempts that aren't closed before the next nested property
    // Match: <ResponseField...>\nDescription\n\n###### nextHeading (no closing tag in between)
    content = content.replace(
      /(<ResponseField name="(\w+)"[^>]*>)\n([^\n]+)\n\n(###### \w+)/g,
      (/** @type {string} */ match, /** @type {string} */ openTag, /** @type {string} */ fieldName, /** @type {string} */ description, /** @type {string} */ nextHeading) => {
        // Close the ResponseField before the next heading
        return openTag + '\n' + description + '\n</ResponseField>\n\n' + nextHeading;
      }
    );
    
    // Also handle the case where there might be extra blank lines
    content = content.replace(
      /(<ResponseField name="(\w+)"[^>]*>)\n([^\n]+)\n\n\n(###### \w+)/g,
      (/** @type {string} */ match, /** @type {string} */ openTag, /** @type {string} */ fieldName, /** @type {string} */ description, /** @type {string} */ nextHeading) => {
        // Close the ResponseField before the next heading
        return openTag + '\n' + description + '\n</ResponseField>\n\n' + nextHeading;
      }
    );
    
    // Fix retry object - ensure parent is closed after all nested ResponseFields
    // But don't add a closing tag if one already exists (to avoid double closing)
    content = content.replace(
      /(<ResponseField name="retry" type="object">\n[^\n]+\n\n)([\s\S]*?)(<\/ResponseField>\s*\n\n)(### [A-Z]|## [A-Z]|# [A-Z]|$)/g,
      (/** @type {string} */ match, /** @type {string} */ openTag, /** @type {string} */ nested, /** @type {string} */ lastClose, /** @type {string} */ nextSection) => {
        // Count ResponseField tags - if nested tags are all closed, we need to close parent
        const opens = (nested.match(/<ResponseField/g) || []).length;
        const closes = (nested.match(/<\/ResponseField>/g) || []).length;
        
        if (opens === closes && opens > 0) {
          // All nested tags are closed
          // Check if the lastClose is already closing the parent retry
          // If opens === closes, the lastClose must be closing a nested field, so we need to close parent
          // But check if there's already a closing tag for retry by counting total closes
          const totalCloses = closes + 1; // +1 for lastClose
          // If total closes > opens, we might have a double close situation
          // Only add parent close if we don't already have it
          const lastPart = nested.trim();
          if (!lastPart.endsWith('</ResponseField>')) {
            // No closing tag in nested content, so lastClose is for a nested field, add parent close
            return openTag + nested + lastClose + '</ResponseField>\n\n' + nextSection;
          }
          // If nested already ends with closing tag, lastClose might be duplicate - don't add another
          return match;
        }
        return match;
      }
    );
    
    // Fix retry object when parent is not closed at all
    // This handles the case where retry ResponseField is opened but not closed
    content = content.replace(
      /(<ResponseField name="retry" type="object">\n[^\n]+\n\n)([\s\S]*?)(\n### [A-Z]|\n## [A-Z]|\n# [A-Z]|$)/g,
      (/** @type {string} */ match, /** @type {string} */ openTag, /** @type {string} */ nested, /** @type {string} */ nextSection) => {
        // First, remove any premature closing tag for retry that might be in nested content
        // This happens if retry was closed too early
        let fixedNested = nested.replace(/<\/ResponseField>\s*\n\n(?=######)/g, '\n\n');
        
        // Count ResponseField tags in nested content (these are the nested properties)
        const opens = (fixedNested.match(/<ResponseField/g) || []).length;
        const closes = (fixedNested.match(/<\/ResponseField>/g) || []).length;
        
        // Close any unclosed nested ResponseFields first (like maxAttempts)
        if (opens > closes) {
          // Find unclosed ResponseFields and close them before next heading
          const unclosedPattern = /(<ResponseField[^>]*>)\n([^\n]+)\n\n(?=###### \w+)/g;
          fixedNested = fixedNested.replace(unclosedPattern, 
            (/** @type {string} */ m, /** @type {string} */ tag, /** @type {string} */ desc) => {
              return tag + '\n' + desc + '\n</ResponseField>\n\n';
            }
          );
        }
        
        // Now check if all nested ResponseFields are closed
        const finalOpens = (fixedNested.match(/<ResponseField/g) || []).length;
        const finalCloses = (fixedNested.match(/<\/ResponseField>/g) || []).length;
        
        // If all nested tags are closed (or there are none), close the parent retry ResponseField
        // But only if there isn't already a closing tag right before nextSection
        const beforeNextSection = fixedNested.trim();
        const hasClosingBeforeNext = beforeNextSection.endsWith('</ResponseField>');
        
        // Count how many closing tags we have vs opening tags
        // If finalOpens === finalCloses, all nested fields are closed
        // We need exactly one more closing tag for the parent retry
        if (finalOpens === finalCloses) {
          if (!hasClosingBeforeNext) {
            // No closing tag before next section, add parent close
            return openTag + fixedNested + '\n</ResponseField>\n\n' + nextSection;
          } else {
            // There's already a closing tag - check if it's the parent or a nested field
            // If finalOpens === finalCloses and there's a closing tag, it must be closing a nested field
            // So we still need to close the parent, but check for duplicates first
            // Look for double closing tags and remove them
            const doubleClosePattern = /<\/ResponseField>\s*\n\n<\/ResponseField>\s*\n\n(?=### )/;
            if (doubleClosePattern.test(fixedNested + '\n\n' + nextSection)) {
              // Already has double close, don't add another
              return openTag + fixedNested + '\n\n' + nextSection;
            }
            // The closing tag is for a nested field, add parent close
            return openTag + fixedNested + '\n</ResponseField>\n\n' + nextSection;
          }
        }
        
        return match;
      }
    );
    
    // Remove orphaned closing ResponseField tags (closing tags without matching opening tags)
    // This handles cases where we have extra closing tags, especially after nested properties
    // Pattern: blank lines, closing tag, blank lines, then next section
    content = content.replace(/\n\n<\/ResponseField>\s*\n\n(?=### |## |# |$)/g, '\n\n');
    // Remove double closing tags (two closing tags in a row before next section)
    content = content.replace(/(<\/ResponseField>\s*\n\n)\s*<\/ResponseField>\s*\n\n(?=### |## |# |$)/g, '$1\n\n');
    
    // Fix missing periods in nested ResponseField descriptions
    content = content.replace(
      /(<ResponseField[^>]*>)\n([^<]+?)\n\n(?=######)/g,
      (match, open, desc) => {
        let cleanDesc = desc.trim();
        if (!cleanDesc.endsWith('.')) {
          cleanDesc += '.';
        }
        return open + '\n' + cleanDesc + '\n\n';
      }
    );
    
    return content;
  }

  /**
   * Transform function parameters from bullet points to ParamField
   * @param {string} content
   * @returns {string}
   */
  transformFunctionParameters(content) {
    // Match function parameter sections - handle mixed ParamField and bullet points
    // Look for "#### Parameters" followed by any parameters (bullet points or ParamField)
    const functionParamPattern = /#### Parameters\n\n([\s\S]*?)(?=\n#### |\n### |\n## |\n# |$)/g;
    
    return content.replace(functionParamPattern, (/** @type {string} */ match, /** @type {string} */ paramsSection) => {
      // If already all ParamField, return as is
      if (!paramsSection.includes('•')) {
        return match;
      }
      
      const paramLines = paramsSection.split('\n').filter((/** @type {string} */ line) => line.trim());
      /** @type {Array<{name: string, type: string, description: string, required: boolean}>} */
      const paramFields = [];
      let i = 0;
      
      while (i < paramLines.length) {
        const line = paramLines[i];
        
        // If it's already a ParamField, skip it
        if (line.includes('<ParamField')) {
          // Find the closing tag
          while (i < paramLines.length && !paramLines[i].includes('</ParamField>')) {
            i++;
          }
          i++;
          continue;
        }
        
        // Match: • **name**: `type` or • **name?**: `type` or • **name?**: [link]
        const paramMatch = line.match(/• \*\*(\w+[?]?)\*\*: (?:`(.+?)`|\[([^\]]+)\]\([^)]+\))/);
        if (paramMatch) {
          const [, name, type, linkType] = paramMatch;
          const isOptional = name.includes('?');
          const cleanName = name.replace('?', '');
          // Clean the type - remove backticks and extra formatting
          let actualType = (type || linkType || 'any').trim();
          actualType = actualType.replace(/^`|`$/g, '').trim();
          
          // Get description from next line if available
          let description = '';
          if (i + 1 < paramLines.length && !paramLines[i + 1].match(/^•/) && !paramLines[i + 1].includes('<ParamField')) {
            description = paramLines[i + 1].trim();
            i++; // Skip the description line
          }
          
          if (!description) {
            description = this.generateParameterDescription(cleanName, actualType);
          } else if (!description.endsWith('.')) {
            description += '.';
          }
          
          paramFields.push({
            name: cleanName,
            type: actualType.trim(),
            description,
            required: !isOptional
          });
        }
        i++;
      }
      
      // If we found bullet point parameters, replace the entire section
      if (paramFields.length > 0) {
        // Get existing ParamFields from the section
        const existingParamFields = paramsSection.match(/<ParamField[\s\S]*?<\/ParamField>/g) || [];
        
        let result = '#### Parameters\n\n';
        // Add existing ParamFields first
        for (const existing of existingParamFields) {
          result += existing + '\n\n';
        }
        // Add new ParamFields from bullet points
        for (const param of paramFields) {
          result += `<ParamField path="${param.name}" type="${param.type}"${param.required ? ' required' : ''}>\n`;
          result += `${param.description}\n`;
          result += `</ParamField>\n\n`;
        }
        return result;
      }
      
      return match;
    });
  }
}
