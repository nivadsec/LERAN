'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Bot, Wrench } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supportBot, SupportBotInput } from '@/ai/flows/support-bot';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await supportBot(input as SupportBotInput);
      const botMessage: Message = { sender: 'bot', text: response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling Support Bot:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در ارتباط با پشتیبانی',
        description: 'مشکلی در ارتباط با سرور هوش مصنوعی رخ داده است. لطفاً دوباره تلاش کنید.',
      });
      setMessages(prev => prev.slice(0, -1)); 
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
  }, [messages]);

  return (
    <Card className="min-h-[calc(100vh-8rem)] w-full flex flex-col">
      <CardHeader className="text-right border-b">
        <CardTitle className="flex items-center justify-end gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          پشتیبان فنی پنل
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                    <Wrench className="w-12 h-12 mb-4" />
                    <h3 className="text-lg font-semibold">سلام! چطور می‌تونم در استفاده از پنل کمکتون کنم؟</h3>
                    <p className="max-w-sm mt-2">
                        هر سوال یا مشکلی در مورد نحوه کار با سایت یا پنل لرنوا دارید، از من بپرسید.
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
                    <AvatarFallback><Wrench size={20}/></AvatarFallback>
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
                        <AvatarFallback><Wrench size={20}/></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
                        <span className="text-sm">در حال بررسی...</span>
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
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button type="submit" size="icon" disabled={isLoading || input.trim() === ''}>
              <Send className="h-5 w-5" />
            </Button>
            <Textarea
              placeholder="سوال خود را از پشتیبان فنی بپرسید..."
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
        </div>
      </CardContent>
    </Card>
  );
}
