'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "نام باید حداقل ۲ کاراکتر باشد." }),
  lastName: z.string().min(2, { message: "نام خانوادگی باید حداقل ۲ کاراکتر باشد." }),
  email: z.string().email({ message: "ایمیل معتبر نیست." }),
  password: z.string().min(6, { message: "رمز عبور باید حداقل ۶ کاراکتر باشد." }),
  grade: z.string({ required_error: "انتخاب پایه تحصیلی الزامی است." }),
  major: z.string({ required_error: "انتخاب رشته تحصیلی الزامی است." }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        grade: values.grade,
        major: values.major,
        signupDate: new Date().toISOString(),
        id: user.uid,
      });

      toast({
        title: "ثبت‌نام موفق",
        description: "حساب کاربری شما با موفقیت ایجاد شد.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Signup Error: ", error);
      toast({
        variant: "destructive",
        title: "خطا در ثبت‌نام",
        description: error.code === 'auth/email-already-in-use' ? 'این ایمیل قبلا استفاده شده است.' : 'مشکلی پیش آمده است. لطفا دوباره تلاش کنید.',
      });
    }
  };

  return (
    <div className="flex items-center min-h-screen justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
         <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center" prefetch={false}>
             <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-primary"
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
             <span className="ml-2 text-3xl font-bold font-headline text-primary">آی‌تاک</span>
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">ایجاد حساب کاربری جدید</CardTitle>
            <CardDescription>
              اطلاعات خود را برای ثبت‌نام در سیستم وارد کنید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="grid gap-2 text-right">
                        <FormLabel htmlFor="first-name">نام</FormLabel>
                        <FormControl>
                          <Input id="first-name" placeholder="مثال: سارا" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="grid gap-2 text-right">
                        <FormLabel htmlFor="last-name">نام خانوادگی</FormLabel>
                        <FormControl>
                          <Input id="last-name" placeholder="مثال: رضایی" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2 text-right">
                      <FormLabel htmlFor="email">ایمیل</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="student@example.com"
                          dir="ltr"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2 text-right">
                      <FormLabel htmlFor="password">رمز عبور</FormLabel>
                      <FormControl>
                        <Input id="password" type="password" dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem className="grid gap-2 text-right">
                      <FormLabel htmlFor="grade">پایه تحصیلی</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger id="grade">
                            <SelectValue placeholder="پایه را انتخاب کنید" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="10">دهم</SelectItem>
                          <SelectItem value="11">یازدهم</SelectItem>
                          <SelectItem value="12">دوازدهم</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem className="grid gap-2 text-right">
                      <FormLabel htmlFor="major">رشته</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger id="major">
                            <SelectValue placeholder="رشته را انتخاب کنید" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="math">ریاضی و فیزیک</SelectItem>
                          <SelectItem value="science">علوم تجربی</SelectItem>
                          <SelectItem value="humanities">ادبیات و علوم انسانی</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "در حال ایجاد حساب..." : "ایجاد حساب کاربری"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              حساب کاربری دارید؟{" "}
              <Link href="/login" className="underline" prefetch={false}>
                وارد شوید
              </Link>
            </div>
             <div className="mt-2 text-center text-sm">
                <Link href="/" className="underline" prefetch={false}>
                بازگشت به صفحه اصلی
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}