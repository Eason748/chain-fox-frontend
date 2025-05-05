import React from 'react';
import AuthRequired from '../components/AuthRequired';
import { ReportPageContent } from '../components/ReportPage';

function ReportPage() {

  return (
    <AuthRequired>
      <ReportPageContent />
    </AuthRequired>
  );
}

export default ReportPage;
