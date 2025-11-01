'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, User, Bot, Wrench } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { lernovaAdvisor, LernovaAdvisorInput } from '@/ai/flows/lernova-advisor';
import { supportBot, SupportBotInput } from '@/ai/flows/support-bot';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { type featureList } from '@/app/admin/users/page';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatPaneProps {
  aiFlow: (input: string) => Promise<string>;
  initialMessage: { title: string; description: string; Icon: React.ElementType };
  placeholder: string;
}

function ChatPane({ aiFlow, initialMessage, placeholder }: ChatPaneProps) {
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
      const response = await aiFlow(input);
      const botMessage: Message = { sender: 'bot', text: response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling AI Flow:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در ارتباط',
        description: 'مشکلی در ارتباط با سرور هوش مصنوعی رخ داده است. لطفاً دوباره تلاش کنید.',
      });
      setMessages(prev => prev.slice(0, prev.length -1)); // Revert user message on error
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
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
              <initialMessage.Icon className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold">{initialMessage.title}</h3>
              <p className="max-w-sm mt-2">{initialMessage.description}</p>
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
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-md rounded-xl px-4 py-3 text-right',
                  msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User size={20} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-3 justify-start">
              <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                <AvatarFallback><Bot size={20} /></AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-sm">...</span>
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
            placeholder={placeholder}
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
    </div>
  );
}

interface GlobalAIChatButtonProps {
    features: Record<typeof featureList[number]['id'], boolean> | undefined;
}

export function GlobalAIChatButton({ features }: GlobalAIChatButtonProps) {
  
  const hasLernovaAdvisor = features?.['lernova-advisor'];
  const hasSupportBot = features?.['panel-support-bot'];

  if (!hasLernovaAdvisor && !hasSupportBot) {
    return null;
  }
  
  const defaultTab = hasLernovaAdvisor ? 'advisor' : 'support';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Bot className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-full max-w-md">
        <Tabs defaultValue={defaultTab} className="h-full w-full flex flex-col">
          <SheetHeader className="p-4 border-b">
             <SheetTitle className="text-right">
                <TabsList className="grid w-full grid-cols-2">
                    {hasLernovaAdvisor && <TabsTrigger value="advisor">مشاور لرنوا</TabsTrigger>}
                    {hasSupportBot && <TabsTrigger value="support" disabled>پشتیبان فنی (بزودی)</TabsTrigger>}
                </TabsList>
             </SheetTitle>
          </SheetHeader>
          
          {hasLernovaAdvisor && (
            <TabsContent value="advisor" className="flex-1 mt-0">
                <ChatPane
                aiFlow={lernovaAdvisor}
                initialMessage={{
                    title: 'چطور می‌تونم کمکت کنم؟',
                    description: 'سوالات خودت رو در مورد برنامه‌ریزی درسی، روش‌های مطالعه، مدیریت استرس و هر چیزی که به موفقیت تحصیلیت مربوط می‌شه، از من بپرس!',
                    Icon: Bot
                }}
                placeholder="سوال خود را از مشاور لرنوا بپرسید..."
                />
            </TabsContent>
          )}

          {hasSupportBot && (
            <TabsContent value="support" className="flex-1 mt-0">
                <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                    <Wrench className="w-12 h-12 mb-4" />
                    <h3 className="text-lg font-semibold">پشتیبان فنی (بزودی)</h3>
                    <p className="max-w-sm mt-2">این بخش در حال آماده‌سازی است و به‌زودی برای پاسخ به سوالات شما در مورد کار با پنل فعال خواهد شد.</p>
                </div>
            </TabsContent>
          )}

        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
