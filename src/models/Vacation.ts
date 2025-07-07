import { VacationStatus } from '../types';

export class Vacation {
  id: string;
  userId: string;
  date: string;
  status: VacationStatus;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: Partial<Vacation>) {
    this.id = data.id || `vacation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.userId = data.userId || '';
    this.date = data.date || '';
    this.status = data.status || VacationStatus.PENDING_APPROVAL;
    this.adminComment = data.adminComment;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      date: this.date,
      status: this.status,
      adminComment: this.adminComment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  isPending(): boolean {
    return this.status === VacationStatus.PENDING_APPROVAL;
  }

  isApproved(): boolean {
    return this.status === VacationStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === VacationStatus.REJECTED;
  }

  approve(comment?: string): void {
    this.status = VacationStatus.APPROVED;
    this.adminComment = comment;
    this.updatedAt = new Date().toISOString();
  }

  reject(comment?: string): void {
    this.status = VacationStatus.REJECTED;
    this.adminComment = comment;
    this.updatedAt = new Date().toISOString();
  }

  getFormattedDate(locale: string = 'pt-BR'): string {
    return new Date(this.date).toLocaleDateString(locale);
  }

  isInMonth(year: number, month: number): boolean {
    const vacationDate = new Date(this.date);
    return vacationDate.getFullYear() === year && vacationDate.getMonth() === month;
  }

  isInDateRange(startDate: Date, endDate: Date): boolean {
    const vacationDate = new Date(this.date);
    return vacationDate >= startDate && vacationDate <= endDate;
  }

  getDayOfWeek(): number {
    return new Date(this.date).getDay();
  }

  isWeekend(): boolean {
    const day = this.getDayOfWeek();
    return day === 0 || day === 6; // 0 = Domingo, 6 = Sábado
  }

  static createFromDate(userId: string, date: string): Vacation {
    return new Vacation({
      userId,
      date,
      status: VacationStatus.PENDING_APPROVAL
    });
  }
} 