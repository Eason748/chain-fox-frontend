import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
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
