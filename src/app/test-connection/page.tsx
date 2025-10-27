'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestConnection() {
  const [result, setResult] = useState('جاري فحص الجداول...')

  useEffect(() => {
    const testAllTables = async () => {
      if (!supabase) {
        setResult('❌ Supabase client is not initialized. Check your environment variables.');
        return;
      }
      
      try {
        // اختبار جميع الجداول المهمة
        const tables = ['seeker_profiles', 'companies', 'jobs', 'skills', 'job_applications']
        
        for (const table of tables) {
          const { data, error } = await supabase.from(table).select('*').limit(1)
          console.log(`جدول ${table}:`, { data, error })
        }

        setResult('✅ تم فحص جميع الجداول - شوفي الـ Console للتفاصيل')

      } catch (err: any) {
        console.error('خطأ غير متوقع:', err)
        setResult(`خطأ غير متوقع: ${err.message}`)
      }
    }

    testAllTables()
  }, [])

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>فحص جداول Supabase</h1>
      <p>{result}</p>
    </div>
  )
}
