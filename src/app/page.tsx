"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/page-header";
import { ArrowRight, BookOpenText, ClipboardList, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  imageHint: string;
}

function FeatureCard({ title, description, link, icon, imageSrc, imageAlt, imageHint }: FeatureCardProps) {
  return (
    <Link href={link} passHref>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1.5">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            style={{ objectFit: 'cover' }}
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
              <p className="mt-2 text-base text-card-foreground">{description}</p>
            </div>
          </div>
          <div className="mt-auto flex justify-end pt-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-300 group-hover:rotate-[-45deg]">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const features: FeatureCardProps[] = [
    {
      title: "Community Forum",
      description: "Browse discussions, share insights, and engage with the community.",
      link: "/forum",
      icon: <BookOpenText />,
      imageSrc: "https://images.unsplash.com/photo-1522543558187-768b6df7c25c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxjb21tdW5pdHl8ZW58MHx8fHwxNzQ5MDIxNzgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      imageAlt: "Abstract representation of a forum discussion",
      imageHint: "discussion community"
    },
    {
      title: "Screening",
      description: "Access confidential screening tools to assess risk and receive guidance on next steps.",
      link: "/hiv-screening",
      icon: <ShieldCheck />,
      imageSrc: "https://images.unsplash.com/photo-1575998064976-9df66085cc83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxISVZ8ZW58MHx8fHwxNzQ4OTY0MTI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      imageAlt: "Symbolic representation of health and protection",
      imageHint: "health screening"
    },
    {
      title: "Track Referrals",
      description: "View and manage referrals generated from screenings and other community programs.",
      link: "/referrals",
      icon: <ClipboardList />,
      imageSrc: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjYWxlbmRhcnxlbnwwfHx8fDE3NDkxMjcwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      imageAlt: "Image representing referral tracking and management",
      imageHint: "referrals tracking"
    },
  ];

  return (
     <div className="container mx-auto px-4 pt-8 pb-20">
      <div className="flex flex-col items-center">
        <PageHeader
          title="Welcome to #iBreakFree"
          description="Your integrated platform for education, community engagement, and health awareness."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 w-full max-w-6xl">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}
