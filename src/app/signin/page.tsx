"use client";

import { useState } from "react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const { signIn } = useAuth();
  const [role, setRole] = useState<UserRole>("seeker");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(role);
  };
  
  const onTabChange = (value: string) => {
    setRole(value as UserRole);
  }

  const AuthForm = () => (
    <form onSubmit={handleSignIn}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            defaultValue={role === 'seeker' ? 'seeker@example.com' : 'company@example.com'}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input id="password" type="password" required defaultValue="password" />
        </div>
        <Button type="submit" className="w-full rounded-2xl">
          تسجيل الدخول
        </Button>
      </div>
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
                <CardTitle>تسجيل دخول كباحث عن عمل</CardTitle>
                <CardDescription>
                  ابحث عن وظيفتك التالية الآن.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="company">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>تسجيل دخول كشركة</CardTitle>
                <CardDescription>
                  اعثر على أفضل المواهب لشركتك.
                </CardDescription>
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
