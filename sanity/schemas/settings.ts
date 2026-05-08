export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'title', title: 'Site Title', type: 'string' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'logo', title: 'Logo', type: 'image' },
    { name: 'favicon', title: 'Favicon', type: 'image' },
    { name: 'contactEmail', title: 'Contact Email', type: 'string' },
    { name: 'socialLinks', title: 'Social Links', type: 'array', of: [{ type: 'object', fields: [
      { name: 'platform', title: 'Platform', type: 'string' },
      { name: 'url', title: 'URL', type: 'url' },
    ]}]},
  ],
};
