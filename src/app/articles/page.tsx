'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns-jalali';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  createdAt: Timestamp;
}

const heroStudentImage = PlaceHolderImages.find(p => p.id === 'hero-student');
const defaultImageUrl = heroStudentImage ? heroStudentImage.imageUrl : 'https://picsum.photos/seed/1/600/400';

export default function ArticlesListPage() {
  const firestore = useFirestore();
  const articlesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'articles'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: articles, isLoading } = useCollection<Article>(articlesQuery);

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-6xl py-12 px-4">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline flex items-center gap-3">
              <Newspaper className="h-10 w-10 text-primary" />
              مقالات آی‌تاک
            </h1>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              مجموعه‌ای از مطالب آموزشی و مشاوره‌ای برای کمک به موفقیت تحصیلی شما.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full mt-2" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardContent>
                </Card>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden group flex flex-col">
                <Link href={`/articles/${article.slug}`} className="block">
                  <div className="aspect-video w-full overflow-hidden">
                    <Image
                      src={article.imageUrl || defaultImageUrl}
                      width={600}
                      height={400}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </Link>
                <CardHeader>
                  <Link href={`/articles/${article.slug}`} className="block">
                    <CardTitle className="text-lg font-bold hover:text-primary transition-colors">{article.title}</CardTitle>
                  </Link>
                  <p className="text-xs text-muted-foreground pt-1">
                    {article.createdAt ? format(new Date(article.createdAt.seconds * 1000), 'd MMMM yyyy') : ''}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.content.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p>در حال حاضر مقاله‌ای برای نمایش وجود ندارد.</p>
          </div>
        )}
      </div>
    </div>
  );
}
