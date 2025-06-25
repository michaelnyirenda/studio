
"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, Timestamp, getDocs, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Download, CalendarIcon, Loader2, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';

// Helper to flatten nested objects for CSV export
const flattenObject = (obj: any, parentKey = '', res: {[key: string]: any} = {}) => {
    if (obj === null || obj === undefined) return res;
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const propName = parentKey ? parentKey + '_' + key : key;
            const value = obj[key];
            if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Timestamp)) {
                flattenObject(value, propName, res);
            } else if (value instanceof Timestamp) {
                res[propName] = value.toDate().toISOString();
            } else {
                res[propName] = value;
            }
        }
    }
    return res;
};

// Helper to convert an array of objects to a CSV string.
const convertToCsv = (data: any[]): string => {
    if (!Array.isArray(data) || data.length === 0) {
        return '';
    }

    // Collect all unique headers
    const headers = Array.from(new Set(data.flatMap(row => Object.keys(row))));
    
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            let cell = row[header];
            if (cell === null || cell === undefined) {
                cell = '';
            } else if (Array.isArray(cell)) {
                cell = cell.join(';'); // Join arrays with a semicolon
            } else if (typeof cell === 'object') {
                cell = JSON.stringify(cell);
            }
            
            const cellString = String(cell);
            const escaped = cellString.replace(/"/g, '""');
            // Quote fields containing commas, double quotes, or newlines
            if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
                return `"${escaped}"`;
            }
            return escaped;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};


// Helper to download data on client side
const downloadData = (data: string, fileName: string) => {
    const mimeType = fileName.endsWith('.csv') ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};


interface ExportHistoryItem {
  id: string;
  dataType: string;
  format: 'csv' | 'excel' | 'json';
  rowCount: number;
  timestamp: string;
  fileName: string;
  dateRange: { from: Timestamp; to: Timestamp };
}

