
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
        console.log('🔍 بداية البحث:', { jobTitle: params.q, location: params.loc })
        
        // استعلام الوظائف
        let query = supabase
          .from('jobs')
          .select(`
            *,
            companies (
              name_ar,
              name_en
            )
          `)
          .eq('is_active', true)

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
        })
        
        if (!error && data) {
            const adaptedJobs = data.map(job => ({
                id: job.id,
                title: job.title,
                company: (job.companies as any)?.name_ar || (job.companies as any)?.name_en || 'شركة غير معروفة',
                location: job.location,
                description: job.description,
                postedAt: job.created_at,
                logo: 'company-logo-1' // Using placeholder logo for now
            }));
            setResults(adaptedJobs);
        } else {
            console.error('❌ خطأ في البحث:', error);
            setResults([]);
            if (error) {
                toast({
                    title: 'فشل البحث',
                    description: error.message,
                    variant: "destructive"
                });
            }
        }
      
    } catch (err: any) {
        console.error('❌ خطأ غير متوقع:', err)
        toast({
            title: 'فشل البحث',
            description: err?.message ?? 'حدث خطأ أثناء جلب النتائج.',
            variant: "destructive"
        });
        setResults([]);
    } finally {
        setLoading(false);
    }
  }, [user]);

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
