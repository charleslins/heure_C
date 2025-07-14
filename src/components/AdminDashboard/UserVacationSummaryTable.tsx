import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Calendar } from "lucide-react";
import SectionCard from "../common/SectionCard";

const UserVacationSummaryTable: React.FC = () => {
  const { t } = useTranslation();

  // Dados de exemplo - substituir por dados reais
  const summaryData = [
    {
      userId: "1",
      userName: "João Silva",
      department: "TI",
      totalDays: 20,
      usedDays: 5,
      pendingDays: 3,
      remainingDays: 12,
    },
    {
      userId: "2",
      userName: "Maria Santos",
      department: "RH",
      totalDays: 25,
      usedDays: 10,
      pendingDays: 5,
      remainingDays: 10,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho da seção */}
      <div className="flex items-center gap-2 text-indigo-700 text-xl font-semibold">
        <Calendar className="w-6 h-6" />
        <span>{t("adminDashboard.vacationSummary.title")}</span>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 rounded-lg p-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                {t("adminDashboard.vacationSummary.totalEmployees")}
              </p>
              <p className="text-2xl font-bold text-indigo-700">
                {summaryData.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-2">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                {t("adminDashboard.vacationSummary.totalVacationDays")}
              </p>
              <p className="text-2xl font-bold text-green-700">
                {summaryData.reduce((acc, curr) => acc + curr.totalDays, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 rounded-lg p-2">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                {t("adminDashboard.vacationSummary.pendingDays")}
              </p>
              <p className="text-2xl font-bold text-yellow-700">
                {summaryData.reduce((acc, curr) => acc + curr.pendingDays, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                {t("adminDashboard.vacationSummary.remainingDays")}
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {summaryData.reduce((acc, curr) => acc + curr.remainingDays, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de resumo */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t("adminDashboard.vacationSummary.employee")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t("adminDashboard.vacationSummary.department")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t("adminDashboard.vacationSummary.totalDays")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t("adminDashboard.vacationSummary.usedDays")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t("adminDashboard.vacationSummary.pendingDays")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t("adminDashboard.vacationSummary.remainingDays")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {summaryData.map((user) => (
              <tr
                key={user.userId}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {user.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {user.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {user.totalDays}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    {user.usedDays}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                    {user.pendingDays}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    {user.remainingDays}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserVacationSummaryTable;
