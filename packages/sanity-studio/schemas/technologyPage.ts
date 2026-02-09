import { defineType, defineField } from 'sanity';

export const technologyPage = defineType({
  name: 'technologyPage',
  title: 'Technology Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
    }),
    defineField({
      name: 'approachTitle',
      title: 'Approach Section Title',
      type: 'string',
    }),
    defineField({
      name: 'approachContent',
      title: 'Approach Content',
      type: 'text',
    }),
    defineField({
      name: 'aiCapabilities',
      title: 'AI Capabilities',
      type: 'array',
      of: [{ type: 'featureList' }],
    }),
    defineField({
      name: 'securityContent',
      title: 'Security & Compliance Content',
      type: 'text',
    }),
    defineField({
      name: 'dataProtectionItems',
      title: 'Data Protection Items',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'complianceItems',
      title: 'Compliance Items',
      type: 'array',
      of: [{ type: 'string' }],
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
    select: { title: 'heroTitle', subtitle: 'site' },
  },
});
