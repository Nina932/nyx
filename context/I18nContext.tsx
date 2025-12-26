
import React, { createContext, useState, useCallback } from 'react';
import en from '../locales/en.ts';
import ka from '../locales/ka.ts';

type Language = 'en' | 'ka';
// Fix: Use a more generic type for translations that enforces keys from 'en' but allows any string value.
type Translations = Record<keyof typeof en, string>;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, options?: Record<string, string>) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  en,
  ka,
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: keyof Translations, options?: Record<string, string>): string => {
    let translation = translations[language][key] || translations['en'][key] || key;
    if (options) {
      Object.keys(options).forEach(optKey => {
        translation = translation.replace(`{{${optKey}}}`, options[optKey]);
      });
    }
    return translation;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};