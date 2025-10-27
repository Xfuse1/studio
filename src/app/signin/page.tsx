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

type UserRole = 'seeker' | 'company';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  // تبويبات الدور
  const [role, setRole] = useState<UserRole>('seeker');

  // وضع الشاشة: تسجيل دخول أم إنشاء حساب
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // حقول النموذج
  const [email, setEmail] = useState(role === 'seeker' ? 'seeker@example.com' : 'company@example.com');
  const [password, setPassword] = useState('password');

  // حالة عامة
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTabChange = (value: string) => {
    const r = value as UserRole;
    setRole(r);
    // مجرد قيمة افتراضية للمثال – احذفيها لو عايزة
    setEmail(r === 'seeker' ? 'seeker@example.com' : 'company@example.com');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // In a real app, you would validate credentials here
      if (!email || !password) {
        throw new Error('Please enter email and password');
      }

      // Use the mock signIn function from AuthContext
      signIn(role);
      
    } catch (err: any) {
      setError(err?.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const AuthForm = () => (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">كلمة المرور</Label>
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
        {loading ? 'جارٍ المعالجة…' : mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
      </Button>

      <button
        type="button"
        onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
        className="text-sm text-primary mt-2"
      >
        {mode === 'signin' ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب؟ سجّل الدخول'}
      </button>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <Tabs defaultValue="seeker" onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seeker">باحث عن عمل</TabsTrigger>
            <TabsTrigger value="company">شركة</TabsTrigger>
          </TabsList>

          <TabsContent value="seeker">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>{mode === 'signin' ? 'تسجيل دخول كباحث عن عمل' : 'إنشاء حساب كباحث عن عمل'}</CardTitle>
                <CardDescription>ابحث عن وظيفتك التالية الآن.</CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>{mode === 'signin' ? 'تسجيل دخول كشركة' : 'إنشاء حساب كشركة'}</CardTitle>
                <CardDescription>اعثر على أفضل المواهب لشركتك.</CardDescription>
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
