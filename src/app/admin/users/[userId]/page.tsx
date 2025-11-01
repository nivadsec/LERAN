'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  grade?: string;
  major?: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const { userId } = params;
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!userId || typeof userId !== 'string') return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: student, isLoading } = useDoc<UserProfile>(userDocRef);

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48 ml-auto" />
                <Skeleton className="h-4 w-64 ml-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                 <Skeleton className="h-6 w-full" />
                 <Skeleton className="h-6 w-2/3" />
                 <Skeleton className="h-6 w-full" />
            </CardContent>
        </Card>
    )
  }

  if (!student) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>دانش‌آموز یافت نشد</CardTitle>
          <CardDescription>اطلاعات این دانش‌آموز در دسترس نیست.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-right">
        <CardTitle>
          پروفایل {student.firstName} {student.lastName}
        </CardTitle>
        <CardDescription>جزئیات و عملکرد دانش‌آموز</CardDescription>
      </CardHeader>
      <CardContent className="text-right space-y-4">
        <p><strong>ایمیل:</strong> {student.email}</p>
        <p><strong>پایه:</strong> {student.grade}</p>
        <p><strong>رشته:</strong> {student.major}</p>
        <p className="pt-8 text-center text-muted-foreground">
          (بخش تحلیل عملکرد هوشمند در این صفحه پیاده‌سازی خواهد شد)
        </p>
      </CardContent>
    </Card>
  );
}
