import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Language } from './types';
import { viTranslations } from './locales/vi';
import { enTranslations } from './locales/en';
import {
  detectInitialLanguage,
  persistLanguage,
  detectGeoCountryAsync,
} from './detector';
import { LanguageContext } from './useLanguage';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => detectInitialLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    persistLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'vi' ? 'en' : 'vi';
      persistLanguage(next);
      return next;
    });
  }, []);

  // Sync document attribute & title when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Non-blocking background Geo-IP verification for users without saved preference
  useEffect(() => {
    let isMounted = true;

    detectGeoCountryAsync().then((country) => {
      if (!isMounted || !country) return;
      if (country.toUpperCase() === 'VN') {
        setLanguageState('vi');
      } else {
        // Outside Vietnam and no user override -> ensure English
        setLanguageState('en');
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const t = useMemo(() => {
    return language === 'vi' ? viTranslations : enTranslations;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isVietnam: language === 'vi',
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

