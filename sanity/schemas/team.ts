export default {
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 } },
    { name: 'role', title: 'Role', type: 'string' },
    { name: 'bio', title: 'Bio', type: 'text' },
    { name: 'image', title: 'Image', type: 'image' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'linkedin', title: 'LinkedIn', type: 'url' },
    { name: 'order', title: 'Order', type: 'number' },
  ],
};
