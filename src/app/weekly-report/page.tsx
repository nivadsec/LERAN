
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, BookCopy, Target, TrendingUp, Sparkles, CheckCircle, BarChartHorizontalBig, History, PlusCircle, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns-jalali';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';


const subjectDetailSchema = z.object({
  name: z.string().min(1, "نام درس الزامی است."),
  targetTime: z.coerce.number().min(0),
  actualTime: z.coerce.number().min(0),
  targetTests: z.coerce.number().min(0),
  actualTests: z.coerce.number().min(0),
});

const formSchema = z.object({
  weekNumber: z.coerce.number().min(1),
  subjects: z.array(subjectDetailSchema),
  whatWentWell: z.string().optional(),
  whatCouldBeBetter: z.string().optional(),
  goalsForNextWeek: z.string().optional(),
});

type WeeklyReportFormValues = z.infer<typeof formSchema>;

interface WeeklyReport extends WeeklyReportFormValues {
    id: string;
    createdAt: Timestamp;
    startDate: string;
    endDate: string;
}

const initialSubjects = [
    { name: 'ریاضی', targetTime: 0, actualTime: 0, targetTests: 0, actualTests: 0 },
    { name: 'فیزیک', targetTime: 0, actualTime: 0, targetTests: 0, actualTests: 0 },
    { name: 'شیمی', targetTime: 0, actualTime: 0, targetTests: 0, actualTests: 0 },
    { name: 'زیست', targetTime: 0, actualTime: 0, targetTests: 0, actualTests: 0 },
]

