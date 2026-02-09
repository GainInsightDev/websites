import { defineType, defineField } from 'sanity';

export const benefitCard = defineType({
  name: 'benefitCard',
  title: 'Benefit Card',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Icon identifier (e.g. "check-circle", "clock", "shield")',
    }),
  ],
});
