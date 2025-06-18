
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, LineChart, Users } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Administrator Dashboard"
        description="Access reports, data exports, and administrative functions."
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">Screening Data</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View aggregated screening results and trends. Export functionality for detailed analysis is planned.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">Referral Tracking</CardTitle>
            <LineChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor referral statuses and turnaround rates. Data export for reporting will be available in a future update.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-primary">Data Export (Excel)</CardTitle>
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comprehensive data export to formats like Excel for screenings and referrals is a planned feature.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-primary mb-4">Feature Roadmap</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 inline-block text-left">
          <li>Full data aggregation and visualization tools.</li>
          <li>Secure role-based access control.</li>
          <li>User management interface.</li>
          <li>Direct admin responses in the chat system.</li>
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          The features described above are currently in a conceptual phase for this prototype.
          Full implementation requires backend development and database integration.
        </p>
      </div>
    </div>
  );
}
