'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '@/components/search/SearchBar';
import ResultsList from '@/components/search/ResultsList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export interface SearchParams {
  q: string;
  loc: string;
  type: string;
  remote: boolean;
}

export default function SearchPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

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
        title: t('search.searchFailedTitle'),
        description: 'Supabase client not initialized.',
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
          console.error('[performSearch] Jobs query error:', {
            message: error.message,
            code: error.code,
            details: error.details
          });
          throw error;
        }
  
        const adaptedJobs = data.map(job => ({
          id: job.id,
          title: job.title,
          company: (job.companies as any)?.name_ar || (job.companies as any)?.name_en || t('search.unknownCompany'),
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

        // ✅ استعلام محسن مع استيراد المهارات
        let query = supabase
          .from('seeker_profiles')
          .select(`
            id, 
            full_name, 
            email, 
            job_title, 
            country, 
            phone, 
            profile_image_url, 
            nationality,
            user_skills (
              level,
              skills (
                name
              )
            )
          `);

        // البحث في المحتوى الرئيسي
        if (params.q) {
          const searchQuery = `%${params.q}%`;
          console.log(`[performSearch] Applying main search filter: ${searchQuery}`);
          query = query.or(`full_name.ilike.${searchQuery},job_title.ilike.${searchQuery},email.ilike.${searchQuery}`);
        }
        
        // البحث في الموقع
        if (params.loc) {
          const locQuery = `%${params.loc}%`;
          console.log(`[performSearch] Applying location filter: ${locQuery}`);
          query = query.ilike('country', locQuery);
        }

        console.log('[performSearch] Executing Supabase query for candidates with skills...');
        const { data, error } = await query;

        if (error) {
          console.error('[performSearch] Supabase query error:', {
            message: error.message,
            code: error.code,
            details: error.details
          });
          throw error;
        }
        
        console.log(`[performSearch] Found ${data?.length || 0} candidates.`);
        console.log('[performSearch] Candidate data with skills:', data);

        // تحويل البيانات مع المهارات
        const adaptedCandidates = data?.map(candidate => {
          // استخراج المهارات من العلاقة
          const skills = candidate.user_skills?.map((userSkill: any) => ({
            name: userSkill.skills?.name,
            level: userSkill.level
          })).filter((skill: any) => skill.name) || []; // تصفية المهارات الفارغة

          // استخراج أسماء المهارات فقط للعرض
          const skillNames = skills.map((skill: any) => skill.name);

          return {
            id: candidate.id,
            name: candidate.full_name,
            title: candidate.job_title,
            location: candidate.country,
            skills: skillNames, // ✅ الآن تحتوي على المهارات الفعلية
            skillsWithLevel: skills, // احتفظ بالبيانات الكاملة إذا احتجتها
            summary: candidate.job_title,
            avatar: candidate.profile_image_url || 'candidate-avatar-1',
            email: candidate.email,
            phone: candidate.phone,
            nationality: candidate.nationality
          };
        }) || [];
        
        setSearchResults(adaptedCandidates);
      }
    } catch (err: any) {
      console.error("Search Error:", err);
      toast({
        title: t('search.searchFailedTitle'),
        description: err?.message || t('search.searchFailedDescription'),
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
      console.log('[performSearch] Search finished.');
    }
  }, [user, currentRole, toast, t]);


  useEffect(() => {
    const params: SearchParams = {
      q: searchParams.get('q') || '',
      loc: searchParams.get('loc') || '',
      type: searchParams.get('type') || 'all',
      remote: searchParams.get('remote') === 'true',
    };
    
    // تأكد أن currentRole محدد قبل البحث
    if (currentRole) {
      performSearch(params);
    }
  }, [searchParams, performSearch, currentRole]);

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
          {currentRole === 'company' ? t('search.findTopTalent') : t('search.findYourDreamJob')}
        </h1>
        <p className="text-muted-foreground text-center text-lg">
          {currentRole === 'company' ? t('search.thousandsOfCandidates') : t('search.yourGateway')}
        </p>
      </div>

      <div className="sticky top-[65px] z-30 bg-background/80 backdrop-blur-sm -mx-4 sm:mx-0 px-4 sm:px-0 py-4 mb-8">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {showLoginPrompt && (
         <Alert variant="default" className="max-w-2xl mx-auto rounded-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{t('search.loginRequiredTitle')}</AlertTitle>
          <AlertDescription>
            {t('search.loginRequiredDescription')}
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
                <h2 className="text-2xl font-semibold mb-2">{t('search.noResultsTitle')}</h2>
                <p className="text-muted-foreground">{t('search.noResultsDescription')}</p>
            </div>
        )
      )}
    </div>
  );
}