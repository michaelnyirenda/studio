
"use client";

import type { Screening } from '@/app/admin/reports/page';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import AnalyticsKpiCard from './analytics-kpi-card';
import AnalyticsEmptyState from './empty-state';
import { Pill, Users, CheckCircle } from 'lucide-react';

const chartConfig: ChartConfig = {
  eligible: { label: "Eligible", color: "hsl(var(--chart-1))" },
  notEligible: { label: "Not Eligible", color: "hsl(var(--chart-2))" },
};

const PIE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

interface PrEpAnalyticsTabProps {
  screenings: Screening[];
}

export default function PrEpAnalyticsTab({ screenings }: PrEpAnalyticsTabProps) {
  const { kpis, eligibilityData, riskFactorsData } = useMemo(() => {
    if (screenings.length === 0) return { kpis: null, eligibilityData: [], riskFactorsData: [] };

    let eligibleCount = 0;
    const riskFactorCounts: Record<string, number> = {
        multiplePartners: 0,
        unprotectedSex: 0,
        unknownStatusPartners: 0,
        atRiskPartners: 0,
        sexUnderInfluence: 0,
        newStiDiagnosis: 0,
        considersAtRisk: 0,
        usedPepMultipleTimes: 0,
        forcedSex: 0,
    };

    screenings.forEach(s => {
      if (s.keyResult === 'Eligible for PrEP') eligibleCount++;
      
      for (const key in riskFactorCounts) {
        if (s.data[key] === 'yes') {
            riskFactorCounts[key]++;
        }
      }
    });
    
    const kpisData = {
      total: screenings.length,
      eligible: eligibleCount,
      eligiblePercentage: screenings.length > 0 ? ((eligibleCount / screenings.length) * 100).toFixed(1) : 0,
    };
    
    const eligibilityChartData = [
        { name: 'Eligible', value: eligibleCount, fill: 'var(--color-eligible)' },
        { name: 'Not Eligible', value: screenings.length - eligibleCount, fill: 'var(--color-notEligible)' },
    ];

    const riskFactorLabels: Record<string, string> = {
        multiplePartners: 'Multiple Partners',
        unprotectedSex: 'Unprotected Sex',
        unknownStatusPartners: 'Unknown Status Partners',
        atRiskPartners: 'At-Risk Partners',
        sexUnderInfluence: 'Sex Under Influence',
        newStiDiagnosis: 'New STI Diagnosis',
        considersAtRisk: 'Considers Self At Risk',
        usedPepMultipleTimes: 'Used PEP Multiple Times',
        forcedSex: 'Forced Sex',
    };
    const riskFactorsChartData = Object.entries(riskFactorCounts)
        .map(([key, count]) => ({ factor: riskFactorLabels[key], count }))
        .sort((a,b) => b.count - a.count);


    return { kpis: kpisData, eligibilityData: eligibilityChartData, riskFactorsData: riskFactorsChartData };
  }, [screenings]);

  if (screenings.length === 0) {
    return <AnalyticsEmptyState type="PrEP" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsKpiCard title="Total PrEP Screenings" metric={kpis?.total ?? 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <AnalyticsKpiCard title="Eligible for PrEP" metric={kpis?.eligible ?? 0} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} description={`${kpis?.eligiblePercentage}% of total screenings`} />
        <AnalyticsKpiCard title="Referrals for PrEP" metric={kpis?.eligible ?? 0} icon={<Pill className="h-4 w-4 text-muted-foreground" />} description="Number of users referred for consultation" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>PrEP Eligibility</CardTitle>
            <CardDescription>Breakdown of users eligible for PrEP based on screening answers.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={eligibilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={5}>
                  {eligibilityData.map((entry, index) => (
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
            <CardTitle>Top Risk Factors Reported</CardTitle>
            <CardDescription>Most common risk factors identified in screenings.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart data={riskFactorsData} layout="vertical" margin={{left: 30}}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="count" />
                <YAxis type="category" dataKey="factor" tickLine={false} axisLine={false} width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-eligible)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
