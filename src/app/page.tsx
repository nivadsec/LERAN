import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpenCheck,
  BrainCircuit,
  ListChecks,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const heroImage = PlaceHolderImages.find(
  (image) => image.id === 'hero-student'
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <Link
        href="#"
        className="flex items-center justify-center"
        prefetch={false}
      >
        <BookOpenCheck className="h-6 w-6 text-primary" />
        <span className="mr-2 text-xl font-bold font-headline text-primary">
          آی‌تاک
        </span>
      </Link>
      <nav className="mr-auto flex items-center gap-4 sm:gap-6">
        <Button variant="ghost" asChild>
          <Link href="/login">ورود</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">ثبت‌نام</Link>
        </Button>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="w-full pt-12 md:pt-24 lg:pt-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                پلتفرم هوشمند خودارزیابی و نظم شخصی
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                مسیر موفقیت تحصیلی خود را با آی‌تاک هوشمندانه طی کنید.
              </p>
              <p className="max-w-[600px] text-muted-foreground/80 md:text-lg">
                آی‌تاک با ابزارهای هوشمند و تحلیل داده، به شما کمک می‌کند تا نقاط
                ضعف و قوت خود را بشناسید، برنامه‌ریزی دقیقی داشته باشید و به
                اهداف تحصیلی خود برسید.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="shadow-lg">
                <Link href="/signup">شروع کنید</Link>
              </Button>
            </div>
          </div>
          {heroImage && (
            <div className="relative rounded-xl shadow-2xl">
              <Image
                src={heroImage.imageUrl}
                width={600}
                height={400}
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              ابزارهای هوشمند برای موفقیت شما
            </h2>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none">
          <FeatureCard
            icon={<BrainCircuit className="h-10 w-10 text-accent" />}
            title="خودارزیابی هوشمند"
            description="نقاط قوت و ضعف خود را با تحلیل هوش مصنوعی بشناسید و یک برنامه موفقیت شخصی‌سازی شده دریافت کنید."
          />
          <FeatureCard
            icon={<ListChecks className="h-10 w-10 text-accent" />}
            title="برنامه‌ریزی شخصی‌سازی شده"
            description="بر اساس ارزیابی و اهداف خود، یک برنامه درسی دقیق و تعاملی با کمک هوش مصنوعی ایجاد کنید."
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-accent" />}
            title="پیگیری پیشرفت"
            description="پیشرفت خود را در طول زمان دنبال کنید و بازخوردهای بصری برای حفظ انگیزه و حرکت در مسیر درست دریافت کنید."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      <CardHeader className="flex flex-col items-center text-center pb-4">
        <div className="mb-4 rounded-full bg-accent/10 p-4">{icon}</div>
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t mt-12">
      <p className="text-xs text-muted-foreground">
        © 1404 آی‌تاک. تمام حقوق محفوظ است.
      </p>
      <nav className="sm:mr-auto flex gap-4 sm:gap-6">
        <p className="text-xs text-muted-foreground">
          طراحی و توسعه توسط حسین طاهری
        </p>
      </nav>
    </footer>
  );
}
