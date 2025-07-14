import React from "react";

const vacationJson = {
  pageTitle: "Gestion de Vacances",
  calendar: {
    month: "juillet",
    year: 2025,
    daysOfWeek: ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"],
    days: [
      { date: 1, status: "workday", hours: "8.00h" },
      { date: 2, status: "workday", hours: "8.00h" },
      { date: 3, status: "workday", hours: "8.00h" },
      { date: 4, status: "workday", hours: "8.00h" },
      { date: 5, status: "weekend", hours: null },
      { date: 6, status: "weekend", hours: null },
      { date: 7, status: "workday", hours: "8.00h" },
      { date: 8, status: "workday", hours: "8.00h" },
      { date: 9, status: "workday", hours: "8.00h" },
      { date: 10, status: "workday", hours: "8.00h" },
      { date: 11, status: "workday", hours: "8.00h" },
      { date: 12, status: "weekend", hours: null },
      { date: 13, status: "weekend", hours: null },
      { date: 14, status: "workday", hours: "8.00h" },
      { date: 15, status: "workday", hours: "8.00h" },
      { date: 16, status: "workday", hours: "8.00h" },
      { date: 17, status: "workday", hours: "8.00h" },
      { date: 18, status: "workday", hours: "8.00h" },
      { date: 19, status: "weekend", hours: null },
      { date: 20, status: "weekend", hours: null },
      { date: 21, status: "workday", hours: "8.00h" },
      { date: 22, status: "workday", hours: "8.00h" },
      { date: 23, status: "workday", hours: "8.00h" },
      { date: 24, status: "workday", hours: "8.00h" },
      { date: 25, status: "workday", hours: "8.00h" },
      { date: 26, status: "weekend", hours: null },
      { date: 27, status: "weekend", hours: null },
      { date: 28, status: "workday", hours: "8.00h" },
      { date: 29, status: "workday", hours: "8.00h" },
      { date: 30, status: "workday", hours: "8.00h" },
      { date: 31, status: "workday", hours: "8.00h" },
      { date: null, status: "empty", hours: null },
      { date: null, status: "empty", hours: null },
      { date: null, status: "empty", hours: null },
      { date: null, status: "empty", hours: null },
    ],
  },
  monthlySummary: {
    title: "Résumé du mois",
    stats: [
      { label: "Jours ouvrables :", value: "23 jours", theme: "light-blue" },
      {
        label: "Jours travaillés effectifs:",
        value: "22 jours",
        theme: "peach",
      },
      {
        label: "Jours de vacances (droit):",
        value: "12 jours",
        theme: "purple",
      },
      {
        label: "Jours de vacances (calculés):",
        value: "6 jours",
        theme: "light-purple",
      },
      { label: "Jours fériés:", value: "1 jour", theme: "yellow" },
      {
        label: "Jours travaillés effectifs:",
        value: "16 jours",
        theme: "pink",
      },
    ],
  },
  publicHolidays: {
    title: "Jours Fériés en juillet 2025",
    holidays: [{ name: "Natal", date: "25 déc" }],
  },
  myVacations: {
    title: "Mes Vacances (mois current)",
    options: [
      { id: "option1", label: "Option 1" },
      { id: "option2", label: "Option 2" },
      { id: "option3", label: "Option 3" },
    ],
  },
};

const VacationPagePreview = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 rounded">
        Voltar ao layout anterior
      </button>
      <h1 className="text-2xl font-bold mb-6">{vacationJson.pageTitle}</h1>
      {/* Calendário (placeholder) */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Calendário (placeholder)</div>
        {/* Aqui você pode montar o grid do calendário usando vacationJson.calendar */}
      </div>
      {/* Resumo do mês (placeholder) */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Resumo do mês (placeholder)</div>
        {/* Aqui você pode montar o resumo usando vacationJson.monthlySummary */}
      </div>
      {/* Feriados (placeholder) */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Feriados (placeholder)</div>
        {/* Aqui você pode montar a lista de feriados usando vacationJson.publicHolidays */}
      </div>
      {/* Minhas férias (placeholder) */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Minhas Férias (placeholder)</div>
        {/* Aqui você pode montar as opções usando vacationJson.myVacations */}
      </div>
    </div>
  );
};

export default VacationPagePreview;
