
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/page-header";
import { ArrowRight, BookOpenText, ClipboardList, ShieldCheck, FileSpreadsheet, LineChart, Users, MessageSquareText, ShieldAlert } from 'lucide-react';
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

function AdminDashboardContent() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Administrator Dashboard"
        description="Access reports, data exports, and administrative functions."
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">Screening Data</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View aggregated screening results and trends. Export functionality for detailed analysis is planned.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">Referral Tracking</CardTitle>
            <LineChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor referral statuses and turnaround rates. Data export for reporting will be available in a future update.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">Data Export (Excel)</CardTitle>
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comprehensive data export to formats like Excel for screenings and referrals is a planned feature.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">Forum Management</CardTitle>
            <MessageSquareText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Oversee forum discussions, manage posts, and handle content moderation (feature in planning). Access <Link href="/forum/create" className="text-accent hover:underline">Create Post</Link>.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">User Chat Support</CardTitle>
            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Interface for administrators to respond to user queries from the chat system (conceptual).
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">User Management</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
             Manage user accounts, roles, and permissions (requires full authentication system).
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-primary mb-4">Feature Roadmap & Prototype Notes</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 inline-block text-left">
          <li>Full data aggregation and visualization tools for screenings and referrals.</li>
          <li>Secure role-based access control and user authentication.</li>
          <li>Functional data export capabilities.</li>
          <li>Admin interface for direct chat responses and forum moderation.</li>
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          The features described above are currently in a conceptual phase for this prototype.
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
      title: "HIV Screening",
      description: "Access a confidential HIV screening tool to assess risk and receive guidance on next steps.",
      link: "/hiv-screening",
      icon: <ShieldCheck className="h-7 w-7 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1575998064976-9df66085cc83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxISVZ8ZW58MHx8fHwxNzQ4OTY0MTI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      imageAlt: "Symbolic representation of health and protection",
      imageHint: "health screening"
    },
    {
      title: "Track Referrals", 
      description: "View and manage referrals generated from HIV screenings and other community programs.", 
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
        title="Welcome to #BeFree"
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
