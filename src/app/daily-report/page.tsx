'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { Calendar, CheckCircle, Upload, Clock, Bed, Smile, BookOpen, History, Activity } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns-jalali';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  activities: z.string().min(10, { message: 'لطفاً فعالیت‌های خود را با حداقل ۱۰ کاراکتر شرح دهید.' }),
  feeling: z.number().min(1).max(10),
  studyHours: z.coerce.number().min(0, { message: 'ساعت مطالعه نمی‌تواند منفی باشد.' }).max(24, { message: 'ساعت مطالعه نمی‌تواند بیش از ۲۴ باشد.' }),
  sleepHours: z.coerce.number().min(0, { message: 'ساعت خواب نمی‌تواند منفی باشد.' }).max(24, { message: 'ساعت خواب نمی‌تواند بیش از ۲۴ باشد.' }),
  attachment: z.any().optional(),
});

interface DailyReport {
    id: string;
    activities: string;
    feeling: number;
    studyHours: number;
    sleepHours: number;
    date: Timestamp;
}

export default function DailyReportPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const dailyReportsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'dailyReports'), orderBy('date', 'desc'));
  }, [user, firestore]);
  
  const { data: pastReports, isLoading: areReportsLoading } = useCollection<DailyReport>(dailyReportsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activities: '',
      feeling: 5,
      studyHours: 0,
      sleepHours: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
    const payload: any = {
        ...values,
        date: serverTimestamp(),
        studentId: user.uid,
    };
    
    if (!values.attachment || values.attachment.length === 0) {
        delete payload.attachment;
    } else {
        // In a real app, you'd upload the file to Firebase Storage first
        // and then save the URL in Firestore.
        payload.attachment = 'file_placeholder';
    }


    addDoc(dailyReportRef, payload)
        .then(() => {
            toast({
                title: 'ثبت موفق',
                description: 'گزارش روزانه شما با موفقیت ثبت شد.',
                action: <CheckCircle className="text-green-500" />,
            });
            form.reset({
                activities: '',
                feeling: 5,
                studyHours: 0,
                sleepHours: 0,
                attachment: undefined,
            });
        })
        .catch(error => {
            console.error("Error creating daily report: ", error);
            const contextualError = new FirestorePermissionError({
                path: dailyReportRef.path,
                operation: 'create',
                requestResourceData: payload,
            });
            errorEmitter.emit('permission-error', contextualError);
        });
  };
  
  const today = format(new Date(), 'EEEE, d MMMM yyyy');
  
  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'تاریخ نامشخص';
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'EEEE, d MMMM yyyy');
  }

  return (
    <div className="space-y-6">
        <Card>
        <CardHeader className="text-right">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span>{today}</span>
                </div>
                <div>
                    <CardTitle>گزارش امروز</CardTitle>
                    <CardDescription>عملکرد و وضعیت خود را برای امروز ثبت کنید.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-right">
                <FormField
                control={form.control}
                name="activities"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>فعالیت‌های انجام‌شده</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="امروز چه درس‌هایی خواندید و چه تمرین‌هایی حل کردید؟"
                        className="min-h-[120px]"
                        {...field}
                        />
                    </FormControl>
                    <FormDescription>
                        خلاصه ای از فعالیت های درسی، مطالعه، تمرین، پروژه و ...
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="feeling"
                render={({ field: { value, onChange } }) => (
                    <FormItem>
                    <FormLabel>ارزیابی شخصی (از ۱ تا ۱۰): {value}</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4" dir="ltr">
                            <Slider
                                defaultValue={[5]}
                                value={[value || 5]}
                                max={10}
                                min={1}
                                step={1}
                                onValueChange={(values) => onChange(values[0])}
                            />
                        </div>
                    </FormControl>
                    <FormDescription>
                        سطح انرژی، تمرکز و انگیزه خود را ارزیابی کنید.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="sleepHours"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>ساعت خواب</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="مثلا: ۸" {...field} />
                        </FormControl>
                        <FormDescription>
                        مجموع ساعت خواب شبانه روز گذشته
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="studyHours"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>ساعت مطالعه</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="مثلا: ۶" {...field} />
                        </FormControl>
                        <FormDescription>
                        مجموع ساعت مطالعه امروز
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                
                <FormField
                control={form.control}
                name="attachment"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>فایل ضمیمه (اختیاری)</FormLabel>
                    <FormControl>
                        <div className="relative flex items-center justify-center w-full">
                            <label htmlFor="attachment-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">برای آپلود کلیک کنید</span> یا فایل را بکشید و رها کنید</p>
                                    <p className="text-xs text-muted-foreground">PDF, PNG, JPG (حداکثر ۵ مگابایت)</p>
                                </div>
                                <Input id="attachment-file" type="file" className="hidden" onChange={(e) => field.onChange(e.target.files)} />
                            </label>
                        </div> 
                    </FormControl>
                    <FormDescription>
                        می‌توانید تصویر تکلیف، گزارش یا فایل PDF را ضمیمه کنید.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />


                <div className="flex justify-start">
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting || isUserLoading}>
                    {isUserLoading ? 'در حال بارگذاری...' : form.formState.isSubmitting ? 'در حال ثبت...' : 'ثبت گزارش'}
                </Button>
                </div>
            </form>
            </Form>
        </CardContent>
        </Card>

        <Card>
            <CardHeader className="text-right">
                <CardTitle className="flex items-center justify-end gap-2">
                    تاریخچه گزارش‌ها
                    <History className="h-5 w-5 text-primary"/>
                </CardTitle>
                <CardDescription>گزارش‌های روزانه ثبت شده قبلی شما</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {areReportsLoading ? (
                    <>
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </>
                ) : pastReports && pastReports.length > 0 ? (
                    pastReports.map(report => (
                        <Card key={report.id} className="bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-base text-right">{formatDate(report.date)}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-right text-muted-foreground flex items-start gap-2">
                                    <Activity className="h-4 w-4 mt-1 shrink-0" />
                                    <span>{report.activities}</span>
                                </p>
                                <Separator />
                                <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold">{report.feeling}/10</span>
                                        <Smile className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                     <div className="flex items-center gap-1.5">
                                        <span className="font-semibold">{report.sleepHours}</span>
                                        <Bed className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold">{report.studyHours} ساعت</span>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="font-semibold">هیچ گزارشی یافت نشد</p>
                        <p className="text-sm text-muted-foreground">هنوز گزارشی ثبت نکرده‌اید. اولین گزارش خود را امروز ثبت کنید!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
