// components/molecules/DatePicker.tsx
import * as React from 'react';
import { format } from 'date-fns';
import { LuCalendar as CalendarIcon } from 'react-icons/lu';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  disabledPast?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDays?: Date[];
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Select date",
  disabledPast = true,
  minDate,
  maxDate,
  disabledDays = []
}: DatePickerProps) {
  // Calculate disabled dates
  const getDisabledDays = () => {
    const disabled: Date[] = [...disabledDays];

    if (disabledPast) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Disable all dates before today
      return [{ before: today }, ...disabled];
    }

    if (minDate) {
      return [{ before: minDate }, ...disabled];
    }

    if (maxDate) {
      return [{ after: maxDate }, ...disabled];
    }

    return disabled;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={getDisabledDays()}
        />
      </PopoverContent>
    </Popover>
  );
}