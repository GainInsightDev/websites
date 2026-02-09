import { defineType, defineField } from 'sanity';

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
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
      name: 'formEmbedUrl',
      title: 'Form Embed URL',
      type: 'url',
      description: 'URL of the embedded contact form (e.g. Pipedrive web form)',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
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
