'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, PlusCircle, KeyRound, Eye, EyeOff, User, Edit, Bot, Wrench, Trash2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth, useFirestore, useUser, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, getDocs, setDoc, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  panelStatus: boolean;
  features?: Record<string, boolean>;
}

const studentFormSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است.'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است.'),
  email: z.string().email('ایمیل نامعتبر است.'),
  grade: z.string().min(1, 'پایه تحصیلی الزامی است.'),
  major: z.string().min(1, 'رشته تحصیلی الزامی است.'),
  password: z.string().optional(),
  panelStatus: z.boolean(),
  features: z.record(z.boolean()),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

export const featureList = [
    { id: 'daily-report', label: 'گزارش روزانه' },
    { id: 'daily-monitoring', label: 'پایش هوشمند روزانه' },
    { id: 'weekly-report', label: 'گزارش هفتگی' },
    { id: 'test-analysis', label: 'تحلیل آزمون' },
    { id: 'comprehensive-test-analysis', label: 'تحلیل آزمون جامع' },
    { id: 'topic-investment', label: 'سرمایه زمانی' },
    { id: 'focus-ladder', label: 'نردبان تمرکز' },
    { id: 'self-assessment', label: 'خودارزیابی هوشمند' },
    { id: 'sleep-system-design', label: 'طراحی سیستم خواب' },
    { id: 'qna', label: 'پرسش و پاسخ با مشاور' },
    { id: 'lernova-advisor', label: 'مشاور اختصاصی لرنوا (AI)', icon: Bot },
    { id: 'panel-support-bot', label: 'پشتیبان فنی پنل (AI)', icon: Wrench },
    { id: 'consulting-content', label: 'مطالب مشاوره‌ای' },
    { id: 'recommendations', label: 'توصیه‌ها' },
    { id: 'surveys', label: 'پرسشنامه‌ها' },
    { id: 'review-calendar', label: 'تقویم مرور' },
    { id: 'online-class', label: 'کلاس آنلاین' },
    { id: 'online-tests', label: 'آزمون آنلاین' },
    { id: 'class-schedule', label: 'برنامه کلاسی' },
];

const defaultFeatures = featureList.reduce((acc, feature) => {
    acc[feature.id] = true; // Set all features to true by default for new users
    return acc;
  }, {} as Record<string, boolean>);


export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const fetchStudents = useCallback(async () => {
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
  }, [firestore, toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = allStudents?.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };
  
  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    
    const studentDocRef = doc(firestore, "users", studentToDelete.id);
    
    try {
      // Deleting the user document from Firestore
      await deleteDoc(studentDocRef);

      // Note: Deleting the user from Firebase Authentication requires Admin SDK
      // which is not available on the client-side. The user's auth record remains.
      
      toast({
        title: "دانش‌آموز حذف شد",
        description: `پروفایل ${studentToDelete.firstName} ${studentToDelete.lastName} با موفقیت حذف شد.`,
      });

      setAllStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
    } catch (error) {
       const contextualError = new FirestorePermissionError({
            path: studentDocRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', contextualError);
    } finally {
        setStudentToDelete(null);
    }
  };


  const handleAddClick = () => {
    setEditingStudent(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingStudent(null);
    }
    setDialogOpen(open);
  }

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
                 <Button className="w-full md:w-auto" onClick={handleAddClick}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    افزودن دانش‌آموز
                </Button>
            </div>
            <div className="text-right w-full md:w-auto">
                <CardTitle>مدیریت دانش‌آموزان و دسترسی‌ها</CardTitle>
                <CardDescription>افزودن، ویرایش و مدیریت دسترسی‌های دانش‌آموزان</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="text-right w-[180px]">اقدامات</TableHead>
                    <TableHead className="text-center">وضعیت پنل</TableHead>
                    <TableHead className="text-right">ایمیل</TableHead>
                    <TableHead className="text-right">نام دانش آموز</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                 {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-9 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredStudents && filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(student)}>
                            <Edit className="ml-1 h-4 w-4" />
                            ویرایش
                          </Button>
                           <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(student)}>
                            <Trash2 className="ml-1 h-4 w-4" />
                            حذف
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${student.panelStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {student.panelStatus ? 'فعال' : 'غیرفعال'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{student.email}</TableCell>
                        <TableCell className="font-medium text-right">{student.firstName} {student.lastName}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        <div className="flex flex-col items-center gap-2">
                            <User className="h-8 w-8 text-muted-foreground" />
                            <span className="font-semibold">
                                {searchTerm ? 'دانش‌آموزی با این نام یافت نشد.' : 'هنوز دانش‌آموزی ثبت‌نام نکرده است.'}
                            </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <UserDialog 
        key={editingStudent?.id || 'new'}
        isOpen={isDialogOpen} 
        setIsOpen={handleDialogClose} 
        student={editingStudent}
        onSuccess={fetchStudents}
      />
      
      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>آیا از حذف دانش‌آموز مطمئن هستید؟</AlertDialogTitle>
                <AlertDialogDescription>
                    این عمل غیرقابل بازگشت است. پروفایل و تمام داده‌های دانش‌آموز (گزارش‌ها، تحلیل‌ها و ...) برای همیشه حذف خواهد شد.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setStudentToDelete(null)}>انصراف</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete}>حذف</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}


