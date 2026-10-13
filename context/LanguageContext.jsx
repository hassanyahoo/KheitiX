import React, { createContext, useState, useEffect, useCallback } from 'react';
import en from '../i18n/en.json';
import ur from '../i18n/ur.json';
import sd from '../i18n/sd.json';

// Translation dictionaries mapped by language code
const translations = {
  en,
  ur,
  sd,
};

// Create the Language Context
export const LanguageContext = createContext();

// Storage key used for remembering language preference
const STORAGE_KEY = 'khetix_lang';

export function LanguageProvider({ children }) {
  // Read saved language from localStorage or default to English ('en')
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'ur' || saved === 'sd')) {
        return saved;
      }
    } catch {
      // LocalStorage access might fail in private browsing mode
    }
    return 'en';
  });

  // Switch language and update document direction (RTL for Urdu and Sindhi, LTR for English)
  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'ur' || lang === 'sd') {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Handle localStorage error silently
      }
    }
  };

  // Sync document dir and lang attributes whenever language changes
  useEffect(() => {
    const isRtl = language === 'ur' || language === 'sd';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Translation helper function supporting both flat ('fields') and dotted ('nav.fields') keys
  const t = useCallback(
    (key) => {
      if (!key) return '';

      const currentDict = translations[language] || translations.en;
      const fallbackDict = translations.en;

      const resolve = (dict, path) => {
        if (!dict) return undefined;
        // Direct key lookup
        if (dict[path] !== undefined) return dict[path];
        // Dotted path lookup
        const parts = path.split('.');
        let current = dict;
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            return undefined;
          }
        }
        return typeof current === 'string' ? current : undefined;
      };

      // Try current language, fallback to English, fallback to key
      return resolve(currentDict, key) ?? resolve(fallbackDict, key) ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export { useLanguage } from './useLanguage';
