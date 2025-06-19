
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileSpreadsheet, LineChart, Users, MessageSquareText, ShieldAlert, BarChart3, Download, Search, Filter, UserCog, Trash2, Edit3 } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Administrator Dashboard"
        description="Access reports, data exports, and administrative functions. All sections below are UI mockups."
      />
      
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 mt-8">

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-primary flex items-center">
              <BarChart3 className="mr-2 h-6 w-6" /> Screening Data & Analytics
            </CardTitle>
            <CardDescription>View aggregated screening results and trends. (Mock UI)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Select defaultValue="hiv_summary">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hiv_summary">HIV Screening Summary</SelectItem>
                  <SelectItem value="gbv_summary">GBV Screening Summary</SelectItem>
                  <SelectItem value="prep_summary">PrEP Screening Summary</SelectItem>
                  <SelectItem value="trends_over_time">Trends Over Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </div>
            <div className="bg-muted/30 p-6 rounded-md text-center">
              <p className="text-muted-foreground">Chart/Graph Placeholder for Screening Data</p>
              <LineChart className="h-32 w-32 mx-auto text-muted-foreground/50 my-4" />
              <p className="text-sm text-muted-foreground">Detailed visualizations will be available here.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-primary flex items-center">
              <LineChart className="mr-2 h-6 w-6" /> Referral Tracking
            </CardTitle>
            <CardDescription>Monitor referral statuses and turnaround rates. (Mock UI)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Search referrals..." className="flex-grow" />
              <Select defaultValue="pending">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe (HIV)</TableCell>
                  <TableCell>2024-08-01</TableCell>
                  <TableCell><Badge variant="destructive">Pending</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Jane Smith (GBV)</TableCell>
                  <TableCell>2024-08-02</TableCell>
                  <TableCell><Badge variant="outline">Contacted</Badge></TableCell>
                   <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>Alex Lee (PrEP)</TableCell>
                  <TableCell>2024-08-03</TableCell>
                  <TableCell><Badge variant="secondary">Follow-up</Badge></TableCell>
                   <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-2 text-center">Showing 3 of X mock referrals.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-primary flex items-center">
              <FileSpreadsheet className="mr-2 h-6 w-6" /> Data Export
            </CardTitle>
            <CardDescription>Export screening, referral, or forum data. (Mock UI)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select defaultValue="screening_data">
              <SelectTrigger>
                <SelectValue placeholder="Select Data Type to Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="screening_data">Screening Data (All)</SelectItem>
                <SelectItem value="hiv_screening">HIV Screening Data</SelectItem>
                <SelectItem value="gbv_screening">GBV Screening Data</SelectItem>
                <SelectItem value="prep_screening">PrEP Screening Data</SelectItem>
                <SelectItem value="referral_data">Referral Data</SelectItem>
                <SelectItem value="forum_posts">Forum Posts</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="csv">
              <SelectTrigger>
                <SelectValue placeholder="Select Export Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel (XLSX)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="mr-2 h-5 w-5" /> Generate & Download Report
            </Button>
            <p className="text-xs text-muted-foreground">Data export functionality requires backend implementation.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-primary flex items-center">
              <MessageSquareText className="mr-2 h-6 w-6" /> Forum Management
            </CardTitle>
            <CardDescription>Oversee forum discussions and manage posts. (Mock UI)</CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder="Search posts by keyword or author..." className="mb-4" />
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-3">
              <div className="p-3 bg-muted/30 rounded-md">
                <h4 className="font-semibold">Getting Started with #BeFree</h4>
                <p className="text-xs text-muted-foreground">By #BeFree Admin - 2024-07-29</p>
                <div className="mt-2 space-x-2">
                  <Button variant="outline" size="sm">View Post</Button>
                  <Button variant="destructive" size="sm"><Trash2 className="mr-1 h-3 w-3"/> Delete</Button>
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-md">
                <h4 className="font-semibold">Tips for Effective Online Learning</h4>
                <p className="text-xs text-muted-foreground">By Community Educator - 2024-07-28</p>
                 <div className="mt-2 space-x-2">
                  <Button variant="outline" size="sm">View Post</Button>
                  <Button variant="destructive" size="sm"><Trash2 className="mr-1 h-3 w-3"/> Delete</Button>
                </div>
              </div>
            </div>
             <p className="text-xs text-muted-foreground mt-2 text-center">Showing 2 of X mock forum posts.</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-primary flex items-center">
              <ShieldAlert className="mr-2 h-6 w-6" /> User Chat Support Interface
            </CardTitle>
            <CardDescription>Respond to user queries from the chat system. (Mock UI)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[350px]">
            <div className="border rounded-t-md p-2 bg-secondary/50">
              <h3 className="font-medium">Chat with: John Doe</h3>
            </div>
            <div className="flex-grow border-x border-b p-4 space-y-3 overflow-y-auto">
              <div className="text-sm p-2 rounded-md bg-muted w-fit max-w-[80%]">User: Hi, I need help with my referral.</div>
              <div className="text-sm p-2 rounded-md bg-primary text-primary-foreground ml-auto w-fit max-w-[80%]">Admin: Hello John, I can help with that. What's your referral ID?</div>
            </div>
            <div className="border-t p-2 flex gap-2">
              <Textarea placeholder="Type your reply as admin..." rows={1} className="flex-grow resize-none" />
              <Button size="sm" className="self-end">Send</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">This is a simplified mock. Full chat interface on /chat page.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-primary flex items-center">
              <UserCog className="mr-2 h-6 w-6" /> User Management
            </CardTitle>
            <CardDescription>Manage user accounts, roles, and permissions. (Mock UI)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Search users by name or email..." className="flex-grow" />
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Filter by Role
              </Button>
            </div>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>john.doe@example.com</TableCell>
                  <TableCell><Badge>User</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>Admin User</TableCell>
                  <TableCell>admin@example.com</TableCell>
                  <TableCell><Badge variant="secondary">Admin</Badge></TableCell>
                   <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-2 text-center">Showing 2 of X mock users.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center border-t pt-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">Prototype Notes</h2>
        <p className="text-muted-foreground">
          The interfaces above are frontend mockups to demonstrate potential administrator views and tools.
          Full implementation of these features (data storage, aggregation, real-time updates, user authentication, and secure actions) requires significant backend development, database integration, and a comprehensive authentication system.
        </p>
      </div>
    </div>
  );

    