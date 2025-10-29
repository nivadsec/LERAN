'use client';

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { BarChart as BarChartIcon, Clock, Smile, TrendingUp, BookOpen, BarChart2, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart as RechartsPieChart, Cell } from 'recharts';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { extractSubjectsFromText } from '@/ai/flows/extract-subjects-from-text';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

interface DailyReport {
    id: string;
    studyHours: number;
    feeling: number;
    activities: string;
    date: Timestamp;
}

interface Announcement {
    id: string;
    message: string;
}

interface SubjectData {
    name: string;
    value: number;
    fill: string;
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [subjectsPieData, setSubjectsPieData] = useState<SubjectData[] | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  const dailyReportsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'dailyReports'), orderBy('date', 'desc'), limit(7));
  }, [firestore, user]);

  const { data: dailyReports, isLoading: isReportsLoading } = useCollection<DailyReport>(dailyReportsQuery);

  const announcementsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'announcements'), orderBy('createdAt', 'desc'), limit(1));
  }, [firestore]);

  const { data: announcements, isLoading: isAnnouncementsLoading } = useCollection<Announcement>(announcementsQuery);
  const latestAnnouncement = announcements?.[0];

  const isLoading = isUserLoading || isProfileLoading || isReportsLoading || isAnnouncementsLoading;

   useEffect(() => {
    if (!isUserLoading && !isProfileLoading) {
      if (!user) {
        router.replace('/login');
      } else if (userProfile?.isAdmin) {
        router.replace('/admin/dashboard');
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  useEffect(() => {
    if (dailyReports && dailyReports.length > 0) {
      const allActivities = dailyReports.map(r => r.activities).join('\n');
      extractSubjectsFromText(allActivities)
        .then(result => {
           const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
           const pieData = result.subjects.map((s, i) => ({
             name: s.subject,
             value: s.duration,
             fill: colors[i % colors.length]
           }));
           if(pieData.length === 0) {
              pieData.push({ name: 'سایر', value: 1, fill: 'hsl(var(--muted))' });
           }
           setSubjectsPieData(pieData);
        })
        .catch(console.error);
    } else {
        setSubjectsPieData(null);
    }
  }, [dailyReports]);

  const { weeklyAvgStudy, weeklyAvgFeeling, streak, weeklyChartData } = useMemo(() => {
    if (!dailyReports || dailyReports.length === 0) {
      return {
        weeklyAvgStudy: 0,
        weeklyAvgFeeling: 0,
        streak: 0,
        weeklyChartData: [
            { day: "شنبه", hours: 0 }, { day: "۱شنبه", hours: 0 }, { day: "۲شنبه", hours: 0 },
            { day: "۳شنبه", hours: 0 }, { day: "۴شنبه", hours: 0 }, { day: "۵شنبه", hours: 0 }, { day: "جمعه", hours: 0 },
        ],
      };
    }
    
    const totalStudy = dailyReports.reduce((acc, r) => acc + r.studyHours, 0);
    const totalFeeling = dailyReports.reduce((acc, r) => acc + r.feeling, 0);

    const dayNames = ["۱شنبه", "۲شنبه", "۳شنبه", "۴شنبه", "۵شنبه", "جمعه", "شنبه"];
    const chartData = dayNames.map(name => ({ day: name, hours: 0 }));

    let consecutiveDays = 0;
    if(dailyReports.length > 0) {
        const sortedReports = [...dailyReports].sort((a, b) => b.date.seconds - a.date.seconds);
        let lastDate = new Date(sortedReports[0].date.seconds * 1000);
        lastDate.setHours(0,0,0,0);
        consecutiveDays = 1;

        for(let i=1; i<sortedReports.length; i++) {
            const currentDate = new Date(sortedReports[i].date.seconds * 1000);
            currentDate.setHours(0,0,0,0);
            const diff = lastDate.getTime() - currentDate.getTime();
            if (diff === 86400000) { // 24 * 60 * 60 * 1000
                consecutiveDays++;
                lastDate = currentDate;
            } else if (diff > 86400000) {
                break;
            }
        }
    }


    dailyReports.forEach(report => {
        const date = new Date(report.date.seconds * 1000);
        const dayIndex = date.getDay(); // 0 (Sun) to 6 (Sat) -> (fa-IR: 6, 0, 1, 2, 3, 4, 5)
        const faDayIndex = (dayIndex + 1) % 7; // Shanbe:0, Yekshanbe:1 ...
        const dayName = dayNames[faDayIndex];
        const chartEntry = chartData.find(d => d.day === dayName);
        if(chartEntry) {
            chartEntry.hours += report.studyHours;
        }
    });

    return {
      weeklyAvgStudy: (totalStudy / dailyReports.length).toFixed(1),
      weeklyAvgFeeling: (totalFeeling / dailyReports.length).toFixed(1),
      streak: consecutiveDays,
      weeklyChartData: chartData
    };
  }, [dailyReports]);

  const hasData = dailyReports && dailyReports.length > 0;
  const hasPieData = subjectsPieData && subjectsPieData.some(d => d.name !== 'سایر');


  if (isLoading || !user || userProfile?.isAdmin) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
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
        {latestAnnouncement && (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>اطلاعیه جدید</AlertTitle>
                <AlertDescription>
                    {latestAnnouncement.message}
                </AlertDescription>
            </Alert>
        )}

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
                    <div className="text-2xl font-bold text-right">{weeklyAvgStudy} ساعت</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">میانگین حس‌وحال</CardTitle>
                    <Smile className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-right">{weeklyAvgFeeling} / ۱۰</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">روزهای فعالیت متوالی</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-right">{streak} روز</div>
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
                    <BarChart data={weeklyChartData} accessibilityLayer>
                       <CartesianGrid vertical={false} />
                       <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                       <YAxis tickLine={false} axisLine={false} />
                       <ChartTooltip content={<ChartTooltipContent />} />
                       <Bar dataKey="hours" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ChartContainer>
                 )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-right">
                <CardTitle>تقسیم‌بندی دروس</CardTitle>
                <CardDescription>درصد زمان مطالعه صرف شده برای هر درس (تخمین هوشمند)</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {!hasData ? (
                   <EmptyStateChart icon={BookOpen} title="نمودار تقسیم‌بندی دروس" description="درصد مطالعه هر درس پس از ثبت فعالیت‌ها در گزارش روزانه نمایش داده می‌شود."/>
                ) : !subjectsPieData || !hasPieData ? (
                   <EmptyStateChart icon={BookOpen} title="در حال تحلیل دروس..." description="هوش مصنوعی در حال تحلیل گزارش‌های شما برای استخراج دروس است."/>
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
