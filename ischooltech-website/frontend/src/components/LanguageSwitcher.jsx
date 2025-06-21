// frontend/src/components/LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * LanguageSwitcher component allows users to change the application language.
 * It uses the `useTranslation` hook from `react-i18next` to interact with the i18n instance.
 */
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  /**
   * Changes the application's current language.
   * @param {string} lng - The language code to switch to (e.g., 'en', 'fr', 'ar').
   */
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="p-2">
      <button
        onClick={() => changeLanguage('fr')}
        disabled={i18n.language === 'fr'}
        className={`px-3 py-1 rounded-md text-sm font-medium mr-2 ${i18n.language === 'fr' ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-500 hover:text-white'}`}
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        disabled={i18n.language === 'ar'}
        className={`px-3 py-1 rounded-md text-sm font-medium ${i18n.language === 'ar' ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-500 hover:text-white'}`}
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
