
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function SectionTitle({ as: Comp = 'h2', className, children, ...props }: SectionTitleProps) {
  return (
    <Comp
      className={cn(
        'font-headline text-2xl sm:text-3xl neon-text-primary mb-4 tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
