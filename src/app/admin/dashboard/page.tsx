'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { BarChart as BarChartIcon, Users, Clock, Smartphone, Smile, Search, ArrowRight } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart as RechartsPieChart, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

interface DailyReport {
  id: string;
  mentalState: number;
  reportDate: string;
  createdAt: Timestamp;
  totals: {
      totalStudyTime: number;
      totalTestCount: number;
      totalTestCorrect: number;
      totalTestWrong: number;
      totalTestTime: number;
      overallTestPercentage: number;
  }
}

interface StudentData extends UserProfile {
    dailyReports: DailyReport[];
    avgStudyHours: number;
    avgMentalState: number;
}

interface SubjectData {
    name: string;
    value: number;
    fill: string;
}


export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [allStudentsData, setAllStudentsData] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [pieData, setPieData] = useState<SubjectData[]>([]);


  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    const initialLoading = isUserLoading || isProfileLoading;
    if (!initialLoading) {
      if (!user) {
        router.replace('/admin/login');
      } else if (userProfile && !userProfile.isAdmin) {
        console.warn("Access denied. User is not an admin.");
        router.replace('/dashboard');
      } else if (userProfile?.isAdmin) {
        fetchAllStudentsData();
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  useEffect(() => {
    if(allStudentsData.length > 0) {
        // This is a placeholder for subject extraction.
        // In a real scenario, you'd process report details.
        const subjects = [
            { name: 'ریاضی', value: 400 },
            { name: 'فیزیک', value: 300 },
            { name: 'شیمی', value: 300 },
            { name: 'زیست', value: 200 },
        ];
        const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
        const data = subjects.map((s, i) => ({
            ...s,
            fill: colors[i % colors.length]
        }));
        setPieData(data);
    }
  }, [allStudentsData]);


  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = allStudentsData.filter(student =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredStudents(filteredData);
  }, [searchTerm, allStudentsData]);


  const fetchAllStudentsData = async () => {
    if (!firestore) return;
    setIsDataLoading(true);
    try {
        const usersQuery = query(collection(firestore, 'users'), where('isAdmin', '!=', true));
        const usersSnapshot = await getDocs(usersQuery);
        const students: StudentData[] = [];

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data() as UserProfile;
            userData.id = userDoc.id;

            const reportsRef = collection(firestore, 'users', userDoc.id, 'dailyReports');
            const reportsSnapshot = await getDocs(reportsRef);
            const dailyReports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyReport));
            
            const totalStudyMinutes = dailyReports.reduce((acc, r) => acc + (r.totals?.totalStudyTime || 0), 0);
            const totalMentalState = dailyReports.reduce((acc, r) => acc + (r.mentalState || 0), 0);

            students.push({
                ...userData,
                dailyReports,
                avgStudyHours: dailyReports.length > 0 ? totalStudyMinutes / 60 / dailyReports.length : 0,
                avgMentalState: dailyReports.length > 0 ? totalMentalState / dailyReports.length : 0,
            });
        }
        setAllStudentsData(students);
    } catch (error) {
        console.error("Error fetching students data:", error);
        toast({
            variant: "destructive",
            title: "خطا در دریافت اطلاعات",
            description: "مشکلی در دریافت اطلاعات دانش‌آموزان رخ داده است."
        });
    } finally {
        setIsDataLoading(false);
    }
  };


  const handleExportData = async () => {
    if (!firestore) return;
    toast({ title: 'در حال آماده‌سازی فایل...', description: 'این فرآیند ممکن است چند لحظه طول بکشد.' });
    try {
      const usersCollectionRef = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollectionRef);
      const allData: { [key: string]: any } = { users: {} };

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.isAdmin) continue; // Skip admin user

        const userId = userDoc.id;
        allData.users[userId] = { profile: userData, dailyReports: {} };

        const dailyReportsRef = collection(firestore, 'users', userId, 'dailyReports');
        const dailyReportsSnapshot = await getDocs(dailyReportsRef);

        dailyReportsSnapshot.forEach((reportDoc) => {
          allData.users[userId].dailyReports[reportDoc.id] = reportDoc.data();
        });
      }

      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'italk_backup.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: 'فایل پشتیبان با موفقیت دانلود شد!', variant: 'default' });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({ title: 'خطا در خروجی گرفتن', description: 'مشکلی در هنگام ایجاد فایل پشتیبان رخ داد.', variant: 'destructive' });
    }
  };

  const { totalStudents, avgStudy, avgFeeling, weeklyChartData } = useMemo(() => {
    if (isDataLoading || allStudentsData.length === 0) {
        return { totalStudents: 0, avgStudy: 0, avgFeeling: 0, weeklyChartData: [] };
    }

    const totalReports = allStudentsData.flatMap(s => s.dailyReports);
    const totalStudyMinutes = totalReports.reduce((acc, r) => acc + (r.totals?.totalStudyTime || 0), 0);
    const totalFeeling = totalReports.reduce((acc, r) => acc + r.mentalState, 0);
    
    const dayNames = ["۱شنبه", "۲شنبه", "۳شنبه", "۴شنبه", "۵شنبه", "جمعه", "شنبه"];
    const chartData = dayNames.map(name => ({ day: name, hours: 0 }));
    totalReports.forEach(report => {
        if(report.createdAt) {
            const date = new Date(report.createdAt.seconds * 1000);
            const faDayIndex = (date.getDay() + 1) % 7;
            const dayName = dayNames[faDayIndex];
            const chartEntry = chartData.find(d => d.day === dayName);
            if (chartEntry && report.totals?.totalStudyTime) {
                chartEntry.hours += report.totals.totalStudyTime / 60;
            }
        }
    });

    return {
        totalStudents: allStudentsData.length,
        avgStudy: totalReports.length > 0 ? (totalStudyMinutes / 60 / totalReports.length).toFixed(1) : 0,
        avgFeeling: totalReports.length > 0 ? (totalFeeling / totalReports.length).toFixed(1) : 0,
        weeklyChartData: chartData
    };
  }, [isDataLoading, allStudentsData]);

  const isLoading = isUserLoading || isProfileLoading || isDataLoading;
  
  if (isLoading || !user || !userProfile || !userProfile.isAdmin) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
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

  const hasData = allStudentsData.length > 0 && allStudentsData.some(s => s.dailyReports.length > 0);
  const hasPieData = pieData && pieData.length > 0 && pieData.some(d => d.name !== 'سایر');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل دانش‌آموزان</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{totalStudents}</div>
            <p className="text-xs text-muted-foreground text-right">دانش‌آموز فعال در سیستم</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">میانگین مطالعه (روزانه)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{avgStudy} ساعت</div>
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
            <p className="text-xs text-muted-foreground text-right">داده‌ای ثبت نشده</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">میانگین رضایت (از ۱۰)</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{avgFeeling}</div>
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
                <BarChart data={weeklyChartData} accessibilityLayer>
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
            {hasData && hasPieData ? (
                <ChartContainer config={{}} className="h-[250px] w-full">
                    <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50}>
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </RechartsPieChart>
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
          <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4 text-right">
             <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-initial" onClick={handleExportData}>خروجی کل داده‌ها</Button>
                <Button asChild className="flex-1 md:flex-initial">
                    <Link href="/admin/users">
                        مشاهده همه
                        <ArrowRight className="mr-2 h-4 w-4" />
                    </Link>
                </Button>
             </div>
             <div>
                <CardTitle>نمای کلی دانش‌آموزان</CardTitle>
                <CardDescription>برای مشاهده جزئیات، روی هر دانش‌آموز کلیک کنید.</CardDescription>
             </div>
          </div>
           <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی دانش‌آموز..."
                className="pl-10 text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent>
         <div className="w-full overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="text-right">نام دانش آموز</TableHead>
                    <TableHead className="text-right">میانگین مطالعه (ساعت)</TableHead>
                    <TableHead className="text-right">میانگین روانی</TableHead>
                    <TableHead className="text-right">وضعیت</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                            <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/users/${student.id}`)}>
                                <TableCell>{student.firstName} {student.lastName}</TableCell>
                                <TableCell>{student.avgStudyHours.toFixed(1)}</TableCell>
                                <TableCell>{student.avgMentalState.toFixed(1)} / 10</TableCell>
                                <TableCell>
                                    <span className="text-green-500">●</span> خوب
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                {searchTerm ? 'دانش‌آموزی با این نام یافت نشد.' : 'دانش‌آموزی برای نمایش وجود ندارد.'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
