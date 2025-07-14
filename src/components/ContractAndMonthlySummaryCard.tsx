import React from "react";
import { useTranslation } from "react-i18next";
import { UserGlobalSettings, SummaryData } from "@/types";
import { formatHours } from "@/utils/timeUtils";
import type { LucideProps } from "lucide-react";
import SectionCard from "./common/SectionCard"; // Import SectionCard
import {
  ClipboardList,
  AlertTriangle,
  BarChart3,
  Calendar,
  Briefcase,
  CheckSquare,
  Check,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface ContractAndMonthlySummaryCardProps {
  userGlobalSettings: UserGlobalSettings;
  summaryData: SummaryData;
}

const STANDARD_FULL_TIME_HOURS_WEEKLY = 40;

interface StyledSummaryItemProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: React.ReactElement<LucideProps>;
  itemBgClass: string;
  accentTextClass: string;
  accentBorderClass: string;
}

const StyledSummaryItem: React.FC<StyledSummaryItemProps> = ({
  label,
  value,
  unit,
  icon,
  itemBgClass,
  accentTextClass,
  accentBorderClass,
}) => (
  <div
    className={`p-3 rounded-lg shadow-md flex items-center space-x-3 ${itemBgClass} ${accentBorderClass} border-l-4 h-full`}
  >
    <div className={`flex-shrink-0 ${accentTextClass}`}>
      {React.cloneElement(icon, { className: "w-7 h-7" })}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">
        {label}
      </p>
      <p className={`text-xl sm:text-2xl font-bold ${accentTextClass}`}>
        {typeof value === "number" ? formatHours(value) : value}
        {unit && <span className="text-sm font-medium"> {unit}</span>}
      </p>
    </div>
  </div>
);

const ContractAndMonthlySummaryCard: React.FC<
  ContractAndMonthlySummaryCardProps
> = ({ userGlobalSettings, summaryData }) => {
  const { t } = useTranslation();
  const contractedWeeklyHours = summaryData.contractedWeeklyHours || 0;

  const calculatedTaux =
    STANDARD_FULL_TIME_HOURS_WEEKLY > 0
      ? parseFloat(
          (
            (contractedWeeklyHours / STANDARD_FULL_TIME_HOURS_WEEKLY) *
            100
          ).toFixed(1),
        )
      : 0;

  const baseAnnualVacationDays = userGlobalSettings.annualVacationDays || 0;
  const actualAnnualVacationDays = parseFloat(
    ((calculatedTaux / 100) * baseAnnualVacationDays).toFixed(1),
  );

  const summaryItemsData = [
    {
      labelKey: "contractSummaryCard.workRate",
      value: calculatedTaux,
      unit: "%",
      icon: <BarChart3 />,
      itemBgClass: "bg-rose-50",
      accentTextClass: "text-rose-600",
      accentBorderClass: "border-rose-500",
    },
    {
      labelKey: "contractSummaryCard.annualLeave",
      value: actualAnnualVacationDays,
      unit: t("common.daysUnitShort"),
      icon: <Calendar />,
      itemBgClass: "bg-teal-50",
      accentTextClass: "text-teal-600",
      accentBorderClass: "border-teal-500",
    },
    {
      labelKey: "contractSummaryCard.balance",
      value: summaryData.overtimeOrMissedHours,
      unit: t("common.hoursUnitShort"),
      icon:
        summaryData.overtimeOrMissedHours >= 0 ? (
          <TrendingUp />
        ) : (
          <TrendingDown />
        ),
      itemBgClass:
        summaryData.overtimeOrMissedHours >= 0 ? "bg-green-50" : "bg-red-50",
      accentTextClass:
        summaryData.overtimeOrMissedHours >= 0
          ? "text-green-600"
          : "text-red-600",
      accentBorderClass:
        summaryData.overtimeOrMissedHours >= 0
          ? "border-green-500"
          : "border-red-500",
    },
    {
      labelKey: "contractSummaryCard.contractedWeekly",
      value: summaryData.contractedWeeklyHours,
      unit: t("common.hoursUnitShort"),
      icon: <Briefcase />,
      itemBgClass: "bg-amber-50",
      accentTextClass: "text-amber-600",
      accentBorderClass: "border-amber-500",
    },
    {
      labelKey: "contractSummaryCard.plannedMonthly",
      value: summaryData.plannedMonthlyHours,
      unit: t("common.hoursUnitShort"),
      icon: <CheckSquare />,
      itemBgClass: "bg-violet-50",
      accentTextClass: "text-violet-600",
      accentBorderClass: "border-violet-500",
    },
    {
      labelKey: "contractSummaryCard.actualPlusAbsences",
      value: summaryData.workedPlusSickHours,
      unit: t("common.hoursUnitShort"),
      icon: <Check />,
      itemBgClass: "bg-slate-100",
      accentTextClass: "text-slate-600",
      accentBorderClass: "border-slate-500",
    },
  ];

  return (
    <SectionCard
      title={t("contractSummaryCard.title")}
      titleIcon={ClipboardList}
      titleIconProps={{ className: "w-6 h-6 text-indigo-600" }}
      cardClassName="bg-white rounded-xl shadow-lg h-full flex flex-col"
      headerAreaClassName="p-4 md:p-6 border-b-0" // No border for this type of card
      contentAreaClassName="p-4 md:p-6 pt-0 flex-grow flex flex-col" // Adjust padding and allow growth
      titleTextClassName="text-lg md:text-xl font-semibold text-slate-800"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 flex-grow">
        {summaryItemsData.map((item) => (
          <StyledSummaryItem
            key={item.labelKey}
            label={t(item.labelKey)}
            value={item.value}
            unit={item.unit}
            icon={item.icon}
            itemBgClass={item.itemBgClass}
            accentTextClass={item.accentTextClass}
            accentBorderClass={item.accentBorderClass}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 pt-4 mt-auto italic flex items-center">
        <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0" />
        <span>{t("contractSummaryCard.infoText")}</span>
      </p>
    </SectionCard>
  );
};

export default ContractAndMonthlySummaryCard;
