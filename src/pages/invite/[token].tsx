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
    setSubmitting(true);
    try {
      await api.invitations.acceptInvitation(token as string, {
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      });
      toast({ title: 'Success', description: 'Account created! You can now log in.' });
      router.push('/login');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to accept invite', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  if (!invite) {
    return <div className="flex justify-center items-center h-96">Invite not found or expired.</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invitation to {company?.name || 'Company'}</CardTitle>
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
                className="w-full"
              />
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
                className="w-full"
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