"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Briefcase, Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

const Header = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const changeLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-headline">{t('header.title')}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button onClick={changeLanguage} variant="ghost" size="icon" className="rounded-full">
            <span className="text-sm font-semibold">{i18n.language === 'ar' ? 'EN' : 'ع'}</span>
          </Button>
          {isClient && (
            <>
              {user ? (
                <Button onClick={signOut} variant="outline" className="rounded-2xl">
                  {t('header.signOut')}
                </Button>
              ) : (
                <Button asChild className="rounded-2xl">
                  <Link href="/signin">{t('header.signIn')}</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
