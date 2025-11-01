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
import { CalendarDays, BookCopy, Target, TrendingUp, Sparkles, CheckCircle, BarChartHorizontalBig } from 'lucide-react';
import { format, addDays } from 'date-fns-jalali';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';


const subjectDetailSchema = z.object({
  name: z.string(),
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

const initialSubjects = [
    { name: 'ریاضی', targetTime: 0, actualTime: 0, targetTests: 0, actualTests: 0 },
    { name: 'فیزیک', targetTime: 0, actualTime: 0, targetTests: 0, actualTests: 0 },
    { name: 'شیمی', targetTime: 0, actualTime: 0, targetTests: 0, actualTests: 0 },
    { name: 'زیست', targetTime: 0, actualTime: 0, targetTests: 0, actualTests: 0 },
    { name: 'عمومی ۱', targetTime: 0, actualTime: 0, targetTests: 0, actualTests: 0 },
    { name: 'عمومی ۲', targetTime: 0, actualTime: 0, targetTests: 0, actualTests: 0 },
]

export default function WeeklyReportPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

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

  const { fields } = useFieldArray({
    control: form.control,
    name: 'subjects',
  });
  
  const totalTargetTime = form.watch('subjects').reduce((acc, sub) => acc + sub.targetTime, 0);
  const totalActualTime = form.watch('subjects').reduce((acc, sub) => acc + sub.actualTime, 0);
  const totalTargetTests = form.watch('subjects').reduce((acc, sub) => acc + sub.targetTests, 0);
  const totalActualTests = form.watch('subjects').reduce((acc, sub) => acc + sub.actualTests, 0);


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
        form.reset();
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
    <div className="space-y-6">
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
                            <TableHead className="text-center">تست (انجام‌شده)</TableHead>
                            <TableHead className="text-center">تست (هدف)</TableHead>
                            <TableHead className="text-center">مطالعه (انجام‌شده)</TableHead>
                            <TableHead className="text-center">مطالعه (هدف)</TableHead>
                            <TableHead className="text-right">درس</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell><Input type="number" {...form.register(`subjects.${index}.actualTests`)} className="min-w-[80px] text-center" /></TableCell>
                                <TableCell><Input type="number" {...form.register(`subjects.${index}.targetTests`)} className="min-w-[80px] text-center" /></TableCell>
                                <TableCell><Input type="number" {...form.register(`subjects.${index}.actualTime`)} className="min-w-[80px] text-center" /></TableCell>
                                <TableCell><Input type="number" {...form.register(`subjects.${index}.targetTime`)} className="min-w-[80px] text-center" /></TableCell>
                                <TableCell className="font-medium text-right">{field.name}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="bg-muted/50 font-bold">
                            <TableCell className="text-center">{totalActualTests}</TableCell>
                            <TableCell className="text-center">{totalTargetTests}</TableCell>
                            <TableCell className="text-center">{totalActualTime}</TableCell>
                            <TableCell className="text-center">{totalTargetTime}</TableCell>
                            <TableCell className="text-right">مجموع</TableCell>
                        </TableRow>
                        </TableBody>
                    </Table>
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
                                    <TableHead className="text-right">هفته قبل</TableHead>
                                    <TableHead className="text-right">این هفته</TableHead>
                                    <TableHead className="text-right">شاخص</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 <TableRow>
                                    <TableCell><Input placeholder="اختیاری" className="text-right"/></TableCell>
                                    <TableCell className="font-bold">{totalActualTime.toLocaleString()} ساعت</TableCell>
                                    <TableCell>کل زمان مطالعه</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell><Input placeholder="اختیاری" className="text-right"/></TableCell>
                                    <TableCell className="font-bold">{totalActualTests.toLocaleString()} تست</TableCell>
                                    <TableCell>کل تست‌ها</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell><Input placeholder="اختیاری" className="text-right"/></TableCell>
                                    <TableCell><Input placeholder="مهم‌ترین دستاورد این هفته..." className="text-right"/></TableCell>
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
    </div>
  );
}
