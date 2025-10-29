'use client';

import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };
  
  if (isUserLoading) {
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

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>داشبورد</CardTitle>
          <CardDescription>به پنل کاربری خود خوش آمدید.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>سلام، {user.email}!</p>
            <p>اینجا صفحه داشبورد شماست. به زودی امکانات بیشتری اضافه خواهد شد.</p>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              خروج از حساب کاربری
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
