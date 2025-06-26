
"use client"

import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TimePickerInputProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

// Helper for the individual time part (hour/minute) with steppers
function TimePart({
  value,
  onChange,
  onBlur,
  onIncrement,
  onDecrement,
  placeholder,
  id,
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onIncrement: () => void;
  onDecrement: () => void;
  placeholder: string;
  id: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={(e) => e.target.select()}
        className="w-16 text-center font-mono text-base h-10 pr-8"
        maxLength={2}
        placeholder={placeholder}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center h-full">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0"
          onClick={onIncrement}
          tabIndex={-1}
        >
          <span className="sr-only">Increment</span>
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0"
          onClick={onDecrement}
          tabIndex={-1}
        >
          <span className="sr-only">Decrement</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function TimePickerInput({ date, setDate }: TimePickerInputProps) {
  const [hour, setHour] = React.useState<string>(date ? String(date.getHours() % 12 || 12).padStart(2, '0') : "");
  const [minute, setMinute] = React.useState<string>(date ? String(date.getMinutes()).padStart(2, '0') : "");
  const [period, setPeriod] = React.useState<'AM' | 'PM'>(date ? (date.getHours() >= 12 ? 'PM' : 'AM') : "AM");

  React.useEffect(() => {
    if (date) {
      const currentHour = date.getHours();
      setHour(String(currentHour % 12 || 12).padStart(2, '0'));
      setMinute(String(date.getMinutes()).padStart(2, '0'));
      setPeriod(currentHour >= 12 ? 'PM' : 'AM');
    } else {
      setHour("");
      setMinute("");
      setPeriod("AM");
    }
  }, [date]);

  const updateDate = (h: string, m: string, p: 'AM' | 'PM') => {
    if (h && m) {
      const newDate = date ? new Date(date) : new Date();
      let hours = parseInt(h, 10);
      if (p === 'PM' && hours < 12) {
        hours += 12;
      } else if (p === 'AM' && hours === 12) {
        hours = 0;
      }
      if (!isNaN(hours) && !isNaN(parseInt(m, 10))) {
        newDate.setHours(hours, parseInt(m, 10), 0, 0);
        setDate(newDate);
      }
    } else if (!h && !m) {
        setDate(undefined);
    }
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setHour(val);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setMinute(val);
  };
  
  const handleHourBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1 || val > 12) {
        val = date ? date.getHours() % 12 || 12 : 12;
      }
      const newHour = String(val).padStart(2, '0');
      setHour(newHour);
      updateDate(newHour, minute, period);
  }

  const handleMinuteBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 0 || val > 59) {
        val = date ? date.getMinutes() : 0;
      }
      const newMinute = String(val).padStart(2, '0');
      setMinute(newMinute);
      updateDate(hour, newMinute, period);
  }

  const handlePeriodClick = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);
    updateDate(hour, minute, newPeriod);
  };

  const handleStep = (part: 'hour' | 'minute', direction: 'inc' | 'dec') => {
    let newHour = parseInt(hour, 10);
    let newMinute = parseInt(minute, 10);
    
    if (part === 'hour') {
      if (isNaN(newHour)) newHour = 12;
      newHour = direction === 'inc' ? (newHour % 12) + 1 : (newHour === 1 ? 12 : newHour - 1);
      const newHourStr = String(newHour).padStart(2, '0');
      setHour(newHourStr);
      updateDate(newHourStr, minute, period);
    } else { // minute
      if (isNaN(newMinute)) newMinute = 0;
      newMinute = direction === 'inc' ? (newMinute + 1) % 60 : (newMinute - 1 + 60) % 60;
      const newMinuteStr = String(newMinute).padStart(2, '0');
      setMinute(newMinuteStr);
      updateDate(hour, newMinuteStr, period);
    }
  };


  return (
    <div className="space-y-2">
      <Label>Time</Label>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TimePart
            id="time-picker-hour"
            value={hour}
            onChange={handleHourChange}
            onBlur={handleHourBlur}
            onIncrement={() => handleStep('hour', 'inc')}
            onDecrement={() => handleStep('hour', 'dec')}
            placeholder="hh"
          />
          <span className="text-lg font-bold">:</span>
          <TimePart
            id="time-picker-minute"
            value={minute}
            onChange={handleMinuteChange}
            onBlur={handleMinuteBlur}
            onIncrement={() => handleStep('minute', 'inc')}
            onDecrement={() => handleStep('minute', 'dec')}
            placeholder="mm"
          />
        </div>
        <div className="flex items-center rounded-md border p-0.5 shrink-0">
          <Button
            type="button"
            variant={period === 'AM' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn("h-8 px-2.5 rounded-sm", period === 'AM' && "shadow-sm")}
            onClick={() => handlePeriodClick('AM')}
          >
            AM
          </Button>
          <Button
            type="button"
            variant={period === 'PM' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn("h-8 px-2.5 rounded-sm", period === 'PM' && "shadow-sm")}
            onClick={() => handlePeriodClick('PM')}
          >
            PM
          </Button>
        </div>
      </div>
    </div>
  );
}
