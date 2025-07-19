
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Footer from '@/components/shared/footer';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for reset password dialog
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Standard Firebase Authentication
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Success', description: 'Logged in successfully.' });
      router.push('/admin/dashboard');
    } catch (authError: any) {
        let errorMessage = 'An unknown error occurred.';
        switch (authError.code) {
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed login attempts. Please try again later.';
                break;
            default:
                console.error('Login error:', authError);
        }
      setError(errorMessage);
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: "Error", description: "Please enter an email address.", variant: "destructive" });
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Check Your Email",
        description: `A password reset link has been sent to ${resetEmail}.`,
      });
      setIsResetDialogOpen(false);
      setResetEmail('');
    } catch (authError: any) {
        let errorMessage = "Failed to send reset email. Please try again.";
        if (authError.code === 'auth/invalid-email') {
            errorMessage = "The email address is not valid.";
        } else if (authError.code === 'auth/user-not-found') {
            // To prevent user enumeration, we can show a generic message.
            errorMessage = `If an account exists for ${resetEmail}, a password reset link has been sent.`;
             toast({
                title: "Check Your Email",
                description: errorMessage,
            });
            setIsResetDialogOpen(false);
            setResetEmail('');
            setIsResetting(false);
            return;
        }
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
        setIsResetting(false);
    }
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                   <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                          <Button variant="link" type="button" className="p-0 h-auto text-xs">
                            Forgot Password?
                          </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                          <form onSubmit={handlePasswordReset}>
                              <DialogHeader>
                                  <DialogTitle>Reset Password</DialogTitle>
                                  <DialogDescription>
                                      Enter your email address below. If an account exists, we'll send you a link to reset your password.
                                  </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="reset-email" className="text-right">
                                          Email
                                      </Label>
                                      <Input
                                          id="reset-email"
                                          type="email"
                                          value={resetEmail}
                                          onChange={(e) => setResetEmail(e.target.value)}
                                          className="col-span-3"
                                          placeholder="you@example.com"
                                          required
                                      />
                                  </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                  <Button type="submit" disabled={isResetting}>
                                      {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                      Send Reset Link
                                  </Button>
                              </DialogFooter>
                          </form>
                      </DialogContent>
                  </Dialog>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
