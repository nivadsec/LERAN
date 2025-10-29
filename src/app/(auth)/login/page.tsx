import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
            <CardTitle className="text-2xl font-headline">ورود</CardTitle>
            <CardDescription>
              ایمیل و رمز عبور خود را برای ورود وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid gap-2 text-right">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
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
                    رمز عبور خود را فراموش کرده‌اید؟
                  </Link>
                </div>
                <Input id="password" type="password" required dir="ltr" />
              </div>
              <Button type="submit" className="w-full mt-2">
                ورود
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              حساب کاربری ندارید؟{" "}
              <Link href="/signup" className="underline" prefetch={false}>
                ثبت‌نام
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