export default function DataExportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [dataType, setDataType] = useState<string>('screening_data_all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'exportHistory'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const historyData: ExportHistoryItem[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          dataType: data.dataType,
          format: data.format,
          rowCount: data.rowCount,
          timestamp: data.timestamp ? format((data.timestamp as Timestamp).toDate(), 'PPpp') : 'N/A',
          fileName: data.fileName,
          dateRange: data.dateRange,
        };
      });
      setHistory(historyData);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
        toast({ title: "Error", description: "Please select a date range.", variant: "destructive" });
        return;
    }
    setLoading(true);

    try {
        const startDate = dateRange.from;
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);

        let dataToExport: any[] = [];
        const collectionMap: { [key: string]: string } = {
            'hiv_screening': 'hivScreenings',
            'gbv_screening': 'gbvScreenings',
            'prep_screening': 'prepScreenings',
            'sti_screening': 'stiScreenings',
        };

        if (dataType === 'screening_data_all') {
             for (const key in collectionMap) {
                const collectionName = collectionMap[key];
                const q = query(collection(db, collectionName), where('createdAt', '>=', startDate), where('createdAt', '<=', endDate));
                const snapshot = await getDocs(q);
                const fetchedData = snapshot.docs.map(doc => flattenObject({ type: key.replace('_screening', ''), ...doc.data(), id: doc.id }));
                dataToExport.push(...fetchedData);
            }
        } else if (dataType === 'referral_data') {
            const q = query(collection(db, 'referrals'), where('referralDate', '>=', startDate), where('referralDate', '<=', endDate));
            const snapshot = await getDocs(q);
            dataToExport = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id, patientName: data.patientName,
                    referralDate: (data.referralDate as Timestamp)?.toDate().toISOString() || 'N/A',
                    type: data.type, status: data.status, consentStatus: data.consentStatus,
                    facility: data.facility, notes: data.notes,
                    services: Array.isArray(data.services) ? data.services.join('; ') : '',
                    screeningId: data.screeningId, userId: data.userId
                }
            });
        } else {
             const collectionName = collectionMap[dataType];
             const q = query(collection(db, collectionName), where('createdAt', '>=', startDate), where('createdAt', '<=', endDate));
             const snapshot = await getDocs(q);
             dataToExport = snapshot.docs.map(doc => flattenObject({ ...doc.data(), id: doc.id }));
        }

        if (dataToExport.length === 0) {
            toast({ title: "No Data", description: "No data found for the selected criteria.", variant: "destructive" });
            setLoading(false);
            return;
        }
        
        const fileExtension = (exportFormat === 'excel') ? 'csv' : exportFormat;
        const fileName = `${dataType}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
        let outputData = '';

        if (fileExtension === 'csv') {
            outputData = convertToCsv(dataToExport);
        } else {
            outputData = JSON.stringify(dataToExport, (key, value) => (value instanceof Timestamp ? value.toDate().toISOString() : value), 2);
        }

        downloadData(outputData, fileName);

        await addDoc(collection(db, 'exportHistory'), {
            dataType: dataType, format: exportFormat,
            dateRange: { from: startDate, to: endDate },
            rowCount: dataToExport.length, timestamp: serverTimestamp(), fileName: fileName,
        });

        toast({ title: "Success", description: "Report generated and download started." });

    } catch (error) {
        console.error("Failed to generate report:", error);
        toast({ title: "Error", description: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  const handleRedownload = async (item: ExportHistoryItem) => {
    setLoading(true);

    try {
        const startDate = item.dateRange.from.toDate();
        const endDate = item.dateRange.to.toDate();

        let dataToExport: any[] = [];
        const collectionMap: { [key: string]: string } = {
            'hiv_screening': 'hivScreenings',
            'gbv_screening': 'gbvScreenings',
            'prep_screening': 'prepScreenings',
            'sti_screening': 'stiScreenings',
        };

        if (item.dataType === 'screening_data_all') {
             for (const key in collectionMap) {
                const collectionName = collectionMap[key];
                const q = query(collection(db, collectionName), where('createdAt', '>=', startDate), where('createdAt', '<=', endDate));
                const snapshot = await getDocs(q);
                const fetchedData = snapshot.docs.map(doc => flattenObject({ type: key.replace('_screening', ''), ...doc.data(), id: doc.id }));
                dataToExport.push(...fetchedData);
            }
        } else if (item.dataType === 'referral_data') {
            const q = query(collection(db, 'referrals'), where('referralDate', '>=', startDate), where('referralDate', '<=', endDate));
            const snapshot = await getDocs(q);
            dataToExport = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id, patientName: data.patientName,
                    referralDate: (data.referralDate as Timestamp)?.toDate().toISOString() || 'N/A',
                    type: data.type, status: data.status, consentStatus: data.consentStatus,
                    facility: data.facility, notes: data.notes,
                    services: Array.isArray(data.services) ? data.services.join('; ') : '',
                    screeningId: data.screeningId, userId: data.userId
                }
            });
        } else {
             const collectionName = collectionMap[item.dataType];
             if (collectionName) {
                const q = query(collection(db, collectionName), where('createdAt', '>=', startDate), where('createdAt', '<=', endDate));
                const snapshot = await getDocs(q);
                dataToExport = snapshot.docs.map(doc => flattenObject({ ...doc.data(), id: doc.id }));
             }
        }

        if (dataToExport.length === 0) {
            toast({ title: "No Data", description: "No data found for this report's criteria. It might have been deleted.", variant: "destructive" });
            setLoading(false);
            return;
        }
        
        const fileExtension = (item.format === 'excel') ? 'csv' : item.format;
        const fileName = item.fileName;
        let outputData = '';

        if (fileExtension === 'csv') {
            outputData = convertToCsv(dataToExport);
        } else {
            outputData = JSON.stringify(dataToExport, (key, value) => (value instanceof Timestamp ? value.toDate().toISOString() : value), 2);
        }

        downloadData(outputData, fileName);
        toast({ title: "Success", description: `Re-download started for ${fileName}.` });

    } catch (error) {
        console.error("Failed to re-download report:", error);
        toast({ title: "Error", description: `Failed to re-download report: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };


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
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger id="dataType">
                <SelectValue />
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
            <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
              <SelectTrigger id="exportFormat">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                <SelectItem value="excel">Excel (XLSX, generates .csv)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerateReport} disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
            {loading ? 'Generating Report...' : 'Generate & Download Report'}
          </Button>
        </CardContent>
      </Card>

       <div className="mt-12 text-center border-t pt-8">
        <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center justify-center gap-2">
          <History className="h-7 w-7" /> Export History
        </h2>
        {history.length > 0 ? (
          <Card className="text-left max-w-2xl mx-auto">
              <CardContent className="p-2">
                  <div className="max-h-80 overflow-y-auto space-y-2 p-2">
                  {history.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                          <div>
                              <p className="font-medium">{item.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                  Generated: {item.timestamp} | Rows: {item.rowCount}
                              </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRedownload(item)} disabled={loading}>
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Re-download</span>
                          </Button>
                      </div>
                  ))}
                  </div>
              </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground mb-4">No reports have been generated yet.</p>
        )}
      </div>
    </div>
  );
}
