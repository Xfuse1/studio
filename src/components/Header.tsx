"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-headline">{'بوابة التوظيف'}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/" className="transition-colors hover:text-primary">
            الرئيسية
          </Link>
          <Link href="/search" className="transition-colors hover:text-primary">
            بحث
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <Button onClick={signOut} variant="outline" className="rounded-2xl">
              تسجيل الخروج
            </Button>
          ) : (
            <Button asChild className="rounded-2xl">
              <Link href="/signin">تسجيل الدخول</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
