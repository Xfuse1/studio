
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
import { supabase } from '@/lib/supabaseClient';

import SearchBar from '@/components/search/SearchBar';
import ResultsList from '@/components/search/ResultsList';
import { mockCandidates } from '@/lib/mock-data'; // Keep for company search until fully implemented

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

    if (!supabase) {
      toast({
        title: 'فشل الاتصال بالداتا بيز',
        description: 'تأكد من إعداد متغيرات البيئة الخاصة بـ Supabase بشكل صحيح.',
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      if (user.role === 'seeker') {
        console.log('🔍 بداية البحث عن وظائف:', { jobTitle: params.q, location: params.loc });
        
        let query = supabase
          .from('jobs')
          .select(`
            *,
            companies (
              name_ar,
              name_en
            )
          `)
          .eq('is_active', true);

        if (params.q) {
          query = query.ilike('title', `%${params.q}%`);
        }
        if (params.loc) {
          query = query.ilike('location', `%${params.loc}%`);
        }
        
        const { data, error } = await query;

        console.log('📊 نتيجة البحث في jobs:', { 
          data, 
          error,
          searchTerm: params.q,
          dataLength: data?.length 
        });
        
        if (error) throw error;

        if (data) {
          const adaptedJobs = data.map(job => ({
            id: job.id,
            title: job.title,
            company: (job.companies as any)?.name_ar || (job.companies as any)?.name_en || 'شركة غير معروفة',
            location: job.location,
            description: job.description,
            postedAt: job.created_at,
            logo: 'company-logo-1' // Using placeholder for now
          }));
          setResults(adaptedJobs);
        } else {
          setResults([]);
        }
      } else { // User is a 'company'
        console.log('🔍 بداية البحث عن مرشحين:', { nameOrTitle: params.q, location: params.loc });
        
        let query = supabase.from('seeker_profiles').select('*');

        if (params.q) {
          query = query.or(`job_title.ilike.%${params.q}%,full_name.ilike.%${params.q}%`);
        }
        if (params.loc) {
          query = query.ilike('country', `%${params.loc}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        const adaptedCandidates = (data || []).map(candidate => ({
          id: candidate.id,
          name: candidate.full_name,
          title: candidate.job_title,
          location: candidate.country,
          skills: candidate.skills || [],
          summary: `ملخص تعريفي للمرشح ${candidate.full_name}`, // Placeholder summary
          avatar: 'candidate-avatar-1' // Placeholder avatar
        }));

        setResults(adaptedCandidates);
      }
      
    } catch (err: any) {
        console.error('❌ خطأ في البحث:', err);
        toast({
            title: 'فشل البحث',
            description: err?.message ?? 'حدث خطأ أثناء جلب النتائج.',
            variant: "destructive"
        });
        setResults([]);
    } finally {
        setLoading(false);
    }
  }, [user]); // Removed 'toast' from dependencies to prevent infinite loop

  // Initial data load effect
  useEffect(() => {
    if (user) {
      performSearch({ q: '', loc: '', type: 'all', remote: false });
    } else {
      setResults([]);
    }
  }, [user, performSearch]);
  
  return (
    <>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12 animate-fade-in-up">
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
