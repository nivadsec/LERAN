'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Newspaper, PlusCircle, Trash2, FileEdit } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, deleteDoc, doc, serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  imageUrl: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const articleSchema = z.object({
  title: z.string().min(5, { message: 'عنوان باید حداقل ۵ کاراکتر باشد.' }),
  slug: z.string().min(3, { message: 'اسلاگ باید حداقل ۳ کاراکتر باشد.' }).regex(/^[a-z0-9-]+$/, 'اسلاگ فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد.'),
  author: z.string().min(2, { message: 'نام نویسنده الزامی است.' }),
  imageUrl: z.string().url({ message: 'لطفاً یک آدرس تصویر معتبر وارد کنید.' }),
  content: z.string().min(50, { message: 'محتوای مقاله باید حداقل ۵۰ کاراکتر باشد.' }),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

function ArticleForm({ onSubmit, defaultValues, isSubmitting }: { onSubmit: (data: ArticleFormValues) => void; defaultValues?: Partial<Article>; isSubmitting: boolean }) {
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      slug: defaultValues?.slug || '',
      author: defaultValues?.author || '',
      imageUrl: defaultValues?.imageUrl || '',
      content: defaultValues?.content || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-right">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>عنوان مقاله</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem><FormLabel>اسلاگ (URL)</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="author" render={({ field }) => (
          <FormItem><FormLabel>نویسنده</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>آدرس تصویر</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem><FormLabel>محتوای مقاله</FormLabel><FormControl><Textarea className="min-h-[200px]" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره مقاله'}
          </Button>
        </div>
      </form>
    </Form>
  );
}


export default function AdminArticlesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  const articlesRef = useMemoFirebase(() => collection(firestore, 'articles'), [firestore]);
  const { data: articles, isLoading } = useCollection<Article>(articlesRef);

  const handleFormSubmit = (data: ArticleFormValues) => {
    setSubmitting(true);
    const payload = { ...data };
    const operation = selectedArticle ? 'update' : 'create';
    const docRef = selectedArticle ? doc(firestore, 'articles', selectedArticle.id) : collection(firestore, 'articles');
    
    const promise = selectedArticle
      ? updateDoc(docRef as any, payload)
      : addDoc(docRef as any, { ...payload, createdAt: serverTimestamp() });

    promise.then(() => {
      toast({ title: 'موفقیت', description: `مقاله با موفقیت ${selectedArticle ? 'ویرایش' : 'ایجاد'} شد.` });
      setDialogOpen(false);
      setSelectedArticle(null);
    }).catch(error => {
      const contextualError = new FirestorePermissionError({
        path: selectedArticle ? (docRef as any).path : (articlesRef as any).path,
        operation: operation as any,
        requestResourceData: payload,
      });
      errorEmitter.emit('permission-error', contextualError);
    }).finally(() => {
      setSubmitting(false);
    });
  };

  const openDeleteAlert = (articleId: string) => {
    setArticleToDelete(articleId);
    setDeleteAlertOpen(true);
  }

  const handleDelete = () => {
    if (!articleToDelete) return;
    const docRef = doc(firestore, 'articles', articleToDelete);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: 'موفقیت', description: 'مقاله با موفقیت حذف شد.' });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({ path: docRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', contextualError);
      });
    setArticleToDelete(null);
  };

  const openDialog = (article: Article | null = null) => {
    setSelectedArticle(article);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4 text-right">
          <Button onClick={() => openDialog()}>
            <PlusCircle className="ml-2 h-4 w-4" />
            مقاله جدید
          </Button>
          <div>
            <CardTitle>مدیریت مقالات</CardTitle>
            <CardDescription>مقالات سایت را ایجاد، ویرایش یا حذف کنید.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden">
                  <Image src={article.imageUrl} alt={article.title} width={400} height={250} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-right">{article.title}</h3>
                    <p className="text-sm text-muted-foreground text-right mt-1">{article.author}</p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => openDialog(article)}>
                        <FileEdit className="ml-1 h-4 w-4" /> ویرایش
                      </Button>
                       <Button variant="destructive" size="sm" onClick={() => openDeleteAlert(article.id)}>
                        <Trash2 className="ml-1 h-4 w-4" /> حذف
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground" />
              <p className="font-semibold">هنوز مقاله‌ای منتشر نشده است</p>
              <p className="text-sm text-muted-foreground">برای ایجاد اولین مقاله، روی دکمه "مقاله جدید" کلیک کنید.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setSelectedArticle(null); setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="text-right">
            <DialogTitle>{selectedArticle ? 'ویرایش مقاله' : 'ایجاد مقاله جدید'}</DialogTitle>
            <DialogDescription>اطلاعات مقاله را در فرم زیر وارد کنید.</DialogDescription>
          </DialogHeader>
          <ArticleForm onSubmit={handleFormSubmit} defaultValues={selectedArticle || undefined} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این مقاله مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>این عمل غیرقابل بازگشت است و مقاله برای همیشه حذف خواهد شد.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    