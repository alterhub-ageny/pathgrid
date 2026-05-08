'use client';

import { HeroSection } from '@/components/home/hero';
import { ServicesPreview } from '@/components/home/services-preview';
import { TestimonialsSection } from '@/components/home/testimonials';
import { CTASection } from '@/components/home/cta';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
