'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Calendar, ArrowLeft } from 'lucide-react';

interface OnlineSession {
  id: string;
  title: string;
  link: string;
  dateTime: string;
}

// Mock data - in a real app, this would come from Firestore
const mockSessions: OnlineSession[] = [
  {
    id: '1',
    title: 'جلسه حل تمرین فیزیک',
    link: 'https://meet.google.com',
    dateTime: 'شنبه ۲۵ فروردین - ساعت ۱۸:۰۰',
  },
  {
    id: '2',
    title: 'کلاس رفع اشکال ریاضی',
    link: 'https://meet.google.com',
    dateTime: 'دوشنبه ۲۷ فروردین - ساعت ۱۶:۳۰',
  },
];

export default function OnlineClassPage() {
  const [sessions, setSessions] = useState<OnlineSession[]>(mockSessions);

  return (
    <Card>
      <CardHeader className="text-right">
        <CardTitle className="flex items-center justify-end gap-2">
            کلاس‌های آنلاین
            <Video className="h-6 w-6 text-primary"/>
        </CardTitle>
        <CardDescription>در این بخش می‌توانید به جلسات کلاس آنلاین برنامه‌ریزی شده وارد شوید.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold">هنوز جلسه‌ای برنامه‌ریزی نشده است.</p>
            <p className="text-sm text-muted-foreground">
              هر زمان که معلم شما جلسه‌ای تعریف کند، در این بخش نمایش داده خواهد شد.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {sessions.map((session) => (
              <li key={session.id}>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                         <Button asChild>
                            <a href={session.link} target="_blank" rel="noopener noreferrer">
                                ورود به کلاس
                                <ArrowLeft className="mr-2 h-4 w-4" />
                            </a>
                        </Button>
                        <div className="text-right">
                            <p className="font-bold">{session.title}</p>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center justify-end gap-2">
                                {session.dateTime}
                                <Calendar className="h-4 w-4"/>
                            </p>
                        </div>
                    </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
