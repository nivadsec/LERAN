'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bed, Moon, Sun, Info, Target, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

const currentStatusSchema = z.object({
  night: z.string(),
  bedtime: z.string().optional(),
  wakeTime: z.string().optional(),
  quality: z.coerce.number().min(0).max(5).optional(),
  feeling: z.coerce.number().min(0).max(5).optional(),
});

const formSchema = z.object({
  currentStatus: z.array(currentStatusSchema),
  obstacle1: z.string().optional(),
  obstacle2: z.string().optional(),
  obstacle3: z.string().optional(),
  rule1: z.string().optional(),
  rule2: z.string().optional(),
  rule3: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SleepSystemDesignPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentStatus: [
        { night: 'شب اول', bedtime: 'مثال: ۲۳:۳۰', wakeTime: 'مثال: ۰۷:۰۰', quality: 4, feeling: 2 },
        { night: 'شب دوم', bedtime: '', wakeTime: '', quality: 0, feeling: 0 },
        { night: 'شب سوم', bedtime: '', wakeTime: '', quality: 0, feeling: 0 },
      ],
      obstacle1: '',
      obstacle2: '',
      obstacle3: '',
      rule1: '',
      rule2: '',
      rule3: '',
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'currentStatus',
  });

  const onSubmit = async (data: FormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'خطا', description: 'برای ذخیره اطلاعات باید وارد شوید.' });
      return;
    }
    try {
      const docRef = doc(firestore, 'users', user.uid, 'sleepSystems', 'main');
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'موفقیت', description: 'کاربرگ خواب شما با موفقیت ذخیره شد.' });
    } catch (error) {
      console.error('Error saving sleep system:', error);
      toast({ variant: 'destructive', title: 'خطا', description: 'مشکلی در ذخیره اطلاعات رخ داد.' });
    }
  };

  return (
    <div className="space-y-8">
      <CardHeader className="text-right p-0">
        <CardTitle className="text-2xl font-bold flex items-center justify-end gap-2">
          <Bed className="h-7 w-7 text-primary" />
          کاربرگ ممیزی و طراحی سیستم خواب من
        </CardTitle>
        <CardDescription>
          هدف: تبدیل خواب از یک عادت اتفاقی به یک سیستم هوشمند برای افزایش عملکرد.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-end items-center gap-2 text-right">
                <Sun className="h-5 w-5 text-yellow-500" />
                بخش A - ردیابی وضعیت فعلی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">احساس صبحگاهی (۱-گیج، ۵-پرانرژی)</TableHead>
                      <TableHead className="text-right">کیفیت خواب (از ۱ تا ۵)</TableHead>
                      <TableHead className="text-right">ساعت بیدار شدن</TableHead>
                      <TableHead className="text-right">ساعت خوابیدن (تقریبی)</TableHead>
                      <TableHead className="text-right">شب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell><Input type="number" {...form.register(`currentStatus.${index}.feeling`)} /></TableCell>
                        <TableCell><Input type="number" {...form.register(`currentStatus.${index}.quality`)} /></TableCell>
                        <TableCell><Input {...form.register(`currentStatus.${index}.wakeTime`)} /></TableCell>
                        <TableCell><Input {...form.register(`currentStatus.${index}.bedtime`)} /></TableCell>
                        <TableCell className="font-medium">{field.night}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-end items-center gap-2 text-right">
                <Info className="h-5 w-5 text-blue-500" />
                بخش B - شناسایی موانع
              </CardTitle>
              <CardDescription className="text-right">
                ۳ عامل اصلی که خواب من را مختل می‌کنند یا به تعویق می‌اندازند را بنویسید:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField name="obstacle1" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormControl><Textarea placeholder="۱. مثال: استفاده از گوشی در تخت، استرس، فکر و خیال" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="obstacle2" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormControl><Textarea placeholder="۲. مثال: دمای نامناسب اتاق، سروصدا" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="obstacle3" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormControl><Textarea placeholder="۳. مثال: مصرف کافئین در بعد از ظهر" {...field} /></FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-end items-center gap-2 text-right">
                <Target className="h-5 w-5 text-green-500" />
                بخش C - برنامه اقدام هفته آینده
              </CardTitle>
              <CardDescription className="text-right">
                من متعهد می‌شوم برای هفته آینده، این ۳ تغییر مشخص را در سیستم خواب خود ایجاد کنم:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField name="rule1" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormControl><Textarea placeholder="۱. قانون اول: مثال: ساعت ۱۰:۳۰ شب، گوشی را خارج از اتاق خواب به شارژ می‌زنم." {...field} /></FormControl>
                </FormItem>
              )} />
               <FormField name="rule2" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormControl><Textarea placeholder="۲. قانون دوم: مثال: هر شب ۱۵ دقیقه قبل از خواب، یک کتاب غیردرسی می‌خوانم." {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="rule3" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormControl><Textarea placeholder="۳. قانون سوم: مثال: زمان بیدار شدنم را بر اساس چرخه ۹۰ دقیقه‌ای روی ساعت ۶:۳۰ صبح تنظیم می‌کنم." {...field} /></FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-start">
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              <Save className="ml-2 h-4 w-4" />
              {form.formState.isSubmitting ? "در حال ذخیره..." : "ذخیره کاربرگ خواب"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
