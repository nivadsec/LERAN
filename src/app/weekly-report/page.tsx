
'use client';

import { useState, useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, BookCopy, PlusCircle, Trash2, Send } from 'lucide-react';
import { format, getDay, addDays, startOfWeek as getStartOfWeek } from 'date-fns-jalali';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const subjectDetailSchema = z.object({
  name: z.string().min(1, "نام درس الزامی است."),
  studyHours: z.coerce.number().optional(),
  studyTests: z.coerce.number().optional(),
  reviewCount: z.coerce.number().optional(),
  comment: z.string().optional(),
});

const formSchema = z.object({
  comment: z.string().optional(),
  subjects: z.array(subjectDetailSchema),
});

type WeeklyReportFormValues = z.infer<typeof formSchema>;

interface WeeklyReportDocument extends WeeklyReportFormValues {
    id: string;
    weekRange: string;
    createdAt: Timestamp;
    totalHours: number;
    totalTests: number;
}


export default function WeeklyReportPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [newSubjectName, setNewSubjectName] = useState('');

  const today = new Date();
  const startOfWeek = getStartOfWeek(today, { weekStartsOn: 6 }); // Saturday
  const endOfWeek = addDays(startOfWeek, 6);
  const formattedRange = `${format(startOfWeek, 'yyyy/MM/dd')} - ${format(endOfWeek, 'yyyy/MM/dd')}`;

  const canSubmit = useMemo(() => {
    const dayOfWeek = getDay(today);
    // Thursday (4) or Friday (5)
    return dayOfWeek === 4 || dayOfWeek === 5;
  }, [today]);

  const form = useForm<WeeklyReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { comment: '', subjects: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjects',
  });

  const subjects = form.watch('subjects');
  const totalHours = subjects.reduce(
    (sum, subj) => sum + Number(subj.studyHours || 0),
    0
  );
  const totalTests = subjects.reduce(
    (sum, subj) => sum + Number(subj.studyTests || 0),
    0
  );

  const weeklyReportsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'weeklyReports'), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: pastReports, isLoading: areReportsLoading } = useCollection<WeeklyReportDocument>(weeklyReportsQuery);

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
        toast({
            variant: "destructive",
            title: "خطا",
            description: "نام درس نمی‌تواند خالی باشد.",
        });
        return;
    }
    append({
      name: newSubjectName.trim(),
      studyHours: 0,
      studyTests: 0,
      reviewCount: 0,
      comment: '',
    });
    setNewSubjectName('');
  };

  const handlePastDateRequest = async () => {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "خطا",
            description: "برای ارسال درخواست باید وارد شده باشید.",
        });
        return;
    }
    const requestsRef = collection(firestore, 'dateChangeRequests');
    const payload = {
        studentId: user.uid,
        studentName: user.displayName || user.email,
        requestType: 'WeeklyReport',
        status: 'pending',
        createdAt: serverTimestamp(),
    };
    try {
        await addDoc(requestsRef, payload);
        toast({
            title: "درخواست ارسال شد",
            description: "درخواست شما برای ثبت گزارش هفتگی به مدیر ارسال شد و در حال بررسی است.",
        });
    } catch(error) {
        console.error("Error sending request:", error);
        const contextualError = new FirestorePermissionError({
            path: requestsRef.path,
            operation: 'create',
            requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "خطا",
            description: "برای ثبت گزارش باید وارد شده باشید.",
        });
        return;
    }
    if (!canSubmit) {
      handlePastDateRequest();
      return;
    }

    const reportRef = collection(firestore, `users/${user.uid}/weeklyReports`);
    const payload = {
        ...data,
        weekRange: formattedRange,
        createdAt: serverTimestamp(),
        totalHours: totalHours,
        totalTests: totalTests,
    };
    
    try {
        await addDoc(reportRef, payload);
        toast({
            title: 'گزارش هفتگی با موفقیت ثبت شد ✅',
        });
        form.reset({ comment: '', subjects: [] });
    } catch(error) {
        console.error("Error submitting weekly report:", error);
        const contextualError = new FirestorePermissionError({
            path: reportRef.path,
            operation: 'create',
            requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return '۰';
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  return (
    <div dir="rtl" className="space-y-8 text-right">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-end gap-2 text-right">
            گزارش هفتگی دانش‌آموز
            <BookCopy className="h-5 w-5 text-primary" />
          </CardTitle>
          <CardDescription className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
             <CalendarDays className="h-4 w-4" />
             هفته جاری: <span className="font-semibold">{formattedRange}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      <form dir="rtl" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-right">
        <Card>
          <CardHeader>
            <CardTitle>جزئیات دروس</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام درس</TableHead>
                  <TableHead className="text-center">ساعت مطالعه</TableHead>
                  <TableHead className="text-center">تعداد تست</TableHead>
                  <TableHead className="text-center">تعداد مرور</TableHead>
                  <TableHead className="text-right w-[200px]">توضیحات</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input dir="rtl" {...form.register(`subjects.${index}.name` as const)} />
                    </TableCell>
                    <TableCell>
                      <Input dir="rtl" className="text-center font-code" type="number" {...form.register(`subjects.${index}.studyHours` as const)} />
                    </TableCell>
                    <TableCell>
                      <Input dir="rtl" className="text-center font-code" type="number" {...form.register(`subjects.${index}.studyTests` as const)} />
                    </TableCell>
                    <TableCell>
                      <Input dir="rtl" className="text-center font-code" type="number" {...form.register(`subjects.${index}.reviewCount` as const)} />
                    </TableCell>
                    <TableCell>
                      <Textarea dir="rtl" {...form.register(`subjects.${index}.comment` as const)} />
                    </TableCell>
                    <TableCell className="text-left">
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 <TableRow className="bg-muted/50 font-bold">
                    <TableCell>مجموع</TableCell>
                    <TableCell className="text-center font-code">{formatNumber(totalHours)}</TableCell>
                    <TableCell className="text-center font-code">{formatNumber(totalTests)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            </div>

            <div className="flex items-center justify-start gap-2 mt-4" dir="rtl">
              <Button type="button" variant="outline" size="sm" onClick={handleAddSubject}>
                <PlusCircle className="ml-2 h-4 w-4" />
                افزودن درس
              </Button>
               <Input
                placeholder="نام درس جدید"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="max-w-xs"
                dir="rtl"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>جمع‌بندی هفته</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...form.register('comment')}
              placeholder="توضیحات کلی، نقاط قوت، ضعف و اهداف هفته آینده..."
              dir="rtl"
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>
        
        {canSubmit ? (
             <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'در حال ثبت...' : 'ثبت گزارش هفتگی'}
             </Button>
        ) : (
            <div className="space-y-2">
                <Button type="button" size="lg" className="w-full sm:w-auto" onClick={handlePastDateRequest}>
                    <Send className="ml-2 h-4 w-4" />
                    درخواست ثبت گزارش
                </Button>
                <p className="text-xs text-muted-foreground">ثبت گزارش هفتگی فقط در روزهای پنجشنبه و جمعه مجاز است.</p>
            </div>
        )}
      </form>

      <Card>
        <CardHeader>
          <CardTitle>گزارش‌های قبلی</CardTitle>
        </CardHeader>
        <CardContent>
          {areReportsLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full"/>
                <Skeleton className="h-10 w-full"/>
            </div>
          ) : pastReports && pastReports.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">هفته</TableHead>
                  <TableHead className="text-center">مجموع ساعت</TableHead>
                  <TableHead className="text-center">مجموع تست</TableHead>
                  <TableHead className="text-right">توضیحات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-code">{report.weekRange}</TableCell>
                    <TableCell className="text-center font-code">{formatNumber(report.totalHours || 0)}</TableCell>
                    <TableCell className="text-center font-code">{formatNumber(report.totalTests || 0)}</TableCell>
                    <TableCell dir="rtl" className="max-w-xs truncate">{report.comment}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">هیچ گزارشی تاکنون ثبت نشده است.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

    