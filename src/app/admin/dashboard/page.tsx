'use client';

import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';

interface UserProfile {
  isAdmin?: boolean;
  email?: string;
}

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
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
        // Logged in but not an admin, redirect to student dashboard or home
        console.warn("Access denied. User is not an admin.");
        router.replace('/dashboard'); 
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };
  
  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !userProfile?.isAdmin) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>داشبورد مدیر</CardTitle>
          <CardDescription>به پنل مدیریت خوش آمدید.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-right">
            <p>سلام، {user.email}!</p>
            <p>اینجا صفحه داشبورد ادمین است.</p>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              خروج از حساب کاربری
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
