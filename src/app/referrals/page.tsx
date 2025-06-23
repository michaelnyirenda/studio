
"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockReferrals as initialReferrals, type MockReferral } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import UpdateReferralDialog from '@/components/referrals/update-referral-dialog';
import ReferralConsentForm from '@/components/referrals/referral-consent-form';
import { useRole } from '@/contexts/role-context';
import { useEffect, useState, useMemo } from 'react';

function getStatusVariant(status: MockReferral['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
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
  const [referrals, setReferrals] = useState<MockReferral[]>(initialReferrals);
  
  // In a real app, this would come from an authentication context.
  // We'll hardcode one of the mock users to simulate a logged-in user.
  const MOCK_CURRENT_USER = 'John Doe (HIV)';

  const pendingUserReferral = useMemo(() => {
    if (role === 'user') {
      // Find the pending referral for the SPECIFIC user.
      return referrals.find(r => r.patientName === MOCK_CURRENT_USER && r.consentStatus === 'pending');
    }
    return null;
  }, [role, referrals]);

  const displayReferrals = useMemo(() => {
    if (role === 'user') {
      // For a user, show only their own agreed referrals.
      return referrals.filter(r => r.patientName === MOCK_CURRENT_USER && r.consentStatus === 'agreed');
    }
    // For an admin, show all agreed referrals from all users.
    return referrals.filter(r => r.consentStatus === 'agreed');
  }, [role, referrals]);
  
  const handleConsentSubmit = (referralId: string, facility: string) => {
    setReferrals(prevReferrals =>
      prevReferrals.map(r =>
        r.id === referralId
          ? { ...r, consentStatus: 'agreed', facility: facility }
          : r
      )
    );
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
      
      {displayReferrals.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-lg text-muted-foreground">
            {role === 'user' ? 'You have no active referrals.' : 'No consented referrals to display.'}
          </p>
          {role === 'user' && !pendingUserReferral && (
             <p className="text-sm text-muted-foreground mt-2">
              Referrals will appear here after you complete a screening and give consent.
            </p>
          )}
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-primary mb-4">{role === 'user' ? "Your Approved Referrals" : "Consented Referrals"}</h2>
          <ScrollArea className="h-[calc(100vh-350px)]"> 
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pr-4">
              {displayReferrals.map((referral) => (
                <Card key={referral.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-headline text-primary">{referral.patientName}</CardTitle>
                      <Badge variant={getStatusVariant(referral.status)} className="ml-2 whitespace-nowrap">
                        {referral.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground pt-1">
                      Referred on: {referral.referralDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm font-semibold text-foreground/90 mb-1">Referred to:</p>
                    <p className="text-sm text-foreground/80 mb-3">{referral.facility || 'N/A'}</p>
                    
                    <p className="text-sm font-semibold text-foreground/90 mb-1">Referral Reason:</p>
                    <p className="text-sm text-foreground/80 line-clamp-4">{referral.referralMessage}</p>
                    {referral.notes && (
                      <>
                        <Separator className="my-3" />
                        <p className="text-sm font-semibold text-foreground/90 mb-1">Notes:</p>
                        <p className="text-sm text-foreground/80 italic">{referral.notes}</p>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-4">
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
