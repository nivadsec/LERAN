'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { aiSelfAssessment, type AISelfAssessmentOutput } from '@/ai/flows/ai-self-assessment';
import { BrainCircuit, Lightbulb, Target, CheckCircle, Activity, Milestone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  studentData: z.string().min(20, 'لطفاً اطلاعات کامل‌تری در مورد خودتان ارائه دهید (حداقل ۲۰ کاراکتر).'),
  academicGoals: z.string().min(10, 'لطفاً اهداف تحصیلی خود را واضح‌تر بیان کنید (حداقل ۱۰ کاراکتر).'),
});

export default function SelfAssessmentPage() {
  const { toast } = useToast();
  const [assessmentResult, setAssessmentResult] = useState<AISelfAssessmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentData: '',
      academicGoals: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setAssessmentResult(null);
    try {
      const result = await aiSelfAssessment(values);
      setAssessmentResult(result);
    } catch (error) {
      console.error('AI Self-Assessment Error:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در ارزیابی',
        description: 'مشکلی در ارتباط با سیستم هوشمند رخ داده است. لطفاً دوباره تلاش کنید.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-right">
          <CardTitle className="flex items-center justify-end gap-2">
            خودارزیابی هوشمند
            <BrainCircuit className="h-6 w-6 text-primary" />
          </CardTitle>
          <CardDescription>
            با پاسخ به سوالات زیر، به هوش مصنوعی کمک کنید تا یک تحلیل دقیق از وضعیت و یک برنامه موفقیت برای شما ایجاد
            کند.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-right">
              <FormField
                control={form.control}
                name="studentData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>درباره خودتان بگویید</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="نقاط قوت، ضعف، سبک یادگیری، چالش‌ها و علایق خود را شرح دهید..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="academicGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اهداف تحصیلی شما چیست؟</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="نمرات مورد نظر، دانشگاه یا رشته‌ی دلخواه، مسیر شغلی و..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-start">
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? 'در حال تحلیل...' : 'شروع ارزیابی'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && <AssessmentSkeleton />}
      {assessmentResult && <AssessmentResult data={assessmentResult} />}
    </div>
  );
}

function AssessmentResult({ data }: { data: AISelfAssessmentOutput }) {
  return (
    <Card className="bg-muted/20">
      <CardHeader>
        <CardTitle className="text-right text-primary">نتیجه تحلیل هوشمند</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-end items-center gap-2 text-right">
                نقاط قوت شما
                <Lightbulb className="h-5 w-5 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-right">
                {data.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                     <p className="flex-1">{strength}</p>
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-end items-center gap-2 text-right">
                 نقاط ضعف شما
                <Target className="h-5 w-5 text-destructive" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-right">
                {data.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-3">
                     <p className="flex-1">{weakness}</p>
                    <Activity className="h-5 w-5 text-destructive mt-1" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Separator />
        
        <div>
          <CardTitle className="mb-6 flex justify-center items-center gap-2 text-center text-xl">
             <Milestone className="h-6 w-6 text-primary" />
             {data.successPlan.title}
          </CardTitle>
          <div className="space-y-6">
            {data.successPlan.steps.map((step) => (
                 <Card key={step.step} className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-right flex justify-end items-center gap-3">
                           <span>{step.title}</span>
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                {step.step}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-right text-muted-foreground">{step.description}</p>
                        <div className="text-left text-xs font-semibold text-primary mt-4">{step.duration}</div>
                    </CardContent>
                 </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssessmentSkeleton() {
  return (
    <Card className="bg-muted/20">
       <CardHeader>
          <Skeleton className="h-8 w-48 ml-auto" />
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32 ml-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32 ml-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </CardContent>
          </Card>
        </div>
        <Separator />
         <div>
          <Skeleton className="h-8 w-64 mx-auto mb-6" />
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                 <CardHeader>
                    <Skeleton className="h-7 w-48 ml-auto" />
                 </CardHeader>
                 <CardContent>
                    <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-3/4 mt-2" />
                    <Skeleton className="h-4 w-24 mt-4" />
                 </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
