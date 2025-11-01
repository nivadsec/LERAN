'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Mailbox } from 'lucide-react';
import { format } from 'date-fns-jalali';

interface DateChangeRequest {
  id: string;
  studentId: string;
  studentName: string;
  requestType: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: Timestamp;
}

export default function AdminRequestsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const requestsQuery = useMemoFirebase(() => collection(firestore, 'dateChangeRequests'), [firestore]);
  const { data: requests, isLoading } = useCollection<DateChangeRequest>(requestsQuery);

  const handleUpdateRequest = async (id: string, status: 'approved' | 'denied') => {
    if (!firestore) return;
    const requestDocRef = doc(firestore, 'dateChangeRequests', id);
    try {
      await updateDoc(requestDocRef, { status });
      toast({
        title: 'موفقیت',
        description: `وضعیت درخواست به "${status === 'approved' ? 'تایید شده' : 'رد شده'}" تغییر کرد.`,
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'مشکلی در به‌روزرسانی درخواست رخ داد.',
      });
    }
  };

  const getStatusVariant = (status: DateChangeRequest['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'denied': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  }
  const getStatusText = (status: DateChangeRequest['status']) => {
    switch (status) {
      case 'approved': return 'تایید شده';
      case 'denied': return 'رد شده';
      case 'pending': return 'در انتظار';
      default: return status;
    }
  }

  return (
    <Card>
      <CardHeader className="text-right">
        <CardTitle>بررسی درخواست‌ها</CardTitle>
        <CardDescription>درخواست‌های ارسال شده از طرف دانش‌آموزان را مدیریت کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right w-[200px]">اقدامات</TableHead>
                <TableHead className="text-center">وضعیت</TableHead>
                <TableHead className="text-right">تاریخ</TableHead>
                <TableHead className="text-right">نوع درخواست</TableHead>
                <TableHead className="text-right">نام دانش‌آموز</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-9 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : requests && requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleUpdateRequest(req.id, 'approved')}
                        disabled={req.status !== 'pending'}
                      >
                        <Check className="ml-1 h-4 w-4" />
                        تایید
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() => handleUpdateRequest(req.id, 'denied')}
                        disabled={req.status !== 'pending'}
                      >
                        <X className="ml-1 h-4 w-4" />
                        رد
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge variant={getStatusVariant(req.status)}>{getStatusText(req.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                        {req.createdAt ? format(new Date(req.createdAt.seconds * 1000), 'yyyy/MM/dd HH:mm') : '-'}
                    </TableCell>
                    <TableCell className="text-right">{req.requestType === 'PastDailyReport' ? 'ثبت گزارش گذشته' : req.requestType}</TableCell>
                    <TableCell className="font-medium text-right">{req.studentName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                     <div className="flex flex-col items-center gap-2">
                        <Mailbox className="h-10 w-10 text-muted-foreground" />
                        <span className="font-semibold">هیچ درخواستی یافت نشد.</span>
                        <p className="text-sm text-muted-foreground">در حال حاضر هیچ درخواست در انتظاری وجود ندارد.</p>
                     </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
