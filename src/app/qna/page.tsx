'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Send, User, Bot, Sparkles, CornerDownLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { lernovaAdvisor } from '@/ai/flows/lernova-advisor';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const formSchema = z.object({
  message: z.string().min(1),
});

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function QnAPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div');
        if (scrollViewport) {
          scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    }
  }, [messages, isLoading]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const userMessage: Message = {
      id: new Date().toISOString() + '-user',
      text: values.message,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    form.reset();
    setIsLoading(true);

    try {
      const response = await lernovaAdvisor(values.message);
      const botMessage: Message = {
        id: new Date().toISOString() + '-bot',
        text: response,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling Lernova Advisor:', error);
      const errorMessage: Message = {
        id: new Date().toISOString() + '-error',
        text: 'متاسفانه مشکلی در ارتباط با سرور پیش آمده. لطفاً لحظاتی بعد دوباره تلاش کنید.',
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`;
    }
    return name[0];
  }

  return (
    <Card className="min-h-[calc(100vh-8rem)] w-full flex flex-col">
      <div className="flex-1 flex flex-col">
         <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
            <AnimatePresence>
            {messages.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                >
                    <Avatar className="w-16 h-16 mb-4 bg-primary/10 border-2 border-primary/20">
                        <AvatarFallback className="bg-transparent"><Sparkles className="h-8 w-8 text-primary" /></AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold font-headline">سلام! من لرنوا هستم</h2>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        مشاور تحصیلی هوشمند شما. هر سوالی در مورد برنامه‌ریزی، روش مطالعه، یا مدیریت استرس داری از من بپرس!
                    </p>
                </motion.div>
            )}
            </AnimatePresence>
            <div className="space-y-6">
                <AnimatePresence>
                {messages.map(message => (
                     <motion.div
                        key={message.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn('flex items-start gap-3', message.sender === 'user' ? 'justify-start' : 'justify-end')}
                    >
                         {message.sender === 'user' && (
                             <Avatar className="border">
                                <AvatarImage src={user?.photoURL || ''} />
                                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                            </Avatar>
                         )}
                         <div className={cn(
                             'rounded-xl px-4 py-3 max-w-lg',
                             message.sender === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-muted rounded-tl-none'
                         )}>
                             <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                         </div>
                          {message.sender === 'bot' && (
                            <Avatar className="border bg-primary/10">
                                <AvatarFallback className="bg-transparent"><Bot className="h-5 w-5 text-primary"/></AvatarFallback>
                            </Avatar>
                         )}
                     </motion.div>
                ))}
                 </AnimatePresence>
                {isLoading && (
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-end gap-3 justify-end"
                    >
                        <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
                             <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                             <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                             <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                        </div>
                        <Avatar className="border bg-primary/10">
                            <AvatarFallback className="bg-transparent"><Bot className="h-5 w-5 text-primary"/></AvatarFallback>
                        </Avatar>
                    </motion.div>
                )}
            </div>
         </ScrollArea>
        <div className="p-4 bg-background/80 backdrop-blur-sm border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                        <div className="relative">
                            <Input placeholder="سوال خود را از لرنوا بپرسید..." {...field} className="pr-10" autoComplete="off"/>
                            <CornerDownLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">ارسال</span>
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Card>
  );
}
