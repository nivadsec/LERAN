'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Bot, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function QnAPage() {
  
  return (
    <Card className="min-h-[calc(100vh-8rem)] w-full flex flex-col">
       <CardContent className="p-0 flex-1">
        <div className="grid md:grid-cols-[300px_1fr] h-full">
            <div className="border-l border-border flex flex-col h-full">
               <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-right">گفتگو با مشاور</h2>
               </div>
               <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-semibold">گفتگویی یافت نشد</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    برای شروع، یک سوال جدید برای مشاور خود ارسال کنید.
                  </p>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-muted/20">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                 <HelpCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">صفحه پرسش و پاسخ</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                در این بخش می‌توانید سوالات خود را به صورت خصوصی برای مشاور ارسال کنید و پاسخ ایشان را دریافت نمایید. (این قابلیت در حال توسعه است)
              </p>
               <div className="mt-6 w-full max-w-md">
                    <Textarea placeholder="سوال خود را اینجا بنویسید..." className="mb-2" disabled/>
                    <Button className="w-full" disabled>
                        <Send className="ml-2 h-4 w-4"/>
                        ارسال سوال
                    </Button>
               </div>
            </div>
        </div>
       </CardContent>
    </Card>
  );
}
