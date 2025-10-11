import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';
import arTranslations from '../locales/ar.json';

const resources = {
  en: {
    translation: enTranslations
  },
  fr: {
    translation: frTranslations
  },
  ar: {
    translation: arTranslations
  }
};

// Detect browser language
const detectBrowserLanguage = () => {
  const browserLang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || 'en';
  const shortLang = browserLang.split('-')[0].toLowerCase();
  
  // Check if we support this language
  if (Object.prototype.hasOwnProperty.call(resources, shortLang)) {
    return shortLang;
  }
  
  return 'en'; // default fallback
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectBrowserLanguage(), // detect browser language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;