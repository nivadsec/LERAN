'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, Calendar, Clock, Smile, Percent, Bot, Send, BrainCircuit } from 'lucide-react';
import { format } from 'date-fns-jalali';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { analyzeStudentPerformance, type StudentPerformanceAnalysisOutput } from '@/ai/flows/student-performance-analyzer';


interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  grade?: string;
  major?: string;
}

interface DailyReport {
    id: string;
    reportDate: string;
    mentalState: number;
    totals: {
        totalStudyTime: number;
        overallTestPercentage: number;
    };
    createdAt: Timestamp;
}

const formatNumber = (num?: number) => {
    if (num === undefined || isNaN(num)) return '۰';
    return new Intl.NumberFormat('fa-IR').format(num);
};

export default function StudentDetailPage() {
  const params = useParams();
  const { userId } = params;
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StudentPerformanceAnalysisOutput | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!userId || typeof userId !== 'string') return null;
    return doc(firestore, 'users', userId as string);
  }, [firestore, userId]);

  const reportsQuery = useMemoFirebase(() => {
    if (!userId || typeof userId !== 'string') return null;
    return query(collection(firestore, 'users', userId as string, 'dailyReports'), orderBy('createdAt', 'desc'), limit(7));
  }, [firestore, userId]);

  const { data: student, isLoading: isStudentLoading } = useDoc<UserProfile>(userDocRef);
  const { data: reports, isLoading: areReportsLoading } = useCollection<DailyReport>(reportsQuery);

  const handleAnalyzePerformance = async () => {
    if (!reports || reports.length === 0) {
        toast({
            variant: "destructive",
            title: "گزارشی برای تحلیل وجود ندارد",
            description: "ابتدا باید دانش‌آموز حداقل یک گزارش ثبت کرده باشد."
        });
        return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const reportsJson = JSON.stringify(reports.map(r => ({
        date: r.reportDate,
        studyTimeMinutes: r.totals.totalStudyTime,
        testPercentage: r.totals.overallTestPercentage,
        mentalState: r.mentalState,
    })), null, 2);

    try {
        const result = await analyzeStudentPerformance({ recentReportsData: reportsJson });
        setAnalysisResult(result);
    } catch (error) {
        console.error("Error analyzing performance:", error);
        toast({
            variant: "destructive",
            title: "خطا در تحلیل هوشمند",
            description: "مشکلی در ارتباط با سرور هوش مصنوعی رخ داد.",
        });
    } finally {
        setIsAnalyzing(false);
    }
  };


  if (isStudentLoading || areReportsLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    )
  }

  if (!student) {
    return (
      <Card>
        <CardHeader className="text-right">
          <CardTitle>دانش‌آموز یافت نشد</CardTitle>
          <CardDescription>اطلاعات این دانش‌آموز در دسترس نیست.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader className="text-right">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl">
                        پروفایل {student.firstName} {student.lastName}
                        </CardTitle>
                        <CardDescription>جزئیات و عملکرد اخیر دانش‌آموز</CardDescription>
                    </div>
                     <div className="flex items-center p-1 bg-muted rounded-lg text-sm">
                        <span className="font-mono text-muted-foreground">{student.email}</span>
                        <User className="mr-2 h-4 w-4" />
                     </div>
                </div>
            </CardHeader>
        </Card>
        
        <Card className="bg-gradient-to-l from-primary/10 to-transparent">
             <CardHeader>
                <CardTitle className="text-right flex items-center justify-end gap-2">
                    <BrainCircuit className="h-6 w-6 text-primary"/>
                    تحلیل عملکرد هوشمند (AI)
                </CardTitle>
                <CardDescription className="text-right">
                    با کلیک بر روی دکمه، گزارش‌های اخیر دانش‌آموز توسط هوش مصنوعی تحلیل شده و نتایج آن به شما نمایش داده می‌شود.
                </CardDescription>
             </CardHeader>
             <CardContent>
                <div className="flex justify-start">
                    <Button onClick={handleAnalyzePerformance} disabled={isAnalyzing}>
                      {isAnalyzing ? "در حال تحلیل..." : "شروع تحلیل هوشمند"}
                      {!isAnalyzing && <Bot className="mr-2 h-5 w-5" />}
                    </Button>
                </div>
                {isAnalyzing && (
                    <div className="space-y-4 mt-6">
                        <Skeleton className="h-6 w-1/3 ml-auto" />
                        <Skeleton className="h-4 w-full ml-auto" />
                        <Skeleton className="h-4 w-4/5 ml-auto" />
                        <Skeleton className="h-6 w-1/4 ml-auto mt-4" />
                        <Skeleton className="h-4 w-full ml-auto" />
                    </div>
                )}
                 {analysisResult && (
                    <div className="mt-6 space-y-6 text-right">
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg">خلاصه عملکرد</h3>
                            <p className="text-muted-foreground">{analysisResult.summary}</p>
                        </div>
                         <div className="space-y-2">
                            <h3 className="font-bold text-lg">روندهای کلیدی</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {analysisResult.keyTrends.map((trend, i) => <li key={i}>{trend}</li>)}
                            </ul>
                        </div>
                         <div className="space-y-2">
                            <h3 className="font-bold text-lg">پیشنهاد برای معلم</h3>
                             <ul className="list-disc list-inside space-y-1">
                                {analysisResult.suggestionsForTeacher.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                            </ul>
                        </div>
                    </div>
                 )}
             </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className="text-right">ارسال بازخورد و توصیه</CardTitle>
            </CardHeader>
             <CardContent className="space-y-4">
                <Textarea placeholder="بازخورد یا توصیه خود را در اینجا برای دانش‌آموز بنویسید..." className="min-h-[120px] text-right" />
                <Button>
                    ارسال بازخورد
                    <Send className="mr-2 h-4 w-4"/>
                </Button>
             </CardContent>
        </Card>


        <div>
            <h2 className="text-xl font-bold text-right mb-4">گزارش‌های روزانه اخیر</h2>
            {reports && reports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reports.map(report => (
                        <Card key={report.id} className="text-right">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>گزارش روز</span>
                                     <span className="text-sm font-normal text-muted-foreground flex items-center gap-1 font-code">
                                        <Calendar className="h-4 w-4" />
                                        {report.reportDate}
                                    </span>
                                </CardTitle>
                                <CardDescription className="pt-1">
                                    ثبت شده در: {format(report.createdAt.toDate(), 'yyyy/MM/dd HH:mm')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                               <div className="flex justify-around items-center text-center p-2 bg-muted rounded-md">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">مطالعه</p>
                                        <p className="font-bold flex items-center justify-center gap-1 font-code"><Clock className="h-4 w-4"/> {formatNumber(report.totals?.totalStudyTime)} دقیقه</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">درصد تست</p>
                                        <p className="font-bold flex items-center justify-center gap-1 font-code"><Percent className="h-4 w-4"/> {formatNumber(report.totals?.overallTestPercentage)}٪</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">وضعیت</p>
                                        <p className="font-bold flex items-center justify-center gap-1 font-code"><Smile className="h-4 w-4"/> {formatNumber(report.mentalState)}/۱۰</p>
                                    </div>
                               </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Alert>
                    <User className="h-4 w-4" />
                    <AlertTitle className="text-right">بدون گزارش</AlertTitle>
                    <AlertDescription className="text-right">
                       این دانش‌آموز هنوز هیچ گزارش روزانه‌ای ثبت نکرده است.
                    </AlertDescription>
                </Alert>
            )}
        </div>

    </div>
  );
}
