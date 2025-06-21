// frontend/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files for each language.
// These JSON files contain the key-value pairs for translatable strings.
import translationFR from './locales/fr/translation.json';
import translationAR from './locales/ar/translation.json';

// Define the resources for i18next.
// Each language code (e.g., 'fr', 'ar') maps to a 'translation' namespace
// which holds the actual translation strings.
const resources = {
  fr: {
    translation: translationFR,
  },
  ar: {
    translation: translationAR,
  },
};

i18n
  // LanguageDetector plugin: automatically detects the user's language
  // based on browser settings, localStorage, etc.
  .use(LanguageDetector)
  // initReactI18next plugin: integrates i18next with React,
  // providing features like the `useTranslation` hook and `I18nextProvider`.
  .use(initReactI18next)
  // Initialize i18next with configuration options.
  .init({
    resources, // The translation data.
    fallbackLng: 'fr', // Language to use if the detected language is not available or translations are missing.
    interpolation: {
      // React already protects against XSS attacks by default,
      // so escaping values is not necessary here.
      escapeValue: false,
    },
    detection: {
      // Order of language detection methods:
      // 1. localStorage: checks if a language was previously saved by the user.
      // 2. navigator: checks the browser's preferred language.
      // 3. htmlTag: checks the `lang` attribute of the HTML tag.
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache the detected language in localStorage for persistence across sessions.
      caches: ['localStorage'],
    },
  });

export default i18n; // Export the configured i18n instance.
