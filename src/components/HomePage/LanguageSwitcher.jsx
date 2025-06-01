import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    // 移除生产环境日志 - 首页语言切换
    // Save language preference to localStorage first
    localStorage.setItem('i18nextLng', lng);

    // Change language and force reload resources
    i18n.changeLanguage(lng).then(() => {
      // 移除生产环境日志 - 首页语言已更改

      // Force reload all namespaces after language change
      i18n.loadNamespaces(['profile', 'common']).then(() => {
        // 移除生产环境日志 - 首页命名空间已重新加载
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
