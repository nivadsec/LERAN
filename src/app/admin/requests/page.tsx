'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, Timestamp, query, where, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, X, Mailbox, Trash2, UserPlus, History } from 'lucide-react';
import { format } from 'date-fns-jalali';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface DateChangeRequest {
  id: string;
  studentId: string;
  studentName: string;
  requestType: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: Timestamp;
}

interface RegistrationRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  major: string;
  registrationStatus: 'pending' | 'approved' | 'denied';
  signupDate: Timestamp;
}


const getMajorDisplayName = (majorKey?: string) => {
    switch (majorKey) {
        case 'math': return 'ریاضی و فیزیک';
        case 'science': return 'علوم تجربی';
        case 'humanities': return 'ادبیات و علوم انسانی';
        default: return majorKey || 'نامشخص';
    }
};

function RegistrationRequests() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const requestsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'users'), where('registrationStatus', '==', 'pending'), orderBy('signupDate', 'desc'));
  }, [firestore]);
  
  const { data: requests, isLoading, error } = useCollection<RegistrationRequest>(requestsQuery);

  const handleRegistrationUpdate = async (userId: string, approve: boolean) => {
    const userDocRef = doc(firestore, 'users', userId);
    if (approve) {
      try {
        await updateDoc(userDocRef, {
          registrationStatus: 'approved',
          panelStatus: true,
        });
        toast({ title: 'موفقیت', description: 'ثبت‌نام دانش‌آموز تایید شد.' });
      } catch (e) {
        console.error(e);
        toast({ title: 'خطا', description: 'مشکلی در تایید ثبت‌نام رخ داد.', variant: 'destructive' });
      }
    } else { // Deny
      try {
        await deleteDoc(userDocRef);
        toast({ title: 'موفقیت', description: 'ثبت‌نام دانش‌آموز رد و اطلاعات حذف شد.', variant: 'destructive' });
      } catch (e) {
         console.error(e);
        toast({ title: 'خطا', description: 'مشکلی در رد کردن ثبت‌نام رخ داد.', variant: 'destructive' });
      }
    }
  }

  if (isLoading) {
    return (
        <div className="space-y-2">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
    )
  }

  if (error) {
      return <p className="text-destructive text-center py-8">خطا در دریافت درخواست‌های ثبت‌نام.</p>
  }
  
  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-center py-12">
        <UserPlus className="h-12 w-12 text-muted-foreground" />
        <p className="font-semibold">هیچ درخواست ثبت‌نام جدیدی وجود ندارد.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
        {requests.map(req => (
            <Card key={req.id}>
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start gap-4 text-right">
                    <div className="flex gap-2">
                         <Button size="sm" variant="destructive" onClick={() => handleRegistrationUpdate(req.id, false)}>
                            <X className="ml-1 h-4 w-4" /> رد کردن
                        </Button>
                        <Button size="sm" onClick={() => handleRegistrationUpdate(req.id, true)}>
                            <Check className="ml-1 h-4 w-4" /> تایید ثبت‌نام
                        </Button>
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="font-bold">{req.firstName} {req.lastName}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>ایمیل: <span className="font-mono">{req.email}</span></span>
                            <span>پایه: {req.grade}</span>
                            <span>رشته: {getMajorDisplayName(req.major)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            تاریخ درخواست: {req.signupDate ? format(req.signupDate.toDate(), 'yyyy/MM/dd HH:mm') : 'نامشخص'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
  )
}

function DateChangeRequests() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [requestToDelete, setRequestToDelete] = useState<DateChangeRequest | null>(null);

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
      const contextualError = new FirestorePermissionError({
        path: requestDocRef.path,
        operation: 'update',
        requestResourceData: { status },
      });
      errorEmitter.emit('permission-error', contextualError);
    }
  };

   const handleDeleteRequest = async () => {
    if (!firestore || !requestToDelete) return;
    const requestDocRef = doc(firestore, 'dateChangeRequests', requestToDelete.id);
    try {
        await deleteDoc(requestDocRef);
        toast({
            title: 'موفقیت',
            description: 'درخواست با موفقیت حذف شد.',
        });
    } catch(error) {
        console.error('Error deleting request:', error);
        const contextualError = new FirestorePermissionError({
            path: requestDocRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', contextualError);
    } finally {
        setRequestToDelete(null);
    }
  }

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
    <>
    <div className="rounded-md border">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead className="text-right w-[250px]">اقدامات</TableHead>
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
                    <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setRequestToDelete(req)}
                    >
                    <Trash2 className="ml-1 h-4 w-4" />
                    حذف
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
                    <span className="font-semibold">هیچ درخواست دیگری یافت نشد.</span>
                    </div>
                </TableCell>
            </TableRow>
            )}
        </TableBody>
        </Table>
    </div>
     <AlertDialog open={!!requestToDelete} onOpenChange={(open) => !open && setRequestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این درخواست مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
                این عمل غیرقابل بازگشت است و درخواست برای همیشه حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequestToDelete(null)}>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRequest}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


export default function AdminRequestsPage() {
    const firestore = useFirestore();
    const registrationRequestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('registrationStatus', '==', 'pending'));
    }, [firestore]);

    const { data: registrationRequests } = useCollection(registrationRequestsQuery);
    const registrationCount = registrationRequests?.length || 0;

  return (
    <Card>
      <CardHeader className="text-right">
        <CardTitle>بررسی درخواست‌ها</CardTitle>
        <CardDescription>درخواست‌های ثبت‌نام و سایر درخواست‌های دانش‌آموزان را مدیریت کنید.</CardDescription>
      </CardHeader>
      <CardContent>
          <Tabs defaultValue="registrations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="registrations">
                    <UserPlus className="ml-2 h-4 w-4" />
                    <span>درخواست‌های ثبت‌نام</span>
                    {registrationCount > 0 && <Badge className="mr-2">{registrationCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="other">
                     <History className="ml-2 h-4 w-4" />
                     سایر درخواست‌ها
                </TabsTrigger>
            </TabsList>
            <TabsContent value="registrations" className="mt-6">
                <RegistrationRequests />
            </TabsContent>
            <TabsContent value="other" className="mt-6">
                <DateChangeRequests />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
