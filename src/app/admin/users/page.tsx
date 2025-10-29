'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, PlusCircle, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function AdminUsersPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const features = [
    { id: 'smart-bot', label: 'ربات هوشمند' },
    { id: 'daily-monitoring', label: 'پایش هوشمند روزانه' },
    { id: 'performance-stats', label: 'آمار عملکرد' },
    { id: 'class-schedule', label: 'برنامه کلاسی' },
    { id: 'online-tests', label: 'آزمون‌های آنلاین' },
    { id: 'surveys', label: 'پرسشنامه‌ها' },
    { id: 'daily-report', label: 'گزارش روزانه' },
    { id: 'weekly-report', label: 'گزارش هفتگی' },
    { id: 'test-analysis', label: 'تحلیل آزمون' },
    { id: 'overall-test-analysis', label: 'تحلیل کلی آزمون' },
    { id: 'test-checklist', label: 'چک‌لیست آزمون' },
    { id: 'focus-ladder', label: 'نردبان تمرکز' },
    { id: 'course-roadmap', label: 'روندنمای درسی' },
    { id: 'strategic-plans', label: 'برنامه‌های راهبردی' },
    { id: 'consulting-content', label: 'محتوای مشاوره‌ای' },
  ];

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";
    let newPassword = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      newPassword += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(newPassword);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4">
             <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="جستجوی دانش‌آموز..." className="pl-10 text-right w-full" />
                </div>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto">
                            <PlusCircle className="ml-2 h-4 w-4" />
                            افزودن دانش‌آموز
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="text-right">
                        <DialogTitle className="text-2xl font-headline">افزودن دانش‌آموز جدید</DialogTitle>
                        <DialogDescription>
                            اطلاعات دانش‌آموز را وارد کرده و برای او یک حساب کاربری ایجاد کنید.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4 text-right">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                <Label htmlFor="first-name">نام</Label>
                                <Input id="first-name" placeholder="مثال: سارا" />
                                </div>
                                <div className="grid gap-2">
                                <Label htmlFor="last-name">نام خانوادگی</Label>
                                <Input id="last-name" placeholder="مثال: رضایی" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">ایمیل</Label>
                                <Input id="email" type="email" placeholder="student@example.com" dir="ltr" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="grid gap-2">
                                    <Label htmlFor="grade">پایه تحصیلی</Label>
                                    <Select dir='rtl'>
                                        <SelectTrigger id="grade">
                                            <SelectValue placeholder="پایه را انتخاب کنید" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">دهم</SelectItem>
                                            <SelectItem value="11">یازدهم</SelectItem>
                                            <SelectItem value="12">دوازدهم</SelectItem>
                                        </SelectContent>
                                    </Select>
                                 </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="major">رشته</Label>
                                     <Select dir='rtl'>
                                        <SelectTrigger id="major">
                                            <SelectValue placeholder="رشته را انتخاب کنید" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="math">ریاضی و فیزیک</SelectItem>
                                            <SelectItem value="science">علوم تجربی</SelectItem>
                                            <SelectItem value="humanities">ادبیات و علوم انسانی</SelectItem>
                                        </SelectContent>
                                    </Select>
                                 </div>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="password">رمز عبور اولیه</Label>
                                <div className="flex gap-2">
                                   <div className="relative w-full">
                                      <Input id="password" type={showPassword ? "text" : "password"} dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                      >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                      </Button>
                                   </div>
                                    <Button type="button" variant="outline" size="icon" onClick={generatePassword} aria-label="پیشنهاد رمز عبور">
                                        <KeyRound className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-4">
                                <Switch id="panel-status" dir='ltr'/>
                                <div>
                                    <Label htmlFor="panel-status" className="font-medium">وضعیت پنل</Label>
                                    <p className="text-xs text-muted-foreground">
                                        برای دسترسی دانش‌آموز به پنل خود، این گزینه را فعال کنید.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-base font-semibold">دسترسی به قابلیت‌ها</Label>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {features.map((feature) => (
                                        <div key={feature.id} className="flex items-center justify-between p-2 rounded-lg border">
                                            <Switch id={feature.id} dir='ltr' />
                                            <Label htmlFor={feature.id} className="text-sm font-normal">
                                                {feature.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:justify-start flex-col-reverse sm:flex-row">
                           <Button type="submit">ایجاد دانش‌آموز</Button>
                           <DialogTrigger asChild>
                             <Button type="button" variant="outline">انصراف</Button>
                           </DialogTrigger>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="text-right w-full md:w-auto">
                <CardTitle>مدیریت دانش‌آموزان</CardTitle>
                <CardDescription>افزودن، ویرایش و مشاهده گزارش‌های دانش‌آموزان</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="text-right">وضعیت</TableHead>
                    <TableHead className="text-right">میانگین روانی</TableHead>
                    <TableHead className="text-right">میانگین مطالعه (ساعت)</TableHead>
                    <TableHead className="text-right">نام دانش آموز</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                    نتیجه‌ای یافت نشد.
                    </TableCell>
                </TableRow>
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
