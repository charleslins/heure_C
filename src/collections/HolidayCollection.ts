import { Holiday } from "../models/Holiday";
import { supabase } from "../utils/supabaseClient";

export class HolidayCollection {
  private holidays: Holiday[] = [];

  constructor(initialHolidays: Holiday[] = []) {
    this.holidays = initialHolidays;
  }

  async loadForYear(year: number, cantonId?: number): Promise<void> {
    try {
      let query = supabase
        .from("global_holidays")
        .select("*")
        .or(`date.gte.${year}-01-01,repeatsAnnually.eq.true`)
        .lt("date", `${year + 1}-01-01`);

      if (cantonId) {
        query = query.or(`cantonId.eq.${cantonId},cantonId.is.null`);
      }

      const { data, error } = await query;

      if (error) throw error;

      this.holidays = (data || []).map((h) => new Holiday(h));
    } catch (error) {
      console.error("Erro ao carregar feriados:", error);
      throw error;
    }
  }

  async loadAll(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("global_holidays")
        .select("*")
        .order("date");

      if (error) throw error;

      this.holidays = (data || []).map((h) => new Holiday(h));
    } catch (error) {
      console.error("Erro ao carregar todos os feriados:", error);
      throw error;
    }
  }

  getAll(): Holiday[] {
    return this.holidays;
  }

  getByYear(year: number): Holiday[] {
    return this.holidays.filter((h) => h.isInYear(year));
  }

  getByMonth(year: number, month: number): Holiday[] {
    return this.holidays.filter((h) => h.isInYear(year) && h.isInMonth(month));
  }

  getGlobalHolidays(): Holiday[] {
    return this.holidays.filter((h) => h.isGlobal());
  }

  getRegionalHolidays(): Holiday[] {
    return this.holidays.filter((h) => h.isRegional());
  }

  getCustomHolidays(): Holiday[] {
    return this.holidays.filter((h) => h.isCustom());
  }

  async add(holiday: Holiday): Promise<void> {
    try {
      const { error } = await supabase
        .from("global_holidays")
        .insert(holiday.toJSON());

      if (error) throw error;

      this.holidays.push(holiday);
    } catch (error) {
      console.error("Erro ao adicionar feriado:", error);
      throw error;
    }
  }

  async update(holiday: Holiday): Promise<void> {
    try {
      const { error } = await supabase
        .from("global_holidays")
        .update(holiday.toJSON())
        .eq("id", holiday.id);

      if (error) throw error;

      const index = this.holidays.findIndex((h) => h.id === holiday.id);
      if (index !== -1) {
        this.holidays[index] = holiday;
      }
    } catch (error) {
      console.error("Erro ao atualizar feriado:", error);
      throw error;
    }
  }

  async remove(holidayId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("global_holidays")
        .delete()
        .eq("id", holidayId);

      if (error) throw error;

      this.holidays = this.holidays.filter((h) => h.id !== holidayId);
    } catch (error) {
      console.error("Erro ao remover feriado:", error);
      throw error;
    }
  }

  getByDateRange(startDate: Date, endDate: Date): Holiday[] {
    return this.holidays.filter((h) => h.isInDateRange(startDate, endDate));
  }

  getByCantonId(cantonId: number): Holiday[] {
    return this.holidays.filter((h) => h.cantonId === cantonId || h.isGlobal());
  }

  getByMunicipalityId(municipalityId: number): Holiday[] {
    return this.holidays.filter(
      (h) => h.municipalityId === municipalityId || h.isGlobal(),
    );
  }

  getStatistics(year: number) {
    const yearHolidays = this.getByYear(year);
    return {
      total: yearHolidays.length,
      official: yearHolidays.filter((h) => h.isOfficial).length,
      custom: yearHolidays.filter((h) => h.isCustom()).length,
      regional: yearHolidays.filter((h) => h.isRegional()).length,
      global: yearHolidays.filter((h) => h.isGlobal()).length,
    };
  }

  getMonthlyDistribution(year: number): Record<number, Holiday[]> {
    const distribution: Record<number, Holiday[]> = {};
    for (let month = 0; month < 12; month++) {
      distribution[month] = this.getByMonth(year, month);
    }
    return distribution;
  }
}
