import type {
  Reflection,
  Type,
  IntrinsicType,
  ReferenceType,
  ArrayType,
  UnionType,
  IntersectionType,
  LiteralType,
  TupleType,
  ConditionalType,
  IndexedAccessType,
  QueryType,
  PredicateType,
  ReflectionType,
  DeclarationReflection,
  ParameterReflection,
  SignatureReflection,
} from 'typedoc';

/**
 * Utility functions for Mintlify markdown generation
 */

/**
 * Escapes special characters in strings for use in MDX
 */
export function escapeMdx(text: string): string {
  if (!text) {
    return '';
  }

  return text.replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/</g, '\\<').replace(/>/g, '\\>');
}

/**
 * Sanitizes text for use in MDX attributes
 */
export function sanitizeAttribute(text: string): string {
  if (!text) {
    return '';
  }

  return text.replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, '');
}

/**
 * Converts a TypeDoc reflection kind to a human-readable label
 */
export function getKindLabel(kind: number): string {
  const kindMap: Record<number, string> = {
    1: 'Project',
    2: 'Module',
    4: 'Namespace',
    8: 'Enum',
    16: 'Enum Member',
    32: 'Variable',
    64: 'Function',
    128: 'Class',
    256: 'Interface',
    512: 'Constructor',
    1024: 'Property',
    2048: 'Method',
    4096: 'Call Signature',
    8192: 'Index Signature',
    16384: 'Constructor Signature',
    32768: 'Parameter',
    65536: 'Type Literal',
    131072: 'Type Parameter',
    262144: 'Accessor',
    524288: 'Get Signature',
    1048576: 'Set Signature',
    2097152: 'Type Alias',
    4194304: 'Reference',
  };

  return kindMap[kind] || 'Unknown';
}

/**
 * Generates a slug from text for use in URLs and file names
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Formats a TypeDoc type for display in Mintlify
 * @param type The type to format
 * @param typeToUrlMap Optional map of type names to URLs for generating links
 * @param currentPageUrl Optional current page URL for generating relative links
 */
export function formatType(
  type: Type | string | null | undefined,
  typeToUrlMap?: Map<string, string>,
  currentPageUrl?: string
): string {
  if (!type) {
    return 'any';
  }

  if (typeof type === 'string') {
    return type;
  }

  if (type.type === 'intrinsic') {
    return (type as IntrinsicType).name;
  }

  if (type.type === 'reference') {
    const ref = type as ReferenceType;
    let typeName = ref.name;

    // Check if this type has a generated page and should be linked
    if (typeToUrlMap && typeToUrlMap.has(typeName)) {
      const targetUrl = typeToUrlMap.get(typeName)!;
      // Use absolute paths for Mintlify (starting with /)
      // Remove .mdx extension if present and ensure leading slash
      const cleanUrl = targetUrl.replace(/\.mdx$/, '');
      const absoluteUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;

      // Wrap in link, preserving the type name
      typeName = `[${typeName}](${absoluteUrl})`;
    }

    let result = typeName;

    // Handle generics
    if (ref.typeArguments && ref.typeArguments.length > 0) {
      const args = ref.typeArguments
        .map((t) => formatType(t, typeToUrlMap, currentPageUrl))
        .join(', ');
      result += `<${args}>`;
    }

    return result;
  }

  if (type.type === 'array') {
    return `${formatType((type as ArrayType).elementType, typeToUrlMap, currentPageUrl)}[]`;
  }

  if (type.type === 'union') {
    return (type as UnionType).types
      .map((t) => formatType(t, typeToUrlMap, currentPageUrl))
      .join(' | ');
  }

  if (type.type === 'intersection') {
    return (type as IntersectionType).types
      .map((t) => formatType(t, typeToUrlMap, currentPageUrl))
      .join(' & ');
  }

  if (type.type === 'literal') {
    return JSON.stringify((type as LiteralType).value);
  }

  if (type.type === 'tuple') {
    const tuple = type as TupleType;
    const elements = tuple.elements
      .map((t) => formatType(t, typeToUrlMap, currentPageUrl))
      .join(', ');
    return `[${elements}]`;
  }

  if (type.type === 'reflection') {
    // Try to get more information about the reflection
    const reflectionType = type as ReflectionType;
    const reflection = reflectionType.declaration as DeclarationReflection | undefined;
    if (reflection) {
      // If it's a function signature, format it
      if (reflection.signatures && reflection.signatures.length > 0) {
        const sig = reflection.signatures[0] as SignatureReflection;
        const params = (sig.parameters || [])
          .map((p: ParameterReflection) => {
            const optional = p.flags?.isOptional ? '?' : '';
            return `${p.name}${optional}: ${formatType(p.type, typeToUrlMap, currentPageUrl)}`;
          })
          .join(', ');
        const returnType = formatType(sig.type, typeToUrlMap, currentPageUrl);
        return `(${params}) => ${returnType}`;
      }
      // If it has properties, format as object type
      if (reflection.children && reflection.children.length > 0) {
        const props = reflection.children
          .map((child: DeclarationReflection) => {
            const optional = child.flags?.isOptional ? '?' : '';
            return `${child.name}${optional}: ${formatType(child.type, typeToUrlMap, currentPageUrl)}`;
          })
          .join('; ');
        return `{ ${props} }`;
      }
    }
    return 'object';
  }

  if (type.type === 'conditional') {
    const conditional = type as ConditionalType;
    const checkType = formatType(conditional.checkType, typeToUrlMap, currentPageUrl);
    const extendsType = formatType(conditional.extendsType, typeToUrlMap, currentPageUrl);
    const trueType = formatType(conditional.trueType, typeToUrlMap, currentPageUrl);
    const falseType = formatType(conditional.falseType, typeToUrlMap, currentPageUrl);
    return `${checkType} extends ${extendsType} ? ${trueType} : ${falseType}`;
  }

  if (type.type === 'indexedAccess') {
    const indexed = type as IndexedAccessType;
    const objectType = formatType(indexed.objectType, typeToUrlMap, currentPageUrl);
    const indexType = formatType(indexed.indexType, typeToUrlMap, currentPageUrl);
    return `${objectType}[${indexType}]`;
  }

  if (type.type === 'query') {
    const query = type as QueryType;
    return `typeof ${query.queryType?.name || 'unknown'}`;
  }

  if (type.type === 'predicate') {
    const predicate = type as PredicateType;
    const name = predicate.name || 'this';
    const typeStr = formatType(predicate.type, typeToUrlMap, currentPageUrl);
    return `${name} is ${typeStr}`;
  }

  if (type.type === 'templateLiteral') {
    // Template literals are complex, use toString if available
    return type.toString?.() || 'string';
  }

  // Fallback to toString if available
  return type.toString?.() || 'any';
}

