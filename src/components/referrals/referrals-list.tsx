'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

import { db } from '@/lib/firebase';
import type { Referral } from '@/lib/types';
import type { ReferralConsentFormData } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ReferralConsentForm from '@/components/referrals/referral-consent-form';
import { FileText, Mail, MessageSquare, CalendarClock, Loader2 } from 'lucide-react';

type ClientReferral = Omit<Referral, 'referralDate' | 'appointmentDateTime'> & {
  referralDate: string;
  appointmentDateTime?: Timestamp;
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
  const searchParams = useSearchParams();
  const pendingIdFromUrl = searchParams.get('pendingId');

  const [referrals, setReferrals] = useState<ClientReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const MOCK_CURRENT_USER_ID = 'client-test-user';

  useEffect(() => {
    setLoading(true);
    const referralsCollection = collection(db, 'referrals');
    const q = query(referralsCollection, where('userId', '==', MOCK_CURRENT_USER_ID), orderBy('referralDate', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const referralsData: ClientReferral[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          referralDate: (data.referralDate as Timestamp)?.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) || 'N/A',
           appointmentDateTime: data.appointmentDateTime,
        } as ClientReferral;
      });
      setReferrals(referralsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching referrals:", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Could not fetch your referrals. Please try again later.",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const pendingUserReferral = useMemo(() => {
    if (pendingIdFromUrl) {
      const referral = referrals.find(r => r.id === pendingIdFromUrl);
      if (referral) return referral;
    }
    return referrals.find(r => r.consentStatus === 'pending');
  }, [referrals, pendingIdFromUrl]);

  const displayReferrals = useMemo(() => {
    return referrals.filter(r => r.consentStatus === 'agreed');
  }, [referrals]);

  const handleConsentSubmit = async (referralId: string, data: ReferralConsentFormData) => {
    setReferrals(prevReferrals =>
      prevReferrals.map(r =>
        r.id === referralId
          ? { ...r, consentStatus: 'agreed', status: 'Pending Review', facility: data.facility, region: data.region, constituency: data.constituency }
          : r
      )
    );
    window.history.replaceState(null, '', '/referrals');
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

  if (!loading && referrals.length === 0) {
     return (
        <div className="mt-8 text-center flex flex-col items-center justify-center rounded-2xl bg-card p-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-card-foreground">
            You have no active referrals.
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Referrals will appear here after you complete a screening and give consent.
          </p>
        </div>
      );
  }

  return (
    <>
      {pendingUserReferral && (
        <div className="mb-12">
          <ReferralConsentForm
            referral={pendingUserReferral}
            onConsentSubmit={handleConsentSubmit}
          />
          <Separator className="my-12" />
        </div>
      )}

      {displayReferrals.length > 0 && (
        <>
          <h2 className="text-3xl font-semibold text-primary mb-6">Your Approved Referrals</h2>
          <ScrollArea>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pr-4">
              {displayReferrals.map((referral) => (
                <Card key={referral.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col bg-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-headline text-primary">{referral.patientName}</CardTitle>
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

                    <p className="text-sm font-semibold text-card-foreground/90 mb-1">Referral Reason:</p>
                    <p className="text-sm text-card-foreground/80 line-clamp-4">{referral.referralMessage}</p>
                    {referral.notes && (
                      <>
                        <Separator className="my-3" />
                        <p className="text-sm font-semibold text-card-foreground/90 mb-1">Notes:</p>
                        <p className="text-sm text-card-foreground/80 italic">{referral.notes}</p>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-4 mt-auto">
                    <p className="text-xs text-muted-foreground">ID: {referral.id}</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </>
  );
}
