'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, PlusCircle } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const announcements: any[] = []; // Placeholder for announcements data

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-right">
          <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4">
             <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        اطلاعیه جدید
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="text-right">
                        <DialogTitle>ارسال اطلاعیه عمومی</DialogTitle>
                        <DialogDescription>
                            این اطلاعیه برای همه کاربران در صفحه اصلی نمایش داده می‌شود.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 text-right">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="message">متن اطلاعیه</Label>
                            <Textarea placeholder="پیام خود را در اینجا بنویسید..." id="message" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">انتشار اطلاعیه</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="text-right">
                <CardTitle>مدیریت اطلاعیه‌ها</CardTitle>
                <CardDescription>
                اطلاعیه‌های عمومی را ویرایش، حذف یا یک مورد جدید ایجاد کنید.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Megaphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold">هیچ اطلاعیه‌ای یافت نشد</p>
              <p className="text-sm text-muted-foreground">
                برای ایجاد اولین اطلاعیه، روی دکمه "اطلاعیه جدید" کلیک کنید.
              </p>
            </div>
          ) : (
            <div>{/* List of announcements will go here */}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
