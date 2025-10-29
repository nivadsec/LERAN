'use client';

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "ایمیل معتبر نیست." }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await sendPasswordResetEmail(auth, values.email);
      toast({
        title: "ایمیل بازیابی ارسال شد",
        description: "یک ایمیل حاوی لینک بازنشانی رمز عبور برای شما ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.",
      });
      form.reset();
    } catch (error: any) {
      console.error("Forgot Password Error: ", error);
      toast({
        variant: "destructive",
        title: "خطا در ارسال ایمیل",
        description: "مشکلی پیش آمده است. لطفاً مطمئن شوید ایمیل خود را به درستی وارد کرده‌اید.",
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
            <CardTitle className="text-2xl font-headline">فراموشی رمز عبور</CardTitle>
            <CardDescription>
              ایمیل خود را برای دریافت لینک بازیابی وارد کنید.
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
                <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "در حال ارسال..." : "ارسال لینک بازیابی"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              <Link href="/login" className="underline inline-flex items-center gap-1" prefetch={false}>
                 بازگشت به صفحه ورود
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
