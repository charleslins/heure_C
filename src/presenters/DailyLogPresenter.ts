import { DailyLog, EntryType, TimeSegment } from "../models/DailyLog";
import { DailyLogCollection } from "../collections/DailyLogCollection";
import { useTranslation } from "react-i18next";

export class DailyLogPresenter {
  private collection: DailyLogCollection;
  private t: (key: string) => string;
  private userId?: string;
  private selectedYear: number;
  private selectedMonth: number;

  constructor(collection: DailyLogCollection) {
    this.collection = collection;
    const { t } = useTranslation();
    this.t = t;
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth();
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  setDate(year: number, month: number) {
    this.selectedYear = year;
    this.selectedMonth = month;
  }

  async initialize(): Promise<void> {
    if (!this.userId) throw new Error("UserId não definido");
    await this.collection.loadForMonth(
      this.userId,
      this.selectedYear,
      this.selectedMonth,
    );
  }

  getDailyLogViewModel() {
    const logs = this.collection.getAll();
    const hoursByType = this.collection.getWorkHoursByType();

    return {
      logs: logs.map((log) => this.mapDailyLogToViewModel(log)),
      summary: {
        totalHours: this.collection.getTotalHours(),
        totalWorkDays: this.collection.getTotalWorkDays(),
        averageHours: this.collection.getDailyAverageHours(),
        incompleteEntries: this.collection.getIncompleteEntries().length,
        hoursByType: Object.entries(hoursByType).map(([type, hours]) => ({
          type: this.t(`entryTypes.${type}`),
          hours,
          className: this.getTypeClass(type as EntryType),
        })),
      },
    };
  }

  private mapDailyLogToViewModel(log: DailyLog) {
    return {
      id: log.id,
      date: log.getFormattedDate(),
      type: this.t(`entryTypes.${log.type}`),
      morning: log.morning
        ? {
            time: log.getFormattedTime(log.morning),
            isComplete: !!(log.morning.start && log.morning.end),
          }
        : undefined,
      afternoon: log.afternoon
        ? {
            time: log.getFormattedTime(log.afternoon),
            isComplete: !!(log.afternoon.start && log.afternoon.end),
          }
        : undefined,
      totalHours: log.totalHours.toFixed(1),
      comment: log.comment,
      isComplete: log.isComplete(),
      isWorkDay: log.isWorkDay(),
      typeClass: this.getTypeClass(log.type),
    };
  }

  private getTypeClass(type: EntryType): string {
    const classes = {
      Regular: "bg-blue-100 text-blue-800",
      Vacance: "bg-green-100 text-green-800",
      Ferié: "bg-purple-100 text-purple-800",
      Récupération: "bg-yellow-100 text-yellow-800",
      Maladie: "bg-red-100 text-red-800",
    };
    return classes[type] || "";
  }

  async createLog(
    date: string,
    type: EntryType = "Regular",
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.userId) throw new Error("UserId não definido");

      let log: DailyLog;
      switch (type) {
        case "Maladie":
          log = DailyLog.createSickLeave(this.userId, date);
          break;
        case "Récupération":
          log = DailyLog.createRecovery(this.userId, date);
          break;
        default:
          log = DailyLog.createRegular(this.userId, date);
      }

      await this.collection.add(log);
      return { success: true };
    } catch (error) {
      console.error("Erro ao criar registro:", error);
      return {
        success: false,
        message: this.t("dailyLog.createError"),
      };
    }
  }

  async updateLog(
    logId: string,
    data: {
      type?: EntryType;
      morning?: TimeSegment;
      afternoon?: TimeSegment;
      comment?: string;
    },
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const log = this.collection.getAll().find((l) => l.id === logId);
      if (!log) {
        return {
          success: false,
          message: this.t("dailyLog.logNotFound"),
        };
      }

      if (data.morning) {
        log.setMorningTime(data.morning.start, data.morning.end);
      }
      if (data.afternoon) {
        log.setAfternoonTime(data.afternoon.start, data.afternoon.end);
      }
      if (data.type) {
        log.update({ type: data.type });
      }
      if (data.comment !== undefined) {
        log.update({ comment: data.comment });
      }

      await this.collection.update(log);
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar registro:", error);
      return {
        success: false,
        message: this.t("dailyLog.updateError"),
      };
    }
  }

  async removeLog(
    logId: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.remove(logId);
      return { success: true };
    } catch (error) {
      console.error("Erro ao remover registro:", error);
      return {
        success: false,
        message: this.t("dailyLog.removeError"),
      };
    }
  }

  async bulkUpdateLogs(
    updates: Array<{
      date: string;
      type?: EntryType;
      morning?: TimeSegment;
      afternoon?: TimeSegment;
      comment?: string;
    }>,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.userId) throw new Error("UserId não definido");

      const logs: DailyLog[] = [];
      for (const update of updates) {
        let log = this.collection.getByDate(update.date);
        if (!log) {
          log = new DailyLog({ userId: this.userId, date: update.date });
        }

        if (update.morning) {
          log.setMorningTime(update.morning.start, update.morning.end);
        }
        if (update.afternoon) {
          log.setAfternoonTime(update.afternoon.start, update.afternoon.end);
        }
        if (update.type) {
          log.update({ type: update.type });
        }
        if (update.comment !== undefined) {
          log.update({ comment: update.comment });
        }

        logs.push(log);
      }

      await this.collection.bulkUpdate(logs);
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar registros em lote:", error);
      return {
        success: false,
        message: this.t("dailyLog.bulkUpdateError"),
      };
    }
  }

  getLogsByType(type: EntryType) {
    return this.collection
      .getByType(type)
      .map((log) => this.mapDailyLogToViewModel(log));
  }

  getIncompleteLogsViewModel() {
    return this.collection
      .getIncompleteEntries()
      .map((log) => this.mapDailyLogToViewModel(log));
  }
}
