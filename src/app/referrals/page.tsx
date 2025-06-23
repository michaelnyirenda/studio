"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MockReferral } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import UpdateReferralDialog from '@/components/referrals/update-referral-dialog';
import ReferralConsentForm from '@/components/referrals/referral-consent-form';
import { useRole } from '@/contexts/role-context';
import { useEffect, useState, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// This function now correctly handles the "Pending Consent" status
function getStatusVariant(status: MockReferral['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
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

export default function ReferralsPage() {
  const { role } = useRole();
  const [referrals, setReferrals] = useState<MockReferral[]>([]);
  const [loading, setLoading] = useState(true);
  
  // In a real app, this would come from your Firebase Auth context
  const MOCK_CURRENT_USER_ID = 'client-test-user'; 

  useEffect(() => {
    setLoading(true);
    const referralsCollection = collection(db, 'referrals');
    let q;

    if (role === 'admin') {
      // Admin sees all referrals that have been consented to
      q = query(referralsCollection, where('consentStatus', '==', 'agreed'), orderBy('referralDate', 'desc'));
    } else {
      // Client sees all of their own referrals
      q = query(referralsCollection, where('userId', '==', MOCK_CURRENT_USER_ID), orderBy('referralDate', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const referralsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          referralDate: (data.referralDate as Timestamp)?.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) || 'N/A',
        } as MockReferral;
      });
      setReferrals(referralsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching referrals: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]);
  
  const pendingUserReferral = useMemo(() => {
    if (role === 'user') {
      return referrals.find(r => r.consentStatus === 'pending');
    }
    return null;
  }, [role, referrals]);

  const displayReferrals = useMemo(() => {
    if (role === 'user') {
      return referrals.filter(r => r.consentStatus === 'agreed');
    }
    return referrals;
  }, [role, referrals]);
  
  const handleConsentSubmit = async (referralId: string, facility: string) => {
    const referralRef = doc(db, 'referrals', referralId);
    await updateDoc(referralRef, {
      consentStatus: 'agreed',
      facility: facility,
      status: 'Pending Review'
    });
  };

  const pageTitle = role === 'admin' ? "Manage All Referrals" : "Your Referrals";
  const pageDescription = role === 'admin' ? "View and manage all consented referrals." : "Complete pending referrals and view your referral history.";

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
      />

      {role === 'user' && pendingUserReferral && (
        <div className="mb-12">
          <ReferralConsentForm
            referral={pendingUserReferral}
            onConsentSubmit={handleConsentSubmit}
          />
          <Separator className="my-12" />
        </div>
      )}
      
      {loading ? (
        <div className="mt-8 text-center">Loading referrals...</div>
      ) : displayReferrals.length === 0 ? (
        <div className="mt-8 text-center flex flex-col items-center justify-center rounded-2xl bg-card p-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-card-foreground">
            {role === 'user' ? 'You have no active referrals.' : 'No consented referrals to display.'}
          </p>
          {role === 'user' && !pendingUserReferral && (
             <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Referrals will appear here after you complete a screening and give consent.
            </p>
          )}
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-semibold text-primary mb-6">{role === 'user' ? "Your Approved Referrals" : "Consented Referrals"}</h2>
          <ScrollArea className="h-[calc(100vh-350px)]"> 
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
                    <CardDescription className="text-sm text-muted-foreground pt-1">
                      Referred on: {referral.referralDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm font-semibold text-card-foreground/90 mb-1">Referred to:</p>
                    <p className="text-sm text-accent font-medium mb-3">{referral.facility || 'N/A'}</p>
                    
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
                    {role === 'admin' && <UpdateReferralDialog referral={referral} />}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}