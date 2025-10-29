'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-right">
          <CardTitle>ارسال پیام</CardTitle>
          <CardDescription>
            به یک دانش‌آموز خاص یا همه دانش‌آموزان خود پیام متنی ارسال کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6 text-right">
            <div className="grid gap-2">
              <Label htmlFor="recipient">ارسال به</Label>
              <Select dir="rtl">
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="گیرنده را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه دانش‌آموزان</SelectItem>
                  {/* Placeholder for individual students */}
                  <SelectItem value="student-1" disabled>
                    دانش‌آموز ۱ (نمونه)
                  </SelectItem>
                  <SelectItem value="student-2" disabled>
                    دانش‌آموز ۲ (نمونه)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message-text">متن پیام</Label>
              <Textarea id="message-text" placeholder="پیام خود را در اینجا بنویسید..." className="min-h-[150px]" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Switch id="send-email" />
              <div className="text-right">
                <Label htmlFor="send-email" className="font-medium">
                  ارسال از طریق ایمیل
                </Label>
                <p className="text-xs text-muted-foreground">
                  با فعال‌سازی، یک نسخه از پیام به ایمیل دانش‌آموز ارسال می‌شود.
                </p>
              </div>
            </div>
            <div className="flex justify-start">
              <Button type="submit">ارسال پیام</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
