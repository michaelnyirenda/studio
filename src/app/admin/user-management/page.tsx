
"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, UserPlus, MoreHorizontal, Edit3, Trash2, ShieldCheck, UserCog } from 'lucide-react';
import { mockReferrals } from '@/lib/mock-data'; // Using referrals as a base for mock users

// Create mock user data
const mockUsers = mockReferrals.map((referral, index) => ({
  id: `user-${referral.id}`,
  name: referral.patientName.replace(/\s+\((HIV|GBV|PrEP)\)/, ''),
  email: `${referral.patientName.toLowerCase().replace(/\s+\((HIV|GBV|PrEP)\)/, '').replace(/\s+/g, '.')}@example.com`,
  role: index % 3 === 0 ? 'Admin' : (index % 3 === 1 ? 'Moderator' : 'User'),
  lastActive: `2024-07-${28 - index}`, // Mock last active date
  status: index % 4 === 0 ? 'Active' : 'Pending Activation',
}));
mockUsers.push({
    id: 'user-admin-001',
    name: 'Super Admin',
    email: 'super.admin@example.com',
    role: 'Super Admin',
    lastActive: '2024-07-29',
    status: 'Active'
});


export default function UserManagementPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="User Account Management"
        description="Oversee user accounts, roles, permissions, and activity."
      />
      
      <Card className="shadow-xl mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-primary flex items-center justify-between">
            <span>User List</span>
            <Button>
              <UserPlus className="mr-2 h-5 w-5" /> Add New User
            </Button>
          </CardTitle>
          <CardDescription>View, search, filter, and manage all platform users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search by name, email, or ID..." className="pl-10 w-full" />
            </div>
            <Select defaultValue="all_roles">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_roles">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all_statuses">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_activation">Pending Activation</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'Admin' || user.role === 'Super Admin' ? 'default' : user.role === 'Moderator' ? 'secondary' : 'outline'}
                      >
                        {user.role === 'Admin' && <UserCog className="mr-1 h-3 w-3"/>}
                        {user.role === 'Moderator' && <ShieldCheck className="mr-1 h-3 w-3"/>}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={user.status === 'Active' ? 'outline' : 'destructive'} className={user.status === 'Active' ? 'border-green-500 text-green-700' : ''}>
                        {user.status}
                       </Badge>
                    </TableCell>
                    <TableCell>{user.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem><Edit3 className="mr-2 h-4 w-4" /> Edit User</DropdownMenuItem>
                          <DropdownMenuItem>View Activity Log</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.role !== 'Super Admin' && <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete User</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">Showing {mockUsers.length} of {mockUsers.length} users.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12 text-center border-t pt-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">Prototype Notes</h2>
        <p className="text-muted-foreground">
          This is a mock user management interface. Full functionality (creating, editing, deleting users,
          managing roles/permissions, and real-time activity logs) requires backend integration,
          a robust authentication and authorization system.
        </p>
      </div>
    </div>
  );
}
