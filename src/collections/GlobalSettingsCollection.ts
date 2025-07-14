import { GlobalSettings } from "../models/GlobalSettings";
import { supabase } from "../utils/supabaseClient";

export class GlobalSettingsCollection {
  private settings: GlobalSettings;

  constructor(initialSettings?: GlobalSettings) {
    this.settings = initialSettings || GlobalSettings.createDefault();
  }

  async load(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("global_settings")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Não encontrado
          // Criar configurações padrão se não existirem
          const defaultSettings = GlobalSettings.createDefault();
          await this.save(defaultSettings);
          this.settings = defaultSettings;
        } else {
          throw error;
        }
      } else {
        this.settings = new GlobalSettings(data);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações globais:", error);
      throw error;
    }
  }

  async save(settings: GlobalSettings): Promise<void> {
    try {
      const { error } = await supabase
        .from("global_settings")
        .upsert(settings.toJSON());

      if (error) throw error;

      this.settings = settings;
    } catch (error) {
      console.error("Erro ao salvar configurações globais:", error);
      throw error;
    }
  }

  get(): GlobalSettings {
    return this.settings;
  }

  async update(data: Partial<GlobalSettings>): Promise<void> {
    this.settings.update(data);
    await this.save(this.settings);
  }

  async reset(): Promise<void> {
    const defaultSettings = GlobalSettings.createDefault();
    await this.save(defaultSettings);
  }

  // Métodos de validação específicos
  validateVacationRequest(
    startDate: Date,
    endDate: Date,
    userId: string,
  ): {
    isValid: boolean;
    message?: string;
  } {
    // Verificar aviso mínimo
    const today = new Date();
    const daysUntilStart = Math.floor(
      (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntilStart < this.settings.vacationRules.minAdvanceNotice) {
      return {
        isValid: false,
        message: `Solicitações devem ser feitas com pelo menos ${this.settings.vacationRules.minAdvanceNotice} dias de antecedência.`,
      };
    }

    // Verificar dias consecutivos
    const vacationDays =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
    if (vacationDays > this.settings.vacationRules.maxConsecutiveDays) {
      return {
        isValid: false,
        message: `O período máximo de férias consecutivas é de ${this.settings.vacationRules.maxConsecutiveDays} dias.`,
      };
    }

    return { isValid: true };
  }

  shouldAutoApprove(startDate: Date, endDate: Date): boolean {
    if (!this.settings.isAutoApprovalEnabled()) {
      return false;
    }

    const today = new Date();
    const daysUntilStart = Math.floor(
      (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    const vacationDays =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    return (
      daysUntilStart >= this.settings.vacationRules.minAdvanceNotice &&
      vacationDays <= this.settings.vacationRules.maxConsecutiveDays
    );
  }

  getWorkHoursForDate(date: Date): number {
    // Implementar lógica específica por dia da semana se necessário
    return this.settings.getDefaultWorkHours();
  }

  shouldConsiderRegionalHolidays(cantonId?: number): boolean {
    return (
      this.settings.isRegionalHolidaysEnabled() &&
      (!cantonId || cantonId === this.settings.regionalSettings.defaultCantonId)
    );
  }

  shouldConsiderMunicipalityHolidays(): boolean {
    return this.settings.isMunicipalityHolidaysEnabled();
  }

  getAdjustedVacationDays(): number {
    return this.settings.getAdjustedVacationDays();
  }
}
