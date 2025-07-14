import { useMemo } from "react";
import {
  VacationStatus,
  STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE,
} from "../types/types";
import { getDayOfWeekName, formatDateToYYYYMMDD } from "@/utils/timeUtils";

interface UseVacationCalculationsProps {
  allYearVacations: any[];
  userGlobalSettings: any;
  weeklyContract: any;
  globalHolidays: any[];
  currentMonthUserVacations: any[];
  daysInCalendarMonth: any[];
}

interface VacationCalculations {
  remainingAnnualVacationDays: number;
  effectiveAnnualAllowance: number;
  monthSummary: any;
}

export const useVacationCalculations = ({
  allYearVacations,
  userGlobalSettings,
  weeklyContract,
  globalHolidays,
  currentMonthUserVacations,
  daysInCalendarMonth,
}: UseVacationCalculationsProps): VacationCalculations => {
  // Cálculo do resumo mensal
  const monthSummary = useMemo(() => {
    let joursOuvrables = 0;
    let joursFeriesComptabilises = 0;
    let impactVacancesHeures = 0;

    const relevantVacationsInMonth = currentMonthUserVacations.filter(
      (v) =>
        v.status === VacationStatus.APPROVED ||
        v.status === VacationStatus.PENDING_APPROVAL ||
        v.status === VacationStatus.SELECTED
    );

    daysInCalendarMonth.forEach((dayDate) => {
      const dayName = getDayOfWeekName(dayDate);
      const contractForDay = weeklyContract[dayName];
      const dateStr = formatDateToYYYYMMDD(dayDate);
      const isGlobalHolidayForThisDay = globalHolidays.some(
        (h) => h.date === dateStr
      );

      if (
        contractForDay &&
        (contractForDay.morning > 0 || contractForDay.afternoon > 0)
      ) {
        joursOuvrables++;
        if (isGlobalHolidayForThisDay) {
          joursFeriesComptabilises++;
        }
      }
      if (
        relevantVacationsInMonth.some((v) => v.date === dateStr) &&
        !isGlobalHolidayForThisDay
      ) {
        impactVacancesHeures +=
          (contractForDay?.morning || 0) + (contractForDay?.afternoon || 0);
      }
    });

    const joursDeCalendrierEnVacances = relevantVacationsInMonth.length;

    // Converter horas para dias com uma casa decimal
    const joursDeVacancesCalcules =
      STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE > 0
        ? Number(
            (
              impactVacancesHeures /
              STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE
            ).toFixed(1)
          )
        : 0;

    const joursTravaillesEffectifs = Number(
      (
        joursOuvrables -
        joursFeriesComptabilises -
        joursDeVacancesCalcules
      ).toFixed(1)
    );

    return {
      joursOuvrables,
      joursFeriesComptabilises,
      joursDeCalendrierEnVacances,
      impactVacancesHeures,
      joursDeVacancesCalcules,
      joursTravaillesEffectifs,
    };
  }, [
    daysInCalendarMonth,
    weeklyContract,
    globalHolidays,
    currentMonthUserVacations,
  ]);

  // CORREÇÃO DO CÁLCULO DO SALDO DE FÉRIAS
  const { effectiveAnnualAllowance, remainingAnnualVacationDays } =
    useMemo(() => {
      // Verificações básicas
      if (
        !userGlobalSettings ||
        !weeklyContract ||
        !globalHolidays ||
        !allYearVacations
      ) {
        return {
          effectiveAnnualAllowance: 0,
          remainingAnnualVacationDays: 0,
        };
      }

      // ETAPA 1: Calcular direito anual de férias (FIXO)
      const baseAllowance = userGlobalSettings.annualVacationDays || 20;
      const tauxPercent = userGlobalSettings.tauxPercent || 100;
      const tauxFactor = tauxPercent / 100;

      // Direito anual (dias base * taxa de ocupação) - SEMPRE O MESMO
      const direitoAnual = baseAllowance * tauxFactor;
      const direitoAnualFormatado = Number(direitoAnual.toFixed(1));

      // ETAPA 2: Contar férias utilizadas/selecionadas (ANUAL)
      let totalHorasFerias = 0;

      // Filtrar apenas férias válidas do ANO CORRENTE
      const currentYear = new Date().getFullYear();
      const feriasValidas = allYearVacations.filter((vac) => {
        const vacDate = new Date(vac.date + "T00:00:00");
        return (
          vacDate.getFullYear() === currentYear &&
          (vac.status === VacationStatus.APPROVED ||
            vac.status === VacationStatus.PENDING_APPROVAL ||
            vac.status === VacationStatus.SELECTED)
        );
      });

      // Para cada dia de férias, somar as horas contratuais
      feriasValidas.forEach((ferias) => {
        // Verificar se não é feriado
        const isFeriado = globalHolidays.some((h) => h.date === ferias.date);

        if (!isFeriado) {
          const dataFerias = new Date(ferias.date + "T00:00:00");
          const diaDaSemana = getDayOfWeekName(dataFerias);
          const horasContratadas = weeklyContract[diaDaSemana];

          if (horasContratadas) {
            const horasDoDia =
              (horasContratadas.morning || 0) +
              (horasContratadas.afternoon || 0);
            totalHorasFerias += horasDoDia;
          }
        }
      });

      // ETAPA 3: Converter horas para dias equivalentes
      const diasFeriasUtilizados =
        totalHorasFerias / STANDARD_FULL_DAY_HOURS_FOR_VACATION_EQUIVALENCE;

      const diasFeriasUtilizadosFormatados = Number(
        diasFeriasUtilizados.toFixed(1)
      );

      // ETAPA 4: Calcular saldo de férias restante
      const saldoRestante =
        direitoAnualFormatado - diasFeriasUtilizadosFormatados;

      // Forçamos a precisão de uma casa decimal para o saldo final
      const saldoRestanteFormatado = Number(saldoRestante.toFixed(1));

      return {
        effectiveAnnualAllowance: direitoAnualFormatado,
        remainingAnnualVacationDays: Math.max(saldoRestanteFormatado, 0),
      };
    }, [allYearVacations, userGlobalSettings, weeklyContract, globalHolidays]);

  return {
    remainingAnnualVacationDays,
    effectiveAnnualAllowance,
    monthSummary,
  };
};
