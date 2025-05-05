import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    console.log('LanguageSwitcher: Changing language to:', lng);
    // Save language preference to localStorage first
    localStorage.setItem('i18nextLng', lng);

    // Change language and force reload resources
    i18n.changeLanguage(lng).then(() => {
      console.log('LanguageSwitcher: Language changed to:', i18n.language);

      // Force reload all namespaces after language change
      i18n.loadNamespaces(['profile', 'common', 'home', 'repository']).then(() => {
        console.log('LanguageSwitcher: Namespaces reloaded');
      });
    });
  };

  return (
    <div className="flex space-x-2">
      <button
        className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'}`}
        onClick={() => changeLanguage('en')}
      >
        {t('languageSwitcher.en')}
      </button>
      <button
        className={`px-2 py-1 rounded ${i18n.language === 'zh' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'}`}
        onClick={() => changeLanguage('zh')}
      >
        {t('languageSwitcher.zh')}
      </button>
    </div>
  );
}

export default LanguageSwitcher;
