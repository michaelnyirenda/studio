
"use client";

import type { Screening } from '@/app/admin/reports/page';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import AnalyticsKpiCard from './analytics-kpi-card';
import AnalyticsEmptyState from './empty-state';
import { Users, TestTube2, Syringe } from 'lucide-react';

const chartConfig: ChartConfig = {
  positive: { label: "Positive", color: "hsl(var(--chart-1))" },
  negative: { label: "Negative", color: "hsl(var(--chart-2))" },
  dont_know: { label: "Don't Know", color: "hsl(var(--chart-3))" },
  refused: { label: "Refused", color: "hsl(var(--chart-4))" },
  taking_art: { label: "On ART", color: "hsl(var(--chart-1))" },
  stopped_art: { label: "Stopped ART", color: "hsl(var(--chart-2))" },
  not_on_art: { label: "Not on ART", color: "hsl(var(--chart-3))" },
};

const PIE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface HivAnalyticsTabProps {
  screenings: Screening[];
}

export default function HivAnalyticsTab({ screenings }: HivAnalyticsTabProps) {
  const { kpis, testResultsData, treatmentStatusData } = useMemo(() => {
    if (screenings.length === 0) return { kpis: null, testResultsData: [], treatmentStatusData: [] };

    const resultCounts = { positive: 0, negative: 0, dont_know: 0, refused: 0, unknown: 0 };
    const treatmentCounts = { taking_art: 0, started_stopped: 0, not_on_art: 0, dont_know: 0, unknown: 0 };
    let positiveCases = 0;
    let onArtCount = 0;

    screenings.forEach(s => {
      const resultKey = (s.data.lastTestResult || 'unknown') as keyof typeof resultCounts;
      if (resultCounts.hasOwnProperty(resultKey)) resultCounts[resultKey]++;

      if (s.data.lastTestResult === 'positive') {
        positiveCases++;
        const treatmentKey = (s.data.treatmentStatus || 'unknown') as keyof typeof treatmentCounts;
        if (treatmentCounts.hasOwnProperty(treatmentKey)) treatmentCounts[treatmentKey]++;
        if (s.data.treatmentStatus === 'taking_art') onArtCount++;
      }
    });

    const kpisData = {
      total: screenings.length,
      positive: positiveCases,
      onArt: onArtCount,
      positivePercentage: screenings.length > 0 ? ((positiveCases / screenings.length) * 100).toFixed(1) : 0,
    };
    
    const testResultsChartData = [
        { name: 'Positive', value: resultCounts.positive, fill: 'var(--color-positive)' },
        { name: 'Negative', value: resultCounts.negative, fill: 'var(--color-negative)' },
        { name: 'Don\'t Know', value: resultCounts.dont_know, fill: 'var(--color-dont_know)' },
        { name: 'Refused', value: resultCounts.refused, fill: 'var(--color-refused)' },
    ].filter(d => d.value > 0);

    const treatmentStatusChartData = [
        { name: 'On ART', value: treatmentCounts.taking_art, fill: 'var(--color-taking_art)' },
        { name: 'Stopped ART', value: treatmentCounts.started_stopped, fill: 'var(--color-stopped_art)' },
        { name: 'Not on ART', value: treatmentCounts.not_on_art, fill: 'var(--color-not_on_art)' },
    ].filter(d => d.value > 0);

    return { kpis: kpisData, testResultsData: testResultsChartData, treatmentStatusData: treatmentStatusChartData };
  }, [screenings]);

  if (screenings.length === 0) {
    return <AnalyticsEmptyState type="HIV" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsKpiCard title="Total HIV Screenings" metric={kpis?.total ?? 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <AnalyticsKpiCard title="Positive Results Reported" metric={kpis?.positive ?? 0} icon={<TestTube2 className="h-4 w-4 text-muted-foreground" />} description={`${kpis?.positivePercentage}% of total screenings`} />
        <AnalyticsKpiCard title="Currently on ART" metric={kpis?.onArt ?? 0} icon={<Syringe className="h-4 w-4 text-muted-foreground" />} description="Among those who reported positive" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reported HIV Test Results</CardTitle>
            <CardDescription>Distribution of the most recent test results reported by users.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={testResultsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={5}>
                    {testResultsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Legend/>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treatment Status (HIV+)</CardTitle>
            <CardDescription>ART status for users who reported being HIV positive.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                 <Pie data={treatmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={5}>
                    {treatmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Legend/>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
