import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Load translations from the backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Set initial language to English
    lng: 'en',
    // Fallback language if a translation is missing
    fallbackLng: 'en',
    // Debug mode in development (temporarily disabled for cleaner console)
    debug: false, // process.env.NODE_ENV === 'development',
    // Namespaces configuration
    ns: ['common', 'home', 'repository', 'profile', 'airdrop'],
    defaultNS: 'common',
    // Backend configuration
    backend: {
      // Path to load language files
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // Interpolation configuration
    interpolation: {
      // React already escapes values
      escapeValue: false,
    },
    // React configuration
    react: {
      // Wait for translations to be loaded before rendering
      useSuspense: true,
    },
    // Ensure all namespaces are loaded
    load: 'all',
  });

export default i18n;
