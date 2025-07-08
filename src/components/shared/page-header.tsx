
import type { FC, ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
}

const PageHeader: FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-10 text-center scroll-fade-out">
      <h1 className="text-4xl font-bold tracking-tight font-headline text-primary">{title}</h1>
      {description && <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">{description}</p>}
    </div>
  );
};

export default PageHeader;
