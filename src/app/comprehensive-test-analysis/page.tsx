'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, CalendarDays, Trophy, Star, ClipboardCheck, ChevronsRight, BookOpen, BarChart2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const beforeExamSchema = z.object({
  previous_score: z.coerce.number().optional(),
  goal_first: z.coerce.number().optional(),
  goal_second: z.coerce.number().optional(),
  goal_third: z.coerce.number().optional(),
  goal_fourth: z.coerce.number().optional(),
});

const executionSchema = z.object({
  correct: z.coerce.number().min(0, "تعداد نمی‌تواند منفی باشد."),
  wrong: z.coerce.number().min(0, "تعداد نمی‌تواند منفی باشد."),
  blank: z.coerce.number().min(0, "تعداد نمی‌تواند منفی باشد."),
  total: z.coerce.number().min(0, "تعداد نمی‌تواند منفی باشد."),
  time_spent: z.coerce.number().min(0, "زمان نمی‌تواند منفی باشد."),
  notes: z.string().optional(),
});

const afterExamSchema = z.object({
  score: z.coerce.number().optional(),
  accuracy_rate: z.coerce.number().optional(),
  skip_ratio: z.coerce.number().optional(),
});

const subjectAnalysisSchema = z.object({
  subject: z.string().min(1, 'نام درس الزامی است.'),
  before_exam: beforeExamSchema,
  execution: executionSchema,
  after_exam: afterExamSchema,
});

const formSchema = z.object({
  exam_date: z.string().min(1, "تاریخ آزمون الزامی است."),
  total_score: z.coerce.number().optional(),
  rank_city: z.coerce.number().optional(),
  rank_region: z.coerce.number().optional(),
  rank_country: z.coerce.number().optional(),
  exam_analysis: z.array(subjectAnalysisSchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function ComprehensiveTestAnalysisPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exam_date: '',
      exam_analysis: [
        { 
          subject: 'ریاضی', 
          before_exam: {}, 
          execution: { correct: 0, wrong: 0, blank: 0, total: 0, time_spent: 0, notes: '' }, 
          after_exam: {} 
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exam_analysis',
  });

  const onSubmit = (data: FormValues) => {
    console.log(JSON.stringify(data, null, 2));
    // Firestore saving logic will go here
  };

  return (
    <div className="space-y-6">
      <CardHeader className="text-right p-0">
          <CardTitle className="text-2xl font-bold flex items-center justify-end gap-2">
            <ClipboardCheck />
            فرم تحلیل آزمون جامع
          </CardTitle>
          <CardDescription>
            عملکرد خود را در این آزمون به صورت دقیق و درس به درس تحلیل کنید.
          </CardDescription>
      </CardHeader>
        
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="bg-muted/30">
                 <CardHeader>
                    <CardTitle className="flex items-center justify-end gap-2 text-lg">
                        <Trophy />
                        اطلاعات کلی آزمون
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <FormField name="exam_date" control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-end gap-1"><CalendarDays className="h-4 w-4"/>تاریخ آزمون</FormLabel>
                          <FormControl><Input placeholder="YYYY-MM-DD" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="total_score" control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-end gap-1"><Star className="h-4 w-4"/>تراز کل</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="rank_city" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>رتبه شهر</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="rank_region" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>رتبه منطقه</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="rank_country" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>رتبه کشور</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            <div>
                <div className="flex justify-between items-center mb-4">
                     <Button type="button" variant="outline" size="sm" onClick={() => append({ subject: '', before_exam: {}, execution: { correct: 0, wrong: 0, blank: 0, total: 0, time_spent: 0, notes:'' }, after_exam: {} })}>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        افزودن درس
                    </Button>
                    <h3 className="text-xl font-bold text-right flex items-center gap-2"><BookOpen/>تحلیل دروس</h3>
                </div>
                 <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="bg-card/80 backdrop-blur-sm" style={{borderColor: "hsl(var(--primary) / 0.2)"}}>
                        <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/20">
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <FormField name={`exam_analysis.${index}.subject`} control={form.control} render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl><Input placeholder="نام درس" {...field} className="text-lg font-bold text-right border-0 shadow-none bg-transparent" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardHeader>
                        <CardContent className="p-4">
                           <Tabs defaultValue="execution" dir="rtl">
                               <TabsList className="grid w-full grid-cols-3 mb-4">
                                   <TabsTrigger value="before_exam"><Star className="ml-1 h-4 w-4"/>قبل آزمون</TabsTrigger>
                                   <TabsTrigger value="execution"><ChevronsRight className="ml-1 h-4 w-4"/>حین آزمون</TabsTrigger>
                                   <TabsTrigger value="after_exam"><BarChart2 className="ml-1 h-4 w-4"/>بعد آزمون</TabsTrigger>
                               </TabsList>
                               <TabsContent value="before_exam">
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-right">
                                        <FormField name={`exam_analysis.${index}.before_exam.previous_score`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>درصد قبلی</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name={`exam_analysis.${index}.before_exam.goal_first`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>هدف ۱</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name={`exam_analysis.${index}.before_exam.goal_second`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>هدف ۲</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name={`exam_analysis.${index}.before_exam.goal_third`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>هدف ۳</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name={`exam_analysis.${index}.before_exam.goal_fourth`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>هدف ۴</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                               </TabsContent>
                               <TabsContent value="execution">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                         <FormField name={`exam_analysis.${index}.execution.correct`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>درست</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField name={`exam_analysis.${index}.execution.wrong`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>غلط</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                          <FormField name={`exam_analysis.${index}.execution.blank`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>نزده</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField name={`exam_analysis.${index}.execution.total`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>تعداد کل</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField name={`exam_analysis.${index}.execution.time_spent`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>زمان (دقیقه)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                     <FormField name={`exam_analysis.${index}.execution.notes`} control={form.control} render={({ field }) => (
                                        <FormItem className="mt-4"><FormLabel>یادداشت</FormLabel><FormControl><Textarea placeholder="نکات و تحلیل حین آزمون..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                               </TabsContent>
                               <TabsContent value="after_exam">
                                    <div className="grid grid-cols-3 gap-3">
                                         <FormField name={`exam_analysis.${index}.after_exam.score`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>درصد نهایی</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField name={`exam_analysis.${index}.after_exam.accuracy_rate`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>نرخ دقت</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                          <FormField name={`exam_analysis.${index}.after_exam.skip_ratio`} control={form.control} render={({ field }) => (
                                          <FormItem><FormLabel>نرخ نزده</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                               </TabsContent>
                           </Tabs>
                        </CardContent>
                      </Card>
                    ))}
                 </div>
            </div>

            <div className="flex justify-start">
                <Button type="submit" size="lg">ذخیره تحلیل آزمون</Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
