'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';


export default function SupportPage() {
  return (
    <Card className="min-h-[calc(100vh-8rem)] w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
            <Wrench className="w-16 h-16 mb-6 text-primary" />
            <h1 className="text-2xl font-bold mb-2">پشتیبان فنی پنل (بزودی)</h1>
            <p className="max-w-md">
                این بخش در حال آماده‌سازی است و به‌زودی برای پاسخ به سوالات شما در مورد نحوه کار با پنل و رفع مشکلات فنی فعال خواهد شد.
            </p>
        </div>
    </Card>
  );
}
