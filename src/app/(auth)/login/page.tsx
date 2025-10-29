import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpenCheck } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex items-center min-h-screen justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block" prefetch={false}>
            <BookOpenCheck className="h-10 w-10 text-primary mx-auto" />
             <span className="mt-2 block text-xl font-bold font-headline text-primary">آی‌تاک</span>
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
