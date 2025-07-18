"use client";

import type { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  className?: string; // Allow className to be passed
}

const PageHeader: FC<PageHeaderProps> = ({ title, description, className }) => {
  return (
    <div className={cn(
      "text-left", // Default alignment
      className
    )}>
      <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">{title}</h1>
      {description && <p className="text-base text-muted-foreground mt-2 max-w-2xl">{description}</p>}
    </div>
  );
};

export default PageHeader;
