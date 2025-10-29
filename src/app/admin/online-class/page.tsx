'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Video, PlusCircle, Calendar, LinkIcon } from 'lucide-react';

const sessionSchema = z.object({
  title: z.string().min(3, { message: 'عنوان جلسه باید حداقل ۳ کاراکتر باشد.' }),
  link: z.string().url({ message: 'لطفاً یک لینک معتبر وارد کنید.' }),
  dateTime: z.string().min(1, { message: 'تاریخ و زمان جلسه الزامی است.' }),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

interface OnlineSession {
  id: string;
  title: string;
  link: string;
  dateTime: string;
}

export default function AdminOnlineClassPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [sessions, setSessions] = useState<OnlineSession[]>([]);
    const { toast } = useToast();

    const form = useForm<SessionFormValues>({
      resolver: zodResolver(sessionSchema),
      defaultValues: {
        title: '',
        link: '',
        dateTime: '',
      }
    });

    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);

            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'دسترسی به دوربین رد شد',
              description: 'لطفاً برای استفاده از این قابلیت، دسترسی به دوربین را در تنظیمات مرورگر خود فعال کنید.',
            });
          }
        };

        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [toast]);

    const handleCreateSession = (values: SessionFormValues) => {
      const newSession: OnlineSession = {
        id: new Date().toISOString(),
        ...values,
      };
      setSessions(prev => [...prev, newSession]);
      toast({
        title: 'جلسه جدید ایجاد شد',
        description: `جلسه "${values.title}" با موفقیت تعریف شد.`,
      });
      form.reset();
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                <Card>
                <CardHeader>
                    <CardTitle>مدیریت کلاس آنلاین</CardTitle>
                    <CardDescription>تصویر شما برای شروع یا مدیریت کلاس آنلاین.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-md border bg-muted aspect-video overflow-hidden flex items-center justify-center">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    </div>
                    {hasCameraPermission === false && (
                    <Alert variant="destructive">
                        <Video className="h-4 w-4" />
                        <AlertTitle>دسترسی به دوربین الزامی است</AlertTitle>
                        <AlertDescription>
                        برای استفاده از کلاس آنلاین، لطفاً اجازه دسترسی به دوربین را بدهید.
                        </AlertDescription>
                    </Alert>
                    )}
                </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>جلسات آنلاین تعریف شده</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sessions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center">هنوز جلسه‌ای تعریف نشده است.</p>
                        ) : (
                            <ul className="space-y-3">
                                {sessions.map(session => (
                                    <li key={session.id} className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="font-semibold">{session.title}</p>
                                            <p className="text-sm text-muted-foreground">{session.dateTime}</p>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <a href={session.link} target="_blank" rel="noopener noreferrer">شروع جلسه</a>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>تعریف جلسه جدید</CardTitle>
                    <CardDescription>یک جلسه آنلاین جدید برای دانش‌آموزان تعریف کنید.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-6 text-right">
                             <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center justify-end gap-2">عنوان جلسه</FormLabel>
                                        <FormControl>
                                            <Input placeholder="مثال: جلسه حل تمرین فیزیک" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="link"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center justify-end gap-2"><LinkIcon className="h-4 w-4" />لینک ورود به جلسه</FormLabel>
                                        <FormControl>
                                            <Input dir="ltr" placeholder="https://meet.google.com/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="dateTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center justify-end gap-2"><Calendar className="h-4 w-4" />تاریخ و زمان</FormLabel>
                                        <FormControl>
                                            <Input placeholder="مثال: شنبه ۲۵ فروردین - ساعت ۱۸:۰۰" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-start">
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    <PlusCircle className="ml-2 h-4 w-4" />
                                    {form.formState.isSubmitting ? 'در حال ایجاد...' : 'ایجاد جلسه'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
