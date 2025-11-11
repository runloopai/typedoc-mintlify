/**
 * Mintlify component generators
 * See: https://www.mintlify.com/docs/content/components
 */
export class MintlifyComponents {
  /**
   * Generate an Accordion component
   */
  accordion(title: string, content: string): string {
    return `<Accordion title="${title}">
${content}
</Accordion>`;
  }

  /**
   * Generate an AccordionGroup
   */
  accordionGroup(accordions: Array<{ title: string; content: string }>): string {
    const items = accordions
      .map((acc) => {
        // Indent content for proper MDX formatting
        const indentedContent = acc.content
          .split('\n')
          .map((line) => `  ${line}`)
          .join('\n');
        return this.accordion(acc.title, indentedContent);
      })
      .join('\n\n');
    return `<AccordionGroup>
${items}
</AccordionGroup>`;
  }

  /**
   * Generate Tabs component
   */
  tabs(tabs: Array<{ title: string; content: string }>): string {
    const tabComponents = tabs
      .map(
        (tab) =>
          `  <Tab title="${tab.title}">
${tab.content
  .split('\n')
  .map((line) => `    ${line}`)
  .join('\n')}
  </Tab>`
      )
      .join('\n');

    return `<Tabs>
${tabComponents}
</Tabs>`;
  }

  /**
   * Generate CodeGroup for multiple code examples
   */
  codeGroup(codeBlocks: Array<{ title: string; code: string; language: string }>): string {
    const blocks = codeBlocks
      .map(
        (block) =>
          `\`\`\`${block.language} ${block.title}
${block.code}
\`\`\``
      )
      .join('\n\n');

    return `<CodeGroup>
${blocks}
</CodeGroup>`;
  }

  /**
   * Generate Card component
   */
  card(title: string, icon: string = '', href: string = ''): string {
    const iconAttr = icon ? ` icon="${icon}"` : '';
    const hrefAttr = href ? ` href="${href}"` : '';
    return `<Card title="${title}"${iconAttr}${hrefAttr} />`;
  }

  /**
   * Generate CardGroup
   */
  cardGroup(
    cards: Array<{ title: string; icon?: string; href?: string }>,
    cols: number = 2
  ): string {
    const cardComponents = cards
      .map((c) => this.card(c.title, c.icon || '', c.href || ''))
      .join('\n');
    return `<CardGroup cols={${cols}}>
${cardComponents}
</CardGroup>`;
  }

  /**
   * Generate Callout component
   */
  callout(
    type: 'note' | 'warning' | 'info' | 'tip' | 'check',
    content: string,
    title: string = ''
  ): string {
    const titleAttr = title ? ` title="${title}"` : '';
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    return `<${capitalizedType}${titleAttr}>
${content}
</${capitalizedType}>`;
  }

  /**
   * Generate Check (success) callout
   */
  check(content: string, title: string = ''): string {
    return `<Check${title ? ` title="${title}"` : ''}>
${content}
</Check>`;
  }

  /**
   * Generate Info callout
   */
  info(content: string, title: string = ''): string {
    return `<Info${title ? ` title="${title}"` : ''}>
${content}
</Info>`;
  }

  /**
   * Generate Warning callout
   */
  warning(content: string, title: string = ''): string {
    return `<Warning${title ? ` title="${title}"` : ''}>
${content}
</Warning>`;
  }

  /**
   * Generate Note callout
   */
  note(content: string, title: string = ''): string {
    return `<Note${title ? ` title="${title}"` : ''}>
${content}
</Note>`;
  }

  /**
   * Generate ParamField for API documentation
   */
  paramField(
    name: string,
    type: string,
    required: boolean = false,
    description: string = ''
  ): string {
    return `<ParamField path="${name}" type="${type}"${required ? ' required' : ''}>
${description}
</ParamField>`;
  }

  /**
   * Generate ResponseField for API documentation
   */
  responseField(name: string, type: string, description: string = ''): string {
    return `<ResponseField name="${name}" type="${type}">
${description}
</ResponseField>`;
  }

  /**
   * Generate Expandable component for collapsible content
   */
  expandable(title: string, content: string, defaultOpen: boolean = false): string {
    const defaultOpenAttr = defaultOpen ? ' defaultOpen' : '';
    return `<Expandable title="${title}"${defaultOpenAttr}>
${content}
</Expandable>`;
  }

  /**
   * Generate Columns component for multi-column layouts
   */
  columns(columns: Array<{ title?: string; content: string }>, cols: number = 2): string {
    const columnComponents = columns
      .map((col) => {
        const title = col.title ? ` title="${col.title}"` : '';
        return `<Column${title}>
${col.content
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
</Column>`;
      })
      .join('\n\n');

    return `<Columns cols={${cols}}>
${columnComponents}
</Columns>`;
  }
}
