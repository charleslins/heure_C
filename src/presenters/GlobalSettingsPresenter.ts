import { GlobalSettings, WorkTimeDefaults, VacationRules, RegionalSettings } from '../models/GlobalSettings';
import { GlobalSettingsCollection } from '../collections/GlobalSettingsCollection';
import { useTranslation } from 'react-i18next';

export class GlobalSettingsPresenter {
  private collection: GlobalSettingsCollection;
  private t: (key: string) => string;

  constructor(collection: GlobalSettingsCollection) {
    this.collection = collection;
    const { t } = useTranslation();
    this.t = t;
  }

  async initialize(): Promise<void> {
    await this.collection.load();
  }

  getSettingsViewModel() {
    const settings = this.collection.get();

    return {
      general: {
        tauxPercent: {
          value: settings.tauxPercent,
          label: this.t('globalSettings.workRateLabel'),
          description: this.t('globalSettings.workRateDescription')
        },
        annualVacationDays: {
          value: settings.annualVacationDays,
          label: this.t('globalSettings.annualVacationDaysLabel'),
          description: this.t('globalSettings.annualVacationDaysDescription'),
          adjusted: settings.getAdjustedVacationDays()
        }
      },
      workTime: {
        isConfigured: settings.isWorkTimeConfigured(),
        defaultHours: settings.getDefaultWorkHours(),
        start: settings.workTimeDefaults?.overallStartTime,
        end: settings.workTimeDefaults?.overallEndTime,
        label: this.t('globalSettings.workTimeLabel'),
        description: this.t('globalSettings.workTimeDescription')
      },
      vacationRules: {
        minAdvanceNotice: {
          value: settings.vacationRules.minAdvanceNotice,
          label: this.t('globalSettings.minAdvanceNoticeLabel'),
          description: this.t('globalSettings.minAdvanceNoticeDescription')
        },
        maxConsecutiveDays: {
          value: settings.vacationRules.maxConsecutiveDays,
          label: this.t('globalSettings.maxConsecutiveDaysLabel'),
          description: this.t('globalSettings.maxConsecutiveDaysDescription')
        },
        autoApproval: {
          enabled: settings.isAutoApprovalEnabled(),
          label: this.t('globalSettings.autoApprovalLabel'),
          description: this.t('globalSettings.autoApprovalDescription')
        },
        maxConcurrentUsers: settings.vacationRules.maxConcurrentUsers
          ? {
              value: settings.vacationRules.maxConcurrentUsers,
              label: this.t('globalSettings.maxConcurrentUsersLabel'),
              description: this.t('globalSettings.maxConcurrentUsersDescription')
            }
          : undefined
      },
      regional: {
        defaultCanton: settings.regionalSettings.defaultCantonId,
        useRegionalHolidays: {
          enabled: settings.isRegionalHolidaysEnabled(),
          label: this.t('globalSettings.useRegionalHolidaysLabel'),
          description: this.t('globalSettings.useRegionalHolidaysDescription')
        },
        allowMunicipalityHolidays: {
          enabled: settings.isMunicipalityHolidaysEnabled(),
          label: this.t('globalSettings.allowMunicipalityHolidaysLabel'),
          description: this.t('globalSettings.allowMunicipalityHolidaysDescription')
        }
      }
    };
  }

  async updateWorkTime(data: WorkTimeDefaults): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.update({ workTimeDefaults: data });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar horário de trabalho:', error);
      return {
        success: false,
        message: this.t('globalSettings.workTimeUpdateError')
      };
    }
  }

  async updateVacationRules(data: VacationRules): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.update({ vacationRules: data });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar regras de férias:', error);
      return {
        success: false,
        message: this.t('globalSettings.vacationRulesUpdateError')
      };
    }
  }

  async updateRegionalSettings(data: RegionalSettings): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.update({ regionalSettings: data });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar configurações regionais:', error);
      return {
        success: false,
        message: this.t('globalSettings.regionalSettingsUpdateError')
      };
    }
  }

  async updateGeneralSettings(data: {
    tauxPercent?: number;
    annualVacationDays?: number;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.update(data);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar configurações gerais:', error);
      return {
        success: false,
        message: this.t('globalSettings.generalSettingsUpdateError')
      };
    }
  }

  async resetToDefaults(): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.reset();
      return { success: true };
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      return {
        success: false,
        message: this.t('globalSettings.resetError')
      };
    }
  }

  validateVacationRequest(startDate: Date, endDate: Date, userId: string): {
    isValid: boolean;
    message?: string;
    autoApproved?: boolean;
  } {
    const validation = this.collection.validateVacationRequest(startDate, endDate, userId);
    if (!validation.isValid) {
      return validation;
    }

    const autoApproved = this.collection.shouldAutoApprove(startDate, endDate);
    return {
      isValid: true,
      autoApproved
    };
  }

  getWorkHoursForDate(date: Date): number {
    return this.collection.getWorkHoursForDate(date);
  }

  shouldConsiderRegionalHolidays(cantonId?: number): boolean {
    return this.collection.shouldConsiderRegionalHolidays(cantonId);
  }

  shouldConsiderMunicipalityHolidays(): boolean {
    return this.collection.shouldConsiderMunicipalityHolidays();
  }
} 