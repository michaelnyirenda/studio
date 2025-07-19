
"use client";

import { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Trash2, KeyRound, UserPlus, Loader2, UserCog, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getAllAdmins,
  createAdminUser,
  deleteAdminUser,
  changeAdminPassword,
  updateAdminUser,
  AdminUser,
} from './actions';


export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for dialogs
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // State for forms
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const adminUsers = await getAllAdmins();
      setUsers(adminUsers);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch admin users.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createAdminUser(newUser.email, newUser.password, newUser.name);
      if (result.success) {
        toast({ title: 'Success', description: `Admin user ${newUser.email} created.` });
        setIsAddUserOpen(false);
        setNewUser({ name: '', email: '', password: '' });
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    setIsSubmitting(true);
    try {
      const result = await updateAdminUser(userToEdit.uid, userToEdit.email || '', userToEdit.displayName || '');
      if (result.success) {
        toast({ title: 'Success', description: `User ${userToEdit.email} updated.` });
        setIsEditUserOpen(false);
        setUserToEdit(null);
        fetchUsers(); // Refresh
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      const result = await deleteAdminUser(userToDelete.uid);
      if (result.success) {
        toast({ title: 'Success', description: `Admin user ${userToDelete.email} deleted.` });
        setUserToDelete(null);
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit || !newPassword) return;
    setIsSubmitting(true);
    try {
      const result = await changeAdminPassword(userToEdit.uid, newPassword);
      if (result.success) {
        toast({ title: 'Success', description: `Password for ${userToEdit.email} updated.` });
        setIsChangePasswordOpen(false);
        setUserToEdit(null);
        setNewPassword('');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openEditDialog = (user: AdminUser) => {
    setUserToEdit(user);
    setIsEditUserOpen(true);
  };
  
  const openChangePasswordDialog = (user: AdminUser) => {
    setUserToEdit(user);
    setIsChangePasswordOpen(true);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      (user.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="User Account Management"
        description="Oversee and manage administrator accounts for the platform."
      />
      
      <Card className="shadow-xl mt-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <UserCog /> Admin Users
              </CardTitle>
              <CardDescription>Create, update, and remove administrator accounts.</CardDescription>
            </div>
             <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-5 w-5" /> Add New Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Admin User</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new admin account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser}>
                  <div className="grid gap-4 py-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name-add" className="text-right">Name</Label>
                      <Input id="name-add" value={newUser.name} onChange={(e) => setNewUser(s => ({...s, name: e.target.value}))} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email-add" className="text-right">Email</Label>
                      <Input id="email-add" type="email" value={newUser.email} onChange={(e) => setNewUser(s => ({...s, email: e.target.value}))} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password-add" className="text-right">Password</Label>
                      <Input id="password-add" type="password" value={newUser.password} onChange={(e) => setNewUser(s => ({...s, password: e.target.value}))} className="col-span-3" required minLength={6} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create User
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
           <div className="mb-4">
            <Input 
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Last Logged In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-[32px] rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.displayName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.createdOn}</TableCell>
                    <TableCell>{user.lastSignIn}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                             <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit User
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => openChangePasswordDialog(user)}>
                              <KeyRound className="mr-2 h-4 w-4" /> Change Password
                           </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setUserToDelete(user)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No admin users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Alert Dialog for Deleting User */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the admin user "{userToDelete?.email}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog for Editing User */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the details for {userToEdit?.displayName}.
            </DialogDescription>
          </DialogHeader>
          {userToEdit && (
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name-edit" className="text-right">Name</Label>
                  <Input id="name-edit" value={userToEdit.displayName || ''} onChange={(e) => setUserToEdit(u => u ? {...u, displayName: e.target.value} : null)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email-edit" className="text-right">Email</Label>
                  <Input id="email-edit" type="email" value={userToEdit.email || ''} onChange={(e) => setUserToEdit(u => u ? {...u, email: e.target.value} : null)} className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>


      {/* Dialog for Updating Password */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {userToEdit?.email}. The user will be logged out and will need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-password" className="text-right">New Password</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" required minLength={6} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    