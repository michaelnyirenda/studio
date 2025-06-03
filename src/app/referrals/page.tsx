
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockReferrals, type MockReferral } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

function getStatusVariant(status: MockReferral['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Pending Review':
      return 'destructive';
    case 'Contacted':
      return 'outline';
    case 'Follow-up Scheduled':
      return 'secondary';
    case 'Closed':
      return 'default'; // Or a success-like variant if available/customized
    default:
      return 'default';
  }
}


export default function ReferralsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Track Referrals"
        description="View and manage referrals generated from HIV screenings."
      />
      
      {mockReferrals.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-lg text-muted-foreground">No referrals to display at the moment.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Referrals will appear here after users complete the HIV screening and a referral is indicated.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)] mt-8"> {/* Adjust height as needed */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pr-4">
            {mockReferrals.map((referral) => (
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
                  <p className="text-sm font-semibold text-foreground/90 mb-1">Referral Details:</p>
                  <p className="text-sm text-foreground/80 line-clamp-4">{referral.referralMessage}</p>
                  {referral.notes && (
                    <>
                      <Separator className="my-3" />
                      <p className="text-sm font-semibold text-foreground/90 mb-1">Notes:</p>
                      <p className="text-sm text-foreground/80 italic">{referral.notes}</p>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  {/* Add actions here if needed, e.g., <Button>Update Status</Button> */}
                  <p className="text-xs text-muted-foreground">ID: {referral.id}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