export interface CodeExample {
  language: string;
  code: string;
}

/**
 * Extracts code examples from JSDoc comments
 */
export function extractExamples(
  comment:
    | { blockTags?: Array<{ tag: string; content?: Array<{ text?: string }> }> }
    | null
    | undefined
): CodeExample[] {
  if (!comment) {
    return [];
  }

  const examples: CodeExample[] = [];

  // Check for @example tags
  if (comment.blockTags) {
    for (const tag of comment.blockTags) {
      if (tag.tag === '@example') {
        const content = tag.content?.[0]?.text || '';

        // Try to extract code blocks
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
          examples.push({
            language: match[1] || 'typescript',
            code: match[2].trim(),
          });
        }

        // If no code blocks found, treat entire content as example
        if (examples.length === 0 && content.trim()) {
          examples.push({
            language: 'typescript',
            code: content.trim(),
          });
        }
      }
    }
  }

  return examples;
}

/**
 * Generates icon name based on reflection kind for Mintlify cards
 */
export function getIconForKind(kind: number): string {
  const iconMap: Record<number, string> = {
    2: 'folder', // Module
    4: 'folder-tree', // Namespace
    8: 'list', // Enum
    64: 'function', // Function
    128: 'cube', // Class
    256: 'shapes', // Interface
    2097152: 'tag', // Type Alias
  };

  return iconMap[kind] || 'file';
}

/**
 * Groups reflections by their kind
 */
export function groupByKind(reflections: Reflection[]): Record<string, Reflection[]> {
  const groups: Record<string, Reflection[]> = {};

  for (const reflection of reflections) {
    const kind = getKindLabel(reflection.kind);
    if (!groups[kind]) {
      groups[kind] = [];
    }
    groups[kind].push(reflection);
  }

  return groups;
}

/**
 * Determines if a reflection should have its own page
 */
export function shouldHaveOwnPage(reflection: Reflection): boolean {
  const pageableKinds = [
    2, // Module
    4, // Namespace
    8, // Enum
    64, // Function
    128, // Class
    256, // Interface
    2097152, // Type Alias
  ];

  return pageableKinds.includes(reflection.kind);
}

/**
 * Generates a relative path between two file paths
 */
export function relativePath(from: string, to: string): string {
  const fromParts = from.split('/').filter(Boolean);
  const toParts = to.split('/').filter(Boolean);

  let i = 0;
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
    i++;
  }

  const upLevels = fromParts.length - i - 1;
  const upPath = '../'.repeat(upLevels);
  const downPath = toParts.slice(i).join('/');

  return upPath + downPath || './';
}

/**
 * Wraps text at a specified width for better readability
 */
export function wrapText(text: string, width: number = 80): string {
  if (!text) {
    return '';
  }

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    if (currentLength + word.length + 1 > width && currentLine.length > 0) {
      lines.push(currentLine.join(' '));
      currentLine = [word];
      currentLength = word.length;
    } else {
      currentLine.push(word);
      currentLength += word.length + (currentLine.length > 1 ? 1 : 0);
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }

  return lines.join('\n');
}
