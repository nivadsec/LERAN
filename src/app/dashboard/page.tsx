'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const isLoading = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (userProfile?.isAdmin) {
        // Redirect admin to admin dashboard
        router.replace('/admin/dashboard');
      }
    }
  }, [user, userProfile, isLoading, router]);


  if (isLoading || !user || userProfile?.isAdmin) {
    // Show skeleton or nothing while loading or redirecting
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
          <CardTitle>داشبورد دانش آموزی</CardTitle>
          <CardDescription>به پنل کاربری خود خوش آمدید.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-right">
            <p>سلام، {userProfile?.firstName}!</p>
            <p>اینجا صفحه داشبورد شماست. به زودی امکانات بیشتری اضافه خواهد شد.</p>
          </div>
        </CardContent>
      </Card>
  );
}
