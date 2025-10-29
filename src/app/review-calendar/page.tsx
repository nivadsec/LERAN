'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, CalendarClock, Bell, HelpCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { addDays, format, differenceInDays } from 'date-fns-jalali';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// --- SCHEMA DEFINITIONS ---
const studyTopicSchema = z.object({
  id: z.string(),
  lesson: z.string().min(1, 'نام درس الزامی است.'),
  topic: z.string().min(1, 'نام مبحث الزامی است.'),
  startDate: z.date(),
  reviews: z.array(z.object({
    day: z.number(),
    status: z.enum(['pending', 'done', 'missed']),
  })),
  mastery: z.number().min(0).max(100),
});

const formSchema = z.object({
  newLesson: z.string(),
  newTopic: z.string(),
});

type StudyTopic = z.infer<typeof studyTopicSchema>;

// --- REVIEW LOGIC ---
const reviewIntervals = [1, 3, 7, 15, 30, 60, 90];

const createNewTopic = (lesson: string, topic: string): StudyTopic => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0); // Normalize date
  return {
    id: new Date().toISOString(),
    lesson,
    topic,
    startDate,
    reviews: reviewIntervals.map(day => ({ day, status: 'pending' })),
    mastery: 0,
  };
};

const getReviewStatus = (topic: StudyTopic, reviewDay: number) => {
  const review = topic.reviews.find(r => r.day === reviewDay);
  if (!review) return { status: 'pending', isDue: false, isPast: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = addDays(topic.startDate, reviewDay);
  const isDue = differenceInDays(dueDate, today) === 0;
  const isPast = differenceInDays(dueDate, today) < 0;

  if (review.status === 'pending' && isPast) {
    return { status: 'missed', isDue: false, isPast: true };
  }
  return { status: review.status, isDue, isPast: isPast && review.status !== 'done' };
};

const getStatusBadgeVariant = (status: 'pending' | 'done' | 'missed' | 'due') => {
  switch (status) {
    case 'done': return 'default';
    case 'missed': return 'destructive';
    case 'due': return 'secondary';
    default: return 'outline';
  }
};

const getStatusBadgeText = (status: 'pending' | 'done' | 'missed' | 'due') => {
    switch (status) {
      case 'done': return 'انجام شد';
      case 'missed': return 'از دست رفت';
      case 'due': return 'امروز';
      default: return 'در انتظار';
    }
  };


// --- COMPONENT ---
export default function ReviewCalendarPage() {
  const [topics, setTopics] = useState<StudyTopic[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { newLesson: '', newTopic: '' },
  });

  const handleAddTopic = (data: z.infer<typeof formSchema>) => {
    const newTopic = createNewTopic(data.newLesson, data.newTopic);
    setTopics(prev => [...prev, newTopic]);
    form.reset({ newLesson: '', newTopic: '' });
  };
  
  const handleRemoveTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };
  
  const handleReviewClick = (topicId: string, reviewDay: number) => {
    setTopics(prev => prev.map(topic => {
      if (topic.id === topicId) {
        const reviewIndex = topic.reviews.findIndex(r => r.day === reviewDay);
        if (reviewIndex === -1) return topic;

        const newReviews = [...topic.reviews];
        const currentStatus = newReviews[reviewIndex].status;
        newReviews[reviewIndex].status = currentStatus === 'done' ? 'pending' : 'done';
        
        const doneCount = newReviews.filter(r => r.status === 'done').length;
        const mastery = Math.round((doneCount / reviewIntervals.length) * 100);

        return { ...topic, reviews: newReviews, mastery };
      }
      return topic;
    }));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-right">
          <CardTitle className="flex justify-end items-center gap-2">
            تقویم مرور شناختی
            <CalendarClock className="h-6 w-6 text-primary" />
          </CardTitle>
          <CardDescription>
            مباحثی که مطالعه کرده‌اید را اضافه کنید تا سیستم به صورت هوشمند مرورها را زمان‌بندی کند.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddTopic)} className="flex flex-col md:flex-row items-end gap-4">
              <FormField name="newLesson" control={form.control} render={({ field }) => (
                  <FormItem className="flex-1"><FormLabel>نام درس</FormLabel><FormControl><Input placeholder="مثال: ریاضی" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="newTopic" control={form.control} render={({ field }) => (
                  <FormItem className="flex-1"><FormLabel>نام مبحث</FormLabel><FormControl><Input placeholder="مثال: تابع نمایی" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit"><PlusCircle className="ml-2 h-4 w-4" /> افزودن مبحث</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="text-right">برنامه مرورها</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="text-right">اقدامات</TableHead>
                            <TableHead className="text-right">تسلط</TableHead>
                            <TableHead className="text-right">وضعیت مرور</TableHead>
                            <TableHead className="text-right">مبحث</TableHead>
                            <TableHead className="text-right">درس</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topics.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    هنوز مبحثی برای مرور اضافه نشده است.
                                </TableCell>
                            </TableRow>
                        ) : (
                            topics.map(topic => (
                                <TableRow key={topic.id}>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTopic(topic.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon">
                                                        <Bell className="h-4 w-4 text-primary" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>یادآوری بعدی: به زودی</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="w-[150px]">
                                        <div className="flex items-center gap-2">
                                            <Progress value={topic.mastery} className="w-full" />
                                            <span className="text-xs font-mono">{topic.mastery}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="min-w-[300px]">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {reviewIntervals.map(day => {
                                                const reviewInfo = getReviewStatus(topic, day);
                                                const finalStatus = reviewInfo.isDue ? 'due' : reviewInfo.status;
                                                return (
                                                    <Badge 
                                                        key={day} 
                                                        variant={getStatusBadgeVariant(finalStatus)} 
                                                        className="cursor-pointer"
                                                        onClick={() => handleReviewClick(topic.id, day)}
                                                    >
                                                        {`روز ${day}`} - {getStatusBadgeText(finalStatus)}
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{topic.topic}</TableCell>
                                    <TableCell className="font-medium">{topic.lesson}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
