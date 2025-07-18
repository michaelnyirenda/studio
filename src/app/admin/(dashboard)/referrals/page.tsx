
"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Referral } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import UpdateReferralDialog from '@/components/referrals/update-referral-dialog';
import { useEffect, useState } from 'react';
import { FileText, Trash2, Mail, MessageSquare, CalendarClock, Download, Loader2, Search } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { deleteReferralAction, downloadReferralPdfAction } from '@/app/referrals/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';


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

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<ClientReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralToDelete, setReferralToDelete] = useState<ClientReferral | null>(null);
  const [loadingReferralId, setLoadingReferralId] = useState<string | null>(null);
  const { toast } = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedReferral, setSearchedReferral] = useState<ClientReferral | null>(null);


  useEffect(() => {
    setLoading(true);
    const referralsCollection = collection(db, 'referrals');
    const q = query(referralsCollection, where('consentStatus', '==', 'agreed'), orderBy('referralDate', 'desc'));

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
  }, []);

  const handleDelete = async () => {
    if (!referralToDelete) return;

    const result = await deleteReferralAction(referralToDelete.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      if (searchedReferral?.id === referralToDelete.id) {
        setSearchedReferral(null);
      }
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setReferralToDelete(null);
  };
  
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
      } catch (e) {
         toast({ title: "Error", description: "Failed to process PDF for download.", variant: "destructive" });
      }
    } else {
      toast({ title: "Error", description: result.message || "Failed to generate PDF.", variant: "destructive" });
    }
    setLoadingReferralId(null);
  };

  const handleSearchReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setSearchedReferral(null);
    
    try {
      const referralRef = doc(db, 'referrals', searchInput.trim());
      const referralSnap = await getDoc(referralRef);
      if (referralSnap.exists()) {
        const data = referralSnap.data();
        setSearchedReferral({
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

  const renderReferralCard = (referral: ClientReferral, isSearchedResult: boolean = false) => (
    <Card key={referral.id} className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col bg-card", isSearchedResult && "border-2 border-accent")}>
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
        <div className="flex items-center gap-2">
            <Button
            variant="outline"
            size="icon"
            className="text-accent border-accent hover:bg-accent/10 h-9 w-9"
            onClick={() => handleDownload(referral)}
            disabled={loadingReferralId === referral.id}
            >
            <span className="sr-only">Download</span>
            {loadingReferralId === referral.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
            <UpdateReferralDialog referral={referral} />
            <Button variant="outline" size="icon" className="text-destructive border-destructive hover:bg-destructive/10 h-9 w-9" onClick={() => setReferralToDelete(referral)}>
                <span className="sr-only">Delete</span>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
        </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Manage All Referrals"
        description="View and manage all consented referrals, or search for a specific one by ID."
      />

       <Card className="mb-8 shadow-xl">
            <CardHeader>
                <CardTitle>Find a Specific Referral</CardTitle>
                <CardDescription>Enter a referral ID to look up its details directly.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearchReferral} className="flex flex-col sm:flex-row gap-2">
                    <Input 
                        placeholder="Enter a referral ID..."
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

      {isSearching && (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {searchedReferral && (
        <div className="mb-8">
            <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Search Result</h2>
            <div className="max-w-md">
                 {renderReferralCard(searchedReferral, true)}
            </div>
        </div>
      )}

      {loading ? (
        <div className="mt-8 text-center">Loading referrals...</div>
      ) : referrals.length === 0 && !searchedReferral ? (
        <div className="mt-8 text-center flex flex-col items-center justify-center rounded-2xl bg-card p-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-card-foreground">
            No consented referrals to display.
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Consented referrals from users will appear here once they are submitted.
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-headline font-semibold text-primary mb-6">All Consented Referrals</h2>
          <ScrollArea>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pr-4">
              {referrals
                .filter(r => r.id !== searchedReferral?.id)
                .map((referral) => renderReferralCard(referral))}
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

    