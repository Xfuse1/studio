'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '@/components/search/SearchBar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Terminal, LogIn } from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import Illustration from '@/components/search/Illustration';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ResultsList = dynamic(() => import('@/components/search/ResultsList'), {
  loading: () => <ResultsSkeleton />,
});

export interface SearchParams {
  q: string;
  loc: string;
  type: string;
  remote: boolean;
}

const ResultsSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-8">
    {[...Array(4)].map((_, i) => (
       <div key={i} className="bg-card p-6 rounded-3xl shadow-md w-full">
          <div className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mt-4" />
          <Skeleton className="h-4 w-5/6 mt-2" />
        </div>
    ))}
  </div>
);


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
  
    if (!supabase) {
      toast({
        title: t('search.searchFailedTitle'),
        description: 'Supabase client not initialized.',
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
  
    // Explicitly prevent search for logged-out company users
    if (currentRole === 'company' && !user) {
      setShowLoginPrompt(true);
      setSearchResults([]);
      setIsLoading(false);
      return;
    }
  
    try {
      if (currentRole === 'seeker') {
        let query = supabase
          .from('jobs')
          .select('*, company_name')
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
          company: job.company_name || t('search.unknownCompany'),
          location: job.location,
          description: job.description,
          postedAt: job.created_at,
          logo: (job.companies as any)?.logo_url || 'company-logo-1', // Fallback to placeholder
        }));
  
        setSearchResults(adaptedJobs);

      } else if (currentRole === 'company') {
        if (!user) {
          setShowLoginPrompt(true);
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

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
            skills (
              name
            )
          `);

        if (params.q) {
          const searchQuery = `%${params.q}%`;
          query = query.or(`full_name.ilike.${searchQuery},job_title.ilike.${searchQuery},email.ilike.${searchQuery}`);
        }
        
        if (params.loc) {
          const locQuery = `%${params.loc}%`;
          query = query.ilike('country', locQuery);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }
        
        const adaptedCandidates = data?.map(candidate => {
          const skills = candidate.skills?.map((skill: any) => skill.name) || [];

          return {
            id: candidate.id,
            name: candidate.full_name,
            title: candidate.job_title,
            location: candidate.country,
            skills: skills,
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
      toast({
        title: t('search.searchFailedTitle'),
        description: err?.message || t('search.searchFailedDescription'),
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentRole, toast, t]);


  useEffect(() => {
    const params: SearchParams = {
      q: searchParams.get('q') || '',
      loc: searchParams.get('loc') || '',
      type: searchParams.get('type') || 'all',
      remote: searchParams.get('remote') === 'true',
    };
    
    if (currentRole) {
      performSearch(params);
    }
  }, [searchParams, performSearch, currentRole]);

  const handleSearch = (params: SearchParams) => {
    // If a company user is not logged in, show the prompt instead of searching
    if (currentRole === 'company' && !user) {
      setShowLoginPrompt(true);
      setSearchResults([]);
      return;
    }
    
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
       <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="md:order-last text-center md:text-right">
              <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                {currentRole === 'company' ? t('search.findTopTalent') : t('search.findYourDreamJob')}
              </h1>
              <p className="text-foreground text-xl">
                {currentRole === 'company' ? t('search.thousandsOfCandidates') : t('search.yourGateway')}
              </p>
              <div className="mt-8 hidden md:block">
                  <Illustration />
              </div>
          </div>
          <div className="md:order-first">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
      </div>


      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
               <Terminal className="h-5 w-5" />
               {t('search.loginRequiredTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('search.loginRequiredDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">{t('signIn.cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction asChild className="rounded-2xl">
              <Link href="/signin">
                <LogIn className="ms-2" />
                {t('header.signIn')}
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <ResultsSkeleton />
      ) : searchResults.length > 0 ? (
        <ResultsList results={searchResults} role={currentRole} />
      ) : (
        !showLoginPrompt && (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold mb-2">{t('search.noResultsTitle')}</h2>
                <p className="text-foreground">{t('search.noResultsDescription')}</p>
            </div>
        )
      )}
    </div>
  );
}
