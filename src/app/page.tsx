
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/page-header";
import { ArrowRight, BookOpenText, Users, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

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

export default function Home() {
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
      title: "Attendance Capture",
      description: "Easily record and manage attendance for educational sessions, workshops, and community lessons.",
      link: "/attendance",
      icon: <Users className="h-7 w-7 text-primary" />,
      imageSrc: "https://images.unsplash.com/photo-1604134967494-8a9ed3adea0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjbGFzc3Jvb218ZW58MHx8fHwxNzQ4OTY0MDE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      imageAlt: "Stylized image of people in a classroom setting",
      imageHint: "classroom learning"
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
  ];

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
