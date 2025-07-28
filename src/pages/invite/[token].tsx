import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/apis';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const AcceptInvitePage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirmation: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchInvite = async () => {
      setLoading(true);
      try {
        const res = await api.invitations.getInvitationByToken(token as string);
        setInvite(res.invite);
        setCompany(res.company);
        setForm(f => ({ ...f, email: res.invite.email }));
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Invalid or expired invite', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.first_name.trim() || !form.last_name.trim() || !form.password || !form.password_confirmation) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    
    // Validate password length
    if (form.password.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters long', variant: 'destructive' });
      return;
    }
    
    // Validate password confirmation
    if (form.password !== form.password_confirmation) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    
    setSubmitting(true);
    try {
      await api.invitations.acceptInvitation(token as string, {
        email: form.email,
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      });
      toast({ title: 'Success', description: 'Account created successfully! You can now log in.' });
      router.push('/auth/login');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to accept invite', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-muted">
        <Card className="w-full max-w-md">
          <CardContent className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading invitation details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-muted">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Accept Invitation</CardTitle>
          <p className="text-center text-muted-foreground">
            You've been invited to join <strong>{company?.name || 'Company'}</strong>
          </p>
          {invite?.role && (
            <p className="text-center text-sm text-muted-foreground">
              Role: <span className="capitalize">{invite.role}</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                disabled
                readOnly
                className="w-full bg-muted"
              />
              <p className="text-xs text-muted-foreground">This email was used for the invitation</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="Enter your last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full"
                placeholder="Enter your password"
              />
              <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full"
                placeholder="Confirm your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating Account...' : 'Accept Invite'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitePage; 