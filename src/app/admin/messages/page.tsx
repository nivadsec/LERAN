'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, serverTimestamp, where, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

const messageSchema = z.object({
  recipient: z.string().min(1, 'انتخاب گیرنده الزامی است.'),
  message: z.string().min(5, 'متن پیام باید حداقل ۵ کاراکتر باشد.'),
  sendEmail: z.boolean(),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('isAdmin', '!=', true));
  }, [firestore]);

  const { data: students, isLoading: isLoadingStudents } = useCollection<Student>(studentsQuery);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      recipient: '',
      message: '',
      sendEmail: false,
    },
  });

  const onSubmit = async (values: MessageFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'خطا', description: 'شما وارد نشده‌اید.' });
      return;
    }

    const messagesRef = collection(firestore, 'messages');
    const recipients = values.recipient === 'all' ? students?.map(s => s.id) || [] : [values.recipient];

    if (recipients.length === 0) {
        toast({ variant: 'destructive', title: 'خطا', description: 'هیچ گیرنده‌ای برای ارسال پیام یافت نشد.' });
        return;
    }
    
    try {
        await Promise.all(recipients.map(recipientId => {
            const payload = {
                senderId: user.uid,
                recipientId: recipientId,
                text: values.message,
                createdAt: serverTimestamp(),
                isRead: false,
                isFromAdmin: true,
            };
            return addDoc(messagesRef, payload);
        }));

        toast({
            title: 'پیام با موفقیت ارسال شد',
            description: `پیام شما برای ${values.recipient === 'all' ? 'همه دانش‌آموزان' : 'دانش‌آموز مورد نظر'} ارسال شد.`,
        });
        form.reset();
    } catch(error) {
        console.error("Error sending message:", error);
        const contextualError = new FirestorePermissionError({
            path: messagesRef.path,
            operation: 'create',
            requestResourceData: { text: values.message },
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-right">
          <CardTitle>ارسال پیام</CardTitle>
          <CardDescription>
            به یک دانش‌آموز خاص یا همه دانش‌آموزان خود پیام متنی ارسال کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-right">
               <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ارسال به</FormLabel>
                    <Select dir="rtl" onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={isLoadingStudents}>
                          <SelectValue placeholder={isLoadingStudents ? 'در حال بارگذاری دانش‌آموزان...' : 'گیرنده را انتخاب کنید'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>عمومی</SelectLabel>
                          <SelectItem value="all">همه دانش‌آموزان</SelectItem>
                        </SelectGroup>
                        {students && students.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>خصوصی</SelectLabel>
                            {students.map(student => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.firstName} {student.lastName}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>متن پیام</FormLabel>
                    <FormControl>
                      <Textarea placeholder="پیام خود را در اینجا بنویسید..." className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="sendEmail"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled />
                    </FormControl>
                    <div className="text-right">
                      <FormLabel className={field.value ? "" : "text-muted-foreground"}>
                        ارسال از طریق ایمیل (بزودی)
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        با فعال‌سازی، یک نسخه از پیام به ایمیل دانش‌آموز ارسال می‌شود.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-start">
                <Button type="submit" disabled={form.formState.isSubmitting || isLoadingStudents}>
                  {form.formState.isSubmitting ? 'در حال ارسال...' : 'ارسال پیام'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
