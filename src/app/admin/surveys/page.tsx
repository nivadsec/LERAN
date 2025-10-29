'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';

export default function AdminSurveysPage() {
  const surveys: any[] = []; // Placeholder for surveys data

  return (
    <Card>
      <CardHeader>
         <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4">
            <Button>
              <PlusCircle className="ml-2 h-4 w-4" />
              ایجاد پرسشنامه جدید
            </Button>
            <div className="text-right">
              <CardTitle>مدیریت پرسشنامه‌ها</CardTitle>
              <CardDescription>
                در این بخش می‌توانید پرسشنامه‌هایی مانند آزمون هوش، شخصیت‌شناسی و... ایجاد و مدیریت کنید.
              </CardDescription>
            </div>
          </div>
      </CardHeader>
      <CardContent>
         {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold">هنوز پرسشنامه‌ای ایجاد نشده است</p>
            <p className="text-sm text-muted-foreground">
              برای ایجاد اولین پرسشنامه، روی دکمه "ایجاد پرسشنامه جدید" کلیک کنید.
            </p>
          </div>
        ) : (
          <div>
            {/* Placeholder for surveys list */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
