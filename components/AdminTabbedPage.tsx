import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminDashboardPage from '../AdminDashboardPage';
import HolidayManagementPage from './HolidayManagementPage';
import EmployeeManagementPage from './EmployeeManagementPage';
import { useAuthContext } from '../contexts/AuthContext';
import {
  Cog8ToothIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon
} from './icons';

const AdminTabbedPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Cog8ToothIcon
    },
    {
      id: 'holidays',
      name: t('nav.manageHolidays'),
      icon: CalendarDaysIcon
    },
    {
      id: 'employees',
      name: t('nav.manageEmployees'),
      icon: UserGroupIcon
    }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return currentUser ? <AdminDashboardPage currentUser={currentUser} /> : null;
      case 'holidays':
        return <HolidayManagementPage />;
      case 'employees':
        return <EmployeeManagementPage />;
      default:
        return currentUser ? <AdminDashboardPage currentUser={currentUser} /> : null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com título */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ClipboardDocumentListIcon className="w-8 h-8 mr-3 text-orange-500" />
              {t('nav.adminPanel')}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Gerencie usuários, feriados, funcionários e configurações do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Navegação por abas */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${isActive
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <tab.icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                    aria-hidden="true"
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default AdminTabbedPage; 