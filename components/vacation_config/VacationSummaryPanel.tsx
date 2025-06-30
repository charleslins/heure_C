import React from 'react';
import { useTranslation } from 'react-i18next';
import { VacationSummaryPanelProps, Holiday } from '../../types';
import SectionCard from '../SectionCard';
import { formatHours } from '../../utils/timeUtils';

const VacationSummaryPanel: React.FC<VacationSummaryPanelProps> = ({
  remainingAnnualVacationDays,
  effectiveAnnualAllowance,
  monthSummaryData,
  displayDate,
  currentMonthGlobalHolidays
}) => {
  const { t, i18n } = useTranslation();
  const year = displayDate.getFullYear();

  const summaryItems = [
    { labelKey: "vacationPage.annualVacationBalanceLabel", value: remainingAnnualVacationDays === undefined ? '...' : formatHours(Math.max(0, remainingAnnualVacationDays)), unitKey: "common.daysUnitShort", badgeStyle: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300" },
    { labelKey: "vacationPage.annualVacationEntitlementLabel", value: effectiveAnnualAllowance === undefined ? '...' : formatHours(effectiveAnnualAllowance), unitKey: "common.daysUnitShort", badgeStyle: "bg-purple-100 text-purple-700 border-purple-300" },
    { labelKey: "vacationPage.workableDays", value: monthSummaryData.joursOuvrables, unitKey: "common.daysUnitShort", badgeStyle: "bg-amber-100 text-amber-700 border-amber-300" },
    { labelKey: "vacationPage.holidays", value: monthSummaryData.joursFeriesComptabilises, unitKey: "common.daysUnitShort", badgeStyle: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    { labelKey: "vacationPage.calendarDaysInVacation", value: monthSummaryData.joursDeCalendrierEnVacances, unitKey: "common.daysUnitShort", badgeStyle: "bg-sky-100 text-sky-700 border-sky-300" },
    { labelKey: "vacationPage.vacationDaysCalculated", value: formatHours(monthSummaryData.joursDeVacancesCalcules), unitKey: "common.daysUnitShort", badgeStyle: "bg-indigo-100 text-indigo-700 border-indigo-300" },
    { labelKey: "vacationPage.effectiveWorkDays", value: formatHours(monthSummaryData.joursTravaillesEffectifs), unitKey: "common.daysUnitShort", badgeStyle: "bg-emerald-100 text-emerald-700 border-emerald-300" }
  ];

  return (
    <div className="lg:col-span-1 flex flex-col space-y-6">
      <SectionCard title={t('vacationPage.monthSummaryTitle')} titleTextClassName="text-lg font-semibold text-slate-700">
        <div className="space-y-1.5 text-sm">
          {summaryItems.map(({labelKey, value, unitKey, badgeStyle}) => (
            <div key={labelKey} className="flex justify-between items-center py-1">
              <span className="text-slate-600 text-xs sm:text-sm">{t(labelKey)}</span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${badgeStyle}`}>
                {value} <span className="font-normal text-xxs">{value === '...' ? '' : t(unitKey)}</span>
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t('vacationPage.holidaysInMonthTitle', { month: displayDate.toLocaleDateString(i18n.language, { month: 'long' }), year: year })} titleTextClassName="text-lg font-semibold text-slate-700" cardClassName="flex-grow">
        {currentMonthGlobalHolidays.length > 0 ? (
          <ul className="space-y-1 text-sm max-h-32 overflow-y-auto pr-1">
            {currentMonthGlobalHolidays.map(holiday => (
              <li key={holiday.id} className="flex justify-between text-slate-600 py-0.5">
                <span>{t(`holidays.${holiday.name.replace(/\s+/g, '')}`, holiday.name)}</span>
                <span className="text-slate-500">{new Date(holiday.date + 'T00:00:00').toLocaleDateString(i18n.language, {day:'2-digit', month:'short'})}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">{t('vacationPage.noHolidaysInMonth')}</p>
        )}
      </SectionCard>
    </div>
  );
};

export default VacationSummaryPanel;
