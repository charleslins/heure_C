import { Employee } from '../models/Employee';
import { EmployeeCollection } from '../collections/EmployeeCollection';
import { useTranslation } from 'react-i18next';

export class EmployeePresenter {
  private collection: EmployeeCollection;
  private t: (key: string) => string;

  constructor(collection: EmployeeCollection) {
    this.collection = collection;
    const { t } = useTranslation();
    this.t = t;
  }

  async initialize(): Promise<void> {
    await this.collection.loadAll();
  }

  getEmployeeListViewModel() {
    const employees = this.collection.getAll();
    const stats = this.collection.getStatistics();

    return {
      employees: employees.map(emp => this.mapEmployeeToViewModel(emp)),
      statistics: {
        totalEmployees: stats.total,
        activeUsers: stats.users,
        administrators: stats.admins
      }
    };
  }

  private mapEmployeeToViewModel(employee: Employee) {
    return {
      id: employee.id,
      name: employee.getFullName(),
      email: employee.email,
      role: this.t(`roles.${employee.role}`),
      position: employee.position || this.t('common.notAvailableShort'),
      hireDate: employee.getFormattedHireDate(),
      isAdmin: employee.isAdmin(),
      cantonId: employee.canton_id,
      municipalityId: employee.municipality_id
    };
  }

  async handleRoleChange(employeeId: string, newRole: 'user' | 'admin'): Promise<boolean> {
    try {
      const employee = this.collection.getById(employeeId);
      if (!employee) return false;

      employee.role = newRole;
      await this.collection.update(employee);
      return true;
    } catch (error) {
      console.error('Erro ao alterar função do funcionário:', error);
      return false;
    }
  }

  async createEmployee(data: Partial<Employee>): Promise<{ success: boolean, message?: string }> {
    try {
      const employee = new Employee(data);
      await this.collection.add(employee);
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      return { 
        success: false, 
        message: this.t('employeeManagement.employeeRegistration.error')
      };
    }
  }

  async updateEmployee(employeeId: string, data: Partial<Employee>): Promise<{ success: boolean, message?: string }> {
    try {
      const employee = this.collection.getById(employeeId);
      if (!employee) {
        return { 
          success: false, 
          message: this.t('employeeManagement.employeeNotFound') 
        };
      }

      Object.assign(employee, data);
      await this.collection.update(employee);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      return { 
        success: false, 
        message: this.t('employeeManagement.updateError')
      };
    }
  }

  async removeEmployee(employeeId: string): Promise<{ success: boolean, message?: string }> {
    try {
      await this.collection.remove(employeeId);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
      return { 
        success: false, 
        message: this.t('employeeManagement.removeError')
      };
    }
  }

  filterEmployees(searchTerm: string) {
    const filtered = this.collection.filterBySearchTerm(searchTerm);
    return filtered.map(emp => this.mapEmployeeToViewModel(emp));
  }

  getEmployeesByRole() {
    const { admins, users } = this.collection.groupByRole();
    return {
      admins: admins.map(emp => this.mapEmployeeToViewModel(emp)),
      users: users.map(emp => this.mapEmployeeToViewModel(emp))
    };
  }
} 