
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Holiday } from '../types';
import { PlusCircleIcon, TrashIcon, CalendarDaysIcon as PageIcon } from './icons'; 
import SectionCard from './SectionCard';
import { useGlobalDataContext } from '../contexts/GlobalDataContext'; 
import { useNotificationContext } from '../contexts/NotificationContext';


interface HolidayManagementPageProps {
  // Props are removed as data will come from context
}

type CountryOption = "Global" | "Suisse" | "France" | "Deutschland" | "Brasil";


const HolidayManagementPage: React.FC<HolidayManagementPageProps> = () => {
  const { t, i18n } = useTranslation();
  const { globalHolidays, saveGlobalHolidays } = useGlobalDataContext(); 
  const { addNotification } = useNotificationContext();

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCountry] = useState<CountryOption>("Global");
  const [holidaysForDisplay, setHolidaysForDisplay] = useState<Holiday[]>([]);
  
  const [newHolidayName, setNewHolidayName] = useState<string>('');
  const [newHolidayDate, setNewHolidayDate] = useState<string>(''); // YYYY-MM-DD

  const lightInputBaseClasses = "w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const lightInputClasses = `${lightInputBaseClasses} bg-white text-slate-700 placeholder-slate-400`;
  const lightSelectClasses = `${lightInputBaseClasses} bg-white text-slate-700 appearance-none`;


  useEffect(() => {
    const filtered = globalHolidays.filter(h => {
        const holidayYear = parseInt(h.date.substring(0, 4), 10);
        return holidayYear === selectedYear;
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setHolidaysForDisplay(filtered);
  }, [globalHolidays, selectedYear, selectedCountry]);

  const handleAddHoliday = async () => {
    if (!newHolidayName || !newHolidayDate) {
      addNotification(t('holidayManagementPage.alertFillNameDate'), 'error');
      return;
    }
    const newHolidayYear = parseInt(newHolidayDate.substring(0,4), 10);
    if (newHolidayYear !== selectedYear){
        addNotification(t('holidayManagementPage.alertYearMismatch', { year: selectedYear }), 'error');
        return;
    }
    if (globalHolidays.some(h => h.date === newHolidayDate)) {
        addNotification(t('holidayManagementPage.alertDateExists'), 'error');
        return;
    }

    const newHolidayEntry: Holiday = {
      id: `holiday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      name: newHolidayName,
      date: newHolidayDate,
      isOfficial: selectedCountry !== "Global", 
    };
    const updatedHolidays = [...globalHolidays, newHolidayEntry];
    const result = await saveGlobalHolidays(updatedHolidays); 
    if (result.success) {
        addNotification(t('holidayManagementPage.alertConfigSaved'), 'success');
        setNewHolidayName('');
        setNewHolidayDate('');
    } else {
        addNotification(result.message || 'Error saving holidays', 'error');
    }
  };

  const handleRemoveHoliday = async (holidayId?: string) => { 
    if (!holidayId) return; 
    const updatedHolidays = globalHolidays.filter(h => h.id !== holidayId);
    const result = await saveGlobalHolidays(updatedHolidays); 
    if (result.success) {
        addNotification(t('holidayManagementPage.alertConfigSaved'), 'success');
    } else {
        addNotification(result.message || 'Error removing holiday', 'error');
    }
  };
  
  const generateYearOptions = () => {
    const currentYr = new Date().getFullYear();
    const years = [];
    for (let i = currentYr - 5; i <= currentYr + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const officialHolidaysCount = holidaysForDisplay.filter(h => h.isOfficial).length;
  const customHolidaysCount = holidaysForDisplay.filter(h => !h.isOfficial).length;
  const totalHolidaysCount = holidaysForDisplay.length;

  const countryOptions: { value: CountryOption, labelKey: string }[] = [
    { value: "Global", labelKey: "holidayManagementPage.countryGlobal" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard
        title={t('holidayManagementPage.title')}
        titleIcon={PageIcon}
        titleIconProps={{ className: "w-7 h-7 text-indigo-600" }}
        titleTextClassName="text-2xl font-semibold text-slate-800"
        headerAreaClassName="p-0 pb-6 border-none" 
        contentAreaClassName="p-0" 
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <SectionCard
              title={t('holidayManagementPage.configCardTitle')}
              titleTextClassName="text-lg font-medium text-slate-700"
              headerAreaClassName="p-4 border-b border-slate-200"
              contentAreaClassName="p-4"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="country-select" className="block text-sm font-medium text-slate-600 mb-1">{t('holidayManagementPage.countryLabel')}</label>
                  <select 
                      id="country-select" 
                      value={selectedCountry} 
                      className={`${lightSelectClasses} cursor-not-allowed opacity-70`}
                      disabled 
                  >
                    {countryOptions.map(opt => <option key={opt.value} value={opt.value}>{t(opt.labelKey, opt.value)}</option>)}
                  </select>
                   <p className="mt-1 text-xs text-slate-500">
                      {t('adminDashboardPage.peakConcurrencyChart.featureNote')} 
                  </p>
                </div>
                <div>
                  <label htmlFor="year-select" className="block text-sm font-medium text-slate-600 mb-1">{t('holidayManagementPage.yearLabel')}</label>
                  <select 
                      id="year-select" 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(parseInt(e.target.value,10))}
                      className={lightSelectClasses}
                  >
                    {generateYearOptions().map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title={t('holidayManagementPage.addHolidayCardTitle')}
              titleTextClassName="text-lg font-medium text-slate-700"
              headerAreaClassName="p-4 border-b border-slate-200"
              contentAreaClassName="p-4"
            >
              <div className="space-y-3">
                <div>
                  <label htmlFor="holiday-name" className="block text-sm font-medium text-slate-600 mb-1">{t('holidayManagementPage.nameLabel')}</label>
                  <input 
                      type="text" 
                      id="holiday-name" 
                      value={newHolidayName} 
                      onChange={(e) => setNewHolidayName(e.target.value)} 
                      className={lightInputClasses}
                      placeholder={t('holidayManagementPage.namePlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="holiday-date" className="block text-sm font-medium text-slate-600 mb-1">{t('holidayManagementPage.dateLabel')}</label>
                  <input 
                      type="date" 
                      id="holiday-date" 
                      value={newHolidayDate} 
                      onChange={(e) => setNewHolidayDate(e.target.value)} 
                      className={lightInputClasses}
                  />
                </div>
                <button 
                  onClick={handleAddHoliday}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  <span>{t('holidayManagementPage.addButton')}</span>
                </button>
              </div>
            </SectionCard>

            <SectionCard
                title={t('holidayManagementPage.summaryCardTitle', { year: selectedYear })}
                titleTextClassName="text-lg font-medium text-slate-700"
                headerAreaClassName="p-4 border-b border-slate-200"
                contentAreaClassName="p-4"
            >
                <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex justify-between"><span>{t('holidayManagementPage.officialHolidays')}</span> <span className="font-semibold bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 text-xs">{officialHolidaysCount}</span></div>
                    <div className="flex justify-between"><span>{t('holidayManagementPage.customHolidays')}</span> <span className="font-semibold bg-blue-200 px-1.5 py-0.5 rounded text-blue-700 text-xs">{customHolidaysCount}</span></div>
                    <hr className="my-1.5"/>
                    <div className="flex justify-between font-semibold text-slate-700"><span>{t('holidayManagementPage.totalLabel')}</span> <span className="bg-green-200 px-1.5 py-0.5 rounded text-green-700 text-xs">{totalHolidaysCount}</span></div>
                </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-2">
            <SectionCard
                title={t('holidayManagementPage.holidaysForYearTitle', { year: selectedYear, country: t(countryOptions.find(c => c.value === selectedCountry)?.labelKey || 'holidayManagementPage.countryGlobal', selectedCountry) })}
                titleTextClassName="text-lg font-medium text-slate-700"
                headerAreaClassName="p-4 border-b border-slate-200"
                contentAreaClassName="p-4"
            >
                {holidaysForDisplay.length === 0 ? (
                    <p className="text-slate-500 text-center py-10">{t('holidayManagementPage.noHolidaysFound', { year: selectedYear })}</p>
                ) : (
                    <ul className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {holidaysForDisplay.map(holiday => (
                        <li key={holiday.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-md hover:bg-slate-50">
                        <div className="flex items-center">
                            <span className="text-lg font-semibold text-indigo-600 w-8 text-center">{new Date(holiday.date + 'T00:00:00').getDate()}</span>
                            <div className="ml-3">
                            <span className={`font-medium text-slate-800 ${holiday.isOfficial ? '' : 'italic'}`}>{t(`holidays.${holiday.name.replace(/\s+/g, '')}`, holiday.name)}</span>
                            <span className="block text-xs text-slate-500">
                                {new Date(holiday.date + 'T00:00:00').toLocaleDateString(i18n.language, { month: 'short' })}. {new Date(holiday.date + 'T00:00:00').toLocaleDateString(i18n.language, { weekday: 'long', day: '2-digit', month: 'long' })}
                            </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleRemoveHoliday(holiday.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                            title={t('adminDashboardPage.rejectButton')}
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                        </li>
                    ))}
                    </ul>
                )}
            </SectionCard>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default HolidayManagementPage;