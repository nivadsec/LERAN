'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart as RechartsPieChart, Cell } from 'recharts';
import { Calculator, Check, X, Minus, TrendingUp, Percent, Target, HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const formSchema = z.object({
  correct: z.coerce.number().min(0, 'تعداد نمی‌تواند منفی باشد.'),
  wrong: z.coerce.number().min(0, 'تعداد نمی‌تواند منفی باشد.'),
  unanswered: z.coerce.number().min(0, 'تعداد نمی‌تواند منفی باشد.'),
});

type FormData = z.infer<typeof formSchema>;

interface AnalysisResult {
  total: number;
  accuracy: number;
  coverage: number;
  skipRate: number;
  pieData: { name: string; value: number; fill: string }[];
}

export default function TestAnalysisPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      correct: 0,
      wrong: 0,
      unanswered: 0,
    },
  });

  const onSubmit = (data: FormData) => {
    const { correct, wrong, unanswered } = data;
    const total = correct + wrong + unanswered;

    if (total === 0) {
      setResult(null);
      return;
    }

    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const coverage = total > 0 ? ((correct + wrong) / total) * 100 : 0;
    const skipRate = total > 0 ? (unanswered / total) * 100 : 0;
    
    const pieData = [
      { name: 'درست', value: correct, fill: 'hsl(var(--chart-1))' },
      { name: 'غلط', value: wrong, fill: 'hsl(var(--destructive))' },
      { name: 'نزده', value: unanswered, fill: 'hsl(var(--muted))' },
    ].filter(item => item.value > 0);

    setResult({
      total,
      accuracy,
      coverage,
      skipRate,
      pieData,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="text-right bg-muted/20">
          <CardTitle className="flex items-center justify-end gap-2">
            تحلیل آزمون
            <Calculator className="h-6 w-6 text-primary" />
          </CardTitle>
          <CardDescription>
            تعداد پاسخ‌های درست، غلط و نزده خود را وارد کنید تا تحلیلی از عملکردتان دریافت کنید.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onChange={form.handleSubmit(onSubmit)} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="correct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-end gap-1"><Check className="h-4 w-4 text-green-500"/> تعداد درست</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="text-center text-lg font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wrong"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-end gap-1"><X className="h-4 w-4 text-red-500"/> تعداد غلط</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="text-center text-lg font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unanswered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-end gap-1"><Minus className="h-4 w-4 text-gray-500"/> تعداد نزده</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="text-center text-lg font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="text-right">
                <CardTitle>نتیجه تحلیل</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 flex items-center justify-center">
                    <ChartContainer config={{}} className="h-[200px] w-full max-w-[250px]">
                        <RechartsPieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Pie data={result.pieData} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
                                {result.pieData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </RechartsPieChart>
                    </ChartContainer>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4 text-right">
                    <InfoCard Icon={TrendingUp} title="تعداد کل سوالات" value={result.total.toLocaleString()} />
                    <InfoCard Icon={Percent} title="درصد شما" value={`${result.accuracy.toFixed(2)} %`} />
                    <InfoCard Icon={Target} title="پوشش پاسخ‌دهی" value={`${result.coverage.toFixed(2)} %`} description="درگیری شما با سوالات" />
                    <InfoCard Icon={HelpCircle} title="نرخ نزده‌ها" value={`${result.skipRate.toFixed(2)} %`} description="سوالات رها شده" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface InfoCardProps {
  Icon: React.ElementType;
  title: string;
  value: string | number;
  description?: string;
}

function InfoCard({ Icon, title, value, description }: InfoCardProps) {
    return (
        <Card className="p-4 text-right">
          <div className="flex justify-end items-center gap-2 mb-2">
            <h3 className="font-semibold text-muted-foreground">{title}</h3>
            <Icon className="h-5 w-5 text-primary"/>
          </div>
          <p className="text-2xl font-bold">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </Card>
    )
}
