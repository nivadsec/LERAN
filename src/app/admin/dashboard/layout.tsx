'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubContent,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Home,
  User,
  ClipboardList,
  CalendarCheck,
  Users,
  LogOut,
  ChevronDown,
  ShieldCheck,
  HelpCircle,
  ThumbsUp,
  MessageSquare,
  Megaphone,
  FileText,
  Compass,
  BookOpen,
  Calendar as CalendarIcon,
  Bot,
  History,
  Settings,
  Users2,
  Contact,
  Library,
  Wrench,
  PanelLeft,
  ClipboardEdit,
  ClipboardPlus,
  Crosshair,
  ClipboardCheck as ClipboardCheckIcon,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Video,
  PenSquare,
  CalendarClock,
  Bed,
  Newspaper,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type featureList } from '@/app/admin/users/page';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin?: boolean;
  features?: Record<typeof featureList[number]['id'], boolean>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout Error: ', error);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-primary animate-spin"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 8"
              />
            </svg>
            <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    if (firstName) {
      return firstName.charAt(0);
    }
    if (lastName) {
      return lastName.charAt(0);
    }
    return 'U';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar side="right" variant="sidebar" collapsible="icon">
          <SidebarHeader className="items-center justify-center border-b border-sidebar-border">
             <Link href="/" className="flex items-center justify-center" prefetch={false}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                >
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="ml-2 text-2xl font-bold font-headline text-primary group-data-[collapsible=icon]:hidden">
                آی‌تاک
                </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex-1 p-2">
            <ScrollArea className="h-full">
              <SidebarMenu>
                {userProfile?.isAdmin ? <AdminNav /> : <StudentNav features={userProfile?.features}/>}
              </SidebarMenu>
            </ScrollArea>
          </SidebarContent>
          <SidebarHeader className="border-t border-sidebar-border p-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto text-right">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={user.photoURL || ''} alt="User avatar" />
                       <AvatarFallback>{getInitials(userProfile?.firstName, userProfile?.lastName)}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden text-right">
                        <span className="text-sm font-medium">
                        {userProfile?.firstName} {userProfile?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                    <DropdownMenuLabel className="text-right">{userProfile?.firstName} {userProfile?.lastName}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                         <Link href={userProfile?.isAdmin ? "/admin/profile" : "/profile"} className="justify-end">
                            <span>پروفایل</span>
                            <User className="mr-2 h-4 w-4" />
                        </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                         <Link href={userProfile?.isAdmin ? "/admin/settings" : "/settings"} className="justify-end">
                            <span>تنظیمات</span>
                            <Settings className="mr-2 h-4 w-4" />
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="justify-end text-red-500 focus:text-red-500">
                        <span>خروج</span>
                        <LogOut className="mr-2 h-4 w-4" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </SidebarHeader>
        </Sidebar>
        <main className="flex-1">
          <header className="flex items-center justify-between p-4 border-b h-16 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
             <h1 className="text-xl font-semibold">
                {userProfile?.isAdmin ? 'پنل مدیریت' : `پنل ${userProfile?.firstName || 'دانش‌آموز'}`}
            </h1>
            <SidebarTrigger className="md:hidden" >
                <PanelLeft className="rotate-180"/>
            </SidebarTrigger>
          </header>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function StudentNav({ features }: { features?: UserProfile['features'] }) {
    const pathname = usePathname();

    const menuConfig = [
        { id: 'dashboard', href: '/dashboard', label: 'داشبورد', icon: Home },
        {
            id: 'reports', label: 'گزارش‌ها', icon: ClipboardList, subItems: [
                { id: 'daily-report', href: '/daily-report', label: 'گزارش روزانه', icon: ClipboardEdit },
                { id: 'daily-monitoring', href: '/daily-monitoring', label: 'پایش روزانه', icon: ShieldCheck },
                { id: 'weekly-report', href: '/weekly-report', label: 'گزارش هفتگی', icon: ClipboardPlus },
            ]
        },
        {
            id: 'analysis', label: 'تحلیل و برنامه‌ریزی', icon: Sparkles, subItems: [
                { id: 'test-analysis', href: '/test-analysis', label: 'تحلیل آزمون', icon: ClipboardCheckIcon },
                { id: 'comprehensive-test-analysis', href: '/comprehensive-test-analysis', label: 'تحلیل آزمون جامع', icon: GraduationCap },
                { id: 'topic-investment', href: '/topic-investment', label: 'سرمایه زمانی', icon: Crosshair },
                { id: 'focus-ladder', href: '/focus-ladder', label: 'نردبان تمرکز', icon: TrendingUp },
                { id: 'self-assessment', href: '/self-assessment', label: 'خودارزیابی هوشمند', icon: Bot },
                { id: 'sleep-system-design', href: '/sleep-system-design', label: 'طراحی سیستم خواب', icon: Bed },
            ]
        },
        {
            id: 'content', label: 'محتوا و ارتباطات', icon: BookOpen, subItems: [
                { id: 'qna', href: '/qna', label: 'پرسش و پاسخ', icon: HelpCircle },
                { id: 'consulting-content', href: '/consulting-content', label: 'مطالب مشاوره‌ای', icon: Library },
                { id: 'recommendations', href: '/recommendations', label: 'توصیه‌ها', icon: ThumbsUp },
                { id: 'surveys', href: '/surveys', label: 'پرسشنامه‌ها', icon: FileText },
            ]
        },
        { id: 'review-calendar', href: '/review-calendar', label: 'تقویم مرور', icon: CalendarClock },
        { id: 'online-class', href: '/online-class', label: 'کلاس آنلاین', icon: Video },
        { id: 'online-tests', href: '/online-tests', label: 'آزمون آنلاین', icon: PenSquare },
        { id: 'class-schedule', href: '/class-schedule', label: 'برنامه کلاسی', icon: CalendarIcon },
    ];

    if (!features) {
        return (
            <>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="داشبورد" isActive={pathname === ('/dashboard')}>
                        <Link href="/dashboard"><span>داشبورد</span><Home /></Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </>
        )
    }

    return (
        <>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="داشبورد" isActive={pathname === ('/dashboard')}>
                    <Link href="/dashboard"><span>داشبورد</span><Home /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            
            {(features['daily-report'] || features['daily-monitoring'] || features['weekly-report']) && (
                 <SidebarMenuSub>
                    <SidebarMenuSubButton tooltip="گزارش‌ها">
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:-rotate-180" />
                        <span>گزارش‌ها</span>
                        <ClipboardList />
                    </SidebarMenuSubButton>
                    <SidebarMenuSubContent>
                        {features['daily-report'] && <SidebarMenuSubItem asChild><Link href="/daily-report" className="justify-end"><span>گزارش روزانه</span><ClipboardEdit className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                        {features['daily-monitoring'] && <SidebarMenuSubItem asChild><Link href="/daily-monitoring" className="justify-end"><span>پایش روزانه</span><ShieldCheck className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                        {features['weekly-report'] && <SidebarMenuSubItem asChild><Link href="/weekly-report" className="justify-end"><span>گزارش هفتگی</span><ClipboardPlus className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                    </SidebarMenuSubContent>
                </SidebarMenuSub>
            )}

            {(features['test-analysis'] || features['comprehensive-test-analysis'] || features['topic-investment'] || features['focus-ladder'] || features['self-assessment'] || features['sleep-system-design']) && (
                <SidebarMenuSub>
                    <SidebarMenuSubButton tooltip="تحلیل و برنامه‌ریزی">
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:-rotate-180" />
                        <span>تحلیل و برنامه‌ریزی</span>
                        <Sparkles />
                    </SidebarMenuSubButton>
                    <SidebarMenuSubContent>
                        {features['test-analysis'] && <SidebarMenuSubItem asChild><Link href="/test-analysis" className="justify-end"><span>تحلیل آزمون</span><ClipboardCheckIcon className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                        {features['comprehensive-test-analysis'] && <SidebarMenuSubItem asChild><Link href="/comprehensive-test-analysis" className="justify-end"><span>تحلیل آزمون جامع</span><GraduationCap className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                        {features['topic-investment'] && <SidebarMenuSubItem asChild><Link href="/topic-investment" className="justify-end"><span>سرمایه زمانی</span><Crosshair className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                        {features['focus-ladder'] && <SidebarMenuSubItem asChild><Link href="/focus-ladder" className="justify-end"><span>نردبان تمرکز</span><TrendingUp className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                        {features['self-assessment'] && <SidebarMenuSubItem asChild><Link href="/self-assessment" className="justify-end"><span>خودارزیابی هوشمند</span><Bot className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                        {features['sleep-system-design'] && <SidebarMenuSubItem asChild><Link href="/sleep-system-design" className="justify-end"><span>طراحی سیستم خواب</span><Bed className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                    </SidebarMenuSubContent>
                </SidebarMenuSub>
            )}

            {(features['qna'] || features['consulting-content'] || features['recommendations'] || features['surveys']) && (
                <SidebarMenuSub>
                    <SidebarMenuSubButton tooltip="محتوا و ارتباطات">
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:-rotate-180" />
                        <span>محتوا و ارتباطات</span>
                        <BookOpen />
                    </SidebarMenuSubButton>
                    <SidebarMenuSubContent>
                        {features['qna'] && <SidebarMenuSubItem asChild><Link href="/qna" className="justify-end"><span>پرسش و پاسخ</span><HelpCircle className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                        {features['consulting-content'] && <SidebarMenuSubItem asChild><Link href="/consulting-content" className="justify-end"><span>مطالب مشاوره‌ای</span><Library className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                        {features['recommendations'] && <SidebarMenuSubItem asChild><Link href="/recommendations" className="justify-end"><span>توصیه‌ها</span><ThumbsUp className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                        {features['surveys'] && <SidebarMenuSubItem asChild><Link href="/surveys" className="justify-end"><span>پرسشنامه‌ها</span><FileText className="mr-2 h-4 w-4" /></Link></SidebarMenuSubItem>}
                    </SidebarMenuSubContent>
                </SidebarMenuSub>
            )}
            
            {features['review-calendar'] && <SidebarMenuItem><SidebarMenuButton asChild tooltip="تقویم مرور" isActive={pathname.startsWith('/review-calendar')}><Link href="/review-calendar"><span>تقویم مرور</span><CalendarClock /></Link></SidebarMenuButton></SidebarMenuItem>}
            {features['online-class'] && <SidebarMenuItem><SidebarMenuButton asChild tooltip="کلاس آنلاین" isActive={pathname.startsWith('/online-class')}><Link href="/online-class"><span>کلاس آنلاین</span><Video /></Link></SidebarMenuButton></SidebarMenuItem>}
            {features['online-tests'] && <SidebarMenuItem><SidebarMenuButton asChild tooltip="آزمون آنلاین" isActive={pathname.startsWith('/online-tests')}><Link href="/online-tests"><span>آزمون آنلاین</span><PenSquare /></Link></SidebarMenuButton></SidebarMenuItem>}
            {features['class-schedule'] && <SidebarMenuItem><SidebarMenuButton asChild tooltip="برنامه کلاسی" isActive={pathname.startsWith('/class-schedule')}><Link href="/class-schedule"><span>برنامه کلاسی</span><CalendarIcon /></Link></SidebarMenuButton></SidebarMenuItem>}
        </>
    )
}

function AdminNav() {
  const pathname = usePathname();
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="داشبورد" isActive={pathname === '/admin/dashboard'}>
          <Link href="/admin/dashboard">
             <span>داشبورد</span>
            <Home />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuSub>
        <SidebarMenuSubButton tooltip="مدیریت اصلی">
          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:-rotate-180" />
          <span>مدیریت اصلی</span>
          <Users2 />
        </SidebarMenuSubButton>
        <SidebarMenuSubContent>
            <SidebarMenuSubItem asChild>
              <Link href="/admin/users" className="justify-end">
                <span>دانش‌آموزان</span>
                <Users className="mr-2 h-4 w-4" />
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem asChild>
              <Link href="/admin/requests" className="justify-end">
                <span>بررسی درخواست‌ها</span>
                <ClipboardCheckIcon className="mr-2 h-4 w-4" />
              </Link>
            </SidebarMenuSubItem>
        </SidebarMenuSubContent>
      </SidebarMenuSub>

      <SidebarMenuSub>
        <SidebarMenuSubButton tooltip="ارتباطات">
           <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:-rotate-180" />
           <span>ارتباطات</span>
           <Contact />
        </SidebarMenuSubButton>
        <SidebarMenuSubContent>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/qna" className="justify-end">
              <span>پرسش و پاسخ</span>
              <HelpCircle className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/recommendations" className="justify-end">
              <span>توصیه‌ها</span>
              <ThumbsUp className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/messages" className="justify-end">
              <span>پیام‌ها</span>
              <MessageSquare className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/announcements" className="justify-end">
              <span>اطلاعیه‌ها</span>
              <Megaphone className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
        </SidebarMenuSubContent>
      </SidebarMenuSub>

      <SidebarMenuSub>
        <SidebarMenuSubButton tooltip="محتوای آموزشی">
           <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:-rotate-180" />
           <span>محتوای آموزشی</span>
           <Library />
        </SidebarMenuSubButton>
        <SidebarMenuSubContent>
           <SidebarMenuSubItem asChild>
            <Link href="/admin/consulting" className="justify-end">
              <span>مطالب مشاوره‌ای</span>
              <BookOpen className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/articles" className="justify-end">
                <span>مقالات</span>
                <Newspaper className="mr-2 h-4 w-4" />
            </Link>
           </SidebarMenuSubItem>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/online-tests" className="justify-end">
              <span>آزمون‌های آنلاین</span>
              <FileText className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/surveys" className="justify-end">
              <span>پرسشنامه‌ها</span>
              <ClipboardList className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
           <SidebarMenuSubItem asChild>
            <Link href="/admin/online-class" className="justify-end">
              <span>کلاس آنلاین</span>
              <Video className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/strategic-plan" className="justify-end">
              <span>برنامه راهبردی</span>
              <Compass className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
        </SidebarMenuSubContent>
      </SidebarMenuSub>

      <SidebarMenuSub>
        <SidebarMenuSubButton tooltip="ابزارها و تنظیمات">
           <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:-rotate-180" />
           <span>ابزارها و تنظیمات</span>
           <Wrench />
        </SidebarMenuSubButton>
        <SidebarMenuSubContent>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/class-schedule" className="justify-end">
              <span>برنامه کلاسی</span>
              <CalendarIcon className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/smart-bot" className="justify-end">
              <span>ربات هوشمند</span>
              <Bot className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/login-history" className="justify-end">
              <span>تاریخچه ورود</span>
              <History className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
        </SidebarMenuSubContent>
      </SidebarMenuSub>
    </>
  );
}

    