import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../contexts/AuthContext";
import { useGlobalDataContext } from "../contexts/GlobalDataContext";
import { useCurrentUserDataContext } from "@/contexts/CurrentUserDataContext";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useVacationCalculations } from "@/hooks/useVacationCalculations";
import { getDaysInMonth, formatDateToYYYYMMDD } from "@/utils/timeUtils";
import { printVacationRequest } from "@/utils/printVacationRequest";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import LoadingScreen from "./LoadingScreen";
import { VacationStatus } from "../types/types";
import LanguageLandingPage from "./LanguageLandingPage";

import { BarChart3, CalendarDays, Plane } from "lucide-react";

const statusColors: Record<string, string> = {
  workday: "bg-white text-indigo-700 border border-indigo-200",
  weekend: "bg-slate-100 text-slate-300",
  [VacationStatus.SELECTED]:
    "bg-indigo-100 text-indigo-700 border border-indigo-400",
  [VacationStatus.PENDING_APPROVAL]:
    "bg-yellow-100 text-yellow-700 border border-yellow-400",
  [VacationStatus.APPROVED]:
    "bg-green-100 text-green-700 border border-green-400",
  [VacationStatus.REJECTED]: "bg-red-100 text-red-700 border border-red-400",
  empty: "bg-transparent",
};

