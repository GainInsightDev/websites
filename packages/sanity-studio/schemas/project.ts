import { defineType, defineField } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'One-line description of the project',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Longer description for the project detail page',
    }),
    defineField({
      name: 'domain',
      title: 'Domain / Sector',
      type: 'string',
      description: 'e.g. FinTech, HealthTech, MedTech',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'accent',
      title: 'Accent Colour',
      type: 'string',
      options: {
        list: [
          { title: 'Steel', value: 'steel' },
          { title: 'Ember', value: 'ember' },
          { title: 'Sage', value: 'sage' },
          { title: 'Violet', value: 'violet' },
          { title: 'Coral', value: 'coral' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Project URL',
      type: 'url',
      description: 'External link to the project website if applicable',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Show this project on the homepage featured grid',
    }),
    defineField({
      name: 'partners',
      title: 'Partners',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'teamMember' }] }],
      description: 'Team members associated with this project',
    }),
    defineField({
      name: 'overview',
      title: 'Overview',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text overview for the project detail page (2-3 paragraphs)',
    }),
    defineField({
      name: 'capabilities',
      title: 'Capabilities',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'description', title: 'Description', type: 'text' }),
          ],
          preview: { select: { title: 'title' } },
        },
      ],
      description: '3-4 key capabilities shown as cards on the detail page',
    }),
    defineField({
      name: 'results',
      title: 'Results',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'description', title: 'Description', type: 'text' }),
          ],
          preview: { select: { title: 'title' } },
        },
      ],
      description: 'Key outcomes/results shown as cards on the detail page',
    }),
    defineField({
      name: 'caseStudyUrl',
      title: 'Case Study URL',
      type: 'string',
      description: 'Path to gated case study page (e.g. /projects/indigo/case-study)',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
    defineField({
      name: 'site',
      title: 'Site',
      type: 'string',
      options: {
        list: [
          { title: 'CLIK', value: 'clik' },
          { title: 'Junkan', value: 'junkan' },
          { title: 'Recon1', value: 'recon1' },
          { title: 'Pensionable', value: 'pensionable' },
          { title: 'Senti', value: 'senti' },
          { title: 'GainInsight', value: 'gaininsight' },
          { title: 'Juncta', value: 'juncta' },
          { title: 'GCS', value: 'gcs' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'domain' },
  },
});
