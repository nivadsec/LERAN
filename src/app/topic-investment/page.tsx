'use client';

import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';


const topicSchema = z.object({
  topic: z.string().min(1, 'نام مبحث الزامی است.'),
  priority: z.coerce.number().min(1, 'اولویت باید حداقل ۱ باشد.'),
  study_hours: z.coerce.number().min(0),
  video_hours: z.coerce.number().min(0),
  test_hours: z.coerce.number().min(0),
  extra_actions: z.string().optional(),
});

const formSchema = z.object({
  lesson_name: z.string().min(1, 'نام درس الزامی است.'),
  average_score: z.coerce.number().min(0).max(100).optional(),
  most_color: z.string().optional(),
  holiday_goal: z.string().optional(),
  exam_goal: z.string().optional(),
  part_count: z.coerce.number().min(0).optional(),
  lesson_time_investment: z.coerce.number().min(0).optional(),
  topics: z.array(topicSchema),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TotalInvestmentCell = ({ control, index }: { control: Control<FormValues>, index: number }) => {
    const topic = useWatch({
        control,
        name: `topics.${index}`
    });
    const total = (topic.study_hours || 0) + (topic.video_hours || 0) + (topic.test_hours || 0);
    return <TableCell className="text-center font-bold">{total}</TableCell>;
};

export default function TopicInvestmentPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lesson_name: '',
      topics: [{ topic: '', priority: 1, study_hours: 0, video_hours: 0, test_hours: 0, extra_actions: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'topics',
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    // Logic to save data to Firestore would go here
  };
  
  return (
    <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="text-right p-0 md:p-6 md:pt-0">
            <CardTitle className="text-2xl font-bold">فرم سرمایه زمانی مبحث‌محور</CardTitle>
            <CardDescription className="mt-1">
                حالا که فرم درس محور تموم شد، از این درس کدوم مباحث رو بخونیم؟
            </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Header Fields */}
                    <Card className="bg-card/80 backdrop-blur-sm">
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField name="lesson_name" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>نام درس</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="average_score" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>میانگین درصد</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="most_color" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>بیشترین رنگ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                              <FormField name="holiday_goal" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>هدفگذاری عید</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="exam_goal" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>هدفگذاری کنکور</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="lesson_time_investment" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>سرمایه درس</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                             )} />
                             <FormField name="part_count" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>تعداد پارت‌ها</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="lesson_time_investment" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>زمان هر پارت</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Topics Table */}
                     <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>جزئیات مباحث</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">مبحث</TableHead>
                                            <TableHead className="text-center w-24">اولویت</TableHead>
                                            <TableHead className="text-center w-48" colSpan={3}>سرمایه زمانی (ساعت)</TableHead>
                                            <TableHead className="text-center w-24">تست (ساعت)</TableHead>
                                            <TableHead className="text-right">سایر اقدامات</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                        <TableRow>
                                            <TableHead></TableHead>
                                            <TableHead></TableHead>
                                            <TableHead className="text-center text-xs">مجموع</TableHead>
                                            <TableHead className="text-center text-xs">ویدئو</TableHead>
                                            <TableHead className="text-center text-xs">مطالعه</TableHead>
                                            <TableHead></TableHead>
                                            <TableHead></TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell><Input {...form.register(`topics.${index}.topic`)} /></TableCell>
                                                <TableCell><Input type="number" {...form.register(`topics.${index}.priority`)} className="text-center" /></TableCell>
                                                <TotalInvestmentCell control={form.control} index={index} />
                                                <TableCell><Input type="number" {...form.register(`topics.${index}.video_hours`)} className="text-center" /></TableCell>
                                                <TableCell><Input type="number" {...form.register(`topics.${index}.study_hours`)} className="text-center" /></TableCell>
                                                <TableCell><Input type="number" {...form.register(`topics.${index}.test_hours`)} className="text-center" /></TableCell>
                                                <TableCell><Input {...form.register(`topics.${index}.extra_actions`)} /></TableCell>
                                                <TableCell>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </div>
                              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ topic: '', priority: fields.length + 1, study_hours: 0, video_hours: 0, test_hours: 0, extra_actions: '' })}>
                                <PlusCircle className="ml-2 h-4 w-4" />
                                افزودن مبحث
                            </Button>
                        </CardContent>
                     </Card>

                    {/* Final Notes */}
                    <Card className="bg-card/80 backdrop-blur-sm">
                         <CardHeader>
                            <CardTitle>توضیحات نهایی</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField name="notes" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="هر نکته یا یادداشت اضافی را اینجا بنویسید..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                    
                    <div className="flex justify-start">
                        <Button type="submit" size="lg">ذخیره گزارش</Button>
                    </div>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
