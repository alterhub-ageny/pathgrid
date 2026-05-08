export default {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'company', title: 'Company', type: 'string' },
    { name: 'role', title: 'Role', type: 'string' },
    { name: 'content', title: 'Content', type: 'text', validation: (Rule: any) => Rule.required() },
    { name: 'rating', title: 'Rating', type: 'number', options: { min: 1, max: 5 } },
    { name: 'image', title: 'Image', type: 'image' },
    { name: 'featured', title: 'Featured', type: 'boolean' },
  ],
};