// User Form Dialog
interface UserDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  student: Student | null;
  onSuccess: () => void;
}

function UserDialog({ isOpen, setIsOpen, student, onSuccess }: UserDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const { user: adminUser } = useUser();
  const firestore = useFirestore();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
  });
  
  useEffect(() => {
    if (student) {
      form.reset({
        ...student,
        password: '', // Don't pre-fill password
        features: {
            ...defaultFeatures,
            ...student.features,
        }
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        grade: '',
        major: '',
        password: '',
        panelStatus: true,
        features: {
            ...defaultFeatures,
            'daily-report': true,
            'weekly-report': true,
            'panel-support-bot': true,
        },
      });
    }
  }, [student, form]);

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";
    let newPassword = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      newPassword += charset.charAt(Math.floor(Math.random() * n));
    }
    form.setValue('password', newPassword, { shouldValidate: true });
  };
  
  const onSubmit = async (values: StudentFormData) => {
      if(student) { // Editing existing student
          const userDocRef = doc(firestore, 'users', student.id);
          try {
              await updateDoc(userDocRef, {
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  grade: values.grade,
                  major: values.major,
                  panelStatus: values.panelStatus,
                  features: values.features,
              });

              // Note: We are not handling password changes or email changes that require re-authentication for simplicity.
              // A real app would need a more complex flow for this.

              toast({
                  title: "دانش‌آموز با موفقیت ویرایش شد!",
                  description: `اطلاعات ${values.firstName} ${values.lastName} به‌روز شد.`,
              });
              setIsOpen(false);
              onSuccess();
          } catch(error) {
              const contextualError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: values,
               });
              errorEmitter.emit('permission-error', contextualError);
          }

      } else { // Creating new student
        const adminPass = sessionStorage.getItem('adminPass');
        if (!auth || !firestore || !adminUser?.email || !adminPass) {
            toast({ variant: "destructive", title: "خطا", description: "سرویس احراز هویت در دسترس نیست یا شما وارد نشده‌اید." });
            return;
        }

        if(!values.password) {
            form.setError('password', { type: 'manual', message: 'برای کاربر جدید، رمز عبور الزامی است.' });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const newUser = userCredential.user;

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
                isAdmin: false, // Explicitly set isAdmin to false for new students
            };

            await setDoc(doc(firestore, "users", newUser.uid), studentData);

            toast({ title: "دانش‌آموز با موفقیت ایجاد شد!" });
            setIsOpen(false);
            onSuccess();

        } catch (error: any) {
            console.error("Error creating user:", error);
            const contextualError = new FirestorePermissionError({
                path: `users/${values.email}`, // Path is dynamic so using email as placeholder
                operation: 'create',
                requestResourceData: values,
            });
            errorEmitter.emit('permission-error', contextualError);
        } finally {
            try {
                await signInWithEmailAndPassword(auth, adminUser.email, adminPass);
            } catch (reloginError) {
                console.error('Admin re-login failed:', reloginError);
                toast({ variant: "destructive", title: "خطا در ورود مجدد ادمین", description: "لطفاً صفحه را رفرش کنید." });
            }
        }
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader className="text-right">
              <DialogTitle className="text-2xl font-headline">{student ? `ویرایش ${student.firstName}` : 'افزودن دانش‌آموز جدید'}</DialogTitle>
              <DialogDescription>
                {student ? 'اطلاعات و دسترسی‌های این دانش‌آموز را مدیریت کنید.' : 'اطلاعات دانش‌آموز را وارد کرده و برای او یک حساب کاربری ایجاد کنید.'}
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
                  <FormItem><FormLabel>ایمیل</FormLabel><FormControl><Input type="email" placeholder="student@example.com" dir="ltr" {...field} disabled={!!student} /></FormControl><FormMessage /></FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="grade" render={({ field }) => (
                  <FormItem><FormLabel>پایه تحصیلی</FormLabel>
                    <Select dir='rtl' onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="پایه را انتخاب کنید" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="10">دهم</SelectItem><SelectItem value="11">یازدهم</SelectItem><SelectItem value="12">دوازدهم</SelectItem></SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="major" render={({ field }) => (
                  <FormItem><FormLabel>رشته</FormLabel>
                    <Select dir='rtl' onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="رشته را انتخاب کنید" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="math">ریاضی و فیزیک</SelectItem><SelectItem value="science">علوم تجربی</SelectItem><SelectItem value="humanities">ادبیات و علوم انسانی</SelectItem></SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )}/>
              </div>
              
              {!student && (
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور اولیه</FormLabel>
                    <div className="flex gap-2">
                      <div className="relative w-full">
                        <FormControl><Input type={showPassword ? "text" : "password"} dir="ltr" {...field} /></FormControl>
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
              )}

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
                        <FormControl><Switch checked={!!field.value} onCheckedChange={field.onChange} dir='ltr' /></FormControl>
                        <FormLabel className="text-sm font-normal">{feature.label}</FormLabel>
                      </FormItem>
                    )}/>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:justify-start flex-col-reverse sm:flex-row pt-4">
               <Button type="submit" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? 'در حال ذخیره...' : (student ? 'ذخیره تغییرات' : 'ایجاد دانش‌آموز')}
               </Button>
               <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>انصراف</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
