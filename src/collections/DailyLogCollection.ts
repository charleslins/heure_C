import { DailyLog, EntryType } from '../models/DailyLog';
import { supabase } from '../utils/supabaseClient';

export class DailyLogCollection {
  private logs: DailyLog[] = [];

  constructor(initialLogs: DailyLog[] = []) {
    this.logs = initialLogs;
  }

  async loadForMonth(userId: string, year: number, month: number): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_daily_logs')
        .select('*')
        .eq('userId', userId)
        .gte('date', `${year}-${String(month + 1).padStart(2, '0')}-01`)
        .lt('date', `${year}-${String(month + 2).padStart(2, '0')}-01`)
        .order('date');

      if (error) throw error;
      
      this.logs = (data || []).map(log => new DailyLog(log));
    } catch (error) {
      console.error('Erro ao carregar registros diários:', error);
      throw error;
    }
  }

  async loadForDateRange(userId: string, startDate: string, endDate: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_daily_logs')
        .select('*')
        .eq('userId', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      if (error) throw error;
      
      this.logs = (data || []).map(log => new DailyLog(log));
    } catch (error) {
      console.error('Erro ao carregar registros diários:', error);
      throw error;
    }
  }

  getAll(): DailyLog[] {
    return this.logs;
  }

  getByDate(date: string): DailyLog | undefined {
    return this.logs.find(log => log.date === date);
  }

  getByType(type: EntryType): DailyLog[] {
    return this.logs.filter(log => log.type === type);
  }

  async add(log: DailyLog): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_daily_logs')
        .insert(log.toJSON());

      if (error) throw error;
      
      this.logs.push(log);
      this.sortLogs();
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
      throw error;
    }
  }

  async update(log: DailyLog): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_daily_logs')
        .update(log.toJSON())
        .eq('id', log.id);

      if (error) throw error;
      
      const index = this.logs.findIndex(l => l.id === log.id);
      if (index !== -1) {
        this.logs[index] = log;
      }
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      throw error;
    }
  }

  async remove(logId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_daily_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
      
      this.logs = this.logs.filter(l => l.id !== logId);
    } catch (error) {
      console.error('Erro ao remover registro:', error);
      throw error;
    }
  }

  private sortLogs(): void {
    this.logs.sort((a, b) => a.date.localeCompare(b.date));
  }

  getTotalHours(): number {
    return this.logs.reduce((total, log) => total + log.totalHours, 0);
  }

  getTotalWorkDays(): number {
    return this.logs.filter(log => log.isWorkDay()).length;
  }

  getWorkHoursByType(): Record<EntryType, number> {
    return this.logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + log.totalHours;
      return acc;
    }, {} as Record<EntryType, number>);
  }

  getDailyAverageHours(): number {
    const workDays = this.getTotalWorkDays();
    return workDays > 0 ? this.getTotalHours() / workDays : 0;
  }

  getIncompleteEntries(): DailyLog[] {
    return this.logs.filter(log => !log.isComplete());
  }

  async bulkUpdate(logs: DailyLog[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_daily_logs')
        .upsert(logs.map(log => log.toJSON()));

      if (error) throw error;

      // Atualizar a coleção local
      logs.forEach(log => {
        const index = this.logs.findIndex(l => l.id === log.id);
        if (index !== -1) {
          this.logs[index] = log;
        } else {
          this.logs.push(log);
        }
      });

      this.sortLogs();
    } catch (error) {
      console.error('Erro ao atualizar registros em lote:', error);
      throw error;
    }
  }
} 