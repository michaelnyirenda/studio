
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
  const [hour, setHour] = React.useState<string>(date ? String(date.getHours() % 12 || 12) : "");
  const [minute, setMinute] = React.useState<string>(date ? String(date.getMinutes()) : "");
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
      <Label htmlFor="time-picker-hour">Enter time</Label>
      <div className="flex items-end gap-2">
        <div className="grid gap-1 text-center">
            <Input
                id="time-picker-hour"
                value={hour}
                onChange={handleHourChange}
                onBlur={handleHourBlur}
                className="w-16 text-center text-lg p-2 bg-background border-primary focus:border-2 h-12 font-mono"
                maxLength={2}
                placeholder="07"
            />
            <Label htmlFor="time-picker-hour" className="text-xs text-muted-foreground">Hour</Label>
        </div>
        <span className="text-xl font-bold pb-3">:</span>
        <div className="grid gap-1 text-center">
            <Input
                id="time-picker-minute"
                value={minute}
                onChange={handleMinuteChange}
                onBlur={handleMinuteBlur}
                className="w-16 text-center text-lg p-2 bg-background h-12 font-mono"
                maxLength={2}
                placeholder="00"
            />
            <Label htmlFor="time-picker-minute" className="text-xs text-muted-foreground">Minute</Label>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant={period === 'AM' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn("h-6 px-3", period === 'AM' && "bg-primary/20 text-primary")}
            onClick={() => handlePeriodClick('AM')}
          >
            AM
          </Button>
          <Button
            type="button"
            variant={period === 'PM' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn("h-6 px-3", period === 'PM' && "bg-primary/20 text-primary")}
            onClick={() => handlePeriodClick('PM')}
          >
            PM
          </Button>
        </div>
      </div>
    </div>
  );
}
