
"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockReferrals, type MockReferral } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import UpdateReferralDialog from '@/components/referrals/update-referral-dialog';
import { useRole } from '@/contexts/role-context';
import { useEffect, useState } from 'react';

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
  const [displayReferrals, setDisplayReferrals] = useState<MockReferral[]>(mockReferrals);

  useEffect(() => {
    if (role === 'user' && mockReferrals.length > 0) {
      setDisplayReferrals([mockReferrals[0]]);
    } else {
      setDisplayReferrals(mockReferrals);
    }
  }, [role]);

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title={role === 'admin' ? "Manage All Referrals" : "Your Referral"}
        description={role === 'admin' ? "View and manage all referrals." : "View your referral generated from HIV screening."}
      />
      
      {displayReferrals.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-lg text-muted-foreground">No referrals to display at the moment.</p>
          {role === 'user' && (
            <p className="text-sm text-muted-foreground mt-2">
              Your referral will appear here if one is generated after an HIV screening.
            </p>
          )}
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)] mt-8 mb-16"> {/* Adjusted height for potential FAB */}
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
      )}
    </div>
  );
}