const VacationConfigPage: React.FC<VacationConfigPageProps> = ({
  currentDate,
  onDateChange,
}) => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotificationContext();
  const { currentUser } = useAuthContext();
  const { globalUserSettings, globalHolidays, isLoadingGlobalData } =
    useGlobalDataContext();
  const {
    weeklyContract,
    dailyLogs,
    vacations,
    setVacations,
    loadUserYearVacations,
    isLoadingCurrentUserData,
    updateSpecificUserVacations,
  } = useCurrentUserDataContext();

  const [displayDate, setDisplayDate] = useState<Date>(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );
  const [allYearVacations, setAllYearVacations] = useState<unknown[]>([]);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  useEffect(() => {
    setDisplayDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    );
  }, [currentDate]);

  // Carregar férias do ano do backend apenas ao trocar de ano ou usuário
  useEffect(() => {
    if (loadUserYearVacations && currentUser) {
      const fetchYearVacs = async () => {
        try {
          const yearVacs = await loadUserYearVacations(currentUser.id, year);
          setVacations(Array.isArray(yearVacs) ? yearVacs : []);
        } catch (error) {
          setVacations([]);
        }
      };
      fetchYearVacs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, currentUser, loadUserYearVacations]);

  // Férias do ano corrente SEMPRE do estado local
  const vacationsAnoCorrente = useMemo(() => {
    return vacations.filter((v: any) => {
      const vDate = new Date(v.date + "T00:00:00");
      return vDate.getFullYear() === year;
    });
  }, [vacations, year]);

  // Férias do mês corrente do estado local
  const currentMonthUserVacations = useMemo(() => {
    return vacations.filter((v) => {
      const vDate = new Date(v.date + "T00:00:00");
      return vDate.getFullYear() === year && vDate.getMonth() === month;
    });
  }, [vacations, year, month]);

  const STANDARD_FULL_TIME_HOURS_WEEKLY = 40;
  const contractedWeeklyHours = Object.values(weeklyContract).reduce(
    (acc: number, day: any) => acc + (day.morning || 0) + (day.afternoon || 0),
    0
  );
  const tauxPercent =
    STANDARD_FULL_TIME_HOURS_WEEKLY > 0
      ? Math.round(
          (contractedWeeklyHours / STANDARD_FULL_TIME_HOURS_WEEKLY) * 100
        )
      : 0;

  const userGlobalSettingsDinamic = {
    ...globalUserSettings,
    tauxPercent,
    annualVacationDays: globalUserSettings.annualVacationDays || 20,
  };

  // Usar vacationsAnoCorrente para o cálculo ANUAL
  const {
    remainingAnnualVacationDays,
    effectiveAnnualAllowance,
    monthSummary,
  } = useVacationCalculations({
    allYearVacations: vacationsAnoCorrente,
    userGlobalSettings: userGlobalSettingsDinamic,
    weeklyContract,
    globalHolidays,
    currentMonthUserVacations,
    daysInCalendarMonth,
  });

  // Saldo anual correto (reativo ao local, sempre ANUAL)
  const saldoAnualRestante = remainingAnnualVacationDays;

  // Função para determinar o estilo do badge do saldo de férias
  const getVacationBalanceStyle = () => {
    // Aqui vamos usar o saldo calculado na interface em vez de remainingAnnualVacationDays
    const calculatedBalance =
      effectiveAnnualAllowance && monthSummary
        ? Number(
            (
              effectiveAnnualAllowance - monthSummary.joursDeVacancesCalcules
            ).toFixed(1)
          )
        : remainingAnnualVacationDays;

    if (calculatedBalance === undefined) return "bg-slate-200 text-slate-700";
    if (calculatedBalance < 0) return "bg-red-100 text-red-700";
    if (calculatedBalance === 0) return "bg-yellow-100 text-yellow-700";
    return "bg-purple-100 text-purple-700";
  };

  const handleDayClick = useCallback(
    async (dateStr: string) => {
      console.log("🖱️ Clique no dia:", dateStr);
      console.log("📅 Férias atuais:", vacations);

      const existingVacationIndex = vacations.findIndex(
        (v) => v.date === dateStr
      );
      const newVacations = [...vacations];

      if (existingVacationIndex > -1) {
        const existingVacation = vacations[existingVacationIndex];
        console.log("🔍 Férias existente encontrada:", existingVacation);

        if (
          existingVacation.status === VacationStatus.SELECTED ||
          existingVacation.status === VacationStatus.PENDING_APPROVAL ||
          existingVacation.status === VacationStatus.REJECTED
        ) {
          // Remover férias selecionadas, pendentes ou rejeitadas
          newVacations.splice(existingVacationIndex, 1);
          console.log("🗑️ Removendo férias:", dateStr);
          addNotification("Férias removidas com sucesso.", "success");
        } else if (existingVacation.status === VacationStatus.APPROVED) {
          addNotification(
            "Não é possível modificar um dia já aprovado.",
            "info"
          );
          return;
        }
      } else {
        console.log("➕ Adicionando novas férias:", dateStr);
        console.log("💰 Saldo anual restante:", saldoAnualRestante);

        // Adicionar novas férias apenas se não atingiu o limite
        if (saldoAnualRestante <= 0) {
          addNotification(
            t(
              "vacationPage.limitReachedAlert",
              "Você atingiu o limite anual de férias. Não é possível selecionar mais dias."
            ),
            "warning"
          );
          return;
        }
        newVacations.push({ date: dateStr, status: VacationStatus.SELECTED });
        addNotification("Férias selecionadas com sucesso.", "success");
      }

      console.log("📝 Novas férias:", newVacations);
      setVacations(newVacations);

      // Salvar imediatamente após a alteração
      if (currentUser) {
        try {
          await updateSpecificUserVacations(
            currentUser.id,
            year,
            month,
            newVacations
          );
          console.log("💾 Férias salvas com sucesso");
        } catch (error) {
          console.error("Erro ao salvar as férias:", error);
          addNotification("Erro ao salvar a seleção de férias.", "error");
        }
      }
    },
    [
      vacations,
      setVacations,
      addNotification,
      currentUser,
      updateSpecificUserVacations,
      year,
      month,
      saldoAnualRestante,
      t,
    ]
  );

  const handleDeleteVacationFromList = useCallback(
    async (dateStr: string) => {
      const existingVacation = vacations.find((v) => v.date === dateStr);
      if (
        existingVacation &&
        (existingVacation.status === VacationStatus.SELECTED ||
          existingVacation.status === VacationStatus.REJECTED ||
          existingVacation.status === VacationStatus.PENDING_APPROVAL)
      ) {
        const updatedVacations = vacations.filter((v) => v.date !== dateStr);
        setVacations(updatedVacations);

        // Salvar imediatamente após a remoção
        if (currentUser) {
          try {
            await updateSpecificUserVacations(
              currentUser.id,
              year,
              month,
              updatedVacations
            );
            addNotification("Férias removidas com sucesso.", "success");
          } catch (error) {
            console.error("Erro ao salvar as férias:", error);
            addNotification("Erro ao remover férias.", "error");
          }
        } else {
          addNotification("Férias removidas com sucesso.", "success");
        }
      } else if (
        existingVacation &&
        existingVacation.status === VacationStatus.APPROVED
      ) {
        addNotification(
          "Não é possível remover um dia já aprovado.",
          "warning"
        );
      }
    },
    [
      vacations,
      setVacations,
      addNotification,
      currentUser,
      updateSpecificUserVacations,
      year,
      month,
    ]
  );

  const handleSubmitForApproval = useCallback(async () => {
    const updatedVacations = vacations.map((v) => {
      const vDate = new Date(v.date + "T00:00:00");
      if (
        v.status === VacationStatus.SELECTED &&
        vDate.getFullYear() === year &&
        vDate.getMonth() === month
      ) {
        return { ...v, status: VacationStatus.PENDING_APPROVAL };
      }
      return v;
    });
    setVacations(updatedVacations);

    // Explicitamente salvar as férias atualizadas no banco de dados
    if (currentUser) {
      try {
        await updateSpecificUserVacations(
          currentUser.id,
          year,
          month,
          updatedVacations
        );
        addNotification("Solicitação enviada com sucesso!", "success");
      } catch (error) {
        console.error("Erro ao salvar as férias:", error);
        addNotification(
          "Erro ao enviar solicitação. Tente novamente.",
          "error"
        );
      }
    } else {
      addNotification(
        "Usuário não identificado. Faça login novamente.",
        "error"
      );
    }
  }, [
    vacations,
    setVacations,
    year,
    month,
    addNotification,
    currentUser,
    updateSpecificUserVacations,
  ]);

  const handlePrintRequestInternal = useCallback(() => {
    if (!currentUser) return;
    const printableVacations = currentMonthUserVacations
      .filter(
        (v) =>
          v.status === VacationStatus.PENDING_APPROVAL ||
          v.status === VacationStatus.APPROVED
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (printableVacations.length === 0) {
      addNotification("Nenhuma férias para imprimir.", "info");
      return;
    }
    printVacationRequest(
      currentUser,
      printableVacations,
      displayDate.toLocaleDateString(i18n.language, {
        month: "long",
        year: "numeric",
      }),
      { t, language: i18n.language }
    );
  }, [
    currentUser,
    currentMonthUserVacations,
    displayDate,
    i18n.language,
    t,
    addNotification,
  ]);

  const changeDisplayedMonth = async (increment: number) => {
    // Primeiro, salvar as férias do mês atual se houver alterações
    if (currentUser && vacations.length > 0) {
      try {
        await updateSpecificUserVacations(
          currentUser.id,
          year,
          month,
          vacations
        );
      } catch (error) {
        console.error("Erro ao salvar as férias antes de mudar de mês:", error);
        addNotification("Erro ao salvar as férias. Tente novamente.", "error");
        return; // Não muda de mês se houver erro
      }
    }

    // Depois muda para o novo mês
    const newDisplayMonth = new Date(
      displayDate.getFullYear(),
      displayDate.getMonth() + increment,
      1
    );
    setDisplayDate(newDisplayMonth);
    if (onDateChange) onDateChange(newDisplayMonth);
  };

  // Internacionalização dos dias da semana (segunda a domingo)
  const daysOfWeek = useMemo(() => {
    const baseDate = new Date(2023, 0, 1); // Domingo
    return Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(baseDate);
      day.setDate(baseDate.getDate() + ((i + 1) % 7)); // Começa na segunda-feira
      return day
        .toLocaleDateString(i18n.language, { weekday: "short" })
        .toUpperCase();
    });
  }, [i18n.language]);

  if (isLoadingGlobalData || isLoadingCurrentUserData || !currentUser) {
    return <LoadingScreen message={t("common.loadingData")} />;
  }

  // Exibir alerta se limite atingido
  const limiteFeriasAtingido = saldoAnualRestante <= 0;

  // Geração dos dias do calendário (com células vazias para alinhamento)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const calendarDays: unknown[] = [];
  const offset = (firstDayOfWeek + 6) % 7; // Ajuste para começar em segunda-feira
  for (let i = 0; i < offset; i++) {
    calendarDays.push({});
  }
  for (let d = 1; d <= daysInCalendarMonth.length; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = formatDateToYYYYMMDD(dateObj);
    const vacation = currentMonthUserVacations.find((v) => v.date === dateStr);
    const holiday = currentMonthGlobalHolidays.find((h) => h.date === dateStr);
    const dayName = dateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const contractForDay = weeklyContract[dayName];
    const totalHours = (
      (contractForDay?.morning || 0) + (contractForDay?.afternoon || 0)
    ).toFixed(2);
    const isWorkday =
      contractForDay &&
      (contractForDay.morning > 0 || contractForDay.afternoon > 0);
    const logEntry = dailyLogs.find(
      (log) => formatDateToYYYYMMDD(log.date) === dateStr
    );
    let tag = "";
    let isBlocked = false;
    let bgClass = "bg-white text-indigo-700";
    let hoursTextClass = "text-indigo-400"; // padrão

    // Prioridade: feriado > recup > atest > não trabalhado > selecionado > pendente
    if (holiday) {
      tag = t("vacationPage.holidayLabel");
      isBlocked = true;
      bgClass = "bg-yellow-100 text-yellow-700";
      hoursTextClass = "text-yellow-300";
    } else if (
      logEntry &&
      (logEntry.morning.type === "Récupération" ||
        logEntry.afternoon.type === "Récupération")
    ) {
      tag = t("vacationPage.recuperationLabel");
      isBlocked = true;
      bgClass = "bg-green-100 text-green-700";
      hoursTextClass = "text-green-300";
    } else if (
      logEntry &&
      (logEntry.morning.type === "Maladie" ||
        logEntry.afternoon.type === "Maladie")
    ) {
      tag = t("vacationPage.sickLeaveLabel");
      isBlocked = true;
      bgClass = "bg-red-100 text-red-700";
      hoursTextClass = "text-red-300";
    } else if (!isWorkday) {
      isBlocked = true;
      bgClass = "bg-slate-100 text-slate-300";
      hoursTextClass = "text-slate-300";
    } else if (vacation && vacation.status === VacationStatus.SELECTED) {
      tag = t("vacationStatuses.Selecionado");
      bgClass = "bg-indigo-100 text-indigo-700 border-2 border-indigo-400";
      hoursTextClass = "text-indigo-300";
    } else if (
      vacation &&
      vacation.status === VacationStatus.PENDING_APPROVAL
    ) {
      tag = t("vacationStatuses.Pendente");
      bgClass = "bg-yellow-100 text-yellow-700 border-2 border-yellow-400";
      hoursTextClass = "text-yellow-300";
    } else if (vacation && vacation.status === VacationStatus.APPROVED) {
      tag = t("vacationStatuses.Aprovado");
      bgClass = "bg-green-100 text-green-700 border-2 border-green-400";
      hoursTextClass = "text-green-300";
    } else if (vacation && vacation.status === VacationStatus.REJECTED) {
      tag = t("vacationStatuses.Rejeitado");
      bgClass = "bg-red-100 text-red-700 border-2 border-red-400";
      hoursTextClass = "text-red-300";
    }
    calendarDays.push({
      date: d,
      dateStr,
      status: vacation ? vacation.status : "workday",
      hours: `${totalHours}h`,
      label: tag,
      isWorkday,
      isBlocked,
      tag,
      bgClass,
      hoursTextClass,
    });
  }
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({});
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-2">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Título principal */}
        <div className="flex items-center gap-2 text-indigo-700 text-2xl font-bold mb-2">
          <Calendar className="w-7 h-7" />
          <span>{t("vacationPage.title")}</span>
        </div>
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => changeDisplayedMonth(-1)}
                className="text-2xl text-slate-400 hover:text-slate-600 transition-colors px-4"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <span className="text-2xl font-bold text-indigo-700 py-4 block">
                {displayDate.toLocaleDateString(i18n.language, {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={() => changeDisplayedMonth(1)}
                className="text-2xl text-slate-400 hover:text-slate-600 transition-colors px-4"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
            {limiteFeriasAtingido && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 font-semibold text-center">
                {t(
                  "vacationPage.limitReachedAlert",
                  "Você atingiu o limite anual de férias. Não é possível selecionar mais dias."
                )}
              </div>
            )}
            <div className="bg-slate-50 rounded-xl p-2">
              {/* Linha dos dias da semana */}
              <div className="grid grid-cols-7 gap-2 mb-1">
                {daysOfWeek.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center h-8 w-18 rounded-lg bg-white text-indigo-600 text-xs font-bold uppercase tracking-wide shadow-sm"
                  >
                    {d}
                  </div>
                ))}
              </div>
              {/* Dias do mês */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, i) => {
                  if (!day.date) {
                    return <div key={i} className="h-16 w-18" />;
                  }
                  if (day.isBlocked) {
                    return (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center rounded-lg ${day.bgClass} h-16 w-18`}
                      >
                        <span className="text-lg font-bold">{day.date}</span>
                        <span className="text-xs font-semibold">
                          {day.hours}
                        </span>
                        {day.tag && (
                          <span className="text-xxs font-bold px-2 py-0.5 rounded">
                            {day.tag}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return (
                    <button
                      key={i}
                      className={`flex flex-col items-center justify-center rounded-lg border ${day.bgClass} h-16 w-18 focus:outline-none`}
                      onClick={() => handleDayClick(day.dateStr)}
                    >
                      <span className="text-lg font-bold">{day.date}</span>
                      <span className="text-xs font-semibold">{day.hours}</span>
                      {day.tag && (
                        <span className="text-xxs font-bold px-2 py-0.5 rounded">
                          {day.tag}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Resumo do mês */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-lg">
                <BarChart3 className="w-6 h-6" />
                <span>{t("vacationPage.monthlySummaryTitle")}</span>
              </div>

              {/* Componente de depuração - apenas temporário */}
              <div className="bg-gray-100 p-2 rounded mb-2 text-xs">
                <p>
                  <b>Debug:</b>
                </p>
                <p>Direito: {effectiveAnnualAllowance}</p>
                <p>Dias utilizados: {monthSummary?.joursDeVacancesCalcules}</p>
                <p>
                  Cálculo: {effectiveAnnualAllowance} -{" "}
                  {monthSummary?.joursDeVacancesCalcules} ={" "}
                  {effectiveAnnualAllowance &&
                  monthSummary?.joursDeVacancesCalcules
                    ? effectiveAnnualAllowance -
                      monthSummary.joursDeVacancesCalcules
                    : "N/A"}
                </p>
                <p>Saldo restante: {remainingAnnualVacationDays}</p>
              </div>

              <div className="space-y-2">
                {/* Resumo customizado com cores diferentes */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 text-sm min-w-[170px]">
                    {t("vacationPage.workableDays")}
                  </span>
                  <span className="rounded-full px-3 py-0.5 text-xs font-bold bg-blue-100 text-blue-700">
                    {monthSummary?.joursOuvrables ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 text-sm min-w-[170px]">
                    {t("vacationPage.holidays")}
                  </span>
                  <span className="rounded-full px-3 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-700">
                    {monthSummary?.joursFeriesComptabilises ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 text-sm min-w-[170px]">
                    {t("vacationPage.effectiveWorkDays")}
                  </span>
                  <span className="rounded-full px-3 py-0.5 text-xs font-bold bg-green-100 text-green-700">
                    {monthSummary?.joursTravaillesEffectifs ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 text-sm min-w-[170px]">
                    {t("vacationPage.annualVacationEntitlementLabel")}
                  </span>
                  <span className="rounded-full px-3 py-0.5 text-xs font-bold bg-purple-100 text-purple-700">
                    {/* Sempre mostrar o direito anual do ano corrente, não recalcular por mês */}
                    {userGlobalSettingsDinamic.annualVacationDays &&
                    userGlobalSettingsDinamic.tauxPercent
                      ? Number(
                          (
                            userGlobalSettingsDinamic.annualVacationDays *
                            (userGlobalSettingsDinamic.tauxPercent / 100)
                          ).toFixed(1)
                        )
                      : effectiveAnnualAllowance ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 text-sm min-w-[170px]">
                    {t("vacationPage.annualVacationBalanceLabel")}
                  </span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold ${getVacationBalanceStyle()}`}
                  >
                    {Math.max(saldoAnualRestante, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 text-sm min-w-[170px]">
                    {t("vacationPage.calendarDaysInVacation")}
                  </span>
                  <span className="rounded-full px-3 py-0.5 text-xs font-bold bg-pink-100 text-pink-700">
                    {monthSummary?.joursDeCalendrierEnVacances ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 text-sm min-w-[170px]">
                    {t("vacationPage.vacationDaysCalculated")}
                  </span>
                  <span className="rounded-full px-3 py-0.5 text-xs font-bold bg-orange-100 text-orange-700">
                    {monthSummary?.joursDeVacancesCalcules ?? 0}
                  </span>
                </div>
              </div>
            </div>
            {/* Feriados */}
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-lg">
                <CalendarDays className="w-6 h-6" />
                <span>{t("vacationPage.holidaysTitle")}</span>
              </div>
              <ul className="space-y-1">
                {currentMonthGlobalHolidays.map((h: any, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="inline-block w-2 h-2 bg-yellow-200 rounded-full"></span>
                    <span>{h.name}</span>
                    <span className="text-slate-400">
                      {new Date(h.date + "T00:00:00").toLocaleDateString(
                        i18n.language,
                        { day: "2-digit", month: "short" }
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Minhas Férias */}
        <div className="bg-white rounded-2xl shadow p-4 mt-2">
          <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-lg">
            <Plane className="w-6 h-6" />
            <span>{t("vacationPage.myVacationsTitle")}</span>
            <button
              onClick={handleSubmitForApproval}
              className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-xs font-medium shadow"
            >
              {t("vacationPage.submitRequestButton")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentMonthUserVacations.length > 0 ? (
              currentMonthUserVacations.map((opt: any, idx: number) => (
                <span
                  key={opt.date}
                  className={`px-4 py-1 rounded-full text-xs font-semibold shadow-sm border border-indigo-200 ${
                    opt.status === VacationStatus.SELECTED
                      ? "bg-indigo-200 text-indigo-800"
                      : opt.status === VacationStatus.PENDING_APPROVAL
                      ? "bg-yellow-100 text-yellow-700"
                      : opt.status === VacationStatus.APPROVED
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {new Date(opt.date + "T00:00:00").toLocaleDateString(
                    i18n.language,
                    { day: "2-digit", month: "short" }
                  )}
                  {opt.status && (
                    <span className="ml-2">
                      {t(`vacationStatuses.${opt.status}`)}
                    </span>
                  )}
                </span>
              ))
            ) : (
              <p>{t("vacationPage.noVacationsMessage")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationConfigPage;
