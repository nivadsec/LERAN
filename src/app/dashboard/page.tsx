'use client';

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { BarChart, Clock, Smile, TrendingUp, BookOpen, BarChart2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, Pie, PieChart as RechartsPieChart, Cell } from 'recharts';
import Link from 'next/link';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

// Dummy data for chart placeholders
const weeklyChartData = [
    { day: "شنبه", hours: 0 },
    { day: "۱شنبه", hours: 0 },
    { day: "۲شنبه", hours: 0 },
    { day: "۳شنبه", hours: 0 },
    { day: "۴شنبه", hours: 0 },
    { day: "۵شنبه", hours: 0 },
    { day: "جمعه", hours: 0 },
];

const subjectsPieData = [
  { name: 'زیست', value: 0, fill: 'hsl(var(--chart-1))' },
  { name: 'شیمی', value: 0, fill: 'hsl(var(--chart-2))' },
  { name: 'فیزیک', value: 0, fill: 'hsl(var(--chart-3))' },
  { name: 'ریاضی', value: 0, fill: 'hsl(var(--chart-4))' },
  { name: 'سایر', value: 1, fill: 'hsl(var(--muted))' }, // To show a full circle
];

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  const dailyReportsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'dailyReports'), orderBy('date', 'desc'), limit(7));
  }, [firestore, user]);

  const { data: dailyReports, isLoading: isReportsLoading } = useCollection(dailyReportsQuery);

  const isLoading = isUserLoading || isProfileLoading || isReportsLoading;

  useEffect(() => {
    if (!isUserLoading && !isProfileLoading) {
      if (!user) {
        router.replace('/login');
      } else if (userProfile?.isAdmin) {
        router.replace('/admin/dashboard');
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  const hasData = dailyReports && dailyReports.length > 0;

  if (isLoading || !user || userProfile?.isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-9 w-48" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                </CardContent>
            </Card>
            ))}
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center justify-between gap-4 text-right">
            <div>
                <h1 className="text-2xl font-bold">داشبورد شما</h1>
                <p className="text-muted-foreground">
                    سلام {userProfile?.firstName}، به پنل خودارزیابی خوش آمدید!
                </p>
            </div>
            <Button asChild>
                <Link href="/daily-report">ثبت گزارش امروز</Link>
            </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">میانگین مطالعه هفتگی</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-right">۰ ساعت</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">میانگین حس‌وحال</CardTitle>
                    <Smile className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-right">۰ / ۱۰</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">روزهای فعالیت متوالی</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-right">۰ روز</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="text-right">
                <CardTitle>روند مطالعه هفتگی</CardTitle>
                <CardDescription>مجموع ساعات مطالعه شما در ۷ روز گذشته</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                 {!hasData ? (
                   <EmptyStateChart icon={BarChart2} title="نمودار مطالعه هفتگی" description="با ثبت گزارش‌های روزانه، روند مطالعه خود را در اینجا دنبال کنید." />
                 ) : (
                  <ChartContainer config={{}} className="h-[250px] w-full">
                    <RechartsBarChart data={weeklyChartData} accessibilityLayer>
                       <CartesianGrid vertical={false} />
                       <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                       <YAxis tickLine={false} axisLine={false} />
                       <ChartTooltip content={<ChartTooltipContent />} />
                       <Bar dataKey="hours" fill="hsl(var(--primary))" radius={4} />
                    </RechartsBarChart>
                  </ChartContainer>
                 )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-right">
                <CardTitle>تقسیم‌بندی دروس</CardTitle>
                <CardDescription>درصد زمان مطالعه صرف شده برای هر درس</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {!hasData ? (
                   <EmptyStateChart icon={BookOpen} title="نمودار تقسیم‌بندی دروس" description="درصد مطالعه هر درس پس از ثبت فعالیت‌ها در گزارش روزانه نمایش داده می‌شود."/>
                ) : (
                    <ChartContainer config={{}} className="h-[250px] w-full">
                        <RechartsPieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Pie data={subjectsPieData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                {subjectsPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </RechartsPieChart>
                    </ChartContainer>
                )}
              </CardContent>
            </Card>
      </div>
    </div>
  );
}

// Helper component for empty chart states
function EmptyStateChart({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
    return (
        <div className="flex h-[250px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

// Renaming Recharts' BarChart to avoid conflict with our own component
const RechartsBarChart = BarChart;

    