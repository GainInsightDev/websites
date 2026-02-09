import { defineType, defineField } from 'sanity';

export const useCase = defineType({
  name: 'useCase',
  title: 'Use Case',
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
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'challenge',
      title: 'The Challenge',
      type: 'text',
      description: 'Description of the problem this use case addresses',
    }),
    defineField({
      name: 'approach',
      title: 'Our Approach',
      type: 'text',
      description: 'How pensionable.ai addresses this challenge',
    }),
    defineField({
      name: 'solutionArchitecture',
      title: 'Solution Architecture',
      type: 'array',
      of: [{ type: 'featureList' }],
    }),
    defineField({
      name: 'benefits',
      title: 'Key Benefits',
      type: 'array',
      of: [{ type: 'benefitCard' }],
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [{ type: 'faq' }],
    }),
    defineField({
      name: 'whoBenefits',
      title: 'Who Benefits',
      type: 'array',
      of: [{ type: 'benefitCard' }],
    }),
    defineField({
      name: 'ctaTitle',
      title: 'CTA Title',
      type: 'string',
    }),
    defineField({
      name: 'ctaDescription',
      title: 'CTA Description',
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
    select: { title: 'title', subtitle: 'subtitle' },
  },
});
