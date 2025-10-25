'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const [language, setLanguage] = useState<'EN' | 'JM'>('JM');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'JM' : 'EN');
  };

  return (
    <button
      onClick={toggleLanguage}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '8px 12px',
        backgroundColor: 'transparent',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#2c3e50'
      }}
    >
      <Globe size={16} />
      {language === 'EN' ? 'English' : 'Patois'}
    </button>
  );
}