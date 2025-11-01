
'use client';

import { useState, useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, BookCopy, PlusCircle, Trash2, Send, BarChartHorizontalBig, Sparkles, PencilRuler } from 'lucide-react';
import { format, getDay, addDays, startOfWeek as getStartOfWeek } from 'date-fns-jalali';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const subjectDetailSchema = z.object({
  name: z.string().min(1, "نام درس الزامی است."),
  targetTime: z.coerce.number().optional(),
  actualTime: z.coerce.number().optional(),
  targetTests: z.coerce.number().optional(),
  actualTests: z.coerce.number().optional(),
});

const weeklyPlanSchema = z.object({
  subjects: z.array(subjectDetailSchema),
  whatWentWell: z.string().optional(),
  whatCouldBeBetter: z.string().optional(),
  goalsForNextWeek: z.string().optional(),
});

type WeeklyReportFormValues = z.infer<typeof weeklyPlanSchema>;

interface WeeklyReportDocument extends WeeklyReportFormValues {
    id: string;
    weekRange: string;
    createdAt: Timestamp;
    totalActualTime: number;
    totalActualTests: number;
}


export default function WeeklyReportPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [newSubjectName, setNewSubjectName] = useState('');

  const today = new Date();
  const startOfWeek = getStartOfWeek(today, { weekStartsOn: 6 }); // Saturday
  const endOfWeek = addDays(startOfWeek, 6);
  const formattedRange = `${format(startOfWeek, 'yyyy/MM/dd')} - ${format(endOfWeek, 'yyyy/MM/dd')}`;

  const canSubmit = useMemo(() => {
    const dayOfWeek = getDay(today);
    // In date-fns-jalali: Saturday: 0, ..., Thursday: 5, Friday: 6
    return dayOfWeek === 5 || dayOfWeek === 6;
  }, [today]);

  const form = useForm<WeeklyReportFormValues>({
    resolver: zodResolver(weeklyPlanSchema),
    defaultValues: { subjects: [], whatWentWell: '', whatCouldBeBetter: '', goalsForNextWeek: '' },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjects',
  });

  const subjects = form.watch('subjects');
  const totalActualTime = subjects.reduce((sum, subj) => sum + Number(subj.actualTime || 0), 0);
  const totalActualTests = subjects.reduce((sum, subj) => sum + Number(subj.actualTests || 0), 0);

  const weeklyReportsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'weeklyReports'), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: pastReports, isLoading: areReportsLoading } = useCollection<WeeklyReportDocument>(weeklyReportsQuery);

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
        toast({
            variant: "destructive",
            title: "خطا",
            description: "نام درس نمی‌تواند خالی باشد.",
        });
        return;
    }
    append({
      name: newSubjectName.trim(),
      targetTime: 0,
      actualTime: 0,
      targetTests: 0,
      actualTests: 0,
    });
    setNewSubjectName('');
  };

  const handlePastDateRequest = async () => {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "خطا",
            description: "برای ارسال درخواست باید وارد شده باشید.",
        });
        return;
    }
    const requestsRef = collection(firestore, 'dateChangeRequests');
    const payload = {
        studentId: user.uid,
        studentName: user.displayName || user.email,
        requestType: 'WeeklyReport',
        status: 'pending',
        createdAt: serverTimestamp(),
    };
    try {
        await addDoc(requestsRef, payload);
        toast({
            title: "درخواست ارسال شد",
            description: "درخواست شما برای ثبت گزارش هفتگی به مدیر ارسال شد و در حال بررسی است.",
        });
    } catch(error) {
        console.error("Error sending request:", error);
        const contextualError = new FirestorePermissionError({
            path: requestsRef.path,
            operation: 'create',
            requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  const onSubmit = async (data: z.infer<typeof weeklyPlanSchema>) => {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "خطا",
            description: "برای ثبت گزارش باید وارد شده باشید.",
        });
        return;
    }
    if (!canSubmit) {
      handlePastDateRequest();
      return;
    }

    const reportRef = collection(firestore, `users/${user.uid}/weeklyReports`);
    const payload = {
        ...data,
        weekRange: formattedRange,
        createdAt: serverTimestamp(),
        studentId: user.uid, // Add studentId
        totalActualTime,
        totalActualTests,
    };
    
    try {
        await addDoc(reportRef, payload);
        toast({
            title: 'گزارش هفتگی با موفقیت ثبت شد ✅',
        });
        form.reset({ subjects: [], whatWentWell: '', whatCouldBeBetter: '', goalsForNextWeek: '' });
    } catch(error) {
        console.error("Error submitting weekly report:", error);
        const contextualError = new FirestorePermissionError({
            path: reportRef.path,
            operation: 'create',
            requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return '۰';
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader dir="rtl" className="text-right">
          <CardTitle className="flex items-center justify-end gap-2 text-right text-2xl">
            فرم پیگیری هفتگی
            <BookCopy className="h-6 w-6 text-primary" />
          </CardTitle>
          <CardDescription className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
             <CalendarDays className="h-4 w-4" />
             هفته جاری: <span className="font-semibold font-code">{formattedRange}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader dir="rtl">
              <CardTitle className="text-right text-xl flex justify-end items-center gap-2">
                  عملکرد مطالعه و تست
                  <PencilRuler className="h-5 w-5"/>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border" dir="rtl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">درس</TableHead>
                    <TableHead className="text-right">ساعت مطالعه هدف</TableHead>
                    <TableHead className="text-right">ساعت مطالعه واقعی</TableHead>
                    <TableHead className="text-right">تعداد تست هدف</TableHead>
                    <TableHead className="text-right">تعداد تست واقعی</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Input dir="rtl" className="text-right" {...form.register(`subjects.${index}.name` as const)} readOnly/>
                      </TableCell>
                      <TableCell>
                        <Input dir="rtl" className="text-center font-code" type="number" {...form.register(`subjects.${index}.targetTime` as const)} />
                      </TableCell>
                      <TableCell>
                        <Input dir="rtl" className="text-center font-code" type="number" {...form.register(`subjects.${index}.actualTime` as const)} />
                      </TableCell>
                      <TableCell>
                        <Input dir="rtl" className="text-center font-code" type="number" {...form.register(`subjects.${index}.targetTests` as const)} />
                      </TableCell>
                      <TableCell>
                        <Input dir="rtl" className="text-center font-code" type="number" {...form.register(`subjects.${index}.actualTests` as const)} />
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                   <TableRow className="bg-muted/50 font-bold">
                      <TableCell className="text-right">مجموع</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-center font-code">{formatNumber(totalActualTime)}</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-center font-code">{formatNumber(totalActualTests)}</TableCell>
                      <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4" dir="rtl">
                 <Button type="button" variant="outline" size="sm" onClick={handleAddSubject}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  افزودن درس
                </Button>
                 <Input
                  placeholder="نام درس جدید"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6" dir="rtl">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-right text-xl flex justify-end items-center gap-2">
                          مقایسه پیشرفت
                          <BarChartHorizontalBig className="h-5 w-5"/>
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="overflow-x-auto rounded-md border">
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead className="text-right">موضوع</TableHead>
                                      <TableHead className="text-right">هدف</TableHead>
                                      <TableHead className="text-right">عملکرد</TableHead>
                                      <TableHead className="text-right">نتیجه</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  <TableRow>
                                      <TableCell>ساعت مطالعه</TableCell>
                                      <TableCell className="font-code">هدف</TableCell>
                                      <TableCell className="font-code">{formatNumber(totalActualTime)}</TableCell>
                                      <TableCell className="font-code">{formatNumber(totalActualTime - (pastReports?.[0]?.totalActualTime || 0))}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                      <TableCell>تعداد تست</TableCell>
                                      <TableCell className="font-code">هدف</TableCell>
                                      <TableCell className="font-code">{formatNumber(totalActualTests)}</TableCell>
                                      <TableCell className="font-code">{formatNumber(totalActualTests - (pastReports?.[0]?.totalActualTests || 0))}</TableCell>
                                  </TableRow>
                              </TableBody>
                          </Table>
                      </div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle className="text-right text-xl flex justify-end items-center gap-2">
                          بازتاب و هدف‌گذاری
                          <Sparkles className="h-5 w-5"/>
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-right">
                       <FormField control={form.control} name="whatWentWell" render={({ field }) => (
                           <FormItem>
                               <FormLabel>چه چیزهایی خوب پیش رفت؟ (نقاط قوت)</FormLabel>
                               <FormControl><Textarea placeholder="تحلیل خود را بنویسید..." {...field} /></FormControl>
                           </FormItem>
                       )} />
                       <FormField control={form.control} name="whatCouldBeBetter" render={({ field }) => (
                           <FormItem>
                               <FormLabel>چه چیزهایی می‌توانست بهتر باشد؟ (نقاط ضعف)</FormLabel>
                               <FormControl><Textarea placeholder="تحلیل خود را بنویسید..." {...field} /></FormControl>
                           </FormItem>
                       )} />
                       <FormField control={form.control} name="goalsForNextWeek" render={({ field }) => (
                           <FormItem>
                               <FormLabel>اهداف هفته آینده</FormLabel>
                               <FormControl><Textarea placeholder="اهداف خود را مشخص کنید..." {...field} /></FormControl>
                           </FormItem>
                       )} />
                  </CardContent>
              </Card>
          </div>
          
          <div dir="rtl" className="flex justify-start">
            {canSubmit ? (
               <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'در حال ثبت...' : 'ثبت گزارش هفتگی'}
               </Button>
            ) : (
                <div className="space-y-2 text-right">
                    <p className="text-sm text-muted-foreground">ثبت گزارش هفتگی فقط در روزهای پنجشنبه و جمعه مجاز است.</p>
                    <Button type="button" size="lg" className="w-full sm:w-auto" onClick={handlePastDateRequest}>
                        <Send className="ml-2 h-4 w-4" />
                        درخواست ثبت گزارش
                    </Button>
                </div>
            )}
          </div>
        </form>
      </Form>

      <Separator />

      <Card dir="rtl">
        <CardHeader>
          <CardTitle className="text-right">گزارش‌های قبلی</CardTitle>
        </CardHeader>
        <CardContent>
          {areReportsLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full"/>
                <Skeleton className="h-10 w-full"/>
            </div>
          ) : pastReports && pastReports.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">هفته</TableHead>
                  <TableHead className="text-center">مجموع ساعت مطالعه</TableHead>
                  <TableHead className="text-center">مجموع تست</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-code text-right">{report.weekRange}</TableCell>
                    <TableCell className="text-center font-code">{formatNumber(report.totalActualTime || 0)}</TableCell>
                    <TableCell className="text-center font-code">{formatNumber(report.totalActualTests || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">هیچ گزارشی تاکنون ثبت نشده است.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
