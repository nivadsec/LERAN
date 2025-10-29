import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
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
            <form className="grid gap-4">
              <div className="grid gap-2 text-right">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                  dir="ltr"
                />
              </div>
              <div className="grid gap-2 text-right">
                <div className="flex items-center">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Link
                    href="#"
                    className="mr-auto inline-block text-sm underline"
                    prefetch={false}
                  >
                    فراموشی رمز عبور؟
                  </Link>
                </div>
                <Input id="password" type="password" required dir="ltr" placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full mt-2">
                ورود
              </Button>
            </form>
            <div className="mt-4 flex items-center justify-center">
                <Separator className="flex-1" />
                <span className="px-2 text-sm text-muted-foreground">یا</span>
                <Separator className="flex-1" />
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/signup">ایجاد حساب دانش‌آموزی</Link>
            </Button>
            <div className="mt-4 text-center text-sm">
              <Link href="#" className="underline" prefetch={false}>
                ورود معلمان
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
