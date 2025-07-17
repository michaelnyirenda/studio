
"use client";

import type { FC, ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
}

const PageHeader: FC<PageHeaderProps> = ({ title, description }) => {
  const [isFaded, setIsFaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Start fading after scrolling down a little bit
      if (window.scrollY > 40) {
        setIsFaded(true);
      } else {
        setIsFaded(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={cn(
      "mb-8 text-center transition-all duration-300 ease-in-out",
      isFaded ? "opacity-0 -translate-y-5" : "opacity-100 translate-y-0"
    )}>
      <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">{title}</h1>
      {description && <p className="text-base text-muted-foreground mt-2 max-w-2xl mx-auto">{description}</p>}
    </div>
  );
};

export default PageHeader;
