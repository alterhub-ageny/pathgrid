import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Pathgrid Agency | Where Strategy Meets Creativity',
    template: '%s | Pathgrid Agency',
  },
  description: 'A full-service digital agency specializing in strategy, design, and technology to transform your business.',
  keywords: ['digital agency', 'web development', 'design', 'strategy', 'branding'],
  authors: [{ name: 'Pathgrid Agency' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Pathgrid Agency',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pathgrid Agency',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://pathgrid.agency',
    description: 'A full-service digital agency specializing in strategy, design, and technology.',
    sameAs: ['https://linkedin.com/company/pathgrid', 'https://twitter.com/pathgrid'],
    contactPoint: { '@type': 'ContactPoint', telephone: '+1-555-0123', contactType: 'sales' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
