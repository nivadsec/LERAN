'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Save } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';


const DEFAULT_PERSONA = `You are Lernova, a top-tier, 'khordanj' (cool and expert) academic advisor for high-school students in Iran. Your tone is energetic, positive, and highly motivational, but also strategic and very smart. You use a mix of professional and slightly informal language, like a cool, knowledgeable older sibling.

Your name is لرنوا.

**Your only purpose is to answer questions related to studying, academic planning, dealing with stress, time management, and test-taking strategies. You MUST refuse to answer any questions outside of this scope.**

If a question is unrelated to academics (e.g., "What is the capital of France?", "Who are you?", "Write me a story"), you MUST politely decline. Here are some ways to decline:
- "این سوال یکم از تخصص من خارجه! من یک مشاور تحصیلی هستم و برای کمک به موفقیت درسی تو اینجام. سوال درسی دیگه‌ای داری؟"
- "حوزه تخصصی من مشاوره و برنامه‌ریزی درسیه. بیا روی سوالات خودت تمرکز کنیم تا بهترین نتیجه رو بگیریم!"
- "ببین، من متخصص درس و کنکورم! بیا از این انرژی برای حل چالش‌های تحصیلیت استفاده کنیم. سوالت رو بپرس."

When answering academic questions, be strategic, give actionable advice, and always maintain your cool, expert persona.`;


const formSchema = z.object({
  persona: z.string().min(50, { message: 'متن شخصیت باید حداقل ۵۰ کاراکتر باشد.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminSmartBotPage() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const configDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'configs', 'lernova-advisor');
    }, [firestore]);

    const { data: configData, isLoading } = useDoc<{ persona: string, updatedAt: any }>(configDocRef);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            persona: '',
        }
    });

    useEffect(() => {
        if (configData) {
            form.setValue('persona', configData.persona);
        } else if (!isLoading) {
            form.setValue('persona', DEFAULT_PERSONA);
        }
    }, [configData, isLoading, form]);

    const onSubmit = async (values: FormValues) => {
        if (!configDocRef) {
            toast({
                variant: 'destructive',
                title: 'خطا',
                description: 'اتصال به پایگاه داده برقرار نیست.',
            });
            return;
        }

        try {
            await setDoc(configDocRef, {
                persona: values.persona,
                updatedAt: serverTimestamp(),
            });
            toast({
                title: 'موفقیت',
                description: 'شخصیت ربات هوشمند با موفقیت به‌روزرسانی شد.',
            });
        } catch (error) {
            console.error('Error updating persona:', error);
            toast({
                variant: 'destructive',
                title: 'خطا در ذخیره‌سازی',
                description: 'مشکلی در هنگام ذخیره تغییرات رخ داد.',
            });
        }
    };

    return (
        <Card>
        <CardHeader className="text-right">
            <CardTitle className="flex items-center justify-end gap-2">
                <Bot className="h-6 w-6 text-primary" />
                مدیریت ربات هوشمند مشاور
            </CardTitle>
            <CardDescription>
                در این بخش می‌توانید شخصیت، لحن و دستورالعمل‌های کلی ربات هوشمند "مشاور لرنوا" را تعریف و ویرایش کنید.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32 ml-auto" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-10 w-24" />
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-right">
                        <FormField
                        control={form.control}
                        name="persona"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>شخصیت و دستورالعمل‌های ربات (System Prompt)</FormLabel>
                            <FormControl>
                                <Textarea
                                dir="ltr"
                                className="min-h-[400px] text-left font-mono"
                                placeholder="دستورالعمل‌های ربات را اینجا وارد کنید..."
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <div className="flex justify-start">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                <Save className="ml-2 h-4 w-4" />
                                {form.formState.isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </CardContent>
        </Card>
  );
}
