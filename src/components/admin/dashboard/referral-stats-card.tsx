
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LineChart, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ReferralStatusCounts {
  pending: number;
  contacted: number;
  scheduled: number;
  closed: number;
  total: number;
}

export default function ReferralStatsCard() {
  const [stats, setStats] = useState<ReferralStatusCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query for referrals that have been consented to, matching the admin view on the referrals page.
    const referralsCollection = collection(db, 'referrals');
    const q = query(referralsCollection, where('consentStatus', '==', 'agreed'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let pending = 0;
      let contacted = 0;
      let scheduled = 0;
      let closed = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        switch (data.status) {
          case 'Pending Review':
            pending++;
            break;
          case 'Contacted':
            contacted++;
            break;
          case 'Follow-up Scheduled':
            scheduled++;
            break;
          case 'Closed':
            closed++;
            break;
        }
      });
      
      const total = querySnapshot.size;
      setStats({ pending, contacted, scheduled, closed, total });
      setLoading(false);
    }, (error) => {
      console.error("Error fetching referral stats:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const closedPercentage = stats && stats.total > 0 ? (stats.closed / stats.total) * 100 : 0;
  const totalReferrals = stats?.total ?? 0;

  if (loading) {
    return (
        <Card className="shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium text-primary">Referral Tracking</CardTitle>
                 <div className="p-3 bg-secondary rounded-xl">
                    <LineChart className="h-6 w-6 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-2 w-full mt-4" />
            </CardContent>
            <CardFooter className="pt-2 mt-auto">
                 <Skeleton className="h-6 w-40" />
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col bg-card hover:-translate-y-1.5 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium text-primary">Referral Tracking</CardTitle>
        <div className="p-3 bg-secondary rounded-xl">
          <LineChart className="h-6 w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">
          {totalReferrals} consented referrals. {closedPercentage.toFixed(0)}% closed.
        </p>
        <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Pending Review</span> <strong className="font-bold">{stats?.pending ?? 0}</strong></div>
            <div className="flex justify-between"><span>Contacted</span> <strong className="font-bold">{stats?.contacted ?? 0}</strong></div>
            <div className="flex justify-between"><span>Follow-up Scheduled</span> <strong className="font-bold">{stats?.scheduled ?? 0}</strong></div>
            <div className="flex justify-between"><span>Closed</span> <strong className="font-bold">{stats?.closed ?? 0}</strong></div>
        </div>
        <div className="mt-4">
            <Progress value={closedPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-right">Overall progress</p>
        </div>
      </CardContent>
      <CardFooter className="pt-2 mt-auto">
         <Link href="/referrals" passHref className="w-full">
            <div className="flex items-center text-accent font-semibold w-full justify-end">
                <span>Manage Referrals</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
         </Link>
      </CardFooter>
    </Card>
  );
}
