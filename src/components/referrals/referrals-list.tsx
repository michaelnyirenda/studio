
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

import { db } from '@/lib/firebase';
import type { Referral } from '@/lib/types';
import type { ReferralConsentFormData } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { downloadReferralPdfAction } from '@/app/referrals/actions';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReferralConsentForm from '@/components/referrals/referral-consent-form';
import { FileText, Mail, MessageSquare, CalendarClock, Loader2, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type ClientReferral = Omit<Referral, 'referralDate' | 'appointmentDateTime'> & {
  referralDate: string;
  appointmentDateTime?: Timestamp;
  isDisappearing?: boolean;
};

function getStatusVariant(status: Referral['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Pending Consent':
    case 'Pending Review':
      return 'destructive';
    case 'Contacted':
      return 'outline';
    case 'Follow-up Scheduled':
      return 'secondary';
    case 'Closed':
      return 'default';
    default:
      return 'default';
  }
}

export default function ReferralsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeReferral, setActiveReferral] = useState<ClientReferral | null>(null);
  const [consentedReferrals, setConsentedReferrals] = useState<ClientReferral[]>([]);

  // New state for search functionality
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch the specific pending referral from the URL on initial load
  useEffect(() => {
    const pendingIdFromUrl = searchParams.get('pendingId');
    if (!pendingIdFromUrl) {
      setLoading(false);
      return;
    }

    const fetchReferral = async (id: string) => {
        setLoading(true);
         try {
            const referralRef = doc(db, 'referrals', id);
            const referralSnap = await getDoc(referralRef);
            if (referralSnap.exists()) {
                const data = referralSnap.data();
                setActiveReferral({
                    id: referralSnap.id,
                    ...data,
                    referralDate: (data.referralDate as Timestamp)?.toDate().toLocaleDateString() || 'N/A',
                    appointmentDateTime: data.appointmentDateTime,
                } as ClientReferral);
            } else {
                toast({ title: "Not Found", description: "The referral ID in the URL was not found.", variant: "destructive" });
                router.replace('/referrals', { scroll: false });
            }
        } catch (error) {
            console.error("Error fetching referral:", error);
            toast({ title: "Error", description: "Could not fetch your referral.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    fetchReferral(pendingIdFromUrl);
    // We only want this to run when the component mounts and the URL param is present.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (referral: ClientReferral) => {
    const result = await downloadReferralPdfAction(referral.id);
    if (result.success && result.pdfData) {
      try {
        const byteCharacters = atob(result.pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Referral_${referral.patientName.replace(/\s+/g, '_')}_${referral.id.slice(0,5)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: "Success", description: "PDF download started." });
      } catch (e) {
        toast({ title: "Error", description: "Failed to process PDF for download.", variant: "destructive" });
      }
    } else {
      toast({ title: "Error", description: result.message || "Failed to generate PDF.", variant: "destructive" });
    }
  };

  const handleConsentSubmit = async (referralId: string, data: ReferralConsentFormData) => {
    if (!activeReferral) return;
    
    // 1. Download PDF
    await handleDownload(activeReferral);

    // 2. Update local state
    const newlyConsentedReferral: ClientReferral = {
      ...activeReferral,
      consentStatus: 'agreed',
      status: 'Pending Review',
      region: data.region,
      constituency: data.constituency,
      facility: data.facility,
      contactMethod: data.contactMethod,
    };
    
    setConsentedReferrals(prev => [newlyConsentedReferral, ...prev]);
    setActiveReferral(null);
    if (searchParams.get('pendingId')) {
        router.replace('/referrals', { scroll: false });
    }


    // 3. Set timer to hide the card
    setTimeout(() => {
      setConsentedReferrals(prev =>
        prev.map(r => r.id === referralId ? { ...r, isDisappearing: true } : r)
      );
    }, 15000); // Wait 15 seconds before starting fade out

    // 4. Remove card from DOM after animation
    setTimeout(() => {
        setConsentedReferrals(prev => prev.filter(r => r.id !== referralId));
    }, 15500); // 15s wait + 0.5s animation
  };

  const handleSearchReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setActiveReferral(null);
    
    if (searchParams.get('pendingId')) {
      router.replace('/referrals', { scroll: false });
    }

    try {
      const referralRef = doc(db, 'referrals', searchInput.trim());
      const referralSnap = await getDoc(referralRef);
      if (referralSnap.exists()) {
        const data = referralSnap.data();
         setActiveReferral({
            id: referralSnap.id,
            ...data,
            referralDate: (data.referralDate as Timestamp)?.toDate().toLocaleDateString() || 'N/A',
            appointmentDateTime: data.appointmentDateTime,
        } as ClientReferral);
      } else {
        setSearchError("Referral ID not found. Please check the ID and try again.");
      }
    } catch (error) {
      console.error("Error searching referral:", error);
      setSearchError("An error occurred while searching. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };
  
  const fullLocation = (referral: ClientReferral) => {
    return [referral.region, referral.constituency, referral.facility].filter(Boolean).join(', ');
  }

  if (loading) {
    return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
        <Card className="mb-8 shadow-xl">
            <CardHeader>
                <CardTitle>Find a Previous Referral</CardTitle>
                <CardDescription>If you have a referral ID, you can enter it here to view its details.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearchReferral} className="flex flex-col sm:flex-row gap-2">
                    <Input 
                        placeholder="Enter your referral ID..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="flex-grow"
                    />
                    <Button type="submit" disabled={isSearching} className="w-full sm:w-auto">
                        {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                        {isSearching ? 'Searching...' : 'Find Referral'}
                    </Button>
                </form>
                 {searchError && (
                    <p className="text-sm font-medium text-destructive mt-3">{searchError}</p>
                 )}
            </CardContent>
        </Card>

      {activeReferral && (
        <div className="mb-12">
          {activeReferral.consentStatus === 'pending' ? (
             <ReferralConsentForm
                referral={activeReferral}
                onConsentSubmit={handleConsentSubmit}
              />
          ) : (
            <Card key={activeReferral.id} className="shadow-lg transition-all duration-300 ease-in-out flex flex-col bg-card border-primary">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="font-headline text-2xl text-primary">Referral Details</CardTitle>
                        <Badge variant={getStatusVariant(activeReferral.status)} className="ml-2 whitespace-nowrap text-xs">
                            {activeReferral.status}
                        </Badge>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground pt-1 flex justify-between items-center flex-wrap gap-2">
                        <span>Referred on: {activeReferral.referralDate}</span>
                        {activeReferral.appointmentDateTime && (
                          <span className="flex items-center gap-1 text-xs font-medium text-accent">
                            <CalendarClock className="h-3 w-3" />
                            Appt: {format(activeReferral.appointmentDateTime.toDate(), "PPp")}
                          </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-sm font-semibold text-card-foreground/90 mb-1">Referred to:</p>
                    <p className="text-sm text-accent font-medium">{fullLocation(activeReferral) || 'N/A'}</p>
                </CardContent>
                 <CardFooter className="flex justify-between items-center pt-4 mt-auto">
                    <p className="text-xs text-muted-foreground">ID: {activeReferral.id}</p>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(activeReferral)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Again
                    </Button>
                </CardFooter>
            </Card>
          )}
        </div>
      )}

      {consentedReferrals.length > 0 && (
        <div className="space-y-6">
          {consentedReferrals.map((referral) => (
             <Card 
                key={referral.id} 
                className={cn(
                    "shadow-lg transition-all duration-300 ease-in-out flex flex-col bg-card",
                    referral.isDisappearing && "animate-fade-out-up"
                )}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="font-headline text-2xl text-primary">Your Consented Referral</CardTitle>
                  <Badge variant={getStatusVariant(referral.status)} className="ml-2 whitespace-nowrap text-xs">
                    {referral.status}
                  </Badge>
                </div>
                 <CardDescription className="text-sm text-muted-foreground pt-1 flex justify-between items-center flex-wrap gap-2">
                    <span>Referred on: {referral.referralDate}</span>
                    {referral.contactMethod && (
                        <span className="flex items-center gap-1 text-xs font-medium">
                            {referral.contactMethod === 'email' ? <Mail className="h-3 w-3 text-blue-600" /> : <MessageSquare className="h-3 w-3 text-green-600" />}
                            Contact via {referral.contactMethod === 'email' ? 'Email' : 'WhatsApp'}
                        </span>
                    )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold text-card-foreground/90 mb-1">Referred to:</p>
                <p className="text-sm text-accent font-medium">{fullLocation(referral) || 'N/A'}</p>
                 <Alert className="mt-4">
                    <AlertTitle>Next Steps</AlertTitle>
                    <AlertDescription>
                        This card will disappear shortly. A PDF of your referral has been downloaded to your device for your records.
                    </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4 mt-auto">
                <p className="text-xs text-muted-foreground">ID: {referral.id}</p>
                <Button variant="outline" size="sm" onClick={() => handleDownload(referral)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Again
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

       {!activeReferral && consentedReferrals.length === 0 && !loading && !isSearching && !searchError && (
        <div className="mt-8 text-center flex flex-col items-center justify-center rounded-2xl bg-card p-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-card-foreground">
            You have no active referrals to display.
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Enter an ID above to find a previous referral, or complete a screening to generate a new one.
          </p>
        </div>
      )}
    </>
  );
}
