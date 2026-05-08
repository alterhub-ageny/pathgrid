export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 } },
    { name: 'excerpt', title: 'Excerpt', type: 'text' },
    { name: 'content', title: 'Content', type: 'blockContent' },
    { name: 'image', title: 'Image', type: 'image' },
    { name: 'category', title: 'Category', type: 'string' },
    { name: 'tags', title: 'Tags', type: 'string' },
    { name: 'author', title: 'Author', type: 'string' },
    { name: 'published', title: 'Published', type: 'boolean' },
    { name: 'featured', title: 'Featured', type: 'boolean' },
  ],
};
