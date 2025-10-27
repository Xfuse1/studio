'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, MapPin, Briefcase } from 'lucide-react';
import Image from 'next/image';

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

function SearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [results, setResults] = useState<SeekerProfile[]>([]);
  const [loading, setLoading] = useState(true); // Start loading initially
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Get search params from URL
  const q = searchParams.get('q') || '';
  const loc = searchParams.get('loc') || '';

  const handleSearch = useCallback(async (jobTitle: string, location: string) => {
    if (!supabase) {
        toast({ title: "Database client not available.", variant: "destructive" });
        setLoading(false);
        return;
    }

    setLoading(true);
    setSearchAttempted(true); // Mark that a search is being attempted
    
    let query = supabase
      .from('seeker_profiles')
      .select('*');

    if (jobTitle) {
      query = query.ilike('job_title', `%${jobTitle}%`);
    }
    if (location) {
      query = query.ilike('country', `%${location}%`);
    }

    try {
        const { data, error } = await query.limit(20); // Limit results for performance
        
        if (error) throw error;
        
        if (data) {
          setResults(data as SeekerProfile[]);
        }
    } catch (err: any) {
        console.error('Search error:', err);
        toast({
            title: 'فشل البحث',
            description: err?.message ?? 'حدث خطأ أثناء جلب النتائج.',
            variant: "destructive"
        });
        setResults([]); // Clear results on error
    } finally {
        setLoading(false);
    }
  }, [toast]);
  
  // Effect to trigger search when component mounts or URL params change
  useEffect(() => {
    // Only set searchAttempted if there are search terms in the URL on load
    if (q || loc) {
      setSearchAttempted(true);
    }
    handleSearch(q, loc);
  }, [q, loc, handleSearch]);


  const handleUrlUpdate = (newParams: { q: string; loc: string }) => {
    const urlParams = new URLSearchParams(searchParams);
    if (newParams.q) {
        urlParams.set('q', newParams.q);
    } else {
        urlParams.delete('q');
    }
    if (newParams.loc) {
        urlParams.set('loc', newParams.loc);
    } else {
        urlParams.delete('loc');
    }
    router.push(`/search?${urlParams.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <section className="mb-12 animate-fade-in-up">
           <Card className="rounded-2xl shadow-lg overflow-hidden">
             <CardContent className="p-6">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUrlUpdate({ 
                        q: (document.getElementById('q') as HTMLInputElement).value, 
                        loc: (document.getElementById('loc') as HTMLInputElement).value 
                    });
                }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div className="lg:col-span-2 grid gap-2">
                        <Label htmlFor="q">المسمى الوظيفي أو الكلمة الرئيسية</Label>
                        <Input
                            id="q"
                            defaultValue={q}
                            placeholder="مثال: مطور ويب"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="loc">الموقع</Label>
                        <Input
                            id="loc"
                            defaultValue={loc}
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
          ) : results.length > 0 ? (
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
          ) : searchAttempted ? (
            <div className="text-center py-16 bg-card rounded-2xl shadow-sm">
              <p className="text-lg text-muted-foreground">
                لم يتم العثور على نتائج. حاول بكلمات بحث مختلفة.
              </p>
            </div>
          ) : (
             <div className="text-center py-16 bg-card rounded-2xl shadow-sm">
              <p className="text-lg text-muted-foreground">
                ابدأ البحث للعثور على المرشحين
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <SearchComponent />
    </Suspense>
  );
}
