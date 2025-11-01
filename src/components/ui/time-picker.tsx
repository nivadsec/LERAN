
'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [hour, minute] = value?.split(':') || ['', ''];

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour.padStart(2, '0')}:${minute || '00'}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour || '00'}:${newMinute.padStart(2, '0')}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <Clock className="ml-2 h-4 w-4" />
          {value || <span>انتخاب زمان</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex items-center gap-2 p-4" dir="ltr">
          <Select onValueChange={handleHourChange} value={hour}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="ساعت" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((h) => (
                <SelectItem key={h} value={h}>
                  {h.padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>:</span>
          <Select onValueChange={handleMinuteChange} value={minute}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="دقیقه" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m.padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
