'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

type UserRole = 'seeker' | 'company';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState<UserRole>('seeker');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const [email, setEmail] = useState(role === 'seeker' ? 'seeker@example.com' : 'company@example.com');
  const [password, setPassword] = useState('password');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTabChange = (value: string) => {
    const r = value as UserRole;
    setRole(r);
    setEmail(r === 'seeker' ? 'seeker@example.com' : 'company@example.com');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter email and password');
      }

      signIn(role);
      
    } catch (err: any) {
      setError(err?.message ?? t('signIn.authFailed'));
    } finally {
      setLoading(false);
    }
  };

  const AuthForm = () => (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">{t('signIn.email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('signIn.emailPlaceholder')}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">{t('signIn.password')}</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
        {loading ? t('signIn.processing') : mode === 'signin' ? t('signIn.signIn') : t('signIn.signUp')}
      </Button>

      <button
        type="button"
        onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
        className="text-sm text-primary mt-2"
      >
        {mode === 'signin' ? t('signIn.noAccount') : t('signIn.hasAccount')}
      </button>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <Tabs defaultValue="seeker" onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seeker">{t('signIn.jobSeeker')}</TabsTrigger>
            <TabsTrigger value="company">{t('signIn.company')}</TabsTrigger>
          </TabsList>

          <TabsContent value="seeker">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>{mode === 'signin' ? t('signIn.signInAsSeekerTitle') : t('signIn.signUpAsSeekerTitle')}</CardTitle>
                <CardDescription>{t('signIn.seekerDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>{mode === 'signin' ? t('signIn.signInAsCompanyTitle') : t('signIn.signUpAsCompanyTitle')}</CardTitle>
                <CardDescription>{t('signIn.companyDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
