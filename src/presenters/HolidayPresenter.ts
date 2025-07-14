import { Holiday } from "../models/Holiday";
import { HolidayCollection } from "../collections/HolidayCollection";
import { useTranslation } from "react-i18next";

export class HolidayPresenter {
  private collection: HolidayCollection;
  private t: (key: string) => string;
  private selectedYear: number;
  private selectedCantonId?: number;

  constructor(collection: HolidayCollection) {
    this.collection = collection;
    const { t } = useTranslation();
    this.t = t;
    this.selectedYear = new Date().getFullYear();
  }

  setYear(year: number) {
    this.selectedYear = year;
  }

  setCanton(cantonId?: number) {
    this.selectedCantonId = cantonId;
  }

  async initialize(): Promise<void> {
    await this.collection.loadForYear(this.selectedYear, this.selectedCantonId);
  }

  getHolidayListViewModel() {
    const holidays = this.collection.getAll();
    const stats = this.collection.getStatistics(this.selectedYear);

    return {
      holidays: holidays.map((h) => this.mapHolidayToViewModel(h)),
      statistics: {
        total: stats.total,
        official: stats.official,
        custom: stats.custom,
        regional: stats.regional,
        global: stats.global,
      },
      monthlyDistribution: this.getMonthlyDistributionViewModel(),
    };
  }

  private mapHolidayToViewModel(holiday: Holiday) {
    return {
      id: holiday.id,
      name: holiday.name,
      date: holiday.getFormattedDate(),
      type: this.t(`holidays.types.${holiday.type.toLowerCase()}`),
      description: holiday.description,
      isOfficial: holiday.isOfficial,
      isCustom: holiday.isCustom(),
      isRegional: holiday.isRegional(),
      isGlobal: holiday.isGlobal(),
      repeatsAnnually: holiday.repeatsAnnually,
      cantonId: holiday.cantonId,
      municipalityId: holiday.municipalityId,
      typeClass: this.getTypeClass(holiday),
    };
  }

  private getTypeClass(holiday: Holiday): string {
    if (holiday.isCustom()) {
      return "bg-purple-100 text-purple-800";
    }
    if (holiday.isRegional()) {
      return "bg-blue-100 text-blue-800";
    }
    return "bg-green-100 text-green-800";
  }

  private getMonthlyDistributionViewModel() {
    const distribution = this.collection.getMonthlyDistribution(
      this.selectedYear,
    );
    return Object.entries(distribution).map(([month, holidays]) => ({
      month: this.t(`months.${parseInt(month)}`),
      count: holidays.length,
      holidays: holidays.map((h) => this.mapHolidayToViewModel(h)),
    }));
  }

  async createHoliday(data: {
    name: string;
    date: string;
    type: "OFFICIAL" | "CUSTOM" | "REGIONAL";
    cantonId?: number;
    municipalityId?: number;
    description?: string;
    repeatsAnnually?: boolean;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      let holiday: Holiday;

      switch (data.type) {
        case "OFFICIAL":
          holiday = Holiday.createOfficial(data.name, data.date);
          break;
        case "CUSTOM":
          holiday = Holiday.createCustom(data.name, data.date, data.cantonId);
          break;
        case "REGIONAL":
          if (!data.cantonId) {
            throw new Error("Canton ID is required for regional holidays");
          }
          holiday = Holiday.createRegional(
            data.name,
            data.date,
            data.cantonId,
            data.municipalityId,
          );
          break;
        default:
          throw new Error("Invalid holiday type");
      }

      if (data.description) {
        holiday.description = data.description;
      }
      if (data.repeatsAnnually !== undefined) {
        holiday.repeatsAnnually = data.repeatsAnnually;
      }

      await this.collection.add(holiday);
      return { success: true };
    } catch (error) {
      console.error("Erro ao criar feriado:", error);
      return {
        success: false,
        message: this.t("holidayManagement.createError"),
      };
    }
  }

  async updateHoliday(
    holidayId: string,
    data: Partial<Holiday>,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const holiday = this.collection.getAll().find((h) => h.id === holidayId);
      if (!holiday) {
        return {
          success: false,
          message: this.t("holidayManagement.holidayNotFound"),
        };
      }

      holiday.update(data);
      await this.collection.update(holiday);
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar feriado:", error);
      return {
        success: false,
        message: this.t("holidayManagement.updateError"),
      };
    }
  }

  async removeHoliday(
    holidayId: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.remove(holidayId);
      return { success: true };
    } catch (error) {
      console.error("Erro ao remover feriado:", error);
      return {
        success: false,
        message: this.t("holidayManagement.removeError"),
      };
    }
  }

  getHolidaysByMonth(month: number) {
    return this.collection
      .getByMonth(this.selectedYear, month)
      .map((h) => this.mapHolidayToViewModel(h));
  }

  getHolidaysByType(type: "OFFICIAL" | "CUSTOM" | "REGIONAL") {
    let holidays: Holiday[];
    switch (type) {
      case "OFFICIAL":
        holidays = this.collection.getGlobalHolidays();
        break;
      case "CUSTOM":
        holidays = this.collection.getCustomHolidays();
        break;
      case "REGIONAL":
        holidays = this.collection.getRegionalHolidays();
        break;
      default:
        holidays = [];
    }
    return holidays.map((h) => this.mapHolidayToViewModel(h));
  }

  getHolidaysByRegion(cantonId: number, municipalityId?: number) {
    let holidays = this.collection.getByCantonId(cantonId);
    if (municipalityId) {
      holidays = holidays.filter(
        (h) => !h.municipalityId || h.municipalityId === municipalityId,
      );
    }
    return holidays.map((h) => this.mapHolidayToViewModel(h));
  }
}
