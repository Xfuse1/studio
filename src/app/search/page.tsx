'use client';
import { useEffect, useState } from 'react';

export default function SearchPage() {
  const [message, setMessage] = useState('جاري التحميل...');

  useEffect(() => {
    console.log('🎯 TEST: صفحة البحث اتحملت!');
    console.log('✅ الكود شغال بنجاح');
    console.log('🕒 الوقت:', new Date().toLocaleTimeString());
    
    setMessage('✅ الكود شغال - انظري الـ Console (F12)');

    // اختبار بسيط
    setTimeout(() => {
      console.log('⏰ اختبار الـ setTimeout شغال');
    }, 1000);
  }, []);

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      fontSize: '20px',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#008080', marginBottom: '20px' }}>بوابة التوظيف - وضع الاختبار</h1>
      <p style={{ 
        color: 'green', 
        fontWeight: 'bold', 
        fontSize: '24px',
        padding: '20px',
        border: '2px solid green',
        borderRadius: '10px'
      }}>
        {message}
      </p>
      <p style={{ marginTop: '20px', color: '#666' }}>
        افتحي <strong>Developer Tools (F12)</strong> ثم <strong>Console</strong>
      </p>
      
      <button 
        onClick={() => {
          console.log('🔄 زر الاختبار اتحط');
          setMessage('🎯 الزر شغال - شوفي الـ Console');
        }}
        style={{ 
          padding: '15px 30px', 
          margin: '20px', 
          fontSize: '18px',
          backgroundColor: '#008080',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        اضغطي هنا للتأكد
      </button>
    </div>
  );
}
