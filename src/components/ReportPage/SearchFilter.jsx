import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const SearchFilter = ({ searchTerm, onSearchChange }) => {
  const { t } = useTranslation('common');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('reportPage.searchPlaceholder', 'Search by repository or user...')}
          className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </motion.div>
  );
};

export default SearchFilter;
