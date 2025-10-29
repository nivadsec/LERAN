import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Home() {
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

function Footer() {
  return (
    <footer className="relative flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 z-10">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-800 text-white font-bold text-lg">
        N
      </div>
      <p className="flex-1 text-center text-xs text-muted-foreground">
        © 1404 آی‌تاک. تمام حقوق محفوظ است. | طراحی و توسعه توسط حسین طاهری
      </p>
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-500 text-black font-bold text-lg">
        V
      </div>
    </footer>
  );
}
