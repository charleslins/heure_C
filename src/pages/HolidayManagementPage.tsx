import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, BarChart3 } from "lucide-react";
import SectionCard from "../components/common/SectionCard";
import Button from "../components/common/Button";
import { useGlobalDataContext } from "../contexts/GlobalDataContext";
import { useNotificationContext } from "../contexts/NotificationContext";

const HolidayManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { globalHolidays, isLoadingGlobalData } = useGlobalDataContext();
  const { addNotification } = useNotificationContext();
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "CUSTOM",
    description: "",
    repeatsAnnually: false,
  });

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.name || !formData.date) {
      addNotification(t("holidayManagementPage.alertFillNameDate"), "error");
      return;
    }

    const holidayDate = new Date(formData.date + "T00:00:00");
    if (holidayDate.getFullYear() !== selectedYear) {
      addNotification(
        t("holidayManagementPage.alertYearMismatch", { year: selectedYear }),
        "error"
      );
      return;
    }

    const existingHoliday = globalHolidays.find(
      (h) => h.date === formData.date
    );
    if (existingHoliday) {
      addNotification(t("holidayManagementPage.alertDateExists"), "error");
      return;
    }

    try {
      await addHoliday({
        name: formData.name,
        date: formData.date,
        type: formData.type,
        description: formData.description,
        repeatsAnnually: formData.repeatsAnnually,
      });

      addNotification(t("holidayManagementPage.alertConfigSaved"), "success");

      // Limpar formulário
      setFormData({
        name: "",
        date: "",
        type: "CUSTOM",
        description: "",
        repeatsAnnually: false,
      });
    } catch (error) {
      console.error("Erro ao salvar feriado:", error);
      addNotification(
        error instanceof Error ? error.message : "Erro ao salvar feriado",
        "error"
      );
    }
  };

  const holidaysForYear = globalHolidays.filter((h) => {
    const holidayDate = new Date(h.date + "T00:00:00");
    return holidayDate.getFullYear() === selectedYear;
  });

  const officialHolidays = holidaysForYear.filter(
    (h) => h.type === "NATIONAL"
  ).length;
  const customHolidays = holidaysForYear.filter(
    (h) => h.type === "CUSTOM"
  ).length;

  if (isLoadingGlobalData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-2">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Título principal */}
        <div className="flex items-center gap-2 text-indigo-700 text-2xl font-bold mb-2">
          <Calendar className="w-7 h-7" />
          <span>{t("holidayManagementPage.title")}</span>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lista de feriados do ano */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-indigo-700">
                {t("holidayManagementPage.holidaysForYearTitle", {
                  year: selectedYear,
                  country: "Suíça",
                })}
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              {holidaysForYear.length > 0 ? (
                <div className="space-y-2">
                  {holidaysForYear.map((holiday, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                    >
                      <div>
                        <span className="font-medium text-slate-700">
                          {holiday.name}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">
                          {new Date(
                            holiday.date + "T00:00:00"
                          ).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          holiday.type === "NATIONAL"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {holiday.type === "NATIONAL"
                          ? t("holidayManagementPage.officialLabel")
                          : t("holidayManagementPage.customLabel")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  {t("holidayManagementPage.noHolidaysFound", {
                    year: selectedYear,
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Cards laterais */}
          <div className="space-y-6">
            {/* Formulário de adição */}
            <SectionCard>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome do feriado */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("common.name")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder={t("holidayManagementPage.namePlaceholder")}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  />
                </div>

                {/* Data */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("common.date")}
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("common.type")}
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value="CUSTOM">
                      {t("holidayManagementPage.customLabel")}
                    </option>
                    <option value="OFFICIAL">
                      {t("holidayManagementPage.officialLabel")}
                    </option>
                  </select>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("common.description")}
                  </label>
                  <textarea
                    name="description"
                    placeholder={t(
                      "holidayManagementPage.descriptionPlaceholder"
                    )}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 h-24"
                  />
                </div>

                {/* Repete anualmente */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="repeatsAnnually"
                    checked={formData.repeatsAnnually}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        repeatsAnnually: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-slate-900">
                    {t("common.repeatsAnnually")}
                  </label>
                </div>

                {/* Botão de adicionar */}
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" size="md">
                    {t("holidayManagementPage.addButton")}
                  </Button>
                </div>
              </form>
            </SectionCard>

            {/* Resumo do ano */}
            <SectionCard>
              <div className="flex items-center gap-2 mb-4 text-indigo-700 font-semibold text-lg">
                <BarChart3 className="w-6 h-6" />
                <span>
                  {t("holidayManagementPage.summaryTitle", {
                    year: selectedYear,
                  })}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {t("holidayManagementPage.officialHolidays")}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {officialHolidays}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {t("holidayManagementPage.customHolidays")}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {customHolidays}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-slate-600 font-medium">
                    {t("holidayManagementPage.totalLabel")}
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                    {officialHolidays + customHolidays}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayManagementPage;
