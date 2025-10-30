'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, PlusCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // These fields might not be on every student document, so they are optional
  avgStudyHours?: number; 
  avgFeeling?: number;
}

const studentSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است.'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است.'),
  email: z.string().email('ایمیل نامعتبر است.'),
  grade: z.string().min(1, 'پایه تحصیلی الزامی است.'),
  major: z.string().min(1, 'رشته تحصیلی الزامی است.'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.'),
  panelStatus: z.boolean(),
  features: z.record(z.boolean()),
});

export default function AdminUsersPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserOpen, setAddUserOpen] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{email: string, pass: string} | null>(null);


  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const { user: adminUser } = useUser();

  useEffect(() => {
    // A simple (and not very secure) way to keep admin credentials in memory
    // In a real-world app, you'd use a more secure session management or refresh token mechanism
    if (adminUser && adminUser.email) {
      const pass = sessionStorage.getItem('adminPass');
      if (pass) {
        setAdminCredentials({ email: adminUser.email, pass });
      }
    }
  }, [adminUser]);


  useEffect(() => {
    const fetchStudents = async () => {
      if (!firestore) return;
      setIsLoading(true);
      try {
        const studentsQuery = query(collection(firestore, 'users'), where('isAdmin', '!=', true));
        const querySnapshot = await getDocs(studentsQuery);
        const studentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        setAllStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
            variant: "destructive",
            title: "خطا در دریافت لیست دانش‌آموزان",
            description: "لطفاً از اتصال به اینترنت و قوانین دسترسی خود مطمئن شوید.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [firestore, toast]);

  const filteredStudents = allStudents?.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featureList = [
    { id: 'smart-bot', label: 'ربات هوشمند' },
    { id: 'daily-monitoring', label: 'پایش هوشمند روزانه' },
    { id: 'performance-stats', label: 'آمار عملکرد' },
    { id: 'class-schedule', label: 'برنامه کلاسی' },
    { id: 'online-tests', label: 'آزمون‌های آنلاین' },
    { id: 'surveys', label: 'پرسشنامه‌ها' },
    { id: 'daily-report', label: 'گزارش روزانه' },
    { id: 'weekly-report', label: 'گزارش هفتگی' },
    { id: 'test-analysis', label: 'تحلیل آزمون' },
    { id: 'overall-test-analysis', label: 'تحلیل کلی آزمون' },
    { id: 'test-checklist', label: 'چک‌لیست آزمون' },
    { id: 'focus-ladder', label: 'نردبان تمرکز' },
    { id: 'course-roadmap', label: 'روندنمای درسی' },
    { id: 'strategic-plans', label: 'برنامه‌های راهبردی' },
    { id: 'consulting-content', label: 'محتوای مشاوره‌ای' },
  ];

  const defaultFeatures = featureList.reduce((acc, feature) => {
    acc[feature.id] = true;
    return acc;
  }, {} as Record<string, boolean>);

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      grade: '',
      major: '',
      password: '',
      panelStatus: true,
      features: defaultFeatures,
    },
  });

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";
    let newPassword = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      newPassword += charset.charAt(Math.floor(Math.random() * n));
    }
    form.setValue('password', newPassword);
  };
  
  const onSubmit = async (values: z.infer<typeof studentSchema>) => {
    if (!auth || !firestore || !adminCredentials) {
        toast({
            variant: "destructive",
            title: "خطا",
            description: "سرویس احراز هویت در دسترس نیست یا شما وارد نشده‌اید.",
        });
        return;
    }
    
    try {
        // Create the new student user
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const newUser = userCredential.user;

        // Prepare student data for Firestore
        const studentData = {
            id: newUser.uid,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            grade: values.grade,
            major: values.major,
            panelStatus: values.panelStatus,
            features: values.features,
            signupDate: new Date().toISOString(),
            isAdmin: false,
        };

        // Save the student's data in Firestore
        await setDoc(doc(firestore, "users", newUser.uid), studentData);

        // Add new student to the local state to update UI immediately
        setAllStudents(prev => [...prev, {
            id: newUser.uid,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
        }]);

        toast({
            title: "دانش‌آموز با موفقیت ایجاد شد!",
            description: `حساب کاربری برای ${values.firstName} ${values.lastName} ایجاد شد.`,
        });

        form.reset();
        setAddUserOpen(false);

    } catch (error: any) {
        console.error("Error creating user:", error);
        let errorMessage = "مشکلی در هنگام ایجاد کاربر رخ داد.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "این ایمیل قبلاً در سیستم ثبت شده است.";
        }
        toast({
            variant: "destructive",
            title: "خطا در ایجاد دانش‌آموز",
            description: errorMessage,
        });
    } finally {
        // IMPORTANT: Re-login the admin to restore their session
        try {
            await signInWithEmailAndPassword(auth, adminCredentials.email, adminCredentials.pass);
        } catch (reloginError) {
            console.error('Admin re-login failed:', reloginError);
            toast({
                variant: "destructive",
                title: "خطا در ورود مجدد ادمین",
                description: "لطفاً برای ادامه، صفحه را رفرش کنید یا مجدداً وارد شوید.",
            });
        }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4">
             <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="جستجوی دانش‌آموز..." 
                      className="pl-10 text-right w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Dialog open={isAddUserOpen} onOpenChange={setAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto">
                            <PlusCircle className="ml-2 h-4 w-4" />
                            افزودن دانش‌آموز
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                          <DialogHeader className="text-right">
                            <DialogTitle className="text-2xl font-headline">افزودن دانش‌آموز جدید</DialogTitle>
                            <DialogDescription>
                              اطلاعات دانش‌آموز را وارد کرده و برای او یک حساب کاربری ایجاد کنید.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-6 py-4 text-right">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name="firstName" render={({ field }) => (
                                  <FormItem><FormLabel>نام</FormLabel><FormControl><Input placeholder="مثال: سارا" {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="lastName" render={({ field }) => (
                                  <FormItem><FormLabel>نام خانوادگی</FormLabel><FormControl><Input placeholder="مثال: رضایی" {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                            </div>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>ایمیل</FormLabel><FormControl><Input type="email" placeholder="student@example.com" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name="grade" render={({ field }) => (
                                <FormItem><FormLabel>پایه تحصیلی</FormLabel>
                                  <Select dir='rtl' onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger><SelectValue placeholder="پایه را انتخاب کنید" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="10">دهم</SelectItem>
                                      <SelectItem value="11">یازدهم</SelectItem>
                                      <SelectItem value="12">دوازدهم</SelectItem>
                                    </SelectContent>
                                  </Select>
                                <FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="major" render={({ field }) => (
                                <FormItem><FormLabel>رشته</FormLabel>
                                  <Select dir='rtl' onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger><SelectValue placeholder="رشته را انتخاب کنید" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="math">ریاضی و فیزیک</SelectItem>
                                      <SelectItem value="science">علوم تجربی</SelectItem>
                                      <SelectItem value="humanities">ادبیات و علوم انسانی</SelectItem>
                                    </SelectContent>
                                  </Select>
                                <FormMessage /></FormItem>
                              )}/>
                            </div>
                            <FormField control={form.control} name="password" render={({ field }) => (
                              <FormItem>
                                <FormLabel>رمز عبور اولیه</FormLabel>
                                <div className="flex gap-2">
                                  <div className="relative w-full">
                                    <FormControl>
                                      <Input type={showPassword ? "text" : "password"} dir="ltr" {...field} />
                                    </FormControl>
                                    <Button type="button" variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword((prev) => !prev)}>
                                      {showPassword ? <EyeOff /> : <Eye />}
                                    </Button>
                                  </div>
                                  <Button type="button" variant="outline" size="icon" onClick={generatePassword} aria-label="پیشنهاد رمز عبور">
                                    <KeyRound className="h-4 w-4" />
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}/>
                            <FormField control={form.control} name="panelStatus" render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} dir='ltr'/></FormControl>
                                <div>
                                  <FormLabel className="font-medium">وضعیت پنل</FormLabel>
                                  <p className="text-xs text-muted-foreground">برای دسترسی دانش‌آموز به پنل خود، این گزینه را فعال کنید.</p>
                                </div>
                              </FormItem>
                            )}/>
                            <div>
                              <Label className="text-base font-semibold">دسترسی به قابلیت‌ها</Label>
                              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {featureList.map((feature) => (
                                  <FormField key={feature.id} control={form.control} name={`features.${feature.id}`} render={({ field }) => (
                                    <FormItem className="flex items-center justify-between p-2 rounded-lg border">
                                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} dir='ltr' /></FormControl>
                                      <FormLabel className="text-sm font-normal">{feature.label}</FormLabel>
                                    </FormItem>
                                  )}/>
                                ))}
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="gap-2 sm:justify-start flex-col-reverse sm:flex-row pt-4">
                             <Button type="submit" disabled={form.formState.isSubmitting}>
                               {form.formState.isSubmitting ? 'در حال ایجاد...' : 'ایجاد دانش‌آموز'}
                             </Button>
                             <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)}>انصراف</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="text-right w-full md:w-auto">
                <CardTitle>مدیریت دانش‌آموزان</CardTitle>
                <CardDescription>افزودن، ویرایش و مشاهده گزارش‌های دانش‌آموزان</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="text-right">وضعیت</TableHead>
                    <TableHead className="text-right">میانگین روانی</TableHead>
                    <TableHead className="text-right">میانگین مطالعه (ساعت)</TableHead>
                    <TableHead className="text-right">نام دانش آموز</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                 {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredStudents && filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <span className="text-green-500">●</span> فعال
                        </TableCell>
                        <TableCell>{student.avgFeeling?.toFixed(1) || 'N/A'}</TableCell>
                        <TableCell>{student.avgStudyHours?.toFixed(1) || 'N/A'}</TableCell>
                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        {searchTerm ? 'دانش‌آموزی با این نام یافت نشد.' : 'هنوز دانش‌آموزی ثبت‌نام نکرده است.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
