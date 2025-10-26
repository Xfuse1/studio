"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SearchBar from "@/components/search/SearchBar";
import ResultsList from "@/components/search/ResultsList";
import { mockJobs, mockCandidates } from "@/lib/mock-data";
import { ToastAction } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

export type SearchParams = {
  q: string;
  loc: string;
  type: string;
  remote: boolean;
};

function SearchComponent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  
  const q = searchParams.get("q") || "";
  const loc = searchParams.get("loc") || "";

  useEffect(() => {
    if (q || loc) {
        handleSearch({
            q,
            loc,
            type: searchParams.get("type") || "all",
            remote: searchParams.get("remote") === "true",
        });
    }
  }, [q, loc, user]);

  const handleSearch = (params: SearchParams) => {
    setSearchAttempted(true);

    if (!user) {
      setResults([]);
      toast({
        title: "مستخدم غير مسجل",
        description: "الرجاء تسجيل الدخول للمتابعة والبحث عن الفرص.",
        action: (
          <ToastAction altText="Go to sign in" onClick={() => router.push("/signin")}>
            تسجيل الدخول
          </ToastAction>
        ),
      });
      return;
    }

    setLoading(true);
    setResults([]);

    // Simulate API call
    setTimeout(() => {
      let fetchedResults: any[] = [];
      if (user.role === 'seeker') {
        fetchedResults = mockJobs.filter(job => 
          job.title.toLowerCase().includes(params.q.toLowerCase()) &&
          job.location.toLowerCase().includes(params.loc.toLowerCase())
        );
      } else {
        fetchedResults = mockCandidates.filter(candidate => 
          (candidate.title.toLowerCase().includes(params.q.toLowerCase()) || 
           candidate.skills.some(skill => skill.toLowerCase().includes(params.q.toLowerCase()))) &&
          candidate.location.toLowerCase().includes(params.loc.toLowerCase())
        );
      }
      setResults(fetchedResults);
      setLoading(false);
    }, 1000);
  };
  
  const handleUrlUpdate = (params: SearchParams) => {
    const urlParams = new URLSearchParams();
    if(params.q) urlParams.set('q', params.q);
    if(params.loc) urlParams.set('loc', params.loc);
    if(params.type) urlParams.set('type', params.type);
    if(params.remote) urlParams.set('remote', String(params.remote));
    router.push(`/search?${urlParams.toString()}`);
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <section className="mb-12 animate-fade-in-up">
          <SearchBar onSearch={handleUrlUpdate} isLoading={loading} />
        </section>

        <section>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : searchAttempted && results.length > 0 ? (
            <>
              <h2 className="text-2xl font-headline font-bold mb-6">
                {user?.role === 'seeker' ? 'الوظائف المتاحة' : 'المرشحون'}
              </h2>
              <ResultsList results={results} role={user?.role} />
            </>
          ) : searchAttempted && !loading ? (
            <div className="text-center py-16 bg-card rounded-2xl shadow-sm">
                <p className="text-lg text-muted-foreground">لم يتم العثور على نتائج. حاول بكلمات بحث مختلفة.</p>
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl shadow-sm">
                <p className="text-lg text-muted-foreground">{user ? 'ابدأ البحث للعثور على النتائج' : 'الرجاء تسجيل الدخول لبدء البحث'}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <SearchComponent />
    </Suspense>
  )
}
