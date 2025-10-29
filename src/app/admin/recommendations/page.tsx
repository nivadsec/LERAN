'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function AdminRecommendationsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-right">
          <CardTitle>ارسال توصیه هوشمند</CardTitle>
          <CardDescription>
            یک توصیه متنی برای دانش‌آموز ارسال کنید. می‌توانید گزارش کار او را تا زمان مطالعه توصیه قفل کرده و یا یک
            آزمون کوتاه برای اطمینان از درک مطلب اضافه کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6 text-right">
            <div className="grid gap-2">
              <Label htmlFor="recipient">ارسال به</Label>
              <Select dir="rtl">
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="گیرنده را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه دانش‌آموزان</SelectItem>
                  {/* Placeholder for individual students */}
                  <SelectItem value="student-1" disabled>
                    دانش‌آموز ۱ (نمونه)
                  </SelectItem>
                  <SelectItem value="student-2" disabled>
                    دانش‌آموز ۲ (نمونه)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recommendation-text">متن توصیه</Label>
              <Textarea id="recommendation-text" placeholder="توصیه خود را در اینجا بنویسید..." className="min-h-[150px]" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Switch id="lock-report" />
              <div className='text-right'>
                <Label htmlFor="lock-report" className="font-medium">
                  قفل کردن گزارش کار
                </Label>
                <p className="text-xs text-muted-foreground">
                  تا زمان خواندن این توصیه، دانش‌آموز نتواند گزارش ثبت کند.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
               <Switch id="add-quiz" />
              <div className='text-right'>
                <Label htmlFor="add-quiz" className="font-medium">
                  افزودن آزمون به توصیه
                </Label>
                <p className="text-xs text-muted-foreground">برای اطمینان از درک مطلب، یک آزمون کوتاه اضافه کنید.</p>
              </div>
            </div>
            <div className="flex justify-start">
              <Button type="submit">ارسال توصیه</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
