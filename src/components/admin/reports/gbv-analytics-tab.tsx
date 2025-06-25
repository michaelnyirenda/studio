
"use client";

import type { Screening } from '@/app/admin/reports/page';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import AnalyticsKpiCard from './analytics-kpi-card';
import AnalyticsEmptyState from './empty-state';
import { ShieldAlert, AlertTriangle, Users } from 'lucide-react';

const chartConfig: ChartConfig = {
  emotional: { label: "Emotional", color: "hsl(var(--chart-1))" },
  physical: { label: "Physical", color: "hsl(var(--chart-2))" },
  sexual: { label: "Sexual", color: "hsl(var(--chart-3))" },
  suicide: { label: "Suicide Risk", color: "hsl(var(--chart-4))" },
  injury: { label: "Serious Injury", color: "hsl(var(--chart-5))" },
  recentViolence: { label: "Recent Violence", color: "hsl(var(--chart-1))" }, // re-use color
};

const PIE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface GbvAnalyticsTabProps {
  screenings: Screening[];
}

export default function GbvAnalyticsTab({ screenings }: GbvAnalyticsTabProps) {
  const { kpis, violenceTypeData, highRiskFactorsData } = useMemo(() => {
    if (screenings.length === 0) return { kpis: null, violenceTypeData: [], highRiskFactorsData: [] };

    let highRiskCount = 0;
    const violenceCounts = { emotional: 0, physical: 0, sexual: 0 };
    const highRiskCounts = { suicide: 0, injury: 0, recentViolence: 0 };

    screenings.forEach(s => {
      const data = s.data;
      if (s.keyResult === 'High Risk / Urgent') highRiskCount++;
      
      if (data.emotionalViolence && !data.emotionalViolence.includes('no')) violenceCounts.emotional++;
      if (data.physicalViolence && !data.physicalViolence.includes('no')) violenceCounts.physical++;
      if (data.sexualViolence && !data.sexualViolence.includes('no')) violenceCounts.sexual++;

      if (data.suicideAttempt === 'yes') highRiskCounts.suicide++;
      if (data.seriousInjury === 'yes') highRiskCounts.injury++;
      if (data.sexualViolenceTimeline === 'le_72_hr' || data.sexualViolenceTimeline === 'gt_72_le_120_hr') highRiskCounts.recentViolence++;
    });

    const kpisData = {
      total: screenings.length,
      highRisk: highRiskCount,
      highRiskPercentage: screenings.length > 0 ? ((highRiskCount / screenings.length) * 100).toFixed(1) : 0,
    };
    
    const violenceTypeChartData = [
        { type: 'Emotional', count: violenceCounts.emotional, fill: 'var(--color-emotional)' },
        { type: 'Physical', count: violenceCounts.physical, fill: 'var(--color-physical)' },
        { type: 'Sexual', count: violenceCounts.sexual, fill: 'var(--color-sexual)' },
    ];
    
    const highRiskFactorsChartData = [
        { factor: 'Suicide Risk', count: highRiskCounts.suicide, fill: 'var(--color-suicide)' },
        { factor: 'Serious Injury', count: highRiskCounts.injury, fill: 'var(--color-injury)' },
        { factor: 'Recent Violence (<5 days)', count: highRiskCounts.recentViolence, fill: 'var(--color-recentViolence)' },
    ];

    return { kpis: kpisData, violenceTypeData: violenceTypeChartData, highRiskFactorsData: highRiskFactorsChartData };
  }, [screenings]);

  if (screenings.length === 0) {
    return <AnalyticsEmptyState type="GBV" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsKpiCard title="Total GBV Screenings" metric={kpis?.total ?? 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <AnalyticsKpiCard title="High-Risk Cases" metric={kpis?.highRisk ?? 0} icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />} description={`${kpis?.highRiskPercentage}% of total screenings`} />
        <AnalyticsKpiCard title="Urgent Referrals" metric={kpis?.highRisk ?? 0} icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />} description="Based on high-risk factors" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Violence Types Reported</CardTitle>
            <CardDescription>Distribution of violence types across all screenings.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <BarChart data={violenceTypeData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="count" />
                <YAxis type="category" dataKey="type" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4}>
                  {violenceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High-Risk Factors Breakdown</CardTitle>
            <CardDescription>Count of specific factors indicating immediate risk.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <BarChart data={highRiskFactorsData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="count" />
                <YAxis type="category" dataKey="factor" tickLine={false} axisLine={false} width={150} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4}>
                   {highRiskFactorsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
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
