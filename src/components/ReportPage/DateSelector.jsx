import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../ui/CustomSelect';
import { formatDateCode } from './utils/helpers';

const DateSelector = ({ selectedDate, onDateChange, availableDates, disabled, isLoading }) => {
  const { t } = useTranslation('common');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 text-gray-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400 mr-3"></div>
        {t('reportPage.loadingDates', 'Loading dates...')}
      </div>
    );
  }

  return (
    <CustomSelect
      value={selectedDate}
      onChange={onDateChange}
      options={availableDates.map(date => ({
        value: date.date_code,
        label: formatDateCode(date.date_code)
      }))}
      placeholder={t('reportPage.selectDate', 'Select date')}
      disabled={disabled}
    />
  );
};

export default DateSelector;
