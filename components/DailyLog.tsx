
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DailyLogEntry, UserGlobalSettings, WeeklyContractHours } from '../types';
import DailyLogRow from './DailyLogRow';
import { ICONS } from '../constants';

interface DailyLogProps {
  dailyLogs: DailyLogEntry[];
  onLogEntryChange: (updatedEntry: DailyLogEntry) => void;
  userGlobalSettings: UserGlobalSettings;
  weeklyContract: WeeklyContractHours; // Added weeklyContract
}

const DailyLog: React.FC<DailyLogProps> = ({ dailyLogs, onLogEntryChange, userGlobalSettings, weeklyContract }) => {
  const { t } = useTranslation();

  if (!dailyLogs || dailyLogs.length === 0) {
    return <p className="text-center text-slate-500 py-8">{t('dailyLog.noData')}</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-600">
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-bold text-white uppercase tracking-wider">{t('dailyLog.dateHeader')}</th>
              <th scope="col" colSpan={3} className="px-2 py-3.5 text-center text-sm font-bold text-white uppercase tracking-wider border-l border-r border-slate-500">
                <span className="mr-1.5 text-xl">{ICONS.SUN}</span>{t('dailyLog.morningHeader')}
              </th>
              <th scope="col" colSpan={3} className="px-2 py-3.5 text-center text-sm font-bold text-white uppercase tracking-wider border-l border-r border-slate-500">
                <span className="mr-1.5 text-xl">{ICONS.MOON}</span>{t('dailyLog.afternoonHeader')}
              </th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-bold text-white uppercase tracking-wider">{t('dailyLog.totalHoursShortHeader')}</th>
            </tr>
            <tr className="bg-slate-200">
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-700 border-b border-slate-400"></th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-slate-700 border-b border-slate-400">{t('dailyLog.startHeader')}</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-slate-700 border-b border-slate-400">{t('dailyLog.endHeader')}</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-slate-700 border-b border-slate-400">{t('dailyLog.typeHeader')}</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-slate-700 border-b border-slate-400">{t('dailyLog.startHeader')}</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-slate-700 border-b border-slate-400">{t('dailyLog.endHeader')}</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-slate-700 border-b border-slate-400">{t('dailyLog.typeHeader')}</th>
              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-slate-700 border-b border-slate-400"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {dailyLogs.map(logEntry => (
              <DailyLogRow
                key={logEntry.id}
                logEntry={logEntry}
                onLogEntryChange={onLogEntryChange}
                userGlobalSettings={userGlobalSettings}
                weeklyContract={weeklyContract} // Pass weeklyContract
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyLog;
