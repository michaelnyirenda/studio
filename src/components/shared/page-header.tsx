
import type { FC } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

const PageHeader: FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-10 text-center">
      <h1 className="text-5xl font-bold tracking-tight font-headline text-primary">{title}</h1>
      {description && <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">{description}</p>}
    </div>
  );
};

export default PageHeader;
