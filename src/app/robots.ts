import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pathgrid.agency';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/auth/'] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
