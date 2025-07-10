import { Employee } from '../models/Employee';
import { supabase } from '../utils/supabaseClient';

export class EmployeeCollection {
  private employees: Employee[] = [];

  constructor(initialEmployees: Employee[] = []) {
    this.employees = initialEmployees;
  }

  async loadAll(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      
      this.employees = (data || []).map(emp => new Employee(emp));
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      throw error;
    }
  }

  async loadByCantonId(cantonId: number): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('canton_id', cantonId)
        .order('name');

      if (error) throw error;
      
      this.employees = (data || []).map(emp => new Employee(emp));
    } catch (error) {
      console.error('Erro ao carregar funcionários do cantão:', error);
      throw error;
    }
  }

  getAll(): Employee[] {
    return this.employees;
  }

  getById(id: string): Employee | undefined {
    return this.employees.find(emp => emp.id === id);
  }

  getAdmins(): Employee[] {
    return this.employees.filter(emp => emp.isAdmin());
  }

  getRegularUsers(): Employee[] {
    return this.employees.filter(emp => !emp.isAdmin());
  }

  async add(employee: Employee): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert(employee.toJSON());

      if (error) throw error;
      
      this.employees.push(employee);
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      throw error;
    }
  }

  async update(employee: Employee): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(employee.toJSON())
        .eq('id', employee.id);

      if (error) throw error;
      
      const index = this.employees.findIndex(emp => emp.id === employee.id);
      if (index !== -1) {
        this.employees[index] = employee;
      }
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      throw error;
    }
  }

  async remove(employeeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;
      
      this.employees = this.employees.filter(emp => emp.id !== employeeId);
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
      throw error;
    }
  }

  filterBySearchTerm(searchTerm: string): Employee[] {
    const term = searchTerm.toLowerCase();
    return this.employees.filter(emp => 
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      (emp.position && emp.position.toLowerCase().includes(term))
    );
  }

  groupByRole(): { admins: Employee[], users: Employee[] } {
    return {
      admins: this.getAdmins(),
      users: this.getRegularUsers()
    };
  }

  getStatistics() {
    return {
      total: this.employees.length,
      admins: this.getAdmins().length,
      users: this.getRegularUsers().length
    };
  }
} 