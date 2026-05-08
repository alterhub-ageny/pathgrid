export default {
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 } },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'icon', title: 'Icon', type: 'string' },
    { name: 'image', title: 'Image', type: 'image' },
    { name: 'priceTier', title: 'Price Tier', type: 'string' },
    { name: 'features', title: 'Features', type: 'text' },
    { name: 'order', title: 'Order', type: 'number' },
  ],
};
