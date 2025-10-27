'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

import SearchBar from '@/components/search/SearchBar';
import ResultsList from '@/components/search/ResultsList';
import { mockJobs, mockCandidates } from '@/lib/mock-data';

export type SearchParams = {
  q: string;
  loc: string;
  type: string;
  remote: boolean;
};

export default function SearchPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const performSearch = useCallback(async (params: SearchParams) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let searchResults: any[] = [];
      if (user.role === 'seeker') {
        // Search for jobs
        searchResults = mockJobs.filter(job => 
          (job.title.toLowerCase().includes(params.q.toLowerCase()) || 
           job.description.toLowerCase().includes(params.q.toLowerCase())) &&
          job.location.toLowerCase().includes(params.loc.toLowerCase())
        );
      } else {
        // Search for candidates
        searchResults = mockCandidates.filter(candidate => 
          (candidate.name.toLowerCase().includes(params.q.toLowerCase()) || 
           candidate.title.toLowerCase().includes(params.q.toLowerCase())) &&
          candidate.location.toLowerCase().includes(params.loc.toLowerCase())
        );
      }
      setResults(searchResults);
    } catch (err: any) {
      toast({
        title: 'فشل البحث',
        description: err?.message ?? 'حدث خطأ أثناء جلب النتائج.',
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Initial load based on user type
  useEffect(() => {
    if (user) {
      setLoading(true);
      setTimeout(() => {
        setResults(user.role === 'seeker' ? mockJobs : mockCandidates);
        setLoading(false);
      }, 500);
    } else {
      setResults([]);
    }
  }, [user]);

  const handleInteraction = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return false;
    }
    return true;
  };
  
  return (
    <>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12 animate-fade-in-up" onFocus={handleInteraction}>
            <SearchBar onSearch={performSearch} isLoading={loading} />
          </section>

          <section>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : user && results.length > 0 ? (
              <>
                <h2 className="text-2xl font-headline font-bold mb-6">
                  {user.role === 'seeker' ? 'الوظائف المتاحة' : 'المرشحون المتاحون'}
                </h2>
                <ResultsList results={results} role={user.role} />
              </>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl shadow-sm">
                <p className="text-lg text-muted-foreground">
                  {user ? 'لم يتم العثور على نتائج. حاول بكلمات بحث مختلفة.' : 'يرجى تسجيل الدخول للبحث وعرض النتائج.'}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>مطلوب تسجيل الدخول</AlertDialogTitle>
            <AlertDialogDescription>
              يجب عليك تسجيل الدخول أولاً لتتمكن من البحث وعرض النتائج.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/signin')}>
              الانتقال إلى صفحة تسجيل الدخول
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
