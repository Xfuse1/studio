'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, MapPin, Briefcase } from 'lucide-react';
import Image from 'next/image';
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

// Define the type for a seeker profile based on your table
type SeekerProfile = {
  id: string;
  full_name: string;
  job_title: string;
  country: string;
  nationality: string;
  phone: string;
  avatar_url: string; // Assuming an avatar_url column exists
};

// Smart search translation map
const translationMap: { [key: string]: string[] } = {
    'programmer': ['مطور', 'مبرمج', 'برمجة', 'برمجيات'],
    'marketing': ['تسويق', 'تسويق الكتروني'],
    'accountant': ['محاسب', 'محاسبة'],
    'pr': ['علاقات عامة'],
    'designer': ['مصمم'],
};

// Function to find the English key from an Arabic value
const getEnglishJobTitle = (arabicTerm: string): string | null => {
    for (const englishKey in translationMap) {
        if (translationMap[englishKey].some(term => arabicTerm.includes(term))) {
            return englishKey;
        }
    }
    return null;
}

export default function SearchPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<SeekerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    jobTitle: '',
    location: ''
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const searchSeekers = useCallback(async (jobTitle: string, location: string) => {
    if (!user) {
        setLoading(false);
        setResults([]);
        return;
    }
    
    setLoading(true);
    console.log('🔍 بداية البحث:', { jobTitle, location });

    if (!supabase) {
        toast({ title: "Database client not available.", variant: "destructive" });
        setLoading(false);
        return;
    }
    
    let query = supabase.from('seeker_profiles').select('*');

    if (jobTitle) {
        const englishEquivalent = getEnglishJobTitle(jobTitle);
        console.log('🗣️ الترجمة الإنجليزية:', englishEquivalent);

        // Build a dynamic OR query
        const orConditions = [
            `full_name.ilike.%${jobTitle}%`, // Search by name in Arabic
            `job_title.ilike.%${jobTitle}%`, // Search if user types in English directly
        ];

        if (englishEquivalent) {
            orConditions.push(`job_title.ilike.%${englishEquivalent}%`); // Search by translated English title
        }
        
        query = query.or(orConditions.join(','));
    }
    
    if (location) {
      query = query.ilike('country', `%${location}%`);
    }

    try {
        const { data, error } = await query.limit(20);
        console.log('📊 نتيجة البحث:', { data, error });
        
        if (error) throw error;
        
        if (data) {
          console.log('✅ عدد النتائج:', data.length);
          console.log('📝 البيانات:', data);
          setResults(data as SeekerProfile[]);
        } else {
          setResults([]);
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
  }, [toast, user]);
  
  useEffect(() => {
    // Initial load of all candidates if user is logged in
    searchSeekers('', '');
  }, [searchSeekers, user]);

  const handleInteraction = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return false;
    }
    return true;
  };
  
  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!handleInteraction()) return;
      const newJobTitle = e.target.value;
      setSearchParams(prev => ({...prev, jobTitle: newJobTitle}));
      searchSeekers(newJobTitle, searchParams.location);
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!handleInteraction()) return;
      const newLocation = e.target.value;
      setSearchParams(prev => ({...prev, location: newLocation}));
      searchSeekers(searchParams.jobTitle, newLocation);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (handleInteraction()) {
        searchSeekers(searchParams.jobTitle, searchParams.location);
      }
  }

  return (
    <>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12 animate-fade-in-up">
            <Card className="rounded-2xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                  <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                      <div className="lg:col-span-2 grid gap-2">
                          <Label htmlFor="q">المسمى الوظيفي أو الكلمة الرئيسية</Label>
                          <Input
                              id="q"
                              value={searchParams.jobTitle}
                              onChange={handleJobTitleChange}
                              onFocus={handleInteraction}
                              placeholder="مثال: مطور ويب، محاسب، marketing"
                          />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="loc">الموقع</Label>
                          <Input
                              id="loc"
                              value={searchParams.location}
                              onChange={handleLocationChange}
                              onFocus={handleInteraction}
                              placeholder="مثال: مصر"
                          />
                      </div>
                      <Button 
                          type="submit"
                          className="w-full rounded-2xl h-10 md:col-span-1 lg:col-span-3" 
                          disabled={loading}
                      >
                          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'بحث'}
                      </Button>
                  </form>
              </CardContent>
            </Card>
          </section>

          <section>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : user && results.length > 0 ? (
              <>
                <h2 className="text-2xl font-headline font-bold mb-6">
                  المرشحون المتاحون
                </h2>
                <div className="grid gap-6">
                  {results.map((seeker) => (
                    <Card key={seeker.id} className="w-full rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className="flex flex-row items-start gap-4">
                        <Image
                            src={seeker.avatar_url || `https://i.pravatar.cc/150?u=${seeker.id}`}
                            alt={`${seeker.full_name} avatar`}
                            width={64}
                            height={64}
                            className="rounded-full border object-cover"
                        />
                        <div className="flex-1">
                            <CardTitle className="text-xl font-headline">{seeker.full_name}</CardTitle>
                            <CardDescription className="text-md text-primary flex items-center gap-2">
                              <Briefcase className="w-4 h-4" /> {seeker.job_title}
                            </CardDescription>
                        </div>
                      </CardHeader>
                      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{seeker.country}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🇺🇳 {seeker.nationality}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>📞 {seeker.phone}</span>
                          </div>
                        </div>
                        <Button variant="outline" className="rounded-2xl w-full sm:w-auto">عرض التفاصيل</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl shadow-sm">
                <p className="text-lg text-muted-foreground">
                  {user ? 'لم يتم العثور على نتائج. حاول بكلمات بحث مختلفة.' : 'يرجى تسجيل الدخول للبحث عن المرشحين.'}
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
              يجب عليك تسجيل الدخول أولاً لتتمكن من البحث عن المرشحين وعرض ملفاتهم الشخصية.
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
