import React from 'react';
import { useTranslation } from 'react-i18next';
import AuthRequired from '../components/AuthRequired';
import ExplorationPageContent from '../components/ExplorationPage';

/**
 * ExplorationPage - Page component for showcasing important repository audits and patches
 * This page tells the narrative of our exploration journey in blockchain security
 */
function ExplorationPage() {
  const { t } = useTranslation(['exploration', 'common']);

  return (
    <AuthRequired>
      <ExplorationPageContent />
    </AuthRequired>
  );
}

export default ExplorationPage;
