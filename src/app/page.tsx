'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Briefcase, FileText, Users, Building2, Search, Award } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/search');
    }, 3000); // 3 second delay

    return () => clearTimeout(timer);
  }, [router]);

  const iconClasses = "absolute text-primary/30 animate-float-1";

  return (
    <div className="flex items-center justify-center h-screen bg-background overflow-hidden">
      <div className="relative w-full h-full">
        {/* Floating Icons */}
        <Briefcase className={`${iconClasses} w-16 h-16 top-[15%] left-[10%] animate-float-1`} />
        <FileText className={`${iconClasses} w-12 h-12 top-[20%] right-[15%] animate-float-2`} />
        <Users className={`${iconClasses} w-20 h-20 bottom-[15%] left-[20%] animate-float-3`} />
        <Building2 className={`${iconClasses} w-14 h-14 bottom-[25%] right-[10%] animate-float-1`} />
        <Search className={`${iconClasses} w-10 h-10 top-[50%] left-[30%] animate-float-2`} />
        <Award className={`${iconClasses} w-16 h-16 top-[60%] right-[25%] animate-float-3`} />
      </div>
      <div className="text-center animate-fade-in absolute flex flex-col items-center">
         <div className="p-4 bg-primary/10 rounded-full mb-6 animate-pulse">
            <Briefcase className="w-16 h-16 text-primary" />
         </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">
          {t('splash.welcome')}
        </h1>
        <p className="text-lg text-muted-foreground">
            {t('search.yourGateway')}
        </p>
      </div>
    </div>
  );
}
