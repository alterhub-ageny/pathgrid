'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function Card({ children, className, hover = true, delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -5 } : undefined}
      className={cn(
        'bg-white dark:bg-navy-800 rounded-2xl border border-navy-100 dark:border-navy-700 p-6 shadow-sm',
        'hover:shadow-lg hover:border-navy-200 dark:hover:border-navy-600',
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
