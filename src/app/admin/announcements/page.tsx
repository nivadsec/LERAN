'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Megaphone, PlusCircle, Trash2, FileEdit } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, deleteDoc, doc, serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { AnnouncementForm, type AnnouncementSchema } from './announcement-form';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns-jalali';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  targetAudience: 'all' | 'students' | 'teachers';
}

export default function AdminAnnouncementsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const announcementsRef = useMemoFirebase(() => collection(firestore, 'announcements'), [firestore]);
  const { data: announcements, isLoading } = useCollection<Announcement>(announcementsRef);

  const handleCreate = (data: AnnouncementSchema) => {
    const payload = {
        ...data,
        createdAt: serverTimestamp(),
    };

    addDoc(announcementsRef, payload)
      .then(() => {
        toast({ title: 'موفقیت', description: 'اطلاعیه با موفقیت ایجاد شد.' });
        setCreateDialogOpen(false);
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          path: announcementsRef.path,
          operation: 'create',
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  };

  const handleEdit = (data: AnnouncementSchema) => {
    if (!selectedAnnouncement) return;

    const docRef = doc(firestore, 'announcements', selectedAnnouncement.id);
    const payload = { ...data };

    updateDoc(docRef, payload)
      .then(() => {
        toast({ title: 'موفقیت', description: 'اطلاعیه با موفقیت ویرایش شد.' });
        setEditDialogOpen(false);
        setSelectedAnnouncement(null);
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  };

  const handleDelete = (announcementId: string) => {
    const docRef = doc(firestore, 'announcements', announcementId);
    
    deleteDoc(docRef)
        .then(() => {
            toast({ title: 'موفقیت', description: 'اطلاعیه با موفقیت حذف شد.' });
        })
        .catch((error) => {
            const contextualError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', contextualError);
        });
  };
  
  const formatDate = (timestamp: Announcement['createdAt']) => {
    if (!timestamp) return 'نامشخص';
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'yyyy/MM/dd HH:mm');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-right">
          <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  اطلاعیه جدید
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader className="text-right">
                  <DialogTitle>ارسال اطلاعیه عمومی</DialogTitle>
                  <DialogDescription>این اطلاعیه برای کاربران مشخص شده نمایش داده می‌شود.</DialogDescription>
                </DialogHeader>
                <AnnouncementForm onSubmit={handleCreate} />
              </DialogContent>
            </Dialog>
            <div className="text-right">
              <CardTitle>مدیریت اطلاعیه‌ها</CardTitle>
              <CardDescription>اطلاعیه‌های عمومی را ویرایش، حذف یا یک مورد جدید ایجاد کنید.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
          ) : announcements && announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <Card key={ann.id} className="flex flex-col sm:flex-row items-start justify-between p-4 gap-4">
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>آیا از حذف اطلاعیه مطمئن هستید؟</AlertDialogTitle>
                          <AlertDialogDescription>این عمل غیرقابل بازگشت است. اطلاعیه برای همیشه حذف خواهد شد.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>انصراف</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(ann.id)}>حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedAnnouncement(ann);
                      setEditDialogOpen(true);
                    }}>
                      <FileEdit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-bold">{ann.title}</p>
                    <p className="text-sm mt-1">{ann.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(ann.createdAt)}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Megaphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold">هیچ اطلاعیه‌ای یافت نشد</p>
              <p className="text-sm text-muted-foreground">برای ایجاد اولین اطلاعیه، روی دکمه "اطلاعیه جدید" کلیک کنید.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          if (!open) setSelectedAnnouncement(null);
          setEditDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-right">
            <DialogTitle>ویرایش اطلاعیه</DialogTitle>
            <DialogDescription>متن و هدف اطلاعیه را ویرایش کنید.</DialogDescription>
          </DialogHeader>
          <AnnouncementForm onSubmit={handleEdit} defaultValues={selectedAnnouncement || undefined} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
