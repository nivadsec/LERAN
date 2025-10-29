'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';
import { BarChart as BarChartIcon, Users, Clock, Smartphone, Smile, Search, ArrowRight } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label";

interface UserProfile {
  firstName?: string;
  isAdmin?: boolean;
}

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const isLoading = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/admin/login');
      } else if (userProfile && !userProfile.isAdmin) {
        console.warn("Access denied. User is not an admin.");
        router.replace('/dashboard'); 
      }
    }
  }, [user, userProfile, isLoading, router]);

  if (isLoading || !user || !userProfile || !userProfile.isAdmin) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-40 mt-2" />
                </CardContent>
            </Card>
            ))}
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
        </div>
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  const chartData = [
    { day: "شنبه", hours: 0 },
    { day: "۱شنبه", hours: 0 },
    { day: "۲شنبه", hours: 0 },
    { day: "۳شنبه", hours: 0 },
    { day: "۴شنبه", hours: 0 },
    { day: "۵شنبه", hours: 0 },
    { day: "جمعه", hours: 0 },
  ];
  
  const pieChartData = [
    { name: 'زیست', value: 0, fill: 'hsl(var(--chart-1))' },
    { name: 'شیمی', value: 0, fill: 'hsl(var(--chart-2))' },
    { name: 'فیزیک', value: 0, fill: 'hsl(var(--chart-3))' },
    { name: 'ریاضی', value: 0, fill: 'hsl(var(--chart-4))' },
    { name: 'سایر', value: 1, fill: 'hsl(var(--muted))' }, // To show a full circle
  ];

  const hasData = false;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل دانش‌آموزان</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">0</div>
            <p className="text-xs text-muted-foreground text-right">دانش‌آموز فعال در سیستم</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">میانگین مطالعه (روزانه)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">0 ساعت</div>
            <p className="text-xs text-muted-foreground text-right">میانگین کل دانش‌آموزان</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استفاده از موبایل</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">0 ساعت</div>
            <p className="text-xs text-muted-foreground text-right">میانگین کل دانش‌آموزان</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">میانگین رضایت (از ۱۰)</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">0</div>
            <p className="text-xs text-muted-foreground text-right">میانگین کل دانش‌آموزان</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="text-right">
            <CardTitle>روند مطالعه هفتگی</CardTitle>
            <CardDescription>میانگین ساعت مطالعه کل دانش‌آموزان در هفته گذشته</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             {hasData ? (
              <ChartContainer config={{}} className="h-[250px] w-full">
                <BarChart data={chartData} accessibilityLayer>
                   <CartesianGrid vertical={false} />
                   <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                   <YAxis tickLine={false} axisLine={false} />
                   <ChartTooltip content={<ChartTooltipContent />} />
                   <Bar dataKey="hours" fill="var(--color-primary)" radius={4} />
                </BarChart>
              </ChartContainer>
             ) : (
                <div className="flex h-[250px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed text-center p-4">
                    <BarChartIcon className="h-10 w-10 text-muted" />
                    <p className="mt-4 text-lg font-semibold">داده کافی برای نمایش نمودار وجود ندارد</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        پس از ثبت اولین گزارش توسط دانش‌آموزان، نمودارها در اینجا نمایش داده خواهند شد.
                    </p>
                </div>
             )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-right">
            <CardTitle>تقسیم زمان بین دروس</CardTitle>
            <CardDescription>درصد زمان مطالعه صرف شده برای هر درس</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
                <ChartContainer config={{}} className="h-[250px] w-full">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                        <Pie data={pieChartData} dataKey="value" nameKey="name" />
                    </PieChart>
                </ChartContainer>
            ) : (
                <div className="flex h-[250px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed text-center p-4">
                    <BarChartIcon className="h-10 w-10 text-muted" />
                    <p className="mt-4 text-lg font-semibold">داده کافی برای نمایش نمودار وجود ندارد</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        پس از ثبت اولین گزارش توسط دانش‌آموزان، نمودارها در اینجا نمایش داده خواهند شد.
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 text-right">
             <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-initial">خروجی کل داده‌ها</Button>
                <Button className="flex-1 md:flex-initial">
                    مشاهده همه
                    <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
             </div>
             <div className="w-full md:w-auto">
                <CardTitle>نمای کلی دانش‌آموزان</CardTitle>
                <CardDescription>برای مشاهده جزئیات، روی هر دانش‌آموز کلیک کنید.</CardDescription>
             </div>
          </div>
           <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="جستجوی دانش‌آموز..." className="pl-10 text-right" />
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
      
      <Card>
        <CardHeader className="text-right">
          <CardTitle>ارسال اطلاعیه سریع</CardTitle>
          <CardDescription>
            این اطلاعیه در صفحه اصلی زیر فرم لاگین برای همه نمایش داده می‌شود.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-right">
            <div>
                 <Label htmlFor="announcement-title" className="text-right block mb-2">اطلاعیه جدید</Label>
                 <Input id="announcement-title" placeholder="عنوان اطلاعیه" className="text-right"/>
            </div>
            <div>
                 <Label htmlFor="announcement-text" className="text-right block mb-2">متن اطلاعیه</Label>
                 <Textarea id="announcement-text" placeholder="پیام خود را در اینجا بنویسید..." className="text-right min-h-[100px]"/>
            </div>
        </CardContent>
        <CardFooter className="justify-start">
          <Button>انتشار اطلاعیه</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
