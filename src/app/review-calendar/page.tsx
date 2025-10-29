'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns-jalali';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function ReviewCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4">
             <Button>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن رویداد جدید
            </Button>
            <div className="text-right">
              <CardTitle>تقویم مرور</CardTitle>
              <CardDescription>
                برنامه‌های مرور، آزمون‌ها و رویدادهای مهم خود را در این تقویم مدیریت کنید.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/3 lg:w-1/4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-right text-lg">
                           رویدادهای {date ? format(date, 'd MMMM yyyy') : '...'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center text-muted-foreground p-4">
                            هیچ رویدادی برای این روز ثبت نشده است.
                        </div>
                    </CardContent>
                </Card>
            </aside>
            <main className="flex-1">
                 <Card>
                    <CardContent className="p-0">
                         <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="w-full"
                            dir="rtl"
                         />
                    </CardContent>
                 </Card>
            </main>
        </CardContent>
      </Card>
    </div>
  );
}
