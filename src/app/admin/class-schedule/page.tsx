'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminClassSchedulePage() {
  return (
    <Card>
      <CardHeader className="text-right">
        <CardTitle>برنامه کلاسی دانش‌آموزان</CardTitle>
        <CardDescription>در این بخش می‌توانید برنامه کلاسی هر دانش‌آموز را مشاهده کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>این صفحه در حال ساخت است. در آینده می‌توانید با انتخاب نام دانش‌آموز، برنامه او را مشاهده کنید.</p>
      </CardContent>
    </Card>
  );
}
