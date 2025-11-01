'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { CalendarDays, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const lessonSchema = z.object({
  lesson: z.string().optional(),
  teacher: z.string().optional(),
});

const dayScheduleSchema = z.object({
  day: z.string(),
  lessons: z.array(lessonSchema),
});

const scheduleSchema = z.object({
  schedule: z.array(dayScheduleSchema),
});

type FormValues = z.infer<typeof scheduleSchema>;

const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
const lessonTimes = ['زنگ اول (۷:۳۰ - ۹:۰۰)', 'زنگ دوم (۹:۱۵ - ۱۰:۴۵)', 'زنگ سوم (۱۱:۰۰ - ۱۲:۳۰)', 'زنگ چهارم (۱۲:۴۵ - ۱۴:۱۵)'];

export default function ClassSchedulePage() {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      schedule: daysOfWeek.map(day => ({
        day,
        lessons: lessonTimes.map(() => ({ lesson: '', teacher: '' })),
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'schedule',
  });

  const onSubmit = (data: FormValues) => {
    // In a real app, you would save this data to Firestore
    console.log(data);
    toast({
      title: 'برنامه ذخیره شد',
      description: 'برنامه کلاسی شما با موفقیت ذخیره شد.',
    });
  };

  return (
    <Card>
      <CardHeader className="text-right">
        <CardTitle className="flex justify-end items-center gap-2">
          برنامه کلاسی هفته
          <CalendarDays className="h-6 w-6 text-primary" />
        </CardTitle>
        <CardDescription>
          برنامه هفتگی کلاس‌های مدرسه خود را در جدول زیر وارد و ذخیره کنید.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">روز / ساعت</TableHead>
                    {lessonTimes.map(time => (
                      <TableHead key={time} className="text-center min-w-[200px]">{time}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((dayField, dayIndex) => (
                    <TableRow key={dayField.id}>
                      <TableCell className="font-bold">{daysOfWeek[dayIndex]}</TableCell>
                      {dayField.lessons.map((_, lessonIndex) => (
                        <TableCell key={lessonIndex}>
                          <div className="space-y-2">
                            <Input
                              placeholder="نام درس"
                              {...form.register(`schedule.${dayIndex}.lessons.${lessonIndex}.lesson`)}
                            />
                            <Input
                              placeholder="نام معلم"
                              {...form.register(`schedule.${dayIndex}.lessons.${lessonIndex}.teacher`)}
                            />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-start">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="ml-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'در حال ذخیره...' : 'ذخیره برنامه'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
