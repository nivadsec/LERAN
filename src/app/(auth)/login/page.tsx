'use client';

import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "ایمیل معتبر نیست." }),
  password: z.string().min(6, { message: "رمز عبور باید حداقل ۶ کاراکتر باشد." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Check user role
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      toast({
        title: "ورود موفق",
        description: "شما با موفقیت وارد شدید.",
      });

      if (userDoc.exists() && userDoc.data()?.isAdmin) {
        // A simple way to keep password in session storage for re-login after creating a user.
        sessionStorage.setItem('adminPass', values.password);
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }

    } catch (error: any) {
      console.error("Login Error: ", error);
      toast({
        variant: "destructive",
        title: "خطا در ورود",
        description: error.code === 'auth/invalid-credential' ? 'ایمیل یا رمز عبور اشتباه است.' : 'مشکلی پیش آمده است. لطفا دوباره تلاش کنید.',
      });
    }
  };

  return (
    <div className="flex items-center min-h-screen justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
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
            <CardTitle className="text-2xl font-headline">خوش آمدید</CardTitle>
            <CardDescription>
              برای ورود، ایمیل و رمز عبور خود را وارد کنید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
                       <div className="flex items-center">
                         <FormLabel htmlFor="password">رمز عبور</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="mr-auto inline-block text-sm underline"
                            prefetch={false}
                          >
                            فراموشی رمز عبور؟
                          </Link>
                        </div>
                      <FormControl>
                        <div className="relative">
                          <Input id="password" type={showPassword ? "text" : "password"} dir="ltr" placeholder="••••••••" {...field} />
                           <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "در حال ورود..." : "ورود"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 flex items-center justify-center">
                <Separator className="flex-1" />
                <span className="px-2 text-sm text-muted-foreground">یا</span>
                <Separator className="flex-1" />
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/signup">ایجاد حساب دانش‌آموزی</Link>
            </Button>
            <div className="mt-4 text-center text-sm">
              <Link href="/admin/login" className="underline" prefetch={false}>
                ورود مدیر
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
