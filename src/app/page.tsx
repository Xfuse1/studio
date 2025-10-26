"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SplashIntro() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/search");
    }, 2500); // Auto-navigate after 2.5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  const handleStart = () => {
    router.push("/search");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center bg-secondary">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full animate-float-1 filter blur-xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/20 rounded-full animate-float-2 filter blur-2xl"></div>
      <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-primary/10 rounded-full animate-float-3 filter blur-xl"></div>
      
      <div className="z-10 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-headline font-bold text-foreground">
          أهلاً بك في Employed
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          ابحث عن فرصتك أو مرشحك القادم.
        </p>
        <Button
          onClick={handleStart}
          className="mt-8 rounded-2xl px-8 py-6 text-lg"
          size="lg"
        >
          ابدأ
        </Button>
      </div>
    </div>
  );
}
