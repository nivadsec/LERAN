'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare } from 'lucide-react';

export default function AdminQnAPage() {
  return (
    <Card className="min-h-[calc(100vh-8rem)] w-full">
      <div className="grid md:grid-cols-[300px_1fr] h-full">
        <div className="border-l border-border flex flex-col h-full">
           <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-right">گفتگوها</h2>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">هنوز گفتگویی وجود ندارد</p>
              <p className="text-sm text-muted-foreground mt-1">
                اولین گفتگوی شما در اینجا نمایش داده خواهد شد.
              </p>
            </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-muted/20">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
             <Mail className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">یک گفتگو را از لیست انتخاب کنید</h3>
          <p className="text-muted-foreground">
            محتوای گفتگو در اینجا نمایش داده خواهد شد.
          </p>
        </div>
      </div>
    </Card>
  );
}
