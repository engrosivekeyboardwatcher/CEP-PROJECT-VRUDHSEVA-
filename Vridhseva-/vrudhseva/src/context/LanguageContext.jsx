import { createContext, useContext, useMemo, useState } from 'react';
import { defaultLanguage, translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(defaultLanguage);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key, fallback = '') => translations[language]?.[key] ?? fallback ?? key,
    lang: language,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
