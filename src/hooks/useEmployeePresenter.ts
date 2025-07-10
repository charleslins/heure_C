import { useState, useEffect, useMemo } from 'react';
import { Employee } from '../models/Employee';
import { EmployeeCollection } from '../collections/EmployeeCollection';
import { EmployeePresenter } from '../presenters/EmployeePresenter';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

export function useEmployeePresenter() {
  const { t } = useTranslation();
  const { addNotification } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criar instâncias das classes MCP
  const collection = useMemo(() => new EmployeeCollection(), []);
  const presenter = useMemo(() => new EmployeePresenter(collection), [collection]);

  // Estado para armazenar os dados processados
  const [viewModel, setViewModel] = useState<ReturnType<typeof presenter.getEmployeeListViewModel>>();

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        await presenter.initialize();
        setViewModel(presenter.getEmployeeListViewModel());
      } catch (err) {
        setError(t('employeeManagement.loadingError'));
        addNotification(t('employeeManagement.loadingError'), 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [presenter, t, addNotification]);

  // Funções de manipulação expostas para os componentes
  const handleCreateEmployee = async (data: Partial<Employee>) => {
    const result = await presenter.createEmployee(data);
    if (result.success) {
      addNotification(t('employeeManagement.employeeRegistration.success'), 'success');
      setViewModel(presenter.getEmployeeListViewModel());
    } else {
      addNotification(result.message || t('employeeManagement.employeeRegistration.error'), 'error');
    }
    return result;
  };

  const handleUpdateEmployee = async (employeeId: string, data: Partial<Employee>) => {
    const result = await presenter.updateEmployee(employeeId, data);
    if (result.success) {
      addNotification(t('employeeManagement.updateSuccess'), 'success');
      setViewModel(presenter.getEmployeeListViewModel());
    } else {
      addNotification(result.message || t('employeeManagement.updateError'), 'error');
    }
    return result;
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    const result = await presenter.removeEmployee(employeeId);
    if (result.success) {
      addNotification(t('employeeManagement.removeSuccess'), 'success');
      setViewModel(presenter.getEmployeeListViewModel());
    } else {
      addNotification(result.message || t('employeeManagement.removeError'), 'error');
    }
    return result;
  };

  const handleRoleChange = async (employeeId: string, newRole: 'user' | 'admin') => {
    const success = await presenter.handleRoleChange(employeeId, newRole);
    if (success) {
      addNotification(t('employeeManagement.roleUpdateSuccess'), 'success');
      setViewModel(presenter.getEmployeeListViewModel());
    } else {
      addNotification(t('employeeManagement.roleUpdateError'), 'error');
    }
    return success;
  };

  const handleSearch = (searchTerm: string) => {
    return presenter.filterEmployees(searchTerm);
  };

  return {
    isLoading,
    error,
    data: viewModel,
    createEmployee: handleCreateEmployee,
    updateEmployee: handleUpdateEmployee,
    removeEmployee: handleRemoveEmployee,
    changeRole: handleRoleChange,
    searchEmployees: handleSearch,
    getEmployeesByRole: () => presenter.getEmployeesByRole()
  };
} 