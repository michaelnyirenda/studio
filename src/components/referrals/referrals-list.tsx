
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
import { FileText, Mail, MessageSquare, CalendarClock, Loader2, Download } from 'lucide-react';

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
  const pendingIdFromUrl = searchParams.get('pendingId');
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [pendingReferral, setPendingReferral] = useState<ClientReferral | null>(null);
  const [consentedReferrals, setConsentedReferrals] = useState<ClientReferral[]>([]);

  // Fetch the specific pending referral from the URL on initial load
  useEffect(() => {
    const fetchPendingReferral = async () => {
      if (!pendingIdFromUrl) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const referralRef = doc(db, 'referrals', pendingIdFromUrl);
        const referralSnap = await getDoc(referralRef);
        if (referralSnap.exists() && referralSnap.data().consentStatus === 'pending') {
          const data = referralSnap.data();
          setPendingReferral({
            id: referralSnap.id,
            ...data,
            referralDate: (data.referralDate as Timestamp)?.toDate().toLocaleDateString() || 'N/A',
            appointmentDateTime: data.appointmentDateTime,
          } as ClientReferral);
        } else {
          // If referral not found or already consented, remove the param from URL
          router.replace('/referrals', { scroll: false });
        }
      } catch (error) {
        console.error("Error fetching pending referral:", error);
        toast({ title: "Error", description: "Could not fetch your referral.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPendingReferral();
  }, [pendingIdFromUrl, router, toast]);

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
    if (!pendingReferral) return;
    
    // 1. Download PDF
    await handleDownload(pendingReferral);

    // 2. Update local state
    const newlyConsentedReferral: ClientReferral = {
      ...pendingReferral,
      consentStatus: 'agreed',
      status: 'Pending Review',
      region: data.region,
      constituency: data.constituency,
      facility: data.facility,
      contactMethod: data.contactMethod,
    };
    
    setConsentedReferrals(prev => [...prev, newlyConsentedReferral]);
    setPendingReferral(null);
    router.replace('/referrals', { scroll: false });

    // 3. Set timer to hide the card
    setTimeout(() => {
      setConsentedReferrals(prev =>
        prev.map(r => r.id === referralId ? { ...r, isDisappearing: true } : r)
      );
    }, 4000); // Wait 4 seconds before starting fade out

    // 4. Remove card from DOM after animation
    setTimeout(() => {
        setConsentedReferrals(prev => prev.filter(r => r.id !== referralId));
    }, 4500); // 4s wait + 0.5s animation
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
      {pendingReferral ? (
        <div className="mb-12">
          <ReferralConsentForm
            referral={pendingReferral}
            onConsentSubmit={handleConsentSubmit}
          />
        </div>
      ) : consentedReferrals.length === 0 ? (
        <div className="mt-8 text-center flex flex-col items-center justify-center rounded-2xl bg-card p-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-card-foreground">
            You have no active referrals.
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Referrals will appear here after you complete a screening and give consent.
          </p>
        </div>
      ) : null}

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
                  <CardTitle className="text-xl font-headline text-primary">Your Consented Referral</CardTitle>
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
                 <p className="text-xs text-muted-foreground mt-4">
                    This card will disappear shortly. A PDF has been downloaded to your device.
                </p>
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
    </>
  );
}
