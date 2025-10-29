'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';

interface UserProfile {
  firstName?: string;
  isAdmin?: boolean;
}

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    const isLoading = isUserLoading || isProfileLoading;
    if (!isLoading) {
      if (!user) {
        // Not logged in, redirect to admin login
        router.replace('/admin/login');
      } else if (!userProfile?.isAdmin) {
        // Logged in but not an admin, redirect to student dashboard
        console.warn("Access denied. User is not an admin.");
        router.replace('/dashboard'); 
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !userProfile?.isAdmin) {
    return (
       <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
           <Skeleton className="h-4 w-full" />
           <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>داشبورد مدیر</CardTitle>
        <CardDescription>به پنل مدیریت خوش آمدید.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-right">
          <p>سلام، {userProfile.firstName || user.email}!</p>
          <p>اینجا صفحه داشبورد ادمین است. از منوی سمت راست می‌توانید به بخش‌های مختلف دسترسی داشته باشید.</p>
        </div>
      </CardContent>
    </Card>
  );
}
