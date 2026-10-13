import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

/**
 * Custom hook to consume the Language Context
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
