
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '@/components/search/SearchBar';
import ResultsList from '@/components/search/ResultsList';
import { mockJobs, mockCandidates } from '@/lib/mock-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';

export interface SearchParams {
  q: string;
  loc: string;
  type: string;
  remote: boolean;
}

export default function SearchPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const [currentRole, setCurrentRole] = useState<UserRole | undefined>(undefined);

  useEffect(() => {
     if(user) {
      setCurrentRole(user.role);
     } else {
      // Default to seeker if no user is logged in
      setCurrentRole('seeker');
     }
  }, [user]);

  const performSearch = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    setShowLoginPrompt(false);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    let results: any[] = [];
    if (currentRole === 'seeker') {
      results = mockJobs.filter(job => 
        job.title.toLowerCase().includes(params.q.toLowerCase()) &&
        job.location.toLowerCase().includes(params.loc.toLowerCase())
      );
    } else if (currentRole === 'company') {
       if (!user) {
        setShowLoginPrompt(true);
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      results = mockCandidates.filter(candidate => 
        (candidate.name.toLowerCase().includes(params.q.toLowerCase()) || 
         candidate.title.toLowerCase().includes(params.q.toLowerCase())) && 
        candidate.location.toLowerCase().includes(params.loc.toLowerCase())
      );
    }
    
    setSearchResults(results);
    setIsLoading(false);
  }, [user, currentRole]);


  useEffect(() => {
    const params: SearchParams = {
      q: searchParams.get('q') || '',
      loc: searchParams.get('loc') || '',
      type: searchParams.get('type') || 'all',
      remote: searchParams.get('remote') === 'true',
    };
    performSearch(params);
  }, [searchParams, performSearch]);

  const handleSearch = (params: SearchParams) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('q', params.q);
    url.searchParams.set('loc', params.loc);
    url.searchParams.set('type', params.type);
    url.searchParams.set('remote', String(params.remote));
    window.history.pushState({}, '', url);
    performSearch(params);
  };
  

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-center mb-2">
          {currentRole === 'company' ? 'ابحث عن أفضل المواهب' : 'اعثر على وظيفة أحلامك'}
        </h1>
        <p className="text-muted-foreground text-center text-lg">
          {currentRole === 'company' ? 'الآلاف من المرشحين المؤهلين في انتظارك.' : 'بوابتك إلى الفرص المهنية الواعدة.'}
        </p>
      </div>

      <div className="sticky top-[65px] z-30 bg-background/80 backdrop-blur-sm -mx-4 sm:mx-0 px-4 sm:px-0 py-4 mb-8">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {showLoginPrompt && (
         <Alert variant="default" className="max-w-2xl mx-auto rounded-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>مطلوب تسجيل الدخول</AlertTitle>
          <AlertDescription>
            لعرض المرشحين، يجب عليك تسجيل الدخول كشركة أولاً.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-card p-6 rounded-2xl shadow-md w-full animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-full mt-4"></div>
                <div className="h-4 bg-muted rounded w-5/6 mt-2"></div>
              </div>
          ))}
        </div>

      ) : searchResults.length > 0 ? (
        <ResultsList results={searchResults} role={currentRole} />
      ) : (
        !showLoginPrompt && (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-2">لم يتم العثور على نتائج</h2>
                <p className="text-muted-foreground">حاول توسيع نطاق البحث أو استخدام كلمات رئيسية مختلفة.</p>
            </div>
        )
      )}
    </div>
  );
}
