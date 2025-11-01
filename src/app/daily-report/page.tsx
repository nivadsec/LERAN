'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';

const studyItemSchema = z.object({
  lesson: z.string(),
  topic: z.string(),
  studyTime: z.coerce.number().min(0).optional(),
  testCount: z.coerce.number().min(0).optional(),
  testCorrect: z.coerce.number().min(0).optional(),
  testWrong: z.coerce.number().min(0).optional(),
  testTime: z.coerce.number().min(0).optional(),
  testPercentage: z.coerce.number().min(0).optional(),
});

const formSchema = z.object({
  reportDate: z.string().min(1, 'تاریخ الزامی است.'),
  wakeupTime: z.string().optional(),
  studyStartTime: z.string().optional(),
  mentalState: z.number().min(1).max(10),
  studyItems: z.array(studyItemSchema),
  classHours: z.coerce.number().min(0).optional(),
  sleepHours: z.coerce.number().min(0).optional(),
  wastedHours: z.coerce.number().min(0).optional(),
  mobileHours: z.coerce.number().min(0).optional(),
});

type DailyReportFormValues = z.infer<typeof formSchema>;

export default function DailyReportPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const form = useForm<DailyReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportDate: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      mentalState: 5,
      studyItems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "studyItems",
  });
  
  const watchedItems = useWatch({
      control: form.control,
      name: "studyItems"
  })

  // Calculate totals
  const totalStudyTime = watchedItems.reduce((acc, item) => acc + (item.studyTime || 0), 0);
  const totalTestCount = watchedItems.reduce((acc, item) => acc + (item.testCount || 0), 0);
  const totalTestCorrect = watchedItems.reduce((acc, item) => acc + (item.testCorrect || 0), 0);
  const totalTestWrong = watchedItems.reduce((acc, item) => acc + (item.testWrong || 0), 0);
  const totalTestTime = watchedItems.reduce((acc, item) => acc + (item.testTime || 0), 0);
  const overallTestPercentage = totalTestCount > 0 ? Math.round(((totalTestCorrect - totalTestWrong / 3) / totalTestCount) * 100) : 0;


  const onSubmit = async (values: DailyReportFormValues) => {
    if (isUserLoading) {
      toast({
        variant: 'destructive',
        title: 'کمی صبر کنید',
        description: 'در حال بارگذاری اطلاعات کاربر. لطفاً چند لحظه بعد دوباره تلاش کنید.',
      });
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'برای ثبت گزارش باید وارد شده باشید.',
      });
      return;
    }
    
    const dailyReportRef = collection(firestore, 'users', user.uid, 'dailyReports');
    const payload = {
        ...values,
        studentId: user.uid,
        createdAt: serverTimestamp(),
        totals: {
            totalStudyTime,
            totalTestCount,
            totalTestCorrect,
            totalTestWrong,
            totalTestTime,
            overallTestPercentage
        }
    };
    
    addDoc(dailyReportRef, payload)
        .then(() => {
            toast({
                title: 'ثبت موفق',
                description: 'گزارش روزانه شما با موفقیت ثبت شد.',
            });
            form.reset({
                reportDate: new Date().toLocaleDateString('fa-IR'),
                mentalState: 5,
                studyItems: [],
                wakeupTime: '',
                studyStartTime: '',
                classHours: 0,
                sleepHours: 0,
                wastedHours: 0,
                mobileHours: 0
            });
        })
        .catch(error => {
            const contextualError = new FirestorePermissionError({
                path: dailyReportRef.path,
                operation: 'create',
                requestResourceData: payload,
            });
            errorEmitter.emit('permission-error', contextualError);
        });
  };

  return (
    <Card>
      <CardHeader className="text-right">
        <CardTitle>ثبت گزارش روزانه</CardTitle>
        <CardDescription>عملکرد امروز خود را با دقت در فرم زیر ثبت کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Top Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField control={form.control} name="reportDate" render={({ field }) => (
                <FormItem><FormLabel>تاریخ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="wakeupTime" render={({ field }) => (
                <FormItem><FormLabel>ساعت بیداری</FormLabel><FormControl><Input placeholder="HH:MM" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="studyStartTime" render={({ field }) => (
                <FormItem><FormLabel>ساعت شروع</FormLabel><FormControl><Input placeholder="HH:MM" {...field} /></FormControl></FormItem>
              )} />
               <FormField control={form.control} name="mentalState" render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>وضعیت روانی: {value}</FormLabel>
                  <FormControl>
                    <Slider dir="ltr" value={[value]} onValueChange={(v) => onChange(v[0])} max={10} min={1} step={1} />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right border-l">درس</TableHead>
                    <TableHead className="text-right border-l">مبحث</TableHead>
                    <TableHead className="text-center border-l w-24">زمان (دقیقه)</TableHead>
                    <TableHead colSpan={5} className="text-center">تست</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="border-l"></TableHead>
                    <TableHead className="border-l"></TableHead>
                    <TableHead className="border-l"></TableHead>
                    <TableHead className="text-center border-l w-20">کل</TableHead>
                    <TableHead className="text-center border-l w-20">درست</TableHead>
                    <TableHead className="text-center border-l w-20">غلط</TableHead>
                    <TableHead className="text-center border-l w-24">زمان (دقیقه)</TableHead>
                    <TableHead className="text-center w-20">درصد</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                     const watchedTest = form.watch(`studyItems.${index}`);
                     const percentage = (watchedTest.testCount || 0) > 0 
                        ? Math.round((( (watchedTest.testCorrect || 0) - (watchedTest.testWrong || 0) / 3) / (watchedTest.testCount || 1)) * 100)
                        : 0;

                    return (
                        <TableRow key={field.id}>
                            <TableCell className="border-l"><Input placeholder="نام درس" {...form.register(`studyItems.${index}.lesson`)} /></TableCell>
                            <TableCell className="border-l"><Input placeholder="مبحث خوانده شده" {...form.register(`studyItems.${index}.topic`)} /></TableCell>
                            <TableCell className="border-l"><Input type="number" className="text-center" {...form.register(`studyItems.${index}.studyTime`)} /></TableCell>
                            <TableCell className="border-l"><Input type="number" className="text-center" {...form.register(`studyItems.${index}.testCount`)} /></TableCell>
                            <TableCell className="border-l"><Input type="number" className="text-center" {...form.register(`studyItems.${index}.testCorrect`)} /></TableCell>
                            <TableCell className="border-l"><Input type="number" className="text-center" {...form.register(`studyItems.${index}.testWrong`)} /></TableCell>
                            <TableCell className="border-l"><Input type="number" className="text-center" {...form.register(`studyItems.${index}.testTime`)} /></TableCell>
                            <TableCell>
                                <Input 
                                    type="number"
                                    value={percentage}
                                    {...form.register(`studyItems.${index}.testPercentage`)}
                                    className="text-center" 
                                    readOnly
                                 />
                            </TableCell>
                            <TableCell>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={2} className="text-right border-l">مجموع</TableCell>
                    <TableCell className="text-center border-l">{totalStudyTime}</TableCell>
                    <TableCell className="text-center border-l">{totalTestCount}</TableCell>
                    <TableCell className="text-center border-l">{totalTestCorrect}</TableCell>
                    <TableCell className="text-center border-l">{totalTestWrong}</TableCell>
                    <TableCell className="text-center border-l">{totalTestTime}</TableCell>
                    <TableCell className="text-center">{overallTestPercentage}%</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
             <Button type="button" variant="outline" size="sm" onClick={() => append({ lesson: '', topic: '', studyTime: 0, testCount: 0, testCorrect: 0, testWrong: 0, testTime: 0, testPercentage: 0 })}>
                <PlusCircle className="ml-2 h-4 w-4" />
                افزودن آیتم
            </Button>

            {/* Bottom Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6">
                <FormField control={form.control} name="classHours" render={({ field }) => (
                    <FormItem><FormLabel>میزان کلاس</FormLabel><FormControl><Input type="number" placeholder="ساعت" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="sleepHours" render={({ field }) => (
                    <FormItem><FormLabel>میزان خواب</FormLabel><FormControl><Input type="number" placeholder="ساعت" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="wastedHours" render={({ field }) => (
                    <FormItem><FormLabel>میزان فاجعه!</FormLabel><FormControl><Input type="number" placeholder="ساعت" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="mobileHours" render={({ field }) => (
                    <FormItem><FormLabel>میزان موبایل</FormLabel><FormControl><Input type="number" placeholder="ساعت" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="studyTime" render={() => (
                    <FormItem><FormLabel>میزان مطالعه</FormLabel><FormControl><Input value={`${Math.floor(totalStudyTime / 60)}h ${totalStudyTime % 60}m`} readOnly /></FormControl></FormItem>
                )} />
            </div>

            <div className="flex justify-start pt-4">
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting || isUserLoading}>
                {isUserLoading ? 'در حال بارگذاری...' : form.formState.isSubmitting ? 'در حال ثبت...' : 'ثبت گزارش'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
