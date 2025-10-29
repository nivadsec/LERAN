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

  if (isLoading) {
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

  if (!user) {
    router.replace('/login');
    return null;
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
            <SidebarMenu>
              {userProfile?.isAdmin ? <AdminNav /> : <StudentNav />}
            </SidebarMenu>
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
                    <Link href="/admin/dashboard"><Home /><span>داشبورد</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="مدیریت کاربران">
                    <Link href="/admin/users"><Users /><span>مدیریت کاربران</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="پروفایل">
                    <Link href="/admin/profile"><User /><span>پروفایل</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </>
    )
}
