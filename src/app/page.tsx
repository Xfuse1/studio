'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/search');
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-bold font-headline text-primary">
          أهلاً بك في بوابة التوظيف
        </h1>
      </div>
    </div>
  );
}
