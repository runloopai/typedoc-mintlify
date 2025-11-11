import { Application, ParameterType } from 'typedoc';
import { MintlifyTheme } from './theme.js';

/**
 * TypeDoc plugin to generate Mintlify-compatible markdown documentation
 */
export function load(app: Application): void {
  // Add custom options for Mintlify
  app.options.addDeclaration({
    name: 'mintlifyOutput',
    help: 'Output directory for Mintlify docs',
    type: ParameterType.String,
    defaultValue: './mintlify-docs',
  });

  app.options.addDeclaration({
    name: 'mintlifyComponents',
    help: 'Enable Mintlify-specific components (Accordions, Tabs, etc.)',
    type: ParameterType.Boolean,
    defaultValue: true,
  });

  app.options.addDeclaration({
    name: 'generateMintlifyNav',
    help: 'Generate mint.json navigation file',
    type: ParameterType.Boolean,
    defaultValue: true,
  });

  // Register the Mintlify theme
  // @ts-expect-error - Type compatibility issue between typedoc and typedoc-plugin-markdown themes
  app.renderer.defineTheme('mintlify', MintlifyTheme);

  // Log plugin initialization
  app.logger.info('[typedoc-mintlify] Plugin loaded');

  // We'll enhance pages via the theme's render method
  // The markdown plugin should generate individual pages automatically

  // Listen to renderer begin event to set up Mintlify-specific rendering
  app.renderer.on('beginRender', () => {
    app.logger.info('[typedoc-mintlify] Beginning Mintlify documentation generation');
  });

  // Listen to renderer end event to generate mint.json
  app.renderer.on('endRender', () => {
    if (app.options.getValue('generateMintlifyNav')) {
      app.logger.info('[typedoc-mintlify] Generating mint.json navigation file');
    }
  });
}
