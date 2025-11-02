
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, ShieldCheck, Clock, BrainCircuit, Star } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { TimePicker } from '@/components/ui/time-picker';
import { Separator } from '@/components/ui/separator';

const activitySchema = z.object({
  activity: z.string().min(1, "فعالیت الزامی است."),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "فرمت ساعت نامعتبر است."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "فرمت ساعت نامعتبر است."),
  timeBoxing: z.coerce.number().min(0),
  focus: z.number().min(0).max(10),
  satisfaction: z.number().min(0).max(5),
  activityType: z.string().min(1, "نوع فعالیت الزامی است."),
  notes: z.string().optional(),
});

const formSchema = z.object({
  activities: z.array(activitySchema),
  dayEndTime: z.string().optional(),
  vibrancy: z.number().min(1).max(5).optional(),
  satisfaction: z.number().min(1).max(5).optional(),
  focus: z.number().min(1).max(5).optional(),
  calmness: z.number().min(1).max(5).optional(),
  mood: z.number().min(1).max(5).optional(),
  nextDayGoal: z.string().optional(),
  improvementNotes: z.string().optional(),
  interruptions: z.string().optional(),
  keyTakeaways: z.string().optional(),
  thingsToImprove: z.string().optional(),
  learningExperiences: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DailyMonitoringPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activities: [],
      dayEndTime: '',
      vibrancy: 3,
      satisfaction: 3,
      focus: 3,
      calmness: 3,
      mood: 3,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'activities',
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    // Firestore saving logic will go here
  };

  return (
    <div className="space-y-8">
      <CardHeader className="text-right p-0">
        <CardTitle className="text-2xl font-bold flex items-center justify-end gap-2">
          <ShieldCheck className="h-7 w-7 text-primary"/>
          پایش هوشمند روزانه
        </CardTitle>
        <CardDescription>
          در اینجا کیفیت اجرای برنامه و وضعیت روانی خود را در طول روز ثبت و ارزیابی کنید.
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ activity: '', startTime: '', endTime: '', timeBoxing: 50, focus: 5, satisfaction: 3, activityType: 'مطالعه', notes: '' })}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    افزودن فعالیت
                </Button>
                <span className="text-right">جدول فعالیت‌های روزانه</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">فعالیت</TableHead>
                      <TableHead className="text-center">شروع</TableHead>
                      <TableHead className="text-center">پایان</TableHead>
                      <TableHead className="text-center">باکس زمانی</TableHead>
                      <TableHead className="text-center">نوع</TableHead>
                      <TableHead className="text-center">تمرکز (۰-۱۰)</TableHead>
                      <TableHead className="text-center">رضایت (۰-۵)</TableHead>
                      <TableHead className="text-right">توضیحات</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell><Input {...form.register(`activities.${index}.activity`)} /></TableCell>
                        <TableCell><Input {...form.register(`activities.${index}.startTime`)} className="text-center" dir="ltr" /></TableCell>
                        <TableCell><Input {...form.register(`activities.${index}.endTime`)} className="text-center" dir="ltr" /></TableCell>
                        <TableCell><Input type="number" {...form.register(`activities.${index}.timeBoxing`)} className="text-center" /></TableCell>
                        <TableCell><Input {...form.register(`activities.${index}.activityType`)} className="text-center" /></TableCell>
                        <TableCell><Input type="number" {...form.register(`activities.${index}.focus`)} className="text-center" /></TableCell>
                        <TableCell><Input type="number" {...form.register(`activities.${index}.satisfaction`)} className="text-center" /></TableCell>
                        <TableCell><Input {...form.register(`activities.${index}.notes`)} /></TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                       <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <div className="w-full">
                          <Input className="text-base font-bold text-right" placeholder="فعالیت" {...form.register(`activities.${index}.activity`)} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                         <FormItem><FormLabel>شروع</FormLabel><Input {...form.register(`activities.${index}.startTime`)} className="text-center" dir="ltr" /></FormItem>
                         <FormItem><FormLabel>پایان</FormLabel><Input {...form.register(`activities.${index}.endTime`)} className="text-center" dir="ltr" /></FormItem>
                       </div>
                       <Separator />
                       <div className="grid grid-cols-2 gap-4">
                         <FormItem><FormLabel>باکس زمانی</FormLabel><Input type="number" {...form.register(`activities.${index}.timeBoxing`)} className="text-center" /></FormItem>
                         <FormItem><FormLabel>نوع</FormLabel><Input {...form.register(`activities.${index}.activityType`)} className="text-center" /></FormItem>
                         <FormItem><FormLabel>تمرکز (۰-۱۰)</FormLabel><Input type="number" {...form.register(`activities.${index}.focus`)} className="text-center" /></FormItem>
                         <FormItem><FormLabel>رضایت (۰-۵)</FormLabel><Input type="number" {...form.register(`activities.${index}.satisfaction`)} className="text-center" /></FormItem>
                       </div>
                       <FormItem><FormLabel>توضیحات</FormLabel><Input {...form.register(`activities.${index}.notes`)} /></FormItem>
                    </CardContent>
                  </Card>
                ))}
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center justify-end gap-2"><Star className="h-5 w-5 text-primary"/>ارزیابی کیفیت کلی روز</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="dayEndTime" render={({ field }) => (
                      <FormItem>
                          <FormLabel className="flex items-center justify-end gap-2"><Clock className="h-4 w-4"/>ساعت پایان روز</FormLabel>
                          <FormControl><TimePicker value={field.value} onChange={field.onChange} /></FormControl>
                          <FormMessage />
                      </FormItem>
                    )} />
                </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                 <FormField name="vibrancy" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>میزان نشاط: {field.value}</FormLabel><FormControl><Slider dir="ltr" value={[field.value || 3]} onValueChange={(v) => field.onChange(v[0])} max={5} min={1} step={1} /></FormControl></FormItem>
                 )} />
                 <FormField name="satisfaction" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>رضایت درونی: {field.value}</FormLabel><FormControl><Slider dir="ltr" value={[field.value || 3]} onValueChange={(v) => field.onChange(v[0])} max={5} min={1} step={1} /></FormControl></FormItem>
                 )} />
                 <FormField name="focus" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>تمرکز: {field.value}</FormLabel><FormControl><Slider dir="ltr" value={[field.value || 3]} onValueChange={(v) => field.onChange(v[0])} max={5} min={1} step={1} /></FormControl></FormItem>
                 )} />
                  <FormField name="calmness" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>آرامش ذهنی: {field.value}</FormLabel><FormControl><Slider dir="ltr" value={[field.value || 3]} onValueChange={(v) => field.onChange(v[0])} max={5} min={1} step={1} /></FormControl></FormItem>
                 )} />
                 <FormField name="mood" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>روحیه: {field.value}</FormLabel><FormControl><Slider dir="ltr" value={[field.value || 3]} onValueChange={(v) => field.onChange(v[0])} max={5} min={1} step={1} /></FormControl></FormItem>
                 )} />
               </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField name="improvementNotes" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>نکات روز بعد برای اصلاح</FormLabel><FormControl><Textarea placeholder="فردا چه چیزی را باید بهتر انجام دهم؟" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField name="nextDayGoal" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>هدف‌گذاری و جمع‌بندی برای فردا</FormLabel><FormControl><Textarea placeholder="مهم‌ترین هدف فردا چیست؟" {...field} /></FormControl></FormItem>
                    )} />
                 </div>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
                <CardTitle className="text-right flex items-center justify-end gap-2"><BrainCircuit className="h-5 w-5 text-primary"/>یادداشت و تحلیل آزاد</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="interruptions" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>نوع وقفه‌ها</FormLabel><FormControl><Textarea placeholder="چه چیزهایی حواس شما را پرت کردند؟" {...field} /></FormControl></FormItem>
                )} />
                <FormField name="keyTakeaways" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>نکات کلیدی روز</FormLabel><FormControl><Textarea placeholder="مهم‌ترین چیزی که امروز یاد گرفتید چه بود؟" {...field} /></FormControl></FormItem>
                )} />
                <FormField name="thingsToImprove" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>کارهایی که باید اصلاح شوند</FormLabel><FormControl><Textarea placeholder="کدام عادت‌ها یا کارها نیاز به بازنگری دارند؟" {...field} /></FormControl></FormItem>
                )} />
                <FormField name="learningExperiences" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>تجربه‌های مفید یادگیری</FormLabel><FormControl><Textarea placeholder="کدام روش مطالعه امروز برایتان مؤثر بود؟" {...field} /></FormControl></FormItem>
                )} />
             </CardContent>
          </Card>

          <div className="flex justify-start">
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "در حال ثبت..." : "ثبت گزارش پایش روزانه"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

    