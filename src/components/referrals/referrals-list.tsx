
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
  const [loadingReferralId, setLoadingReferralId] = useState<string | null>(null);

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
                if (data.consentStatus === 'pending') {
                  setActiveReferral({
                      id: referralSnap.id,
                      ...data,
                      referralDate: (data.referralDate as Timestamp)?.toDate().toLocaleDateString() || 'N/A',
                      appointmentDateTime: data.appointmentDateTime,
                  } as ClientReferral);
                } else {
                  toast({ title: "Already Consented", description: "This referral has already been consented to. You can find it by searching its ID.", variant: "default" });
                  router.replace('/referrals', { scroll: false });
                }
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
    setLoadingReferralId(referral.id);
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

        // Check if the downloaded referral is the active (searched) one.
        if (activeReferral && activeReferral.id === referral.id) {
          setTimeout(() => {
            setActiveReferral(prev => prev ? { ...prev, isDisappearing: true } : null);
          }, 10000);
          setTimeout(() => {
            setActiveReferral(null);
          }, 10500);
        }
        
        // Check if it's from the consented list and handle its disappearance.
        const isFromConsentedList = consentedReferrals.some(r => r.id === referral.id);
        if (isFromConsentedList) {
            setTimeout(() => {
                setConsentedReferrals(prev => prev.map(r => (r.id === referral.id ? { ...r, isDisappearing: true } : r)));
            }, 10000);
            setTimeout(() => {
                setConsentedReferrals(prev => prev.filter(r => r.id !== referral.id));
                if (searchParams.get('pendingId') === referral.id) {
                    router.replace('/referrals', { scroll: false });
                }
            }, 10500);
        }
      } catch (e) {
         toast({ title: "Error", description: "Failed to process PDF for download.", variant: "destructive" });
      }
    } else {
      toast({ title: "Error", description: result.message || "Failed to generate PDF.", variant: "destructive" });
    }
    setLoadingReferralId(null);
  };

  const handleConsentSubmit = async (referralId: string, data: ReferralConsentFormData) => {
    if (!activeReferral) return;
    
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

  const renderReferralCard = (referral: ClientReferral, isSearchedResult: boolean) => (
       <Card
          key={referral.id}
          className={cn(
              "shadow-lg transition-all duration-500 ease-in-out flex flex-col bg-card",
              isSearchedResult && "border-2 border-primary",
              referral.isDisappearing && "animate-fade-out-up"
          )}
      >
          <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle className="font-headline text-2xl text-primary">{isSearchedResult ? 'Referral Details' : 'Your Consented Referral'}</CardTitle>
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
                  {referral.appointmentDateTime && (
                    <span className="flex items-center gap-1 text-xs font-medium text-accent">
                      <CalendarClock className="h-3 w-3" />
                      Appt: {format(referral.appointmentDateTime.toDate(), "PPp")}
                    </span>
                  )}
              </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
              <p className="text-sm font-semibold text-card-foreground/90 mb-1">Referred to:</p>
              <p className="text-sm text-accent font-medium mb-3">{fullLocation(referral) || 'N/A'}</p>

              {referral.services && referral.services.length > 0 && (
                  <div className="mb-3">
                      <p className="text-sm font-semibold text-card-foreground/90 mb-1">Services Referred For:</p>
                      <p className="text-sm text-muted-foreground">{referral.services.join(', ')}</p>
                  </div>
              )}
              
              <Alert className="mt-4">
                  <AlertTitle>Your Referral PDF</AlertTitle>
                  <AlertDescription>
                      Click the download button to save your referral PDF. For your privacy, this card will disappear 10 seconds after downloading.
                  </AlertDescription>
              </Alert>
          </CardContent>
           <CardFooter className="flex justify-between items-center pt-4 mt-auto">
              <p className="text-xs text-muted-foreground">ID: {referral.id}</p>
              <Button variant="outline" size="sm" onClick={() => handleDownload(referral)} disabled={loadingReferralId === referral.id}>
                  {loadingReferralId === referral.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  Download PDF
              </Button>
          </CardFooter>
      </Card>
  );

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
            renderReferralCard(activeReferral, true)
          )}
        </div>
      )}

      {consentedReferrals.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary pl-1">Ready for Download</h2>
          {consentedReferrals.map((referral) => renderReferralCard(referral, false))}
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
