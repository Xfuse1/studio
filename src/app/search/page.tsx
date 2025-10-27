'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '@/components/search/SearchBar';
import ResultsList from '@/components/search/ResultsList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export interface SearchParams {
  q: string;
  loc: string;
  type: string;
  remote: boolean;
}

export default function SearchPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    console.log(`[performSearch] Started for role: ${currentRole}`, { params });
  
    if (!supabase) {
      toast({
        title: 'فشل الاتصال بالداتا بيز',
        description: 'تأكد من إعداد متغيرات البيئة الخاصة بـ Supabase بشكل صحيح.',
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
  
    try {
      if (currentRole === 'seeker') {
        let query = supabase
          .from('jobs')
          .select('*, companies (name_ar, name_en)')
          .eq('is_active', true);
  
        if (params.q) {
          query = query.ilike('title', `%${params.q}%`);
        }
        if (params.loc) {
          query = query.ilike('location', `%${params.loc}%`);
        }
  
        const { data, error } = await query;
  
        if (error) {
          throw error;
        }
  
        const adaptedJobs = data.map(job => ({
          id: job.id,
          title: job.title,
          company: (job.companies as any)?.name_ar || (job.companies as any)?.name_en || 'شركة غير معروفة',
          location: job.location,
          description: job.description,
          postedAt: job.created_at,
          logo: (job.companies as any)?.logo_url || 'company-logo-1', // Fallback to placeholder
        }));
  
        setSearchResults(adaptedJobs);

      } else if (currentRole === 'company') {
        console.log('[performSearch] Company role detected. Preparing to search for candidates.');
        if (!user) {
          setShowLoginPrompt(true);
          setSearchResults([]);
          setIsLoading(false);
          console.log('[performSearch] User not logged in as Company. Showing login prompt.');
          return;
        }

        let query = supabase.from('seeker_profiles').select('*');

        // Combined search for main query parameter 'q'
        if (params.q) {
            const searchQuery = `%${params.q}%`;
            console.log(`[performSearch] Applying main search filter: ${searchQuery}`);
            query = query.or(
              `full_name.ilike.${searchQuery},` +
              `job_title.ilike.${searchQuery},` +
              `country.ilike.${searchQuery},` +
              `email.ilike.${searchQuery}`
            );
        }
        // Separate search for location parameter 'loc'
        if (params.loc) {
            const locQuery = `%${params.loc}%`;
            console.log(`[performSearch] Applying location filter: ${locQuery}`);
            query = query.ilike('country', locQuery);
        }

        console.log('[performSearch] Executing Supabase query for candidates...');
        const { data, error } = await query;

        if (error) {
            console.error('[performSearch] Supabase query error:', error);
            throw error;
        }
        console.log(`[performSearch] Found ${data.length} candidates.`);

        const adaptedCandidates = data.map(candidate => ({
            id: candidate.id,
            name: candidate.full_name,
            title: candidate.job_title,
            location: candidate.country,
            skills: candidate.skills || [],
            summary: candidate.bio,
            avatar: candidate.avatar_url || 'candidate-avatar-1', // Fallback to placeholder
        }));
        
        setSearchResults(adaptedCandidates);
      }
    } catch (err: any) {
      console.error("Search Error:", err);
      toast({
        title: 'فشل البحث',
        description: err?.message || 'حدث خطأ أثناء جلب النتائج. قد يكون السبب متعلقًا بصلاحيات الوصول إلى البيانات (RLS).',
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
      console.log('[performSearch] Search finished.');
    }
  }, [user, currentRole, toast]);


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
