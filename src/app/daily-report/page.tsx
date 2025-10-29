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
import { useAuth, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Calendar, CheckCircle, Upload } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns-jalali';

const formSchema = z.object({
  activities: z.string().min(10, { message: 'لطفاً فعالیت‌های خود را با حداقل ۱۰ کاراکتر شرح دهید.' }),
  feeling: z.number().min(1).max(10),
  studyHours: z.coerce.number().min(0, { message: 'ساعت مطالعه نمی‌تواند منفی باشد.' }).max(24, { message: 'ساعت مطالعه نمی‌تواند بیش از ۲۴ باشد.' }),
  sleepHours: z.coerce.number().min(0, { message: 'ساعت خواب نمی‌تواند منفی باشد.' }).max(24, { message: 'ساعت خواب نمی‌تواند بیش از ۲۴ باشد.' }),
  attachment: z.any().optional(),
});

export default function DailyReportPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

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
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'برای ثبت گزارش باید وارد شده باشید.',
      });
      return;
    }

    try {
      const dailyReportRef = collection(firestore, 'users', user.uid, 'dailyReports');
      await addDoc(dailyReportRef, {
        ...values,
        date: serverTimestamp(),
        studentId: user.uid,
        // Attachment logic needs to be implemented separately (e.g., upload to Firebase Storage)
      });
      toast({
        title: 'ثبت موفق',
        description: 'گزارش روزانه شما با موفقیت ثبت شد.',
        action: <CheckCircle className="text-green-500" />,
      });
      form.reset();
    } catch (error: any) {
      console.error('Error submitting report: ', error);
      toast({
        variant: 'destructive',
        title: 'خطا در ثبت گزارش',
        description: 'مشکلی در هنگام ثبت گزارش رخ داد. لطفاً دوباره تلاش کنید.',
      });
    }
  };
  
  const today = format(new Date(), 'EEEE, d MMMM yyyy');

  return (
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
                  <FormLabel>ارزیابی شخصی (از ۱ تا ۱۰)</FormLabel>
                  <FormControl>
                     <div className="flex items-center gap-4" dir="ltr">
                        <span className="text-sm text-muted-foreground w-12 text-center">{value}</span>
                        <Slider
                            defaultValue={[5]}
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
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'در حال ثبت...' : 'ثبت گزارش'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
