export type HolidayType = 'OFFICIAL' | 'CUSTOM' | 'REGIONAL';

export class Holiday {
  id: string;
  name: string;
  date: string;
  type: HolidayType;
  isOfficial: boolean;
  cantonId?: number;
  municipalityId?: number;
  description?: string;
  repeatsAnnually: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data: Partial<Holiday>) {
    this.id = data.id || `holiday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = data.name || '';
    this.date = data.date || '';
    this.type = data.type || 'OFFICIAL';
    this.isOfficial = data.isOfficial ?? true;
    this.cantonId = data.cantonId;
    this.municipalityId = data.municipalityId;
    this.description = data.description;
    this.repeatsAnnually = data.repeatsAnnually ?? false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      date: this.date,
      type: this.type,
      isOfficial: this.isOfficial,
      cantonId: this.cantonId,
      municipalityId: this.municipalityId,
      description: this.description,
      repeatsAnnually: this.repeatsAnnually,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  getFormattedDate(locale: string = 'pt-BR'): string {
    return new Date(this.date).toLocaleDateString(locale);
  }

  getYear(): number {
    return new Date(this.date).getFullYear();
  }

  getMonth(): number {
    return new Date(this.date).getMonth();
  }

  isInYear(year: number): boolean {
    return this.getYear() === year;
  }

  isInMonth(month: number): boolean {
    return this.getMonth() === month;
  }

  isGlobal(): boolean {
    return !this.cantonId && !this.municipalityId;
  }

  isRegional(): boolean {
    return !!this.cantonId || !!this.municipalityId;
  }

  isCustom(): boolean {
    return !this.isOfficial;
  }

  isInDateRange(startDate: Date, endDate: Date): boolean {
    const holidayDate = new Date(this.date);
    return holidayDate >= startDate && holidayDate <= endDate;
  }

  clone(): Holiday {
    return new Holiday(this.toJSON());
  }

  update(data: Partial<Holiday>): void {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
  }

  static createOfficial(name: string, date: string): Holiday {
    return new Holiday({
      name,
      date,
      type: 'OFFICIAL',
      isOfficial: true,
      repeatsAnnually: true
    });
  }

  static createCustom(name: string, date: string, cantonId?: number): Holiday {
    return new Holiday({
      name,
      date,
      type: 'CUSTOM',
      isOfficial: false,
      cantonId,
      repeatsAnnually: false
    });
  }

  static createRegional(name: string, date: string, cantonId: number, municipalityId?: number): Holiday {
    return new Holiday({
      name,
      date,
      type: 'REGIONAL',
      isOfficial: true,
      cantonId,
      municipalityId,
      repeatsAnnually: true
    });
  }
} 