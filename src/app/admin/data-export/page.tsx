
"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Download, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import React, { useState } from 'react';
import type { DateRange } from 'react-day-picker';

export default function DataExportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29), // Default to last 30 days
    to: new Date(),
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Data Export Center"
        description="Generate and download reports for various data sets in multiple formats."
      />
      
      <Card className="w-full max-w-2xl mx-auto shadow-xl mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-primary flex items-center">
            <Download className="mr-2 h-6 w-6" /> Configure Your Export
          </CardTitle>
          <CardDescription>Select the data, date range, and format for your report.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="dataType" className="text-base">Data Type</Label>
            <Select defaultValue="screening_data_all">
              <SelectTrigger id="dataType">
                <SelectValue placeholder="Select Data Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="screening_data_all">All Screening Data</SelectItem>
                <SelectItem value="hiv_screening">HIV Screening Data</SelectItem>
                <SelectItem value="gbv_screening">GBV Screening Data</SelectItem>
                <SelectItem value="prep_screening">PrEP Screening Data</SelectItem>
                <SelectItem value="sti_screening">STI Screening Data</SelectItem>
                <SelectItem value="referral_data">Referral Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
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
              </PopoverContent>
            </Popover>
            <div className="flex gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => setDateRange({from: subDays(new Date(), 6), to: new Date()})}>Last 7 Days</Button>
                <Button variant="ghost" size="sm" onClick={() => setDateRange({from: subDays(new Date(), 29), to: new Date()})}>Last 30 Days</Button>
                 <Button variant="ghost" size="sm" onClick={() => setDateRange({from: subDays(new Date(), 89), to: new Date()})}>Last 90 Days</Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="exportFormat" className="text-base">Export Format</Label>
            <Select defaultValue="csv">
              <SelectTrigger id="exportFormat">
                <SelectValue placeholder="Select Export Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                <SelectItem value="excel">Excel (XLSX)</SelectItem>
                <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                <SelectItem value="pdf">PDF (Printable Document)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base">
            <Download className="mr-2 h-5 w-5" /> Generate & Download Report
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-2">
            Data export functionality is a mock-up. Actual implementation requires backend processing and secure data handling.
          </p>
        </CardContent>
      </Card>

       <div className="mt-12 text-center border-t pt-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">Export History (Mock)</h2>
        <p className="text-muted-foreground mb-4">A list of previously generated reports would appear here.</p>
        <Card className="text-left max-w-lg mx-auto">
            <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                    <div>
                        <p className="font-medium">HIV Screenings - Q2 2024</p>
                        <p className="text-xs text-muted-foreground">Generated: 2024-07-01 | Format: Excel</p>
                    </div>
                    <Button variant="outline" size="sm">Re-Download</Button>
                </div>
                 <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                    <div>
                        <p className="font-medium">All User Data - June 2024</p>
                        <p className="text-xs text-muted-foreground">Generated: 2024-06-15 | Format: CSV</p>
                    </div>
                    <Button variant="outline" size="sm">Re-Download</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
