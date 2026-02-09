import { defineType, defineField } from 'sanity';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
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
      name: 'heroCtaText',
      title: 'Hero CTA Button Text',
      type: 'string',
    }),
    defineField({
      name: 'heroCtaLink',
      title: 'Hero CTA Button Link',
      type: 'string',
    }),
    defineField({
      name: 'problemTitle',
      title: 'Problem Statement Title',
      type: 'string',
    }),
    defineField({
      name: 'problemDescription',
      title: 'Problem Statement Description',
      type: 'text',
    }),
    defineField({
      name: 'problemItems',
      title: 'Problem List Items',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'solutionTitle',
      title: 'Solution Overview Title',
      type: 'string',
    }),
    defineField({
      name: 'solutionCards',
      title: 'Solution Overview Cards',
      type: 'array',
      of: [{ type: 'benefitCard' }],
    }),
    defineField({
      name: 'featuredUseCases',
      title: 'Featured Use Cases',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'useCase' }] }],
    }),
    defineField({
      name: 'ctaTitle',
      title: 'CTA Section Title',
      type: 'string',
    }),
    defineField({
      name: 'ctaDescription',
      title: 'CTA Section Description',
      type: 'string',
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
