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
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Wrench
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
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
                  <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
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
                    <DropdownMenuLabel>{userProfile?.firstName} {userProfile?.lastName}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                         <Link href={userProfile?.isAdmin ? "/admin/profile" : "/profile"}>
                            <User className="ml-2 h-4 w-4" />
                            <span>پروفایل</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="ml-2 h-4 w-4" />
                        <span>خروج</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </SidebarHeader>
        </Sidebar>
        <main className="flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger className="md:hidden" />
             <h1 className="text-xl font-semibold">
                {userProfile?.isAdmin ? 'پنل مدیریت' : 'پنل دانش‌آموزی'}
            </h1>
            <div></div>
          </header>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function StudentNav() {
    return (
        <>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="داشبورد">
                    <Link href="/dashboard"><Home /><span>داشبورد</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="خودارزیابی">
                    <Link href="/self-assessment"><ClipboardList /><span>خودارزیابی</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="برنامه تحصیلی">
                    <Link href="/academic-plan"><CalendarCheck /><span>برنامه تحصیلی</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="پروفایل">
                    <Link href="/profile"><User /><span>پروفایل</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </>
    )
}

function AdminNav() {
    return (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="داشبورد">
            <Link href="/admin/dashboard">
              <Home />
              <span>داشبورد</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
  
        <SidebarMenuSub>
          <SidebarMenuSubButton tooltip="مدیریت اصلی">
            <Users2 />
            <span>مدیریت اصلی</span>
          </SidebarMenuSubButton>
          <ul className='space-y-1'>
            <SidebarMenuSubItem>
              <Link href="/admin/users" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <Users className="ml-2 h-4 w-4" />
                <span>دانش‌آموزان</span>
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Link href="/admin/permissions" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <ShieldCheck className="ml-2 h-4 w-4" />
                <span>دسترسی‌ها</span>
              </Link>
            </SidebarMenuSubItem>
          </ul>
        </SidebarMenuSub>
  
        <SidebarMenuSub>
          <SidebarMenuSubButton tooltip="ارتباطات">
            <Contact />
            <span>ارتباطات</span>
          </SidebarMenuSubButton>
           <ul className='space-y-1'>
            <SidebarMenuSubItem>
              <Link href="/admin/qna" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <HelpCircle className="ml-2 h-4 w-4" />
                <span>پرسش و پاسخ</span>
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Link href="/admin/recommendations" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <ThumbsUp className="ml-2 h-4 w-4" />
                <span>توصیه‌ها</span>
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Link href="/admin/messages" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <MessageSquare className="ml-2 h-4 w-4" />
                <span>پیام‌ها</span>
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Link href="/admin/announcements" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <Megaphone className="ml-2 h-4 w-4" />
                <span>اطلاعیه‌ها</span>
              </Link>
            </SidebarMenuSubItem>
          </ul>
        </SidebarMenuSub>
  
        <SidebarMenuSub>
          <SidebarMenuSubButton tooltip="محتوای آموزشی">
            <Library />
            <span>محتوای آموزشی</span>
          </SidebarMenuSubButton>
           <ul className='space-y-1'>
            <SidebarMenuSubItem>
              <Link href="/admin/online-tests" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <FileText className="ml-2 h-4 w-4" />
                <span>آزمون‌های آنلاین</span>
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Link href="/admin/surveys" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <ClipboardList className="ml-2 h-4 w-4" />
                <span>پرسشنامه‌ها</span>
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Link href="/admin/strategic-plan" className="flex items-center p2 text-sm rounded-md hover:bg-sidebar-accent">
                <Compass className="ml-2 h-4 w-4" />
                <span>برنامه راهبردی</span>
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Link href="/admin/consulting" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <BookOpen className="ml-2 h-4 w-4" />
                <span>مطالب مشاوره‌ای</span>
              </Link>
            </SidebarMenuSubItem>
          </ul>
        </SidebarMenuSub>
  
        <SidebarMenuSub>
          <SidebarMenuSubButton tooltip="ابزارها و تنظیمات">
            <Wrench />
            <span>ابزارها و تنظیمات</span>
          </SidebarMenuSubButton>
           <ul className='space-y-1'>
            <SidebarMenuSubItem>
              <Link href="/admin/class-schedule" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <CalendarIcon className="ml-2 h-4 w-4" />
                <span>برنامه کلاسی</span>
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Link href="/admin/smart-bot" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <Bot className="ml-2 h-4 w-4" />
                <span>ربات هوشمند</span>
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Link href="/admin/login-history" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <History className="ml-2 h-4 w-4" />
                <span>تاریخچه ورود</span>
              </Link>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Link href="/admin/settings" className="flex items-center p-2 text-sm rounded-md hover:bg-sidebar-accent">
                <Settings className="ml-2 h-4 w-4" />
                <span>تنظیمات</span>
              </Link>
            </SidebarMenuSubItem>
          </ul>
        </SidebarMenuSub>
      </>
    );
  }
  
