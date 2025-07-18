
"use client";

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, Timestamp } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { BarChart as LucideBarChart, Loader2, CalendarIcon } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as ShadBarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { db } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ScreeningDetailsDisplay from '@/components/referrals/screening-details-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Import new analytics tab components
import HivAnalyticsTab from '@/components/admin/reports/hiv-analytics-tab';
import GbvAnalyticsTab from '@/components/admin/reports/gbv-analytics-tab';
import PrEpAnalyticsTab from '@/components/admin/reports/prep-analytics-tab';
import StiAnalyticsTab from '@/components/admin/reports/sti-analytics-tab';


const chartConfig: ChartConfig = {
  hiv: { label: "HIV", color: "hsl(var(--chart-1))" },
  gbv: { label: "GBV", color: "hsl(var(--chart-2))" },
  prep: { label: "PrEP", color: "hsl(var(--chart-3))" },
  sti: { label: "STI", color: "hsl(var(--chart-4))" },
};

export type ScreeningType = 'HIV' | 'GBV' | 'PrEP' | 'STI';

export interface Screening {
  id: string;
  userName: string;
  phoneNumber?: string;
  email?: string;
  date: string;
  screeningType: ScreeningType;
  keyResult: string;
  referred: string;
  data: any;
}

const getKeyResult = (screeningData: any, type: ScreeningType): string => {
  switch (type) {
    case 'HIV':
      return "Consultation Recommended";
    case 'GBV':
      const isHighRisk = screeningData.suicideAttempt === 'yes' || screeningData.seriousInjury === 'yes' || screeningData.sexualViolenceTimeline === 'le_72_hr' || screeningData.sexualViolenceTimeline === 'gt_72_le_120_hr';
      return isHighRisk ? "High Risk / Urgent" : "Support Recommended";
    case 'PrEP':
      const isEligible = Object.entries(screeningData).some(([key, value]) => key !== 'name' && key !== 'age' && key !== 'phoneNumber' && key !== 'email' && value === 'yes');
      return isEligible ? "Eligible for PrEP" : "Not Eligible";
    case 'STI':
       const needsAssessment = Object.entries(screeningData).some(([key, value]) => key !== 'name' && key !== 'age' && key !== 'phoneNumber' && key !== 'email' && value === 'yes');
      return needsAssessment ? "Assessment Recommended" : "No Immediate Risk";
    default:
      return "N/A";
  }
};

const hasReferral = (screeningData: any, type: ScreeningType): boolean => {
   switch (type) {
    case 'HIV':
    case 'GBV':
      return true;
    case 'PrEP':
       return Object.entries(screeningData).some(([key, value]) => key !== 'name' && key !== 'age' && key !== 'phoneNumber' && key !== 'email' && value === 'yes');
    case 'STI':
      return Object.entries(screeningData).some(([key, value]) => key !== 'name' && key !== 'age' && key !== 'phoneNumber' && key !== 'email' && value === 'yes');
    default:
      return false;
  }
}

