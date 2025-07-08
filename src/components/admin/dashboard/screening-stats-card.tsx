
"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ScreeningStats {
  total: number;
  hiv: number;
  gbv: number;
  prep: number;
  sti: number;
}

export default function ScreeningStatsCard() {
  const [stats, setStats] = useState<ScreeningStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScreeningStats = async () => {
      setLoading(true);
      try {
        const screeningDefs = [
          { name: 'hivScreenings', key: 'hiv' as const },
          { name: 'gbvScreenings', key: 'gbv' as const },
          { name: 'prepScreenings', key: 'prep' as const },
          { name: 'stiScreenings', key: 'sti' as const },
        ];
        
        let total = 0;
        const counts = { hiv: 0, gbv: 0, prep: 0, sti: 0 };

        for (const def of screeningDefs) {
          const snapshot = await getDocs(collection(db, def.name));
          counts[def.key] = snapshot.size;
          total += snapshot.size;
        }

        setStats({ total, ...counts });
      } catch (err) {
        console.error("Error fetching screening stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScreeningStats();
  }, []);

  if (loading) {
    return (
        <Card className="shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold text-primary">Screening Data</CardTitle>
                 <div className="p-3 bg-secondary rounded-xl">
                    <BarChart3 className="h-6 w-6 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-full" />
                </div>
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
        <CardTitle className="text-xl font-bold text-primary">Screening Data</CardTitle>
        <div className="p-3 bg-secondary rounded-xl">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
         <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
         <p className="text-xs text-muted-foreground mb-4">Total Screenings Completed</p>
        <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>HIV Screenings</span> <strong className="font-bold">{stats?.hiv ?? 0}</strong></div>
            <div className="flex justify-between"><span>GBV Screenings</span> <strong className="font-bold">{stats?.gbv ?? 0}</strong></div>
            <div className="flex justify-between"><span>PrEP Screenings</span> <strong className="font-bold">{stats?.prep ?? 0}</strong></div>
            <div className="flex justify-between"><span>STI Screenings</span> <strong className="font-bold">{stats?.sti ?? 0}</strong></div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end mt-auto">
          <Link href="/admin/reports" passHref className="w-full">
              <div className="flex items-center text-accent font-semibold w-full justify-end">
                  <span>View Reports</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
          </Link>
      </CardFooter>
    </Card>
  );
}
