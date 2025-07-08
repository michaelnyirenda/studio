
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

// Helper to convert an array of objects to a CSV string with human-readable headers and values.
const convertToCsv = (data: any[], preferredOrder: string[] = []): string => {
    if (!Array.isArray(data) || data.length === 0) {
        return '';
    }

    const formatKeyToHeader = (key: string): string => {
        if (key === 'id') return 'ID';
        if (key === 'userId') return 'User ID';
        if (key === 'screeningId') return 'Screening ID';
        if (key === 'createdAt' || key === 'referralDate' || key === 'timestamp' || key === 'appointmentDateTime') {
            return key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase());
        }
        
        const result = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1).trim();
    };

    const humanReadableValueMap: { [key: string]: string } = {
        // General
        'yes': 'Yes', 'no': 'No', 'dont_know': "Don't Know", 'refused': 'Refused to Answer', 'no_answer': 'No Answer', 'na': 'N/A', 'pending': 'Pending', 'agreed': 'Agreed', 'declined': 'Declined',
        'whatsapp': 'WhatsApp/SMS', 'email': 'Email',

        // HIV Screening
        'less_than_3_months': 'Less than 3 months ago', '3_to_6_months': '3-6 months ago', '6_to_12_months': '6-12 months ago', 'more_than_12_months': 'More than 12 months ago', 'never_tested': 'Never tested',
        'positive': 'HIV Positive', 'negative': 'HIV Negative',
        'taking_art': 'Currently taking ART', 'started_stopped': 'Started ART but Stopped', 'not_on_art': 'Not on ART',
        'within_6_months': 'Yes (within the last 6 months)', 'never': 'Never had Sex', 'cant_remember': "Can't Remember",
        'forced': 'Forced', 'two': 'Yes, two partners', 'three_or_more': 'Yes, three or more partners', 'dont_remember': "Yes, I don't remember the number",
        '0-3': '0-3 years', '4-9': '4-9 years', '10+': '10+ years',
        'any': 'Consumed any alcohol', 'none': 'Did not consume any alcohol',
        'every_day': 'Every day', 'every_week': 'Every week', '2_3_times_month': '2-3 times a month', 'once_month': 'Once a month', 'special_occasions': 'Only on specific occasions',
        'coughing': 'Coughing', 'weight_loss': 'Weight loss', 'night_sweats': 'Night sweats', 'fever': 'Fever', 'swelling': 'Swelling',
        'currently_pregnant': 'Currently pregnant', 'pregnant_in_past': 'Pregnant in the past', 'child_passed_on': 'Child passed on', 'child_under_2': 'Have a child ≤ 2 years', 'child_over_2': 'Have a child older than 2 years', 'abortion_miscarriage': 'Had a history of abortion or miscarriage', 'never_pregnant': 'Never been pregnant',
        'attending_anc': 'Attending ANC/PMTCT', 'attending_post_natal': 'Attending Post Natal Care', 'eligible_not_attending': 'Eligible but not attending',
        'single': 'Single (lost one parent)', 'double': 'Double (lost both parents)', 'child_headed': 'Child-headed household',
        
        // GBV Screening
        'mocked': 'Mocked/insulted/put down', 'controlled': 'Controlled (money, food, movement)',
        'punched': 'Punched/slapped/shoved/etc.', 'threatened': 'Threatened with a weapon',
        'touched': 'Touched sexually without consent',
        'le_72_hr': '≤ 72 hours ago', 'gt_72_le_120_hr': '> 72 hours to ≤ 120 hours ago', 'gt_120_hr': '> 120 hours (> 5 days) ago', 'no_history': 'No History',

        // STI Screening
        'diagnosedOrTreated': 'Diagnosed or Treated', 'abnormalDischarge': 'Abnormal Discharge', 'vaginalItchiness': 'Vaginal Itchiness', 'genitalSores': 'Genital Sores/Ulcers',

        // Referral Status
        'Pending Consent': 'Pending Consent', 'Pending Review': 'Pending Review', 'Contacted': 'Contacted', 'Follow-up Scheduled': 'Follow-up Scheduled', 'Closed': 'Closed',
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined || value === '') return '';
        if (Array.isArray(value)) {
            if (value.length === 0) return 'No selection';
            if (value.includes('no') || value.includes('never_pregnant')) return 'No';
            return value.map(v => humanReadableValueMap[v] || v.toString().replace(/_/g, ' ')).join('; ');
        }
        const stringValue = String(value);
        return humanReadableValueMap[stringValue] || stringValue;
    };

    // Collect all unique keys from the data
    const allKeys = Array.from(new Set(data.flatMap(row => Object.keys(row))));
    
    let headers: string[];

    if (preferredOrder.length > 0) {
        // Filter preferredOrder to only include keys present in the data, maintaining order
        const orderedPresentKeys = preferredOrder.filter(key => allKeys.includes(key));
        // Find keys present in data but not in the preferred order
        const remainingKeys = allKeys
            .filter(key => !preferredOrder.includes(key))
            .sort(); // Sort remaining keys alphabetically for consistent output
        headers = [...orderedPresentKeys, ...remainingKeys];
    } else {
        // Fallback to just sorting all keys alphabetically if no order is provided
        headers = allKeys.sort();
    }
    
    const csvRows = [];
    csvRows.push(headers.map(formatKeyToHeader).join(','));

    for (const row of data) {
        const values = headers.map(header => {
            let cell = row[header];
            cell = formatValue(cell);
            
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

  const columnOrders = {
    hiv_screening: [
        'id', 'name', 'age', 'phoneNumber', 'email', 'createdAt', 'userId', 'knowsHivStatus', 'lastTestDate', 'lastTestResult', 'treatmentStatus',
        'hadSex', 'usedCondoms', 'transactionalSex', 'multiplePartners', 'partnerAgeDifferenceP1', 'partnerAgeDifferenceP2', 'partnerAgeDifferenceP3',
        'consumedAlcohol', 'alcoholFrequency', 'symptoms', 'pregnancyHistory', 'attendingAnc', 'isOrphan', 'orphanStatus',
        'hasDisability', 'isDisabilityRegistered'
    ],
    gbv_screening: [
        'id', 'name', 'age', 'phoneNumber', 'email', 'createdAt', 'userId', 'emotionalViolence', 'suicideAttempt', 'physicalViolence', 'seriousInjury',
        'sexualViolence', 'sexualViolenceTimeline'
    ],
    prep_screening: [
        'id', 'name', 'age', 'phoneNumber', 'email', 'createdAt', 'userId', 'multiplePartners', 'unprotectedSex', 'unknownStatusPartners',
        'atRiskPartners', 'sexUnderInfluence', 'newStiDiagnosis', 'considersAtRisk', 'usedPepMultipleTimes', 'forcedSex'
    ],
    sti_screening: [
        'id', 'name', 'age', 'phoneNumber', 'email', 'createdAt', 'userId', 'diagnosedOrTreated', 'abnormalDischarge', 'vaginalItchiness', 'genitalSores'
    ],
    referral_data: [
        'id', 'patientName', 'phoneNumber', 'email', 'referralDate', 'type', 'status', 'consentStatus', 'contactMethod', 'appointmentDateTime', 'region', 'constituency', 'facility', 'services', 'referralMessage',
        'notes', 'screeningId', 'userId'
    ],
    get screening_data_all() {
        const hivCols = this.hiv_screening.slice(7);
        const gbvCols = this.gbv_screening.slice(7);
        const prepCols = this.prep_screening.slice(7);
        const stiCols = this.sti_screening.slice(7);
        // Use a Set to ensure unique column names while preserving a logical order.
        const allUniqueCols = [...new Set([...hivCols, ...gbvCols, ...prepCols, ...stiCols])];
        return ['id', 'type', 'name', 'age', 'phoneNumber', 'email', 'createdAt', 'userId', ...allUniqueCols];
    }
  };

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
            dataToExport = snapshot.docs.map(doc => flattenObject({ ...doc.data(), id: doc.id }));
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
            const preferredOrder = columnOrders[dataType as keyof typeof columnOrders] || [];
            outputData = convertToCsv(dataToExport, preferredOrder);
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
            dataToExport = snapshot.docs.map(doc => flattenObject({ ...doc.data(), id: doc.id }));
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
            const preferredOrder = columnOrders[item.dataType as keyof typeof columnOrders] || [];
            outputData = convertToCsv(dataToExport, preferredOrder);
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
          <CardTitle className="text-xl font-bold text-primary flex items-center">
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
                          <Button variant="outline" size="sm" onClick={() => handleRedownload(item)} disabled={loading} className="text-accent border-accent hover:bg-accent hover:text-accent-foreground">
                              <Download className="mr-2 h-4 w-4" />
                              Re-download
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
