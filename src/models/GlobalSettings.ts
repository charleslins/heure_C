export interface WorkTimeDefaults {
  overallStartTime?: string;
  overallEndTime?: string;
}

export interface VacationRules {
  minAdvanceNotice: number;
  maxConsecutiveDays: number;
  autoApprovalEnabled: boolean;
  maxConcurrentUsers?: number;
}

export interface RegionalSettings {
  defaultCantonId?: number;
  useRegionalHolidays: boolean;
  allowMunicipalityHolidays: boolean;
}

export class GlobalSettings {
  id: string;
  tauxPercent: number;
  annualVacationDays: number;
  workTimeDefaults?: WorkTimeDefaults;
  vacationRules: VacationRules;
  regionalSettings: RegionalSettings;
  createdAt: string;
  updatedAt: string;

  constructor(data: Partial<GlobalSettings>) {
    this.id = data.id || 'global-settings';
    this.tauxPercent = data.tauxPercent || 100;
    this.annualVacationDays = data.annualVacationDays || 20;
    this.workTimeDefaults = data.workTimeDefaults;
    this.vacationRules = {
      minAdvanceNotice: data.vacationRules?.minAdvanceNotice || 14,
      maxConsecutiveDays: data.vacationRules?.maxConsecutiveDays || 30,
      autoApprovalEnabled: data.vacationRules?.autoApprovalEnabled || false,
      maxConcurrentUsers: data.vacationRules?.maxConcurrentUsers
    };
    this.regionalSettings = {
      defaultCantonId: data.regionalSettings?.defaultCantonId,
      useRegionalHolidays: data.regionalSettings?.useRegionalHolidays || true,
      allowMunicipalityHolidays: data.regionalSettings?.allowMunicipalityHolidays || false
    };
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      tauxPercent: this.tauxPercent,
      annualVacationDays: this.annualVacationDays,
      workTimeDefaults: this.workTimeDefaults,
      vacationRules: this.vacationRules,
      regionalSettings: this.regionalSettings,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  update(data: Partial<GlobalSettings>): void {
    if (data.tauxPercent !== undefined) {
      this.tauxPercent = this.validateTauxPercent(data.tauxPercent);
    }
    if (data.annualVacationDays !== undefined) {
      this.annualVacationDays = this.validateAnnualVacationDays(data.annualVacationDays);
    }
    if (data.workTimeDefaults) {
      this.workTimeDefaults = this.validateWorkTimeDefaults(data.workTimeDefaults);
    }
    if (data.vacationRules) {
      this.vacationRules = this.validateVacationRules(data.vacationRules);
    }
    if (data.regionalSettings) {
      this.regionalSettings = this.validateRegionalSettings(data.regionalSettings);
    }
    this.updatedAt = new Date().toISOString();
  }

  private validateTauxPercent(value: number): number {
    if (value < 0) return 0;
    if (value > 100) return 100;
    return value;
  }

  private validateAnnualVacationDays(value: number): number {
    if (value < 0) return 0;
    if (value > 365) return 365;
    return value;
  }

  private validateWorkTimeDefaults(defaults: WorkTimeDefaults): WorkTimeDefaults {
    if (!defaults.overallStartTime && !defaults.overallEndTime) {
      return undefined;
    }
    return defaults;
  }

  private validateVacationRules(rules: VacationRules): VacationRules {
    return {
      minAdvanceNotice: Math.max(0, rules.minAdvanceNotice),
      maxConsecutiveDays: Math.max(1, rules.maxConsecutiveDays),
      autoApprovalEnabled: rules.autoApprovalEnabled,
      maxConcurrentUsers: rules.maxConcurrentUsers !== undefined 
        ? Math.max(1, rules.maxConcurrentUsers) 
        : undefined
    };
  }

  private validateRegionalSettings(settings: RegionalSettings): RegionalSettings {
    return {
      defaultCantonId: settings.defaultCantonId,
      useRegionalHolidays: settings.useRegionalHolidays,
      allowMunicipalityHolidays: settings.allowMunicipalityHolidays
    };
  }

  isWorkTimeConfigured(): boolean {
    return !!(this.workTimeDefaults?.overallStartTime && this.workTimeDefaults?.overallEndTime);
  }

  isAutoApprovalEnabled(): boolean {
    return this.vacationRules.autoApprovalEnabled;
  }

  isRegionalHolidaysEnabled(): boolean {
    return this.regionalSettings.useRegionalHolidays;
  }

  isMunicipalityHolidaysEnabled(): boolean {
    return this.regionalSettings.allowMunicipalityHolidays;
  }

  getDefaultWorkHours(): number {
    if (!this.isWorkTimeConfigured()) return 8; // Padrão de 8 horas

    const start = this.workTimeDefaults.overallStartTime.split(':').map(Number);
    const end = this.workTimeDefaults.overallEndTime.split(':').map(Number);
    
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    
    return (endMinutes - startMinutes) / 60;
  }

  getAdjustedVacationDays(): number {
    return Math.round((this.annualVacationDays * this.tauxPercent) / 100);
  }

  static createDefault(): GlobalSettings {
    return new GlobalSettings({
      tauxPercent: 100,
      annualVacationDays: 20,
      workTimeDefaults: {
        overallStartTime: '08:00',
        overallEndTime: '17:00'
      },
      vacationRules: {
        minAdvanceNotice: 14,
        maxConsecutiveDays: 30,
        autoApprovalEnabled: false
      },
      regionalSettings: {
        useRegionalHolidays: true,
        allowMunicipalityHolidays: false
      }
    });
  }
} 