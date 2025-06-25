
import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AnalyticsEmptyState({ type }: { type: string }) {
  return (
    <Card className="shadow-lg">
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        <Info className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-semibold text-muted-foreground">No {type} Data Available</p>
        <p className="text-sm text-muted-foreground">Screening data for this category will appear here once submitted by users.</p>
      </CardContent>
    </Card>
  );
}
