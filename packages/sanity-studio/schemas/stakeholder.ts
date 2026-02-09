import { defineType, defineField } from 'sanity';

export const stakeholder = defineType({
  name: 'stakeholder',
  title: 'Stakeholder',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'challenges',
      title: 'Key Challenges',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'howWeHelp',
      title: 'How We Help',
      type: 'array',
      of: [{ type: 'benefitCard' }],
    }),
    defineField({
      name: 'benefits',
      title: 'Key Benefits',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'relatedIssues',
      title: 'Related Industry Issues',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'overview',
      title: 'Organisation Overview',
      type: 'text',
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
          { title: 'Recon1', value: 'recon1' },
          { title: 'Pensionable', value: 'pensionable' },
          { title: 'Senti', value: 'senti' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image' },
  },
});
