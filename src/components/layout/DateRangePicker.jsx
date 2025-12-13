import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDate } from '@/utils/formatters';

// Função para converter data em string YYYY-MM-DD sem problemas de timezone
const dateToString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função para converter string YYYY-MM-DD em Date sem problemas de timezone
const stringToDate = (dateString) => {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const DateRangePicker = ({ dateRange, onDateRangeChange }) => {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState({
    from: stringToDate(dateRange.start),
    to: stringToDate(dateRange.end)
  });
  const [isRangeComplete, setIsRangeComplete] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

  // Sincronizar quando abrir o popover
  useEffect(() => {
    if (open) {
      const newRange = {
        from: stringToDate(dateRange.start),
        to: stringToDate(dateRange.end)
      };
      setTempRange(newRange);
      setIsRangeComplete(!!(newRange.from && newRange.to));
      setCalendarKey(prev => prev + 1); // Forçar re-render ao abrir
    }
  }, [open, dateRange.start, dateRange.end]);

  const handleDayClick = (day) => {
    // Se tinha range completo, resetar e começar nova seleção
    if (isRangeComplete) {
      setTempRange({ from: day, to: undefined });
      setIsRangeComplete(false);
      setCalendarKey(prev => prev + 1); // Forçar re-render visual
      return;
    }

    // Se só tem FROM, completar o range
    if (tempRange?.from && !tempRange?.to) {
      const newRange = tempRange.from <= day 
        ? { from: tempRange.from, to: day }
        : { from: day, to: tempRange.from };
      
      setTempRange(newRange);
      setIsRangeComplete(true);
      
      onDateRangeChange({
        start: dateToString(newRange.from),
        end: dateToString(newRange.to)
      });
      
      setTimeout(() => setOpen(false), 200);
      return;
    }

    // Se não tem nada, começar nova seleção
    setTempRange({ from: day, to: undefined });
    setIsRangeComplete(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">
            {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          key={calendarKey}
          mode="range"
          selected={tempRange}
          onDayClick={handleDayClick}
          numberOfMonths={2}
          className="rounded-lg"
        />
      </PopoverContent>
    </Popover>
  );
};
