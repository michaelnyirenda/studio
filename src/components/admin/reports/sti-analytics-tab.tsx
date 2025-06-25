
"use client";

import type { Screening } from '@/app/admin/reports/page';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import AnalyticsKpiCard from './analytics-kpi-card';
import AnalyticsEmptyState from './empty-state';
import { TestTube2, Users, FileWarning } from 'lucide-react';

const chartConfig: ChartConfig = {
  assessmentRecommended: { label: "Assessment Recommended", color: "hsl(var(--chart-1))" },
  noImmediateRisk: { label: "No Immediate Risk", color: "hsl(var(--chart-2))" },
};

const PIE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface StiAnalyticsTabProps {
  screenings: Screening[];
}

export default function StiAnalyticsTab({ screenings }: StiAnalyticsTabProps) {
  const { kpis, assessmentData, symptomsData } = useMemo(() => {
    if (screenings.length === 0) return { kpis: null, assessmentData: [], symptomsData: [] };

    let recommendedCount = 0;
    const symptomCounts: Record<string, number> = {
        diagnosedOrTreated: 0,
        abnormalDischarge: 0,
        vaginalItchiness: 0,
        genitalSores: 0,
    };

    screenings.forEach(s => {
      if (s.keyResult === 'Assessment Recommended') recommendedCount++;
      
      for (const key in symptomCounts) {
        if (s.data[key] === 'yes') {
            symptomCounts[key]++;
        }
      }
    });

    const kpisData = {
      total: screenings.length,
      recommended: recommendedCount,
      recommendedPercentage: screenings.length > 0 ? ((recommendedCount / screenings.length) * 100).toFixed(1) : 0,
    };

    const assessmentChartData = [
      { name: 'Assessment Recommended', value: recommendedCount, fill: 'var(--color-assessmentRecommended)' },
      { name: 'No Immediate Risk', value: screenings.length - recommendedCount, fill: 'var(--color-noImmediateRisk)' },
    ];
    
    const symptomLabels: Record<string, string> = {
        diagnosedOrTreated: 'Prior Diagnosis/Treatment',
        abnormalDischarge: 'Abnormal Discharge',
        vaginalItchiness: 'Vaginal Itchiness',
        genitalSores: 'Genital Sores/Ulcers',
    };
    const symptomsChartData = Object.entries(symptomCounts)
      .map(([key, count]) => ({ symptom: symptomLabels[key], count }))
      .sort((a,b) => b.count - a.count)
      .map((item, index) => ({
        ...item,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }));

    return { kpis: kpisData, assessmentData: assessmentChartData, symptomsData: symptomsChartData };
  }, [screenings]);

  if (screenings.length === 0) {
    return <AnalyticsEmptyState type="STI" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsKpiCard title="Total STI Screenings" metric={kpis?.total ?? 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <AnalyticsKpiCard title="Assessment Recommended" metric={kpis?.recommended ?? 0} icon={<FileWarning className="h-4 w-4 text-muted-foreground" />} description={`${kpis?.recommendedPercentage}% of total screenings`} />
        <AnalyticsKpiCard title="STI Referrals" metric={kpis?.recommended ?? 0} icon={<TestTube2 className="h-4 w-4 text-muted-foreground" />} description="Number of users referred for assessment" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Screening Outcome</CardTitle>
            <CardDescription>Breakdown of users recommended for clinical STI assessment.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={assessmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={5}>
                  {assessmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Symptoms/Factors Reported</CardTitle>
            <CardDescription>Most common symptoms or history reported by users.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[300px] w-full">
              <BarChart data={symptomsData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="count" />
                <YAxis type="category" dataKey="symptom" tickLine={false} axisLine={false} width={140} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4}>
                  {symptomsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(entry as any).fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