export default function WeeklyReportPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [newSubjectName, setNewSubjectName] = useState('');

  const today = new Date();
  const startOfWeek = today; // Placeholder
  const endOfWeek = addDays(startOfWeek, 6);

  const form = useForm<WeeklyReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weekNumber: 1, // This could be calculated dynamically
      subjects: initialSubjects,
      whatWentWell: '',
      whatCouldBeBetter: '',
      goalsForNextWeek: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjects',
  });
  
  const handleAddSubject = () => {
    if (newSubjectName.trim() === '') {
        toast({
            variant: "destructive",
            title: "خطا",
            description: "نام درس نمی‌تواند خالی باشد.",
        })
        return;
    }
    append({
        name: newSubjectName,
        targetTime: 0,
        actualTime: 0,
        targetTests: 0,
        actualTests: 0,
    });
    setNewSubjectName('');
  }


  const watchedSubjects = form.watch('subjects');
  const totalTargetTime = watchedSubjects.reduce((acc, sub) => acc + (sub.targetTime || 0), 0);
  const totalActualTime = watchedSubjects.reduce((acc, sub) => acc + (sub.actualTime || 0), 0);
  const totalTargetTests = watchedSubjects.reduce((acc, sub) => acc + (sub.targetTests || 0), 0);
  const totalActualTests = watchedSubjects.reduce((acc, sub) => acc + (sub.actualTests || 0), 0);

  const weeklyReportsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'weeklyReports'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: pastReports, isLoading: areReportsLoading } = useCollection<WeeklyReport>(weeklyReportsQuery);

    const formatNumber = (num: number | undefined) => {
        if (num === undefined || isNaN(num)) return '۰';
        return new Intl.NumberFormat('fa-IR').format(num);
    }

  const onSubmit = (data: WeeklyReportFormValues) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'برای ثبت گزارش باید وارد شده باشید.',
      });
      return;
    }
    const weeklyReportRef = collection(firestore, 'users', user.uid, 'weeklyReports');
    const payload = {
        ...data,
        studentId: user.uid,
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
        createdAt: serverTimestamp(),
    };

    addDoc(weeklyReportRef, payload)
      .then(() => {
        toast({
          title: 'گزارش هفتگی ثبت شد',
          description: 'گزارش شما با موفقیت در سیستم ذخیره شد.',
        });
        form.reset({
             weekNumber: 1,
             subjects: initialSubjects,
             whatWentWell: '',
             whatCouldBeBetter: '',
             goalsForNextWeek: '',
        });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          path: weeklyReportRef.path,
          operation: 'create',
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  };

  return (
    <div className="space-y-8">
        <CardHeader className="text-right p-0">
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CalendarDays className="h-4 w-4" />
                    <span>{format(startOfWeek, 'yyyy/MM/dd')} - {format(endOfWeek, 'yyyy/MM/dd')}</span>
                </div>
                 <div>
                    <CardTitle className="text-2xl font-bold">فرم پیگیری هفتگی</CardTitle>
                    <CardDescription className="mt-1">آینه‌ی رشد و پیشرفت شما در این هفته</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">

            {/* Study Time and Tests Section */}
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center justify-end gap-2 text-right">
                        عملکرد مطالعه و تست
                       <BookCopy className="h-5 w-5 text-primary" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="text-right">درس</TableHead>
                            <TableHead className="text-center">مطالعه (هدف)</TableHead>
                            <TableHead className="text-center">مطالعه (انجام‌شده)</TableHead>
                            <TableHead className="text-center">تست (هدف)</TableHead>
                            <TableHead className="text-center">تست (انجام‌شده)</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>
                                    <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                                <TableCell className="font-medium text-right">{field.name}</TableCell>
                                <TableCell><Input type="number" {...form.register(`subjects.${index}.targetTime`)} className="min-w-[80px] text-center font-code" /></TableCell>
                                <TableCell><Input type="number" {...form.register(`subjects.${index}.actualTime`)} className="min-w-[80px] text-center font-code" /></TableCell>
                                <TableCell><Input type="number" {...form.register(`subjects.${index}.targetTests`)} className="min-w-[80px] text-center font-code" /></TableCell>
                                <TableCell><Input type="number" {...form.register(`subjects.${index}.actualTests`)} className="min-w-[80px] text-center font-code" /></TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="bg-muted/50 font-bold">
                            <TableCell colSpan={2} className="text-right">مجموع</TableCell>
                            <TableCell className="text-center font-code">{formatNumber(totalTargetTime)}</TableCell>
                            <TableCell className="text-center font-code">{formatNumber(totalActualTime)}</TableCell>
                            <TableCell className="text-center font-code">{formatNumber(totalTargetTests)}</TableCell>
                            <TableCell className="text-center font-code">{formatNumber(totalActualTests)}</TableCell>
                        </TableRow>
                        </TableBody>
                    </Table>
                    </div>
                     <div className="flex items-center gap-2 mt-4">
                        <Button type="button" variant="outline" size="sm" onClick={handleAddSubject}>
                            <PlusCircle className="ml-2 h-4 w-4" />
                            افزودن
                        </Button>
                        <Input
                            placeholder="نام درس جدید را وارد کنید"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Progress Comparison Section */}
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center justify-end gap-2 text-right">
                        مقایسه پیشرفت
                        <BarChartHorizontalBig className="h-5 w-5 text-primary" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">این هفته</TableHead>
                                    <TableHead className="text-right">هفته قبل</TableHead>
                                    <TableHead className="text-right">شاخص</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 <TableRow>
                                    <TableCell className="font-bold font-code">{formatNumber(totalActualTime)} ساعت</TableCell>
                                    <TableCell><Input placeholder="اختیاری" className="text-right font-code"/></TableCell>
                                    <TableCell>کل زمان مطالعه</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="font-bold font-code">{formatNumber(totalActualTests)} تست</TableCell>
                                    <TableCell><Input placeholder="اختیاری" className="text-right font-code"/></TableCell>
                                    <TableCell>کل تست‌ها</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell><Input placeholder="مهم‌ترین دستاورد این هفته..." className="text-right"/></TableCell>
                                    <TableCell><Input placeholder="اختیاری" className="text-right"/></TableCell>
                                    <TableCell>دستاوردهای کلیدی</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                     </div>
                </CardContent>
            </Card>

            {/* Reflection and Goals Section */}
             <Card className="bg-card/80 backdrop-blur-sm">
                 <CardHeader>
                    <CardTitle className="flex items-center justify-end gap-2 text-right">
                        بازتاب و هدف‌گذاری
                        <Sparkles className="h-5 w-5 text-primary" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="whatWentWell"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center justify-end gap-2">
                                چه چیزهایی این هفته خوب پیش رفت؟
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </FormLabel>
                            <FormControl>
                            <Textarea placeholder="نقاط قوت و موفقیت‌های این هفته..." {...field} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="whatCouldBeBetter"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center justify-end gap-2">
                                چه چیزهایی می‌توانست بهتر باشد؟
                                <TrendingUp className="h-4 w-4 text-yellow-500" />
                            </FormLabel>
                            <FormControl>
                            <Textarea placeholder="چالش‌ها و نکاتی برای بهبود..." {...field} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="goalsForNextWeek"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center justify-end gap-2">
                                سه هدف دقیق برای هفته آینده؟
                                <Target className="h-4 w-4 text-red-500" />
                            </FormLabel>
                            <FormControl>
                            <Textarea placeholder="۱. افزایش ساعت مطالعه فیزیک به ۱۰ ساعت..." {...field} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-start pt-4">
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'در حال ثبت...' : 'ثبت گزارش هفتگی'}
                </Button>
            </div>
            </form>
        </Form>
        </CardContent>

        <Separator />

        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-right flex items-center justify-end gap-2">
                تاریخچه گزارش‌های هفتگی
                <History className="h-6 w-6 text-primary" />
            </h2>
            {areReportsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-6 w-1/2 ml-auto" /></CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-5 w-3/4 ml-auto" />
                                <Skeleton className="h-5 w-1/2 ml-auto" />
                                <Skeleton className="h-10 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : pastReports && pastReports.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pastReports.map(report => {
                        const reportTotalTime = report.subjects.reduce((acc, s) => acc + s.actualTime, 0);
                        const reportTotalTests = report.subjects.reduce((acc, s) => acc + s.actualTests, 0);

                        return (
                            <Card key={report.id}>
                                <CardHeader>
                                    <CardTitle className="text-right flex justify-between items-center">
                                        <span>گزارش هفته {report.weekNumber}</span>
                                        <span className="text-sm font-normal text-muted-foreground flex items-center gap-1 font-code">
                                            <CalendarDays className="h-4 w-4" />
                                            {format(new Date(report.startDate), 'MM/dd')}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-right">
                                    <div className="flex justify-around items-center text-center">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">کل مطالعه</p>
                                            <p className="font-bold font-code">{formatNumber(reportTotalTime)} ساعت</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">کل تست</p>
                                            <p className="font-bold font-code">{formatNumber(reportTotalTests)} عدد</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full">مشاهده جزئیات</Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center gap-4 border-2 border-dashed p-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <History className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-semibold">هنوز گزارش هفتگی ثبت نکرده‌اید</p>
                    <p className="text-sm text-muted-foreground">برای شروع، اولین گزارش هفتگی خود را در فرم بالا ثبت کنید.</p>
                </Card>
            )}
        </div>
    </div>
  );
}
