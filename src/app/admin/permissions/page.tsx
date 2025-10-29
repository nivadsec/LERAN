'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function AdminPermissionsPage() {
  const students: any[] = []; // Placeholder for student data

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-right">
          <CardTitle>مدیریت دسترسی دانش‌آموزان</CardTitle>
          <CardDescription>
            در این بخش می‌توانید قابلیت‌های مختلف پنل را برای هر دانش‌آموز فعال یا غیرفعال کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-right">لیست دانش‌آموزان</h2>
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-semibold">هنوز دانش‌آموزی برای مدیریت وجود ندارد.</p>
                <p className="text-sm text-muted-foreground">
                  پس از افزودن اولین دانش‌آموز، لیست آن‌ها در این بخش نمایش داده خواهد شد.
                </p>
              </div>
            ) : (
              <div>
                {/* Placeholder for student list */}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
