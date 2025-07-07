import { Vacation } from '../models/Vacation';
import { supabase } from '../utils/supabaseClient';
import { VacationStatus } from '../types';

export class VacationCollection {
  private vacations: Vacation[] = [];

  constructor(initialVacations: Vacation[] = []) {
    this.vacations = initialVacations;
  }

  async loadForUser(userId: string, year: number, month: number): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_vacations')
        .select('*')
        .eq('userId', userId)
        .gte('date', `${year}-${String(month + 1).padStart(2, '0')}-01`)
        .lt('date', `${year}-${String(month + 2).padStart(2, '0')}-01`);

      if (error) throw error;
      
      this.vacations = (data || []).map(v => new Vacation(v));
    } catch (error) {
      console.error('Erro ao carregar férias:', error);
      throw error;
    }
  }

  async loadPendingRequests(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_vacations')
        .select('*')
        .eq('status', VacationStatus.PENDING_APPROVAL)
        .order('date');

      if (error) throw error;
      
      this.vacations = (data || []).map(v => new Vacation(v));
    } catch (error) {
      console.error('Erro ao carregar solicitações pendentes:', error);
      throw error;
    }
  }

  getAll(): Vacation[] {
    return this.vacations;
  }

  getPending(): Vacation[] {
    return this.vacations.filter(v => v.isPending());
  }

  getApproved(): Vacation[] {
    return this.vacations.filter(v => v.isApproved());
  }

  getRejected(): Vacation[] {
    return this.vacations.filter(v => v.isRejected());
  }

  async add(vacation: Vacation): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_vacations')
        .insert(vacation.toJSON());

      if (error) throw error;
      
      this.vacations.push(vacation);
    } catch (error) {
      console.error('Erro ao adicionar férias:', error);
      throw error;
    }
  }

  async update(vacation: Vacation): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_vacations')
        .update(vacation.toJSON())
        .eq('id', vacation.id);

      if (error) throw error;
      
      const index = this.vacations.findIndex(v => v.id === vacation.id);
      if (index !== -1) {
        this.vacations[index] = vacation;
      }
    } catch (error) {
      console.error('Erro ao atualizar férias:', error);
      throw error;
    }
  }

  async remove(vacationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_vacations')
        .delete()
        .eq('id', vacationId);

      if (error) throw error;
      
      this.vacations = this.vacations.filter(v => v.id !== vacationId);
    } catch (error) {
      console.error('Erro ao remover férias:', error);
      throw error;
    }
  }

  getByDateRange(startDate: Date, endDate: Date): Vacation[] {
    return this.vacations.filter(v => v.isInDateRange(startDate, endDate));
  }

  getByMonth(year: number, month: number): Vacation[] {
    return this.vacations.filter(v => v.isInMonth(year, month));
  }

  getByStatus(status: VacationStatus): Vacation[] {
    return this.vacations.filter(v => v.status === status);
  }

  getByUserId(userId: string): Vacation[] {
    return this.vacations.filter(v => v.userId === userId);
  }

  async approveVacation(vacationId: string, comment?: string): Promise<void> {
    const vacation = this.vacations.find(v => v.id === vacationId);
    if (!vacation) throw new Error('Férias não encontradas');

    vacation.approve(comment);
    await this.update(vacation);
  }

  async rejectVacation(vacationId: string, comment?: string): Promise<void> {
    const vacation = this.vacations.find(v => v.id === vacationId);
    if (!vacation) throw new Error('Férias não encontradas');

    vacation.reject(comment);
    await this.update(vacation);
  }

  getStatistics() {
    return {
      total: this.vacations.length,
      pending: this.getPending().length,
      approved: this.getApproved().length,
      rejected: this.getRejected().length
    };
  }

  getDaysInMonth(year: number, month: number): number {
    return this.getByMonth(year, month).length;
  }

  getWorkingDaysInMonth(year: number, month: number): number {
    return this.getByMonth(year, month).filter(v => !v.isWeekend()).length;
  }
} 