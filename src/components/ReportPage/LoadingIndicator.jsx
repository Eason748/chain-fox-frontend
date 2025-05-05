import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingIndicator = ({ text }) => {
  const { t } = useTranslation('common');
  const defaultText = t('common.loading', 'Loading...');
  
  return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mr-3"></div>
      {text || defaultText}
    </div>
  );
};

export default LoadingIndicator;
