'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
    firstName?: string;
    lastName?: string;
    email?: string;
    grade?: string;
    major?: string;
}

const profileSchema = z.object({
  firstName: z.string().min(2, { message: 'نام باید حداقل ۲ کاراکتر باشد.' }),
  lastName: z.string().min(2, { message: 'نام خانوادگی باید حداقل ۲ کاراکتر باشد.' }),
});

const getMajorDisplayName = (majorKey?: string) => {
    switch (majorKey) {
        case 'math':
            return 'ریاضی و فیزیک';
        case 'science':
            return 'علوم تجربی';
        case 'humanities':
            return 'ادبیات و علوم انسانی';
        default:
            return majorKey || '';
    }
};

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, "users", user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
        }
    });
    
    React.useEffect(() => {
        if(userProfile) {
            form.reset({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
            });
        }
    }, [userProfile, form]);

    const onSubmit = async (data: z.infer<typeof profileSchema>) => {
        if (!userDocRef) return;
        try {
            await updateDoc(userDocRef, {
                firstName: data.firstName,
                lastName: data.lastName,
            });
            toast({
                title: 'موفقیت',
                description: 'پروفایل شما با موفقیت به‌روزرسانی شد.',
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: 'destructive',
                title: 'خطا',
                description: 'مشکلی در به‌روزرسانی پروفایل رخ داد.',
            });
        }
    };

    const isLoading = isUserLoading || isProfileLoading;

    if (isLoading) {
        return (
             <Card>
                <CardHeader className='text-right'>
                    <Skeleton className="h-8 w-32 ml-auto" />
                    <Skeleton className="h-4 w-48 ml-auto" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24 ml-auto" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24 ml-auto" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24 ml-auto" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-11 w-32" />
                </CardContent>
            </Card>
        )
    }

    if (!userProfile) {
        return (
            <Card>
                <CardHeader className='text-right'>
                    <CardTitle>خطا</CardTitle>
                    <CardDescription>اطلاعات پروفایل شما یافت نشد.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader className="text-right">
        <CardTitle>پروفایل کاربری</CardTitle>
        <CardDescription>اطلاعات پروفایل خود را در اینجا مشاهده و ویرایش کنید.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-right">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>نام</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>نام خانوادگی</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
                <div className="grid gap-2">
                    <FormLabel>ایمیل</FormLabel>
                    <Input type="email" defaultValue={userProfile.email} disabled />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <FormLabel>پایه تحصیلی</FormLabel>
                        <Input defaultValue={userProfile.grade} disabled />
                    </div>
                    <div className="grid gap-2">
                        <FormLabel>رشته</FormLabel>
                        <Input defaultValue={getMajorDisplayName(userProfile.major)} disabled />
                    </div>
                </div>
                <div className="flex justify-start">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                       {form.formState.isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </Button>
                </div>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
