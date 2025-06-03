import type { FC } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

const PageHeader: FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-8 text-center md:text-left">
      <h1 className="text-4xl font-bold tracking-tight font-headline text-primary">{title}</h1>
      {description && <p className="text-lg text-muted-foreground mt-2">{description}</p>}
    </div>
  );
};

export default PageHeader;
