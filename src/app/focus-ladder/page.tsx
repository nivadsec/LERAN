'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Brain, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  sessionName: z.string().min(3, { message: 'نام بازه باید حداقل ۳ کاراکتر باشد.' }),
  focusScore: z.number().min(0).max(10),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "فرمت ساعت معتبر نیست (HH:MM)"}),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "فرمت ساعت معتبر نیست (HH:MM)"}),
});

type FormValues = z.infer<typeof formSchema>;

export default function FocusLadderPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();
  const [sliderValue, setSliderValue] = useState(5);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionName: '',
      focusScore: 5,
      startTime: '',
      endTime: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'برای ثبت امتیاز باید وارد شده باشید.',
      });
      return;
    }
    try {
      const focusLadderRef = collection(firestore, 'users', user.uid, 'focusSessions');
      await addDoc(focusLadderRef, {
        ...values,
        studentId: user.uid,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'امتیاز شما ثبت شد!',
        description: `بازه "${values.sessionName}" با امتیاز تمرکز ${values.focusScore} از ۱۰ ثبت شد.`,
        action: <CheckCircle className="text-green-500" />,
      });
      form.reset({ sessionName: '', focusScore: 5, startTime: '', endTime: '' });
      setSliderValue(5);
    } catch (error) {
      console.error('Error submitting focus score: ', error);
      toast({
        variant: 'destructive',
        title: 'خطا در ثبت امتیاز',
        description: 'مشکلی در هنگام ثبت امتیاز شما رخ داد. لطفاً دوباره تلاش کنید.',
      });
    }
  };

  const getSliderColor = (value: number) => {
    if (value <= 4) return 'bg-red-500';
    if (value <= 7) return 'bg-yellow-500';
    return 'bg-teal-500'; // --primary color
  };

  return (
    <Card>
      <CardHeader className="text-right">
        <CardTitle className="flex items-center justify-end gap-2 text-2xl">
          نردبان تمرکز
          <Brain className="h-7 w-7 text-primary" />
        </CardTitle>
        <CardDescription>
          در پایان هر بازه مطالعه، میزان تمرکز خود را بین ۰ تا ۱۰ ارزیابی و ثبت کنید.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-right">
            <FormField
              control={form.control}
              name="sessionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام بازه مطالعه</FormLabel>
                  <FormControl>
                    <Input placeholder="مثلاً: فیزیک - بازه اول" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-end gap-2">
                      ساعت شروع
                      <Clock className="h-4 w-4" />
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="text-center" dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-end gap-2">
                       ساعت پایان
                       <Clock className="h-4 w-4" />
                    </FormLabel>
                    <FormControl>
                       <Input type="time" {...field} className="text-center" dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="focusScore"
              render={({ field: { onChange, ...restField } }) => (
                <FormItem>
                  <FormLabel>امتیاز تمرکز: {sliderValue}</FormLabel>
                  <FormControl>
                    <div dir="ltr">
                       <Slider
                        min={0}
                        max={10}
                        step={1}
                        value={[sliderValue]}
                        onValueChange={(value) => {
                          setSliderValue(value[0]);
                          onChange(value[0]);
                        }}
                        className="py-2"
                        {...restField}
                       />
                       <style>{`
                        .irs-bar { background: ${getSliderColor(sliderValue)} !important; }
                        .irs-slider { border-color: ${getSliderColor(sliderValue)} !important; }
                       `}</style>
                    </div>
                  </FormControl>
                  <FormDescription>
                    ۱۰ به معنای تمرکز کامل و ۰ به معنای حواس‌پرتی مطلق است.
                  </FormDescription>
                </FormItem>
              )}
            />
            <div className="flex justify-start">
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? 'در حال ثبت...' : 'ثبت تمرکز ✅'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
