import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon } from './icons'; // Or a more suitable icon

const AccessDeniedMessage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center p-10 flex flex-col items-center justify-center h-full">
      <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
      <h2 className="text-2xl font-semibold text-red-600">{t('common.accessDenied')}</h2>
      <p className="text-slate-600 mt-2">{t('common.noPermission')}</p>
    </div>
  );
};

export default AccessDeniedMessage;