export default function ScreeningDataPage() {
  const [loading, setLoading] = useState(true);
  const [allScreenings, setAllScreenings] = useState<Screening[]>([]);
  const [filters, setFilters] = useState({ search: '', type: 'all_types', result: 'any_result' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  useEffect(() => {
    const fetchAllScreenings = async () => {
      setLoading(true);
      try {
        const screeningDefs: { name: string; type: ScreeningType }[] = [
          { name: 'hivScreenings', type: 'HIV' },
          { name: 'gbvScreenings', type: 'GBV' },
          { name: 'prepScreenings', type: 'PrEP' },
          { name: 'stiScreenings', type: 'STI' },
        ];
        
        let fetchedData: Screening[] = [];

        for (const def of screeningDefs) {
          const q = query(collection(db, def.name));
          const snapshot = await getDocs(q);
          const screenings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              userName: data.name,
              phoneNumber: data.phoneNumber,
              email: data.email,
              date: data.createdAt ? format((data.createdAt as Timestamp).toDate(), 'yyyy-MM-dd') : 'N/A',
              screeningType: def.type,
              keyResult: getKeyResult(data, def.type),
              referred: hasReferral(data, def.type) ? 'Yes' : 'No',
              data: data,
            } as Screening;
          });
          fetchedData = [...fetchedData, ...screenings];
        }
        setAllScreenings(fetchedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (err) {
        console.error("Error fetching screenings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllScreenings();
  }, []);

  const dateFilteredScreenings = useMemo(() => {
    if (!dateRange?.from) return allScreenings;
    const fromDate = dateRange.from;
    const toDate = dateRange.to ? new Date(dateRange.to) : new Date();
    toDate.setHours(23, 59, 59, 999); // Include all of the 'to' date

    return allScreenings.filter(s => {
      const screeningDate = new Date(s.date);
      return screeningDate >= fromDate && screeningDate <= toDate;
    });
  }, [allScreenings, dateRange]);


  const filteredScreenings = useMemo(() => {
    return dateFilteredScreenings.filter(s => {
      const searchMatch = s.userName.toLowerCase().includes(filters.search.toLowerCase()) || s.id.toLowerCase().includes(filters.search.toLowerCase()) || (s.phoneNumber && s.phoneNumber.includes(filters.search)) || (s.email && s.email.toLowerCase().includes(filters.search.toLowerCase()));
      const typeMatch = filters.type === 'all_types' || s.screeningType.toLowerCase() === filters.type;
      const resultMatch = filters.result === 'any_result' || 
                          (filters.result === 'high_risk' && (s.keyResult.toLowerCase().includes('high risk') || s.keyResult.toLowerCase().includes('urgent') || s.keyResult.toLowerCase().includes('eligible') || s.keyResult.toLowerCase().includes('recommended'))) ||
                          (filters.result === 'referred' && s.referred === 'Yes');
      return searchMatch && typeMatch && resultMatch;
    });
  }, [dateFilteredScreenings, filters]);

  const summaryChartData = useMemo(() => {
    const monthlyCounts = dateFilteredScreenings.reduce((acc, screening) => {
      const date = new Date(screening.date);
      const month = format(date, 'MMM');
      if (!acc[month]) {
        acc[month] = { month, hiv: 0, gbv: 0, prep: 0, sti: 0 };
      }
      const typeKey = screening.screeningType.toLowerCase() as keyof typeof acc[typeof month];
      if (acc[month][typeKey] !== undefined) {
         acc[month][typeKey]++;
      }
      return acc;
    }, {} as Record<string, { month: string, hiv: number, gbv: number, prep: number, sti: number }>);

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Object.values(monthlyCounts).sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
  }, [dateFilteredScreenings]);

  const { hivScreenings, gbvScreenings, prepScreenings, stiScreenings } = useMemo(() => ({
    hivScreenings: dateFilteredScreenings.filter(s => s.screeningType === 'HIV'),
    gbvScreenings: dateFilteredScreenings.filter(s => s.screeningType === 'GBV'),
    prepScreenings: dateFilteredScreenings.filter(s => s.screeningType === 'PrEP'),
    stiScreenings: dateFilteredScreenings.filter(s => s.screeningType === 'STI'),
  }), [dateFilteredScreenings]);

  const handleViewDetails = (screening: Screening) => {
    setSelectedScreening(screening);
    setIsModalOpen(true);
  };
  
  if (loading) {
     return (
        <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading screening data...</p>
        </div>
    );
  }

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
              <CardTitle className="text-xl font-bold text-primary flex items-center">
                <LucideBarChart className="mr-2 h-6 w-6" /> Screening Trends
              </CardTitle>
              <CardDescription>Monthly screening counts across all categories.</CardDescription>
            </CardHeader>
            <CardContent>
              {summaryChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                  <ShadBarChart accessibilityLayer data={summaryChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="hiv" fill="var(--color-hiv)" radius={4} name="HIV" />
                    <Bar dataKey="gbv" fill="var(--color-gbv)" radius={4} name="GBV" />
                    <Bar dataKey="prep" fill="var(--color-prep)" radius={4} name="PrEP" />
                    <Bar dataKey="sti" fill="var(--color-sti)" radius={4} name="STI" />
                  </ShadBarChart>
                </ChartContainer>
              ) : (
                <div className="text-center py-10 text-muted-foreground">No data available for chart.</div>
              )}
            </CardContent>
          </Card>
          
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">Screening Data Table</CardTitle>
              <CardDescription>Browse and filter individual screening records.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center flex-wrap">
                <Input placeholder="Search..." className="flex-grow min-w-[200px]" value={filters.search} onChange={(e) => setFilters(f => ({...f, search: e.target.value}))}/>
                <Select value={filters.type} onValueChange={(value) => setFilters(f => ({...f, type: value}))}>
                  <SelectTrigger className="w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">All Types</SelectItem>
                    <SelectItem value="hiv">HIV</SelectItem>
                    <SelectItem value="gbv">GBV</SelectItem>
                    <SelectItem value="prep">PrEP</SelectItem>
                    <SelectItem value="sti">STI</SelectItem>
                  </SelectContent>
                </Select>
                 <Select value={filters.result} onValueChange={(value) => setFilters(f => ({...f, result: value}))}>
                  <SelectTrigger className="w-full sm:w-[180px]"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any_result">Any Result</SelectItem>
                    <SelectItem value="high_risk">High Risk / Recommended</SelectItem>
                    <SelectItem value="referred">Referred</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[260px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                                ) : (
                                format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            />
                             <div className="flex gap-2 p-2 border-t">
                                <Button variant="ghost" size="sm" onClick={() => setDateRange({from: subDays(new Date(), 6), to: new Date()})}>Last 7 Days</Button>
                                <Button variant="ghost" size="sm" onClick={() => setDateRange({from: subDays(new Date(), 29), to: new Date()})}>Last 30 Days</Button>
                                <Button variant="ghost" size="sm" onClick={() => setDateRange({from: subDays(new Date(), 89), to: new Date()})}>Last 90 Days</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
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
                    {loading ? (
                       Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-[50px] rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[30px]" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-[100px]" /></TableCell>
                          </TableRow>
                       ))
                    ) : filteredScreenings.length > 0 ? (
                      filteredScreenings.map((screening) => (
                        <TableRow key={screening.id}>
                          <TableCell>{screening.userName}</TableCell>
                          <TableCell>{screening.date}</TableCell>
                          <TableCell>
                            <Badge variant={
                              screening.screeningType === 'HIV' ? 'default' :
                              screening.screeningType === 'GBV' ? 'destructive' :
                              screening.screeningType === 'PrEP' ? 'secondary' : 'outline'
                            }>{screening.screeningType}</Badge>
                          </TableCell>
                          <TableCell>{screening.keyResult}</TableCell>
                          <TableCell>{screening.referred}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(screening)}>View Details</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                       <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">No screening records found for the selected criteria.</TableCell>
                       </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Showing {filteredScreenings.length} of {allScreenings.length} total screening records.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hiv_analytics">
          <HivAnalyticsTab screenings={hivScreenings} />
        </TabsContent>
         <TabsContent value="gbv_analytics">
          <GbvAnalyticsTab screenings={gbvScreenings} />
        </TabsContent>
        <TabsContent value="prep_analytics">
          <PrEpAnalyticsTab screenings={prepScreenings} />
        </TabsContent>
         <TabsContent value="sti_analytics">
          <StiAnalyticsTab screenings={stiScreenings} />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
           {selectedScreening && (
             <>
                <DialogHeader>
                    <DialogTitle>Screening Details: {selectedScreening.userName}</DialogTitle>
                    <CardDescription className="text-sm">
                      <div>Type: {selectedScreening.screeningType} | Date: {selectedScreening.date}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {selectedScreening.phoneNumber && <span>Phone: {selectedScreening.phoneNumber}</span>}
                        {selectedScreening.phoneNumber && selectedScreening.email && <span className="mx-2">|</span>}
                        {selectedScreening.email && <span>Email: {selectedScreening.email}</span>}
                      </div>
                    </CardDescription>
                </DialogHeader>
                <div className="py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <ScreeningDetailsDisplay details={selectedScreening.data} type={selectedScreening.screeningType} />
                </div>
             </>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
