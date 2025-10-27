'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestConnection() {
  useEffect(() => {
    const test = async () => {
      if (!supabase) {
        console.error('Supabase client is not initialized. Check your environment variables.');
        return;
      }
      // This query will fail if the 'profiles' table doesn't exist, which is expected.
      // We are looking for an auth error (bad key) vs. a table-not-found error.
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      console.log('Test Result:', { data, error });
    }
    test()
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Testing Supabase Connection...</h1>
          <p className="text-muted-foreground">Check the browser console (DevTools) for the test result.</p>
          <p className="text-muted-foreground mt-2">The result will show either data, a 'relation "profiles" does not exist' error (which is a good sign), or an authentication error.</p>
      </div>
    </div>
    )
}
