'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface UserProfile {
    firstName?: string;
    lastName?: string;
    email?: string;
    grade?: string;
    major?: string;
}

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, "users", user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    const isLoading = isUserLoading || isProfileLoading;

    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-11 w-24" />
                </CardContent>
            </Card>
        )
    }

    if (!userProfile) {
        return (
            <Card>
                <CardHeader>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="firstName">نام</Label>
                <Input id="firstName" defaultValue={userProfile.firstName} />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="lastName">نام خانوادگی</Label>
                <Input id="lastName" defaultValue={userProfile.lastName} />
            </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" type="email" defaultValue={userProfile.email} disabled />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="grade">پایه تحصیلی</Label>
                <Input id="grade" defaultValue={userProfile.grade} disabled />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="major">رشته</Label>
                <Input id="major" defaultValue={userProfile.major} disabled />
            </div>
        </div>
        <div className="flex justify-start">
            <Button>ذخیره تغییرات</Button>
        </div>
      </CardContent>
    </Card>
  );
}
