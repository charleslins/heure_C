import { useState, useMemo } from 'react';
import { getDaysInMonth } from '../utils/timeUtils';

export function useMonthNavigation(initialDate = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  function nextMonth() {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function prevMonth() {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  return {
    currentDate,
    setCurrentDate,
    year,
    month,
    nextMonth,
    prevMonth,
    daysInMonth,
  };
} 