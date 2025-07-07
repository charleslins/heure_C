export type EntryType = 'Regular' | 'Vacance' | 'Ferié' | 'Récupération' | 'Maladie';

export interface TimeSegment {
  start: string;
  end: string;
}

export class DailyLog {
  id: string;
  userId: string;
  date: string;
  type: EntryType;
  morning?: TimeSegment;
  afternoon?: TimeSegment;
  totalHours: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: Partial<DailyLog>) {
    this.id = data.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.userId = data.userId || '';
    this.date = data.date || '';
    this.type = data.type || 'Regular';
    this.morning = data.morning;
    this.afternoon = data.afternoon;
    this.totalHours = data.totalHours || 0;
    this.comment = data.comment;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      date: this.date,
      type: this.type,
      morning: this.morning,
      afternoon: this.afternoon,
      totalHours: this.totalHours,
      comment: this.comment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  private calculateSegmentHours(segment?: TimeSegment): number {
    if (!segment || !segment.start || !segment.end) return 0;

    const startParts = segment.start.split(':').map(Number);
    const endParts = segment.end.split(':').map(Number);

    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];

    return (endMinutes - startMinutes) / 60;
  }

  calculateTotalHours(): number {
    const morningHours = this.calculateSegmentHours(this.morning);
    const afternoonHours = this.calculateSegmentHours(this.afternoon);
    this.totalHours = morningHours + afternoonHours;
    return this.totalHours;
  }

  getFormattedDate(locale: string = 'pt-BR'): string {
    return new Date(this.date).toLocaleDateString(locale);
  }

  getFormattedTime(segment?: TimeSegment): string {
    if (!segment) return '--:--';
    return `${segment.start} - ${segment.end}`;
  }

  isComplete(): boolean {
    return !!(
      (this.morning?.start && this.morning?.end) ||
      (this.afternoon?.start && this.afternoon?.end)
    );
  }

  isWorkDay(): boolean {
    return this.type === 'Regular' || this.type === 'Récupération';
  }

  update(data: Partial<DailyLog>): void {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
    if (data.morning || data.afternoon) {
      this.calculateTotalHours();
    }
  }

  setMorningTime(start: string, end: string): void {
    this.morning = { start, end };
    this.calculateTotalHours();
  }

  setAfternoonTime(start: string, end: string): void {
    this.afternoon = { start, end };
    this.calculateTotalHours();
  }

  clearMorningTime(): void {
    this.morning = undefined;
    this.calculateTotalHours();
  }

  clearAfternoonTime(): void {
    this.afternoon = undefined;
    this.calculateTotalHours();
  }

  static createRegular(userId: string, date: string): DailyLog {
    return new DailyLog({
      userId,
      date,
      type: 'Regular'
    });
  }

  static createSickLeave(userId: string, date: string, comment?: string): DailyLog {
    return new DailyLog({
      userId,
      date,
      type: 'Maladie',
      comment
    });
  }

  static createRecovery(userId: string, date: string, comment?: string): DailyLog {
    return new DailyLog({
      userId,
      date,
      type: 'Récupération',
      comment
    });
  }
} 