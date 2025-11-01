import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

interface Article {
    id: string;
    slug: string;
    title: string;
    content: string;
    imageUrl: string;
    author: string;
    createdAt: any;
}


async function getLatestArticles(): Promise<Article[]> {
    try {
        const { firestore } = initializeFirebase();
        const articlesRef = collection(firestore, 'articles');
        const q = query(articlesRef, orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    } catch (error) {
        console.error("Error fetching articles: ", error);
        return [];
    }
}

export default async function Home() {
  const articles = await getLatestArticles();

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div
        className="absolute inset-0 w-full h-full bg-repeat"
        style={{
          backgroundImage:
            'linear-gradient(rgba(180, 180, 180, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(180, 180, 180, 0.3) 1px, transparent 1px)',
          backgroundSize: '2rem 2rem',
        }}
      ></div>
      <Header />
      <main className="flex-1 relative">
        <HeroSection />
        {articles.length > 0 && <ArticlesSection articles={articles} />}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-transparent backdrop-blur-sm sticky top-0 z-50 justify-between">
      <div className="hidden md:flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/login">ورود</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">ثبت‌نام</Link>
        </Button>
      </div>
       <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">باز کردن منو</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-4 py-6">
               <Link href="/" className="flex items-center justify-center mb-6" prefetch={false}>
                 <Logo/>
               </Link>
              <Button variant="ghost" asChild>
                <Link href="/login">ورود</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">ثبت‌نام</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <Link
        href="#"
        className="flex items-center justify-center"
        prefetch={false}
      >
       <Logo/>
      </Link>
    </header>
  );
}

function Logo() {
    return (
        <>
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                >
                <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="ml-2 text-xl font-bold font-headline text-primary">
            آی‌تاک
            </span>
        </>
    )
}

function HeroSection() {
  return (
    <section className="w-full pt-12 md:pt-24 lg:pt-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Badge
            variant="outline"
            className="bg-accent/10 border-accent/20 text-accent"
          >
            پلتفرم هوشمند خودارزیابی و نظم شخصی
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
              مسیر موفقیت تحصیلی خود را با
              <br />
              آی‌تاک هوشمندانه طی کنید
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              آی‌تاک با ابزارهای هوشمند و تحلیل داده، به شما کمک می‌کند تا نقاط
              ضعف و قوت خود را بشناسید، برنامه‌ریزی دقیقی داشته باشید و به اهداف
              تحصیلی خود برسید.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/signup">
                شروع کنید
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticlesSection({ articles }: { articles: Article[] }) {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                         <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline flex items-center gap-3">
                            <Newspaper className="h-8 w-8 text-primary" />
                            آخرین مقالات
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            مطالب آموزشی و مشاوره‌ای برای کمک به موفقیت تحصیلی شما.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                    {articles.map((article) => (
                        <Card key={article.id} className="overflow-hidden group">
                            <Link href={`/articles/${article.slug}`} className="block">
                                <Image
                                    src={article.imageUrl || "https://picsum.photos/seed/1/600/400"}
                                    width={600}
                                    height={400}
                                    alt={article.title}
                                    className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                                />
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">{article.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {article.content.substring(0, 150)}...
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
                <div className="flex justify-center">
                    <Button variant="outline" asChild>
                        <Link href="/articles">مشاهده همه مقالات</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

function Footer() {
  return (
    <footer className="relative flex justify-center py-6 w-full shrink-0 items-center px-4 md:px-6 z-10">
      <p className="text-xs text-muted-foreground">
        © 1404 آی‌تاک. تمام حقوق محفوظ است. | طراحی و توسعه توسط حسین طاهری
      </p>
    </footer>
  );
}

    