'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { PlusCircle, Trash2, TrendingUp, Smile, Meh, Frown } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';

const testEntrySchema = z.object({
  id: z.string(),
  testNumber: z.coerce.number().min(1),
  date: z.string(),
  correct: z.coerce.number().min(0),
  wrong: z.coerce.number().min(0),
  percentage: z.coerce.number().min(0).max(100),
  answered: z.coerce.number().min(0),
  satisfaction: z.enum(['happy', 'neutral', 'sad']).optional(),
  notes: z.string().optional(),
});

const formSchema = z.object({
  subjectName: z.string().min(1, 'نام درس الزامی است.'),
  tests: z.array(testEntrySchema),
});

type FormData = z.infer<typeof formSchema>;

export default function TestAnalysisPage() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectName: '',
      tests: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tests',
  });

  const watchedTests = useWatch({
    control: form.control,
    name: 'tests',
  });

  const chartData = watchedTests
    .map(t => ({ name: `آزمون ${t.testNumber}`, درصد: t.percentage }))
    .sort((a,b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));


  const handleAddTest = () => {
    append({
      id: new Date().toISOString(),
      testNumber: fields.length + 1,
      date: '',
      correct: 0,
      wrong: 0,
      percentage: 0,
      answered: 0,
      satisfaction: 'neutral',
      notes: '',
    });
  };
  
  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-right">
          <CardTitle className="flex items-center justify-end gap-2">
            تحلیل آزمون کلی
            <TrendingUp className="h-6 w-6 text-primary" />
          </CardTitle>
          <CardDescription>
            روند پیشرفت خود را در یک درس خاص با ثبت نتایج آزمون‌های متوالی مشاهده کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <FormField
                  control={form.control}
                  name="subjectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام درس</FormLabel>
                      <FormControl>
                        <Input placeholder="مثلا: فیزیک ۳" {...field} className="max-w-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
              <AnimatePresence>
                {chartData.length > 0 && (
                   <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                   >
                     <Card className="bg-muted/20">
                      <CardHeader>
                        <CardTitle className="text-right">نمودار روند پیشرفت</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[250px] w-full p-2">
                          <ChartContainer config={{}} className="w-full h-full">
                            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" tickMargin={10} axisLine={false} tickLine={false} />
                              <YAxis domain={[0, 100]} tickMargin={10} axisLine={false} tickLine={false} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line type="monotone" dataKey="درصد" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 5, fill: 'var(--color-primary)' }} />
                            </LineChart>
                          </ChartContainer>
                      </CardContent>
                    </Card>
                   </motion.div>
                )}
              </AnimatePresence>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="text-right min-w-[200px]">توضیحات</TableHead>
                      <TableHead className="text-center min-w-[150px]">رضایت</TableHead>
                      <TableHead className="text-center">زده</TableHead>
                      <TableHead className="text-center">درصد</TableHead>
                      <TableHead className="text-center">غلط</TableHead>
                      <TableHead className="text-center">درست</TableHead>
                      <TableHead className="text-center">تاریخ</TableHead>
                      <TableHead className="text-center w-[80px]">آزمون</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     <AnimatePresence>
                        {fields.map((field, index) => (
                           <motion.tr 
                              key={field.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, x: -100 }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              className="align-top"
                           >
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                            <TableCell>
                               <Textarea {...form.register(`tests.${index}.notes`)} className="min-h-[40px]"/>
                            </TableCell>
                            <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`tests.${index}.satisfaction`}
                                  render={({ field }) => (
                                     <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex justify-center gap-2 pt-2">
                                        <FormItem><FormControl><RadioGroupItem value="happy" className="h-6 w-6 border-0 text-green-500"><Smile/></RadioGroupItem></FormControl></FormItem>
                                        <FormItem><FormControl><RadioGroupItem value="neutral" className="h-6 w-6 border-0 text-yellow-500"><Meh/></RadioGroupItem></FormControl></FormItem>
                                        <FormItem><FormControl><RadioGroupItem value="sad" className="h-6 w-6 border-0 text-red-500"><Frown/></RadioGroupItem></FormControl></FormItem>
                                    </RadioGroup>
                                  )}
                                />
                            </TableCell>
                            <TableCell><Input type="number" {...form.register(`tests.${index}.answered`)} className="text-center" /></TableCell>
                            <TableCell><Input type="number" {...form.register(`tests.${index}.percentage`)} className="text-center" /></TableCell>
                            <TableCell><Input type="number" {...form.register(`tests.${index}.wrong`)} className="text-center" /></TableCell>
                            <TableCell><Input type="number" {...form.register(`tests.${index}.correct`)} className="text-center" /></TableCell>
                            <TableCell><Input placeholder="YYYY-MM-DD" {...form.register(`tests.${index}.date`)} className="text-center" /></TableCell>
                            <TableCell><Input type="number" {...form.register(`tests.${index}.testNumber`)} className="text-center font-bold" /></TableCell>
                          </motion.tr>
                        ))}
                     </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "در حال ذخیره..." : "ذخیره تحلیل"}
                </Button>
                 <Button type="button" variant="outline" onClick={handleAddTest}>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  افزودن آزمون
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

