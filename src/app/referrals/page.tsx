import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ReferralsList from '@/components/referrals/referrals-list';
import PageHeader from '@/components/shared/page-header';

export default function ReferralsPage() {
    return (
        <div className="container mx-auto py-8 px-4 pb-20">
            <PageHeader
                title="Your Referrals"
                description="Complete pending referrals and view your referral history."
            />
            <Suspense fallback={
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            }>
                <ReferralsList />
            </Suspense>
        </div>
    );
}
