#!/usr/bin/env node
/**
 * Upload team photos to Sanity and patch AI capabilities.
 * Usage: SANITY_API_TOKEN=xxx node apps/pensionable/scripts/patch-sanity-media.mjs
 */

import { createClient } from '@sanity/client';
import { createReadStream } from 'fs';
import path from 'path';

const client = createClient({
  projectId: 'qt7mj7sy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

if (!process.env.SANITY_API_TOKEN) {
  console.error('SANITY_API_TOKEN is required. Get it from Doppler: doppler secrets get SANITY_API_TOKEN --project websites --config prd --plain');
  process.exit(1);
}

// ─── Team photos ─────────────────────────────────────────────────────

const teamPhotos = [
  { docId: 'teamMember-pensionable-mark-crump', file: 'mark.png' },
  { docId: 'teamMember-pensionable-spencer-lynch', file: 'spencer.png' },
  { docId: 'teamMember-pensionable-jason-rogers', file: 'jason.png' },
  { docId: 'teamMember-pensionable-andrew-davidson', file: 'andrew.png' },
  { docId: 'teamMember-pensionable-david-rich', file: 'david.png' },
];

const PHOTO_DIR = '/srv/sites/pensionable.ai/src/assets/images/team';

console.log('Uploading team photos to Sanity...');

for (const { docId, file } of teamPhotos) {
  const filePath = path.join(PHOTO_DIR, file);
  console.log(`  Uploading ${file}...`);

  const asset = await client.assets.upload('image', createReadStream(filePath), {
    filename: file,
  });

  await client.patch(docId).set({
    photo: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
    },
  }).commit();

  console.log(`  ✓ ${file} → ${docId} (asset: ${asset._id})`);
}

console.log('Team photos complete.\n');

// ─── AI Capabilities ─────────────────────────────────────────────────

let keyCounter = 0;
function k() { return `k${++keyCounter}`; }

const aiCapabilities = [
  {
    _key: k(),
    _type: 'featureList',
    title: 'Automated Reasoning',
    description: 'Advanced logical processing for complex pension calculations',
    items: [
      { _key: k(), title: 'Formal verification of calculations', description: '' },
      { _key: k(), title: 'Logical consistency checking', description: '' },
      { _key: k(), title: 'Automated problem solving', description: '' },
      { _key: k(), title: 'Decision support systems', description: '' },
    ],
  },
  {
    _key: k(),
    _type: 'featureList',
    title: 'Machine Learning',
    description: 'Intelligent pattern recognition and prediction capabilities',
    items: [
      { _key: k(), title: 'Pattern recognition in scheme rules', description: '' },
      { _key: k(), title: 'Anomaly detection', description: '' },
      { _key: k(), title: 'Predictive analytics', description: '' },
      { _key: k(), title: 'Continuous learning and improvement', description: '' },
    ],
  },
  {
    _key: k(),
    _type: 'featureList',
    title: 'Natural Language Processing',
    description: 'Sophisticated text analysis and understanding',
    items: [
      { _key: k(), title: 'Document understanding', description: '' },
      { _key: k(), title: 'Context-aware interpretation', description: '' },
      { _key: k(), title: 'Semantic analysis', description: '' },
      { _key: k(), title: 'Multi-document correlation', description: '' },
    ],
  },
  {
    _key: k(),
    _type: 'featureList',
    title: 'Data Extraction',
    description: 'Intelligent data capture and processing',
    items: [
      { _key: k(), title: 'Automated document processing', description: '' },
      { _key: k(), title: 'Structured data extraction', description: '' },
      { _key: k(), title: 'Format recognition', description: '' },
      { _key: k(), title: 'Quality assurance', description: '' },
    ],
  },
];

console.log('Patching AI capabilities onto technologyPage...');

await client
  .patch('technologyPage-pensionable')
  .set({ aiCapabilities })
  .commit();

console.log('✓ AI capabilities patched.\n');
console.log('Done!');
