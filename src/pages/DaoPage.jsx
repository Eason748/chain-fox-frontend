import React from 'react';
import { useTranslation } from 'react-i18next';
import AuthRequired from '../components/AuthRequired';
import DaoPageContent from '../components/DaoPage';
import { DaoProgressProvider } from '../contexts/DaoProgressContext';

/**
 * DaoPage - Page component for Chain-Fox DAO governance and staking
 * This page serves as the entry point for DAO participation and governance
 */
function DaoPage() {
  const { t } = useTranslation(['dao', 'common']);

  return (
    <AuthRequired>
      <DaoProgressProvider>
        <DaoPageContent />
      </DaoProgressProvider>
    </AuthRequired>
  );
}

export default DaoPage;
