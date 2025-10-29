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

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin?: boolean;
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
                {userProfile?.isAdmin ? <AdminNav /> : <StudentNav />}
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="justify-end">
                        <span>خروج</span>
                        <LogOut className="mr-2 h-4 w-4" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </SidebarHeader>
        </Sidebar>
        <main className="flex-1">
          <header className="flex items-center justify-between p-4 border-b h-16">
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

function StudentNav() {
    const pathname = usePathname();
    return (
        <>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="داشبورد" isActive={pathname.startsWith('/dashboard')}>
                    <Link href="/dashboard"><span>داشبورد</span><Home /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="گزارش روزانه" isActive={pathname.startsWith('/daily-report')}>
                    <Link href="/daily-report"><span>گزارش روزانه</span><ClipboardEdit /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="پایش روزانه" isActive={pathname.startsWith('/daily-monitoring')}>
                    <Link href="/daily-monitoring"><span>پایش روزانه</span><ShieldCheck /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="گزارش هفتگی" isActive={pathname.startsWith('/weekly-report')}>
                    <Link href="/weekly-report"><span>گزارش هفتگی</span><ClipboardPlus /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="تحلیل آزمون" isActive={pathname.startsWith('/test-analysis')}>
                    <Link href="/test-analysis"><span>تحلیل آزمون</span><ClipboardCheckIcon /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="تحلیل آزمون جامع" isActive={pathname.startsWith('/comprehensive-test-analysis')}>
                    <Link href="/comprehensive-test-analysis"><span>تحلیل آزمون جامع</span><ClipboardCheckIcon /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="سرمایه زمانی" isActive={pathname.startsWith('/topic-investment')}>
                    <Link href="/topic-investment"><span>سرمایه زمانی</span><Crosshair /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="نردبان تمرکز" isActive={pathname.startsWith('/focus-ladder')}>
                    <Link href="/focus-ladder"><span>نردبان تمرکز</span><TrendingUp /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="خودارزیابی" isActive={pathname.startsWith('/self-assessment')}>
                    <Link href="/self-assessment"><span>خودارزیابی</span><ClipboardList /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="برنامه تحصیلی" isActive={pathname.startsWith('/academic-plan')}>
                    <Link href="/academic-plan"><span>برنامه تحصیلی</span><CalendarCheck /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="پروفایل" isActive={pathname.startsWith('/profile')}>
                    <Link href="/profile"><span>پروفایل</span><User /></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
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
              <Link href="/admin/permissions" className="justify-end">
                <span>دسترسی‌ها</span>
                <ShieldCheck className="mr-2 h-4 w-4" />
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
            <Link href="/admin/strategic-plan" className="justify-end">
              <span>برنامه راهبردی</span>
              <Compass className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem asChild>
            <Link href="/admin/consulting" className="justify-end">
              <span>مطالب مشاوره‌ای</span>
              <BookOpen className="mr-2 h-4 w-4" />
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
          <SidebarMenuSubItem asChild>
            <Link href="/admin/settings" className="justify-end">
              <span>تنظیمات</span>
              <Settings className="mr-2 h-4 w-4" />
            </Link>
          </SidebarMenuSubItem>
        </SidebarMenuSubContent>
      </SidebarMenuSub>
    </>
  );
}

    


