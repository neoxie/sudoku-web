import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Language } from './translations';
import { detectBrowserLanguage, getTranslation } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, ...args: unknown[]) => string;
  tArray: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Language Provider Component
 * Manages global language state and provides translation function
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => detectBrowserLanguage());

  // Persist language preference to localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sudoku-language') as Language | null;
    if (stored && stored !== language) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sudoku-language', lang);
  }, []);

  // Type-safe translation function for strings
  const t = useCallback((key: string, ...args: unknown[]): string => {
    const result = getTranslation(language, key, ...args);
    return Array.isArray(result) ? result[0] || '' : result;
  }, [language]);

  // Type-safe translation function for arrays
  const tArray = useCallback((key: string): string[] => {
    const result = getTranslation(language, key);
    return Array.isArray(result) ? result : [result];
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    tArray,
  }), [language, setLanguage, t, tArray]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 * Throws error if used outside LanguageProvider
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
