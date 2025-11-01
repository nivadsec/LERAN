'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns-jalali';
import { Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  createdAt: { seconds: number; nanoseconds: number };
}

const heroStudentImage = PlaceHolderImages.find(p => p.id === 'hero-student');
const defaultImageUrl = heroStudentImage ? heroStudentImage.imageUrl : 'https://picsum.photos/seed/1/1200/800';

export default function ArticlePage() {
  const params = useParams();
  const { slug } = params;
  const firestore = useFirestore();

  const articleQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return query(collection(firestore, 'articles'), where('slug', '==', slug), limit(1));
  }, [firestore, slug]);

  const { data: articles, isLoading } = useCollection<Article>(articleQuery);
  const article = articles?.[0];

  if (isLoading) {
    return <ArticleSkeleton />;
  }

  if (!article) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4 text-center">
        <Card>
            <CardHeader>
                <CardTitle>مقاله یافت نشد</CardTitle>
            </CardHeader>
            <CardContent>
                <p>متاسفانه مقاله‌ای با این آدرس وجود ندارد.</p>
                 <Button asChild className="mt-6">
                    <Link href="/">بازگشت به صفحه اصلی</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  const formattedDate = article.createdAt ? format(new Date(article.createdAt.seconds * 1000), 'd MMMM yyyy') : '';

  return (
    <div className="bg-background">
        <div className="container mx-auto max-w-4xl py-12 px-4">
        <article className="space-y-8">
            <div className="space-y-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline text-right">{article.title}</h1>
             <div className="flex items-center justify-center gap-x-6 gap-y-2 text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={new Date(article.createdAt.seconds * 1000).toISOString()}>
                        {formattedDate}
                    </time>
                </div>
            </div>
            </div>

            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                <Image
                    src={article.imageUrl || defaultImageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                />
            </div>
            
            <div
            className="prose prose-lg dark:prose-invert max-w-full mx-auto text-right text-foreground leading-loose"
            dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
            />
            
             <div className="text-center pt-8">
                <Button asChild>
                    <Link href="/">بازگشت به صفحه اصلی</Link>
                </Button>
            </div>
        </article>
        </div>
    </div>
  );
}


function ArticleSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <div className="flex items-center justify-center gap-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <Skeleton className="w-full aspect-video rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <br />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-11/12" />
        </div>
      </div>
    </div>
  );
}
