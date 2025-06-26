
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
import { FileText, Trash2, Mail, MessageSquare, CalendarClock } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSearchParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteReferralAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import type { ReferralConsentFormData } from '@/lib/schemas';
import { format } from 'date-fns';
import ScheduleAppointmentDialog from '@/components/referrals/schedule-appointment-dialog';


type ClientReferral = Omit<MockReferral, 'referralDate' | 'appointmentDateTime'> & {
  referralDate: string;
  appointmentDateTime?: Timestamp;
};

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
  const searchParams = useSearchParams();
  const pendingIdFromUrl = searchParams.get('pendingId');

  const [referrals, setReferrals] = useState<ClientReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralToDelete, setReferralToDelete] = useState<ClientReferral | null>(null);
  const { toast } = useToast();

  const MOCK_CURRENT_USER_ID = 'client-test-user';

  useEffect(() => {
    setLoading(true);
    const referralsCollection = collection(db, 'referrals');
    let q;

    if (role === 'admin') {
      q = query(referralsCollection, where('consentStatus', '==', 'agreed'), orderBy('referralDate', 'desc'));
    } else {
      q = query(referralsCollection, where('userId', '==', MOCK_CURRENT_USER_ID), orderBy('referralDate', 'desc'));
    }

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
    });

    return () => unsubscribe();
  }, [role]);

  const pendingUserReferral = useMemo(() => {
    if (role !== 'user') return null;

    if (pendingIdFromUrl) {
      const referral = referrals.find(r => r.id === pendingIdFromUrl);
      if (referral) return referral;
    }

    return referrals.find(r => r.consentStatus === 'pending');
  }, [role, referrals, pendingIdFromUrl]);

  const displayReferrals = useMemo(() => {
    if (role === 'user') {
      return referrals.filter(r => r.consentStatus === 'agreed');
    }
    return referrals;
  }, [role, referrals]);

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

  const handleDelete = async () => {
    if (!referralToDelete) return;

    const result = await deleteReferralAction(referralToDelete.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setReferralToDelete(null);
  };

  const pageTitle = role === 'admin' ? "Manage All Referrals" : "Your Referrals";
  const pageDescription = role === 'admin' ? "View and manage all consented referrals." : "Complete pending referrals and view your referral history.";

  const fullLocation = (referral: ClientReferral) => {
    return [referral.region, referral.constituency, referral.facility].filter(Boolean).join(', ');
  }

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
      ) : displayReferrals.length === 0 && (role === 'admin' || (role === 'user' && !pendingUserReferral)) ? (
        <div className="mt-8 text-center flex flex-col items-center justify-center rounded-2xl bg-card p-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-card-foreground">
            {role === 'admin' ? 'No consented referrals to display.' : 'You have no active referrals.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            {role === 'admin'
              ? 'Consented referrals from users will appear here once they are submitted.'
              : 'Referrals will appear here after you complete a screening and give consent.'}
          </p>
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
                    {role === 'admin' && (
                        <div className="flex items-center gap-2">
                            <ScheduleAppointmentDialog referral={referral} />
                            <UpdateReferralDialog referral={referral} />
                            <Button variant="outline" size="icon" className="text-destructive border-destructive hover:bg-destructive/10 h-9 w-9" onClick={() => setReferralToDelete(referral)}>
                                <span className="sr-only">Delete</span>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}

      <AlertDialog open={!!referralToDelete} onOpenChange={(open) => !open && setReferralToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the referral for "{referralToDelete?.patientName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReferralToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Yes, delete referral
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
