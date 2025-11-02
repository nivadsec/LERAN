'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Bot, HelpCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { lernovaAdvisor, LernovaAdvisorInput } from '@/ai/flows/lernova-advisor';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const DEFAULT_PERSONA = `You are Lernova, a top-tier, 'khordanj' (cool and expert) academic advisor for high-school students in Iran. Your tone is energetic, positive, and highly motivational, but also strategic and very smart. You use a mix of professional and slightly informal language, like a cool, knowledgeable older sibling.

Your name is لرنوا.

**Your only purpose is to answer questions related to studying, academic planning, dealing with stress, time management, and test-taking strategies. You MUST refuse to answer any questions outside of this scope.**

If a question is unrelated to academics (e.g., "What is the capital of France?", "Who are you?", "Write me a story"), you MUST politely decline. Here are some ways to decline:
- "این سوال یکم از تخصص من خارجه! من یک مشاور تحصیلی هستم و برای کمک به موفقیت درسی تو اینجام. سوال درسی دیگه‌ای داری؟"
- "حوزه تخصصی من مشاوره و برنامه‌ریزی درسیه. بیا روی سوالات خودت تمرکز کنیم تا بهترین نتیجه رو بگیریم!"
- "ببین، من متخصص درس و کنکورم! بیا از این انرژی برای حل چالش‌های تحصیلیت استفاده کنیم. سوالت رو بپرس."

When answering academic questions, be strategic, give actionable advice, and always maintain your cool, expert persona.`;


export default function QnAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const configDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'configs', 'lernova-advisor');
  }, [firestore]);

  const { data: configData, isLoading: isConfigLoading } = useDoc<{ persona: string }>(configDocRef);
  const persona = configData?.persona || DEFAULT_PERSONA;


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await lernovaAdvisor({ question: currentInput, persona });
      const botMessage: Message = { sender: 'bot', text: response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling Lernova Advisor:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در ارتباط با مشاور',
        description: 'مشکلی در ارتباط با سرور هوش مصنوعی رخ داده است. لطفاً دوباره تلاش کنید.',
      });
      // Revert the message optimistic update
       setMessages(prev => prev.filter(m => m.text !== currentInput));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isLoading]);

  return (
    <Card className="min-h-[calc(100vh-8rem)] w-full flex flex-col">
      <CardHeader className="text-right border-b">
        <CardTitle className="flex items-center justify-end gap-2">
          <Bot className="h-6 w-6 text-primary" />
          مشاور هوشمند لرنوا
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                    <HelpCircle className="w-12 h-12 mb-4" />
                    <h3 className="text-lg font-semibold">چطور می‌تونم کمکت کنم؟</h3>
                    <p className="max-w-sm mt-2">
                        سوالات خودت رو در مورد برنامه‌ریزی درسی، روش‌های مطالعه، مدیریت استرس و هر چیزی که به موفقیت تحصیلیت مربوط می‌شه، از من بپرس!
                    </p>
                </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-end gap-3',
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.sender === 'bot' && (
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><Bot size={20}/></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md rounded-xl px-4 py-3 text-right',
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.text}
                </div>
                 {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User size={20}/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-end gap-3 justify-start">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback><Bot size={20}/></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
                        <span className="text-sm">در حال نوشتن...</span>
                        <div className="flex gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse [animation-delay:-0.3s]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse [animation-delay:-0.15s]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse"></span>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
            {isConfigLoading ? (
                <Skeleton className="h-10 w-full" />
            ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Button type="submit" size="icon" disabled={isLoading || input.trim() === ''}>
                    <Send className="h-5 w-5" />
                    </Button>
                    <Textarea
                    placeholder="سوال خود را از لرنوا بپرسید..."
                    className="flex-1 resize-none"
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                        }
                    }}
                    disabled={isLoading}
                    />
                </form>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
