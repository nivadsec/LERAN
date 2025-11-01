
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Announcement } from './page';
import { Input } from '@/components/ui/input';

const announcementSchema = z.object({
  title: z.string().min(5, { message: 'موضوع باید حداقل ۵ کاراکتر باشد.' }),
  message: z.string().min(10, { message: 'پیام باید حداقل ۱۰ کاراکتر باشد.' }),
  targetAudience: z.enum(['all', 'students', 'teachers'], {
    required_error: 'انتخاب گروه هدف الزامی است.',
  }),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  onSubmit: (data: AnnouncementSchema) => void;
  defaultValues?: Partial<Announcement>;
}

export function AnnouncementForm({ onSubmit, defaultValues }: AnnouncementFormProps) {
  const form = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      message: defaultValues?.message || '',
      targetAudience: defaultValues?.targetAudience || 'all',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-right">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>موضوع اطلاعیه</FormLabel>
              <FormControl>
                <Input placeholder="موضوع اصلی اطلاعیه..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>متن اطلاعیه</FormLabel>
              <FormControl>
                <Textarea placeholder="پیام خود را در اینجا بنویسید..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ارسال به</FormLabel>
              <Select dir="rtl" onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="گروه هدف را انتخاب کنید" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">همه کاربران</SelectItem>
                  <SelectItem value="students">فقط دانش‌آموزان</SelectItem>
                  <SelectItem value="teachers">فقط معلمان</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
