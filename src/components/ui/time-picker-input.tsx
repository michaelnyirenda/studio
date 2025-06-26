
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TimePickerInputProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
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
    } else {
      setDate(undefined);
    }
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^([0-9]|0[1-9]|1[0-2])?$/.test(val)) {
      setHour(val);
      updateDate(val, minute, period);
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^([0-9]|[0-5][0-9])?$/.test(val)) {
        setMinute(val);
        updateDate(hour, val, period);
    }
  };
  
  const handleHourBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if(val){
        const newHour = String(val).padStart(2, '0');
        setHour(newHour);
        updateDate(newHour, minute, period);
      }
  }

  const handleMinuteBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if(val){
        const newMinute = String(val).padStart(2, '0');
        setMinute(newMinute);
        updateDate(hour, newMinute, period);
      }
  }

  const handlePeriodClick = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);
    updateDate(hour, minute, newPeriod);
  };

  return (
    <div className="space-y-2">
      <Label>Time</Label>
      <div className="flex items-center gap-2">
        <Input
            id="time-picker-hour"
            value={hour}
            onChange={handleHourChange}
            onBlur={handleHourBlur}
            className="w-14 text-center text-lg p-2 h-10 font-mono"
            maxLength={2}
            placeholder="hh"
        />
        <span className="text-lg font-bold">:</span>
        <Input
            id="time-picker-minute"
            value={minute}
            onChange={handleMinuteChange}
            onBlur={handleMinuteBlur}
            className="w-14 text-center text-lg p-2 h-10 font-mono"
            maxLength={2}
            placeholder="mm"
        />
        <div className="flex items-center rounded-md border p-0.5">
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
