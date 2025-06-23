"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/page-header";
import { ArrowRight, BookOpenText, ClipboardList, ShieldCheck, FileSpreadsheet, LineChart, Users, MessageSquareText, ShieldAlert, UserCog, BarChart3, Search } from 'lucide-react';
import Image from 'next/image';
import { useRole } from '@/contexts/role-context';

interface FeatureCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  imageHint: string;
}

interface AdminFeatureCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  isExternal?: boolean; // To handle external links if any, though not used here
}

function FeatureCard({ title, description, link, icon, imageSrc, imageAlt, imageHint }: FeatureCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image src={imageSrc} alt={imageAlt} layout="fill" objectFit="cover" data-ai-hint={imageHint} />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline text-primary">
          {icon}
          <span className="ml-3">{title}</span>
        </CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Link href={link} passHref>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Proceed <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function AdminFeatureLinkCard({ title, description, link, icon }: AdminFeatureCardProps) {
  return (
    <Link href={link} passHref className="block h-full">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium text-primary">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
        <CardFooter className="pt-2">
           <Button variant="link" className="p-0 text-accent hover:underline">
              Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}


function AdminDashboardContent() {
  const adminFeatures: AdminFeatureCardProps[] = [
    {
      title: "Screening Data",
      description: "View aggregated screening results, trends, and detailed analytics.",
      link: "/admin/reports", 
      icon: <BarChart3 className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: "Referral Tracking",
      description: "Monitor referral statuses, patient follow-ups, and turnaround rates.",
      link: "/referrals",
      icon: <LineChart className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: "Data Export",
      description: "Generate and download reports for screenings, referrals, and other data.",
      link: "/admin/data-export",
      icon: <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: "Forum Management",
      description: "Oversee forum discussions and manage posts. Create new posts via the Forum page.",
      link: "/forum",
      icon: <MessageSquareText className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: "User Chat Support",
      description: "Access the chat system to respond to user queries and provide support.",
      link: "/chat",
      icon: <ShieldAlert className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: "User Management",
      description: "Manage user accounts, roles, permissions, and view user activity.",
      link: "/admin/user-management",
      icon: <UserCog className="h-5 w-5 text-muted-foreground" />
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Administrator Dashboard"
        description="Access reports, data exports, and administrative functions."
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {adminFeatures.map(feature => (
          <AdminFeatureLinkCard key={feature.title} {...feature} />
        ))}
      </div>

      <div className="mt-12 text-center border-t pt-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">Prototype Notes</h2>
        <p className="text-muted-foreground">
          The features linked above lead to mock UI pages or existing functionalities.
          Full implementation requires backend development, database integration, and an authentication system.
        </p>
      </div>
    </div>
  );
}


export default function Home() {
  const { role } = useRole();

  const features: FeatureCardProps[] = [
    {
      title: "Community Forum",
      description: "Browse discussions, share insights, and engage with the community. Create new posts via the forum page.",
      link: "/forum",
      icon: <BookOpenText className="h-7 w-7 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1522543558187-768b6df7c25c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxjb21tdW5pdHl8ZW58MHx8fHwxNzQ5MDIxNzgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      imageAlt: "Abstract representation of a forum discussion",
      imageHint: "discussion community"
    },
     {
      title: "Screening",
      description: "Access a confidential screening tool to assess risk and receive guidance on next steps.",
      link: "/hiv-screening",
      icon: <ShieldCheck className="h-7 w-7 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1575998064976-9df66085cc83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxISVZ8ZW58MHx8fHwxNzQ4OTY0MTI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      imageAlt: "Symbolic representation of health and protection",
      imageHint: "health screening"
    },
    {
      title: "Track Referrals", 
      description: "View and manage referrals generated from screenings and other community programs.", 
      link: "/referrals", 
      icon: <ClipboardList className="h-7 w-7 text-primary" />, 
      imageSrc: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjYWxlbmRhcnxlbnwwfHx8fDE3NDkxMjcwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080", 
      imageAlt: "Image representing referral tracking and management", 
      imageHint: "referrals tracking" 
    },
  ];

  if (role === 'admin') {
    return <AdminDashboardContent />;
  }

  return (
    <div className="flex flex-col items-center">
      <PageHeader
        title="Welcome to i-BreakFree"
        description="Your integrated platform for education, community engagement, and health awareness."
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 w-full max-w-6xl">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  );
}
    
