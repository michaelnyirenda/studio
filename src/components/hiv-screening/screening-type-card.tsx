
"use client";

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ScreeningTypeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onSelect: () => void;
  imageSrc: string;
  imageAlt: string;
  imageHint: string;
}

export default function ScreeningTypeCard({ title, description, icon, onSelect, imageSrc, imageAlt, imageHint }: ScreeningTypeCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image 
          src={imageSrc} 
          alt={imageAlt} 
          layout="fill" 
          objectFit="cover" 
          data-ai-hint={imageHint}
        />
      </div>
      <CardHeader className="items-center text-center">
        {icon}
        <CardTitle className="text-xl font-headline text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
      <CardContent className="mt-auto pb-6">
        <Button onClick={onSelect} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Select <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
