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
  return children;
}
