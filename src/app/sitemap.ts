import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pathgrid.agency';
const LOCALES = ['en', 'fr', 'ar'];

const staticPages = [
  '', '/about', '/services', '/portfolio', '/blog', '/contact',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  try {
    const blogPosts = await prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
    for (const post of blogPosts) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch { /* blog may not exist yet */ }

  return entries;
}
