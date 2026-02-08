import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'websites',
  title: 'GainInsight Websites',

  // TODO: Replace with actual Sanity project ID after creating project at sanity.io
  projectId: 'REPLACE_ME',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
