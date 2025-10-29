'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function SurveysPage() {
  const surveys: any[] = []; // Placeholder for surveys data

  return (
    <Card>
      <CardHeader className="text-right">
        <CardTitle>پرسشنامه‌ها</CardTitle>
        <CardDescription>
          در این بخش می‌توانید در آزمون‌های هوش، شخصیت‌شناسی و... که توسط مشاور شما تعریف شده، شرکت کنید.
        </CardDescription>
      </CardHeader>
      <CardContent>
         {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold">هنوز پرسشنامه‌ای برای شما تعریف نشده است.</p>
            <p className="text-sm text-muted-foreground">
              در صورت تعریف پرسشنامه توسط مشاور، در این بخش نمایش داده خواهد شد.
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
