
import React from 'react';
import { useTranslation } from 'react-i18next';
import { VacationStatus, MonthlyVacationListProps } from '../../types';
import { VACATION_STATUS_STYLES } from '../../constants';
import SectionCard from '../SectionCard';
import { PaperAirplaneIcon, TrashIcon, CheckCircleIcon, ClockIcon, XCircleIcon, PrinterIcon } from '../icons';

const MonthlyVacationList: React.FC<MonthlyVacationListProps> = ({
  currentMonthUserVacations,
  onDeleteVacation,
  onSubmitForApproval,
  onPrintRequest,
  displayDate,
  user
}) => {
  const { t, i18n } = useTranslation();

  const sortedVacations = [...currentMonthUserVacations].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <SectionCard
      title={t('vacationPage.myVacationsTitle', { month: displayDate.toLocaleDateString(i18n.language, { month: 'long' }) })}
      titleTextClassName="text-xl font-semibold text-slate-700"
      headerActions={
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          {currentMonthUserVacations.some(v => v.status === VacationStatus.PENDING_APPROVAL || v.status === VacationStatus.APPROVED) && (
               <button
                  onClick={onPrintRequest}
                  className="w-full sm:w-auto px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors flex items-center justify-center space-x-2 text-xs font-medium"
              >
                  <PrinterIcon className="w-4 h-4" />
                  <span>{t('vacationPage.printRequestButton')}</span>
              </button>
          )}
          {currentMonthUserVacations.some(v => v.status === VacationStatus.SELECTED) && (
              <button
                  onClick={onSubmitForApproval}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
              >
                  <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45" />
                  <span>{t('vacationPage.submitRequestButton')}</span>
              </button>
          )}
        </div>
      }
    >
        {sortedVacations.length > 0 ? (
            <div className="max-h-80 overflow-y-auto pr-1 -mr-1">
                <ul className="flex flex-wrap gap-2 justify-start">
                    {sortedVacations.map(vacation => (
                        <li key={vacation.date}
                            className={`relative px-1.5 py-0.5 rounded-md w-[140px] h-[28px]
                                       ${VACATION_STATUS_STYLES[vacation.status].bg}
                                       border ${VACATION_STATUS_STYLES[vacation.status].border || 'border-transparent'}
                                       shadow-sm flex items-center`}
                            title={t(`vacationStatuses.${vacation.status}`)}
                        >
                            {vacation.status === VacationStatus.SELECTED && <CheckCircleIcon className={`w-3.5 h-3.5 flex-shrink-0 mr-1.5 ${VACATION_STATUS_STYLES[VacationStatus.SELECTED].text}`} />}
                            {vacation.status === VacationStatus.PENDING_APPROVAL && <ClockIcon className={`w-3.5 h-3.5 flex-shrink-0 mr-1.5 ${VACATION_STATUS_STYLES[VacationStatus.PENDING_APPROVAL].text}`} />}
                            {vacation.status === VacationStatus.APPROVED && <CheckCircleIcon className={`w-3.5 h-3.5 flex-shrink-0 mr-1.5 ${VACATION_STATUS_STYLES[VacationStatus.APPROVED].text}`} />}
                            {vacation.status === VacationStatus.REJECTED && <XCircleIcon className={`w-3.5 h-3.5 flex-shrink-0 mr-1.5 ${VACATION_STATUS_STYLES[VacationStatus.REJECTED].text}`} />}
                            
                            <span className={`font-medium text-slate-800 text-xs leading-tight block truncate flex-grow ${VACATION_STATUS_STYLES[vacation.status].text}`}>
                                {new Date(vacation.date + 'T00:00:00').toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                                
                            {(vacation.status === VacationStatus.SELECTED || vacation.status === VacationStatus.REJECTED || vacation.status === VacationStatus.PENDING_APPROVAL) && (
                                <button
                                    onClick={() => onDeleteVacation(vacation.date)}
                                    className="p-0.5 hover:bg-red-200 rounded-full transition-colors flex items-center justify-center ml-1.5"
                                    aria-label={t('vacationPage.deleteAction')}
                                >
                                    <TrashIcon className="w-3 h-3 text-red-600" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <p className="text-sm text-slate-500 py-4 text-center">{t('vacationPage.noVacationDays')}</p>
        )}
    </SectionCard>
  );
};

export default MonthlyVacationList;
