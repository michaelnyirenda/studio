
"use client";

import Link from 'next/link';
import PageHeader from "@/components/shared/page-header";
import { ArrowRight, FileSpreadsheet, MessageSquareText, UserCog } from 'lucide-react';
import * as React from 'react';
import ReferralStatsCard from '@/components/admin/dashboard/referral-stats-card';
import ScreeningStatsCard from '@/components/admin/dashboard/screening-stats-card';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ChatStatsCard from '@/components/admin/dashboard/chat-stats-card';

interface AdminFeatureCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  isExternal?: boolean;
}

function AdminFeatureLinkCard({ title, description, link, icon }: AdminFeatureCardProps) {
  return (
    <Link href={link} passHref className="block h-full group">
      <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col bg-card hover:-translate-y-1.5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold text-primary">{title}</CardTitle>
          <div className="p-3 bg-secondary rounded-xl">
            {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6 text-primary" })}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
        <CardFooter className="pt-2 flex justify-end">
          <div className="flex items-center text-accent font-semibold">
            <span>View Details</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Administrator Dashboard"
        description="Access reports, data exports, and administrative functions."
      />

      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ScreeningStatsCard />
          <ReferralStatsCard />
        </div>

        <div className="grid gap-6 pt-2 md:grid-cols-2">
          <ChatStatsCard />
          <AdminFeatureLinkCard
            title="Data Export"
            description="Generate and download reports for screenings, referrals, and other data."
            link="/admin/data-export"
            icon={<FileSpreadsheet />}
          />
          <AdminFeatureLinkCard
            title="Forum Management"
            description="Oversee forum discussions and manage posts. Create new posts via the Forum page."
            link="/admin/forum-management"
            icon={<MessageSquareText />}
          />
          <AdminFeatureLinkCard
            title="User Management"
            description="Manage user accounts, roles, permissions, and view user activity."
            link="/admin/user-management"
            icon={<UserCog />}
          />
        </div>
      </div>
    </div>
  );
}
