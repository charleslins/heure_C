import React from 'react';
import { useTranslation } from 'react-i18next';
import { DailyLogEntry, EntryType, UserGlobalSettings, WeeklyContractHours, TimeSegment } from '../types';
import TimeInput from './common/TimeInput';
import TypeSelector from './TypeSelector';
import { calculateDurationInHours, formatHours, getDayOfWeekName } from '../utils/timeUtils';
import { SEGMENT_COLORS, SEGMENT_HOVER_COLORS } from '../constants';

interface DailyLogRowProps {
  logEntry: DailyLogEntry;
  onLogEntryChange: (updatedEntry: DailyLogEntry) => void;
  userGlobalSettings: UserGlobalSettings;
  weeklyContract: WeeklyContractHours;
}

const DailyLogRow: React.FC<DailyLogRowProps> = ({ logEntry, onLogEntryChange, userGlobalSettings, weeklyContract }) => {
  const { i18n } = useTranslation();

  const parseTimeToHour = (timeString?: string): number | undefined => {
    if (!timeString || !timeString.includes(':')) return undefined;
    const [hours] = timeString.split(':').map(Number);
    return isNaN(hours) ? undefined : hours;
  };

  const minHour = parseTimeToHour(userGlobalSettings?.workTimeDefaults?.overallStartTime);
  const maxHour = parseTimeToHour(userGlobalSettings?.workTimeDefaults?.overallEndTime);

  const handleTimeChange = (period: 'morning' | 'afternoon', part: 'start' | 'end', value: string) => {
    onLogEntryChange({
      ...logEntry,
      [period]: {
        ...logEntry[period],
        [part]: value,
      },
    });
  };

  const handleTypeChange = (period: 'morning' | 'afternoon', type: EntryType) => {
    const shouldClearTimes = type === EntryType.VACANCE || type === EntryType.FERIE || type === EntryType.RECUPERATION || type === EntryType.MALADIE;
    onLogEntryChange({
      ...logEntry,
      [period]: {
        ...logEntry[period],
        type: type,
        start: shouldClearTimes ? '' : logEntry[period].start,
        end: shouldClearTimes ? '' : logEntry[period].end,
      },
    });
  };

  const morningHours = calculateDurationInHours(logEntry.morning.start, logEntry.morning.end);
  const afternoonHours = calculateDurationInHours(logEntry.afternoon.start, logEntry.afternoon.end);
  const totalDayHours = morningHours + afternoonHours;

  const dayOfWeekShort = logEntry.date.toLocaleDateString(i18n.language, { weekday: 'short' }).replace('.', '').toLowerCase();
  const dayName = getDayOfWeekName(logEntry.date);
  const isWeekend = dayName === 'saturday' || dayName === 'sunday';

  const contractForDay = weeklyContract[dayName];
  const morningContractHours = contractForDay?.morning || 0;
  const afternoonContractHours = contractForDay?.afternoon || 0;

  const isTypeDisablingTimeInputs = (type: EntryType) => 
    type === EntryType.VACANCE || type === EntryType.FERIE || type === EntryType.RECUPERATION || type === EntryType.MALADIE;
  
  const isMorningTimeInputDisabled = isTypeDisablingTimeInputs(logEntry.morning.type);
  const isAfternoonTimeInputDisabled = isTypeDisablingTimeInputs(logEntry.afternoon.type);

  // Determine if a segment should appear faded but remain enabled for exceptional input
  const isMorningVisuallyFaded = morningContractHours === 0 && logEntry.morning.type === EntryType.REGULAR && !logEntry.morning.start && !logEntry.morning.end;
  const isAfternoonVisuallyFaded = afternoonContractHours === 0 && logEntry.afternoon.type === EntryType.REGULAR && !logEntry.afternoon.start && !logEntry.afternoon.end;

  const rowLevelFaded = (!logEntry.isWorkingDay || isWeekend) && !logEntry.hasInputs;

  const getSegmentClasses = (segmentData: TimeSegment, contractHoursForSegment: number, isVisuallyFaded: boolean, isTimeCell: boolean = false) => {
    let classes = `px-2 py-1.5 whitespace-nowrap transition-colors duration-150 ease-in-out border-b align-middle `;
    if (isTimeCell) {
        classes += ` min-w-[100px] sm:min-w-[110px] `;
    }

    const isSegmentTypeNonWorkingOverride = segmentData.type === EntryType.VACANCE || segmentData.type === EntryType.FERIE || segmentData.type === EntryType.RECUPERATION || segmentData.type === EntryType.MALADIE;
    const isSegmentEmptyAndRegular = !segmentData.start && !segmentData.end && segmentData.type === EntryType.REGULAR;

    if (rowLevelFaded && isSegmentEmptyAndRegular) {
        classes += 'bg-slate-50 border-slate-200 ';
    } else if (isVisuallyFaded && !isSegmentTypeNonWorkingOverride) {
        classes += 'bg-slate-100 border-slate-200 opacity-70 '; // Faded style for cell
    } else {
        classes += (SEGMENT_COLORS[segmentData.type] || 'bg-white border-slate-200') + ' ';
    }
    // Hover effect should still apply unless fully disabled by type
    if (!isTypeDisablingTimeInputs(segmentData.type)) {
        classes += (SEGMENT_HOVER_COLORS[segmentData.type] || 'hover:bg-slate-100');
    }
    
    return classes;
  };
  
  const rowClasses = `
    border-b border-slate-200 
    ${rowLevelFaded ? 'opacity-70 bg-slate-50' : 'bg-white'}
    transition-opacity duration-150 ease-in-out
  `;

  return (
    <tr className={rowClasses}>
      <td className={`px-3 py-1.5 text-sm text-slate-700 whitespace-nowrap align-middle ${rowLevelFaded ? '' : ''}`}>
        <div className="font-medium text-center">{logEntry.date.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit' })}</div>
        <div className="text-xs text-slate-500 capitalize text-center min-w-[45px] tracking-wide">{dayOfWeekShort}</div>
      </td>

      {/* Morning Segment */}
      <td className={getSegmentClasses(logEntry.morning, morningContractHours, isMorningVisuallyFaded, true)}>
        <TimeInput 
            id={`${logEntry.id}-m-start`} 
            value={logEntry.morning.start} 
            onChange={(v) => handleTimeChange('morning', 'start', v)} 
            disabled={isMorningTimeInputDisabled} // Only disabled by type, not contract hours
            minHour={minHour}
            maxHour={maxHour}
        />
      </td>
      <td className={getSegmentClasses(logEntry.morning, morningContractHours, isMorningVisuallyFaded, true)}>
        <TimeInput 
            id={`${logEntry.id}-m-end`} 
            value={logEntry.morning.end} 
            onChange={(v) => handleTimeChange('morning', 'end', v)} 
            disabled={isMorningTimeInputDisabled} // Only disabled by type, not contract hours
            minHour={minHour}
            maxHour={maxHour}
        />
      </td>
      <td className={getSegmentClasses(logEntry.morning, morningContractHours, isMorningVisuallyFaded) + ' min-w-[140px]'}>
        <TypeSelector 
            id={`${logEntry.id}-m-type`} 
            value={logEntry.morning.type} 
            onChange={(v) => handleTypeChange('morning', v)} 
            disabled={false} // Type selector generally remains enabled
        />
      </td>

      {/* Afternoon Segment */}
      <td className={getSegmentClasses(logEntry.afternoon, afternoonContractHours, isAfternoonVisuallyFaded, true)}>
        <TimeInput 
            id={`${logEntry.id}-a-start`} 
            value={logEntry.afternoon.start} 
            onChange={(v) => handleTimeChange('afternoon', 'start', v)} 
            disabled={isAfternoonTimeInputDisabled} // Only disabled by type, not contract hours
            minHour={minHour}
            maxHour={maxHour}
        />
      </td>
      <td className={getSegmentClasses(logEntry.afternoon, afternoonContractHours, isAfternoonVisuallyFaded, true)}>
        <TimeInput 
            id={`${logEntry.id}-a-end`} 
            value={logEntry.afternoon.end} 
            onChange={(v) => handleTimeChange('afternoon', 'end', v)} 
            disabled={isAfternoonTimeInputDisabled} // Only disabled by type, not contract hours
            minHour={minHour}
            maxHour={maxHour}
        />
      </td>
      <td className={getSegmentClasses(logEntry.afternoon, afternoonContractHours, isAfternoonVisuallyFaded) + ' min-w-[140px]'}>
        <TypeSelector 
            id={`${logEntry.id}-a-type`} 
            value={logEntry.afternoon.type} 
            onChange={(v) => handleTypeChange('afternoon', v)} 
            disabled={false} // Type selector generally remains enabled
        />
      </td>
      
      {/* Total */}
      <td className={`px-3 py-1.5 text-sm font-bold text-slate-800 text-right whitespace-nowrap align-middle ${rowLevelFaded ? '' : ''}`}>
        {formatHours(totalDayHours)}
      </td>
    </tr>
  );
};

export default DailyLogRow;
