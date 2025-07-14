import { Vacation } from "../models/Vacation";
import { VacationCollection } from "../collections/VacationCollection";
import { VacationStatus } from "@/types";
import { useTranslation } from "react-i18next";

export class VacationPresenter {
  private collection: VacationCollection;
  private t: (key: string) => string;
  private userId?: string;

  constructor(collection: VacationCollection) {
    this.collection = collection;
    const { t } = useTranslation();
    this.t = t;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  async initialize(year: number, month: number): Promise<void> {
    if (!this.userId) throw new Error("UserId não definido");
    await this.collection.loadForUser(this.userId, year, month);
  }

  async loadPendingRequests(): Promise<void> {
    await this.collection.loadPendingRequests();
  }

  getVacationListViewModel() {
    const vacations = this.collection.getAll();
    const stats = this.collection.getStatistics();

    return {
      vacations: vacations.map((v) => this.mapVacationToViewModel(v)),
      statistics: {
        total: stats.total,
        pending: stats.pending,
        approved: stats.approved,
        rejected: stats.rejected,
      },
    };
  }

  private mapVacationToViewModel(vacation: Vacation) {
    return {
      id: vacation.id,
      date: vacation.getFormattedDate(),
      status: this.t(`vacationStatuses.${vacation.status}`),
      statusClass: this.getStatusClass(vacation.status),
      adminComment: vacation.adminComment || this.t("common.noComment"),
      isWeekend: vacation.isWeekend(),
      isPending: vacation.isPending(),
      isApproved: vacation.isApproved(),
      isRejected: vacation.isRejected(),
      canEdit: vacation.isPending(),
      canDelete: !vacation.isPending(),
    };
  }

  private getStatusClass(status: VacationStatus): string {
    const classes: Record<VacationStatus, string> = {
      [VacationStatus.SELECTED]: "bg-indigo-100 text-indigo-800",
      [VacationStatus.PENDING_APPROVAL]: "bg-yellow-100 text-yellow-800",
      [VacationStatus.APPROVED]: "bg-green-100 text-green-800",
      [VacationStatus.REJECTED]: "bg-red-100 text-red-800",
    };
    return classes[status] || "";
  }

  async requestVacation(
    date: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.userId) throw new Error("UserId não definido");

      const vacation = Vacation.createFromDate(this.userId, date);
      await this.collection.add(vacation);

      return { success: true };
    } catch (error) {
      console.error("Erro ao solicitar férias:", error);
      return {
        success: false,
        message: this.t("vacationPage.requestError"),
      };
    }
  }

  async approveVacation(
    vacationId: string,
    comment?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.approveVacation(vacationId, comment);
      return { success: true };
    } catch (error) {
      console.error("Erro ao aprovar férias:", error);
      return {
        success: false,
        message: this.t("vacationPage.approvalError"),
      };
    }
  }

  async rejectVacation(
    vacationId: string,
    comment?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.rejectVacation(vacationId, comment);
      return { success: true };
    } catch (error) {
      console.error("Erro ao rejeitar férias:", error);
      return {
        success: false,
        message: this.t("vacationPage.rejectionError"),
      };
    }
  }

  async cancelVacation(
    vacationId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.remove(vacationId);
      return { success: true };
    } catch (error) {
      console.error("Erro ao cancelar férias:", error);
      return {
        success: false,
        message: this.t("vacationPage.cancellationError"),
      };
    }
  }

  getMonthlyStatistics(year: number, month: number) {
    return {
      totalDays: this.collection.getDaysInMonth(year, month),
      workingDays: this.collection.getWorkingDaysInMonth(year, month),
      pendingDays: this.collection
        .getByMonth(year, month)
        .filter((v) => v.isPending()).length,
      approvedDays: this.collection
        .getByMonth(year, month)
        .filter((v) => v.isApproved()).length,
    };
  }

  getPendingRequestsViewModel() {
    const pending = this.collection.getPending();
    return pending.map((v) => ({
      ...this.mapVacationToViewModel(v),
      userId: v.userId,
    }));
  }

  getVacationsByDateRange(startDate: Date, endDate: Date) {
    const vacations = this.collection.getByDateRange(startDate, endDate);
    return vacations.map((v) => this.mapVacationToViewModel(v));
  }
}
