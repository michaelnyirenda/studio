
"use client";

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import * as React from 'react';

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
     <div 
      onClick={onSelect} 
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1.5"
    >
      <div className="relative h-48 w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          layout="fill"
          objectFit="cover"
          data-ai-hint={imageHint}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start">
          <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
            {React.cloneElement(icon as React.ReactElement, { className: "h-7 w-7 text-primary" })}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold font-headline text-primary">{title}</h3>
          </div>
        </div>
         <p className="mt-2 text-base text-card-foreground">{description}</p>
        <div className="mt-auto flex justify-end pt-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-300 group-hover:rotate-[-45deg]">
              <ArrowRight className="h-5 w-5" />
            </div>
        </div>
      </div>
    </div>
  );
}
