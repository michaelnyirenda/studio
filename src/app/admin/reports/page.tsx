
"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { BarChart as LucideBarChart, LineChart as LucideLineChart, Users, Filter, Download, TestTube2 } from 'lucide-react'; 
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as ShadBarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'; 
import type { ChartConfig } from '@/components/ui/chart';
import { mockReferrals } from '@/lib/mock-data'; 

const overallChartData = [
  { month: "Jan", hiv: 18, gbv: 12, prep: 20, sti: 8 },
  { month: "Feb", hiv: 25, gbv: 15, prep: 22, sti: 11 },
  { month: "Mar", hiv: 30, gbv: 18, prep: 25, sti: 14 },
  { month: "Apr", hiv: 22, gbv: 20, prep: 28, sti: 18 },
  { month: "May", hiv: 27, gbv: 22, prep: 30, sti: 16 },
  { month: "Jun", hiv: 35, gbv: 25, prep: 33, sti: 20 },
];

const chartConfig: ChartConfig = {
  hiv: { label: "HIV Screenings", color: "hsl(var(--chart-1))" },
  gbv: { label: "GBV Screenings", color: "hsl(var(--chart-2))" },
  prep: { label: "PrEP Screenings", color: "hsl(var(--chart-3))" },
  sti: { label: "STI Screenings", color: "hsl(var(--chart-4))" },
};

const getScreeningType = (index: number) => {
  const typeIndex = index % 4;
  switch (typeIndex) {
    case 0: return 'HIV';
    case 1: return 'GBV';
    case 2: return 'PrEP';
    case 3: return 'STI';
    default: return 'HIV';
  }
};

const mockScreeningData = mockReferrals.flatMap((referral, index) => {
  const baseData = {
    id: referral.id,
    userName: referral.patientName.replace(/\s+\((HIV|GBV|PrEP|STI)\)/, ''), 
    date: referral.referralDate,
    keyResult: referral.status === 'Pending Review' ? 'High Risk / Positive Indicators' : 'Moderate Risk',
    referred: referral.status !== 'Closed' ? 'Yes' : 'No', 
    age: 25 + (index * 3) % 15, 
    gender: index % 2 === 0 ? 'Female' : 'Male', 
  };
  
  // Create a record for each type for varied data
  return ['HIV', 'GBV', 'PrEP', 'STI'].map((type, typeIndex) => ({
      ...baseData,
      id: `${referral.id}-${type}`,
      screeningType: type,
      // Make some data unique per type
      userName: `${baseData.userName}`, 
      keyResult: (index + typeIndex) % 3 === 0 ? 'High Risk / Positive Indicators' : ((index + typeIndex) % 3 === 1 ? 'Moderate Risk' : 'Low Risk'),
  }));
}).slice(0, 10); // Limit total mock data


export default function ScreeningDataPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Screening Data & Analytics"
        description="View aggregated screening results, trends, and individual screening details."
      />
      
      <Tabs defaultValue="overall_summary" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="overall_summary">Overall Summary</TabsTrigger>
          <TabsTrigger value="hiv_analytics">HIV Analytics</TabsTrigger>
          <TabsTrigger value="gbv_analytics">GBV Analytics</TabsTrigger>
          <TabsTrigger value="prep_analytics">PrEP Analytics</TabsTrigger>
          <TabsTrigger value="sti_analytics">STI Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overall_summary">
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-primary flex items-center">
                <LucideBarChart className="mr-2 h-6 w-6" /> Screening Trends (All Types)
              </CardTitle>
              <CardDescription>Monthly screening counts across all categories.</CardDescription>
            </CardHeader>
            <CardContent>
               <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <ShadBarChart accessibilityLayer data={overallChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hiv" fill="var(--color-hiv)" radius={4} />
                  <Bar dataKey="gbv" fill="var(--color-gbv)" radius={4} />
                  <Bar dataKey="prep" fill="var(--color-prep)" radius={4} />
                  <Bar dataKey="sti" fill="var(--color-sti)" radius={4} />
                </ShadBarChart>
              </ChartContainer>
            </CardContent>
          </Card>
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-primary">Screening Data Table</CardTitle>
              <CardDescription>Browse and filter individual screening records. (Mock Data)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input placeholder="Search by name or ID..." className="flex-grow" />
                <Select defaultValue="all_types">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Screening Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">All Types</SelectItem>
                    <SelectItem value="hiv">HIV</SelectItem>
                    <SelectItem value="gbv">GBV</SelectItem>
                    <SelectItem value="prep">PrEP</SelectItem>
                    <SelectItem value="sti">STI</SelectItem>
                  </SelectContent>
                </Select>
                 <Select defaultValue="any_result">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any_result">Any Result</SelectItem>
                    <SelectItem value="high_risk">High Risk / Positive</SelectItem>
                    <SelectItem value="referred">Referred</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" /> Apply Filters
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Key Result</TableHead>
                      <TableHead>Referred</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockScreeningData.slice(0, 5).map((screening) => ( 
                      <TableRow key={screening.id}>
                        <TableCell>{screening.userName}</TableCell>
                        <TableCell>{screening.date}</TableCell>
                        <TableCell>
                          <Badge variant={
                            screening.screeningType === 'HIV' ? 'default' : 
                            screening.screeningType === 'GBV' ? 'destructive' : 
                            screening.screeningType === 'PrEP' ? 'secondary' : 
                            'outline'
                          }>{screening.screeningType}</Badge>
                        </TableCell>
                        <TableCell>{screening.keyResult}</TableCell>
                        <TableCell>{screening.referred}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Showing 5 of {mockScreeningData.length} mock screening records.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hiv_analytics">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>HIV Screening Analytics</CardTitle>
              <CardDescription>Detailed metrics for HIV screenings. (Mock UI)</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <LucideLineChart className="h-48 w-48 mx-auto text-muted-foreground/50 my-4" />
              <p className="text-muted-foreground">HIV screening specific charts and data will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gbv_analytics">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>GBV Screening Analytics</CardTitle>
              <CardDescription>Detailed metrics for GBV screenings. (Mock UI)</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <LucideBarChart className="h-48 w-48 mx-auto text-muted-foreground/50 my-4" />
              <p className="text-muted-foreground">GBV screening specific charts and data will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="prep_analytics">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>PrEP Screening Analytics</CardTitle>
              <CardDescription>Detailed metrics for PrEP screenings. (Mock UI)</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Users className="h-48 w-48 mx-auto text-muted-foreground/50 my-4" />
              <p className="text-muted-foreground">PrEP screening specific charts and data will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="sti_analytics">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>STI Screening Analytics</CardTitle>
              <CardDescription>Detailed metrics for STI screenings. (Mock UI)</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <TestTube2 className="h-48 w-48 mx-auto text-muted-foreground/50 my-4" />
              <p className="text-muted-foreground">STI screening specific charts and data will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-12 text-center border-t pt-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">Prototype Notes</h2>
        <p className="text-muted-foreground">
          This page provides a mock interface for screening data analytics.
          Functionality like real-time data, filtering, and detailed views requires backend implementation.
        </p>
      </div>
    </div>
  );
}
