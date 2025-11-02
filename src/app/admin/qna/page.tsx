'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, orderBy, limit, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Bot, HelpCircle, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns-jalali';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: Timestamp;
  isRead: boolean;
  isFromAdmin: boolean;
}

interface UserProfile {
    id: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string;
}

interface Conversation {
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    lastMessage: string;
    lastMessageAt: Timestamp;
    unreadCount: number;
}

function ConversationList({ conversations, activeConversation, onSelect, isLoading }: { conversations: Conversation[], activeConversation: string | null, onSelect: (studentId: string) => void, isLoading: boolean }) {

    if (isLoading) {
        return (
            <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        )
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-semibold">هیچ گفتگویی یافت نشد</p>
                <p className="text-sm text-muted-foreground mt-1">
                سوالات دانش‌آموزان در اینجا نمایش داده می‌شود.
                </p>
            </div>
        );
    }
    
    return (
        <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
            {conversations.map(conv => (
                <Button
                    key={conv.studentId}
                    variant={activeConversation === conv.studentId ? 'secondary' : 'ghost'}
                    className="w-full h-auto justify-between p-3"
                    onClick={() => onSelect(conv.studentId)}
                >
                    {conv.unreadCount > 0 && <div className="w-2 h-2 rounded-full bg-primary" />}
                    <div className="flex-1 text-right ml-2">
                        <p className="font-semibold">{conv.studentName}</p>
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.studentAvatar} />
                        <AvatarFallback>{conv.studentName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            ))}
            </div>
        </ScrollArea>
    )
}

function ChatView({ studentId }: { studentId: string | null }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const messagesQuery = useMemoFirebase(() => {
        if (!studentId || !user) return null;
        return query(
            collection(firestore, 'messages'),
            where('senderId', 'in', [studentId, user.uid]),
            where('recipientId', 'in', [studentId, user.uid]),
            orderBy('createdAt', 'asc')
        );
    }, [firestore, studentId, user]);

    const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages, isLoading]);

    if (!studentId) {
        return (
             <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-muted/20">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <HelpCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">یک گفتگو را برای پاسخ انتخاب کنید</h3>
                <p className="text-muted-foreground">
                    محتوای سوال دانش‌آموز در اینجا نمایش داده خواهد شد.
                </p>
            </div>
        )
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() === '' || !user || !firestore || isSending) return;

        setIsSending(true);
        const messagesRef = collection(firestore, 'messages');
        const payload = {
            senderId: user.uid,
            recipientId: studentId,
            text: input,
            createdAt: serverTimestamp(),
            isRead: false,
            isFromAdmin: true,
        };

        try {
            await addDoc(messagesRef, payload);
            setInput('');
        } catch (error) {
            console.error("Error sending message:", error);
             const contextualError = new FirestorePermissionError({
                path: messagesRef.path,
                operation: 'create',
                requestResourceData: payload,
            });
            errorEmitter.emit('permission-error', contextualError);
            toast({
                variant: 'destructive',
                title: 'خطا در ارسال پیام',
            })
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                 {isLoading && <div className="flex justify-center"><p>در حال بارگذاری گفتگو...</p></div>}
                 {messages && messages.map((msg, index) => (
                    <div
                        key={index}
                        className={cn(
                        'flex items-end gap-3',
                        msg.isFromAdmin ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {!msg.isFromAdmin && (
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                            <AvatarFallback><User size={20}/></AvatarFallback>
                        </Avatar>
                        )}
                        <div
                        className={cn(
                            'max-w-md rounded-xl px-4 py-3 text-right',
                            msg.isFromAdmin
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                        style={{ whiteSpace: 'pre-wrap' }}
                        >
                        {msg.text}
                        </div>
                        {msg.isFromAdmin && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot size={20}/></AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                ))}
                </div>
            </ScrollArea>
             <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Button type="submit" size="icon" disabled={isSending || input.trim() === ''}>
                        <Send className="h-5 w-5" />
                    </Button>
                    <Textarea
                        placeholder="پاسخ خود را بنویسید..."
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
                        disabled={isSending}
                    />
                </form>
            </div>
        </div>
    )
}

export default function AdminQnAPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [activeConversation, setActiveConversation] = useState<string | null>(null);

    const messagesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'messages'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);
    
    const studentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('isAdmin', '!=', true));
    }, [firestore]);

    const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
    const { data: students, isLoading: isLoadingStudents } = useCollection<UserProfile>(studentsQuery);

    const conversations: Conversation[] = useMemo(() => {
        if (!messages || !students) return [];

        const studentMap = new Map(students.map(s => [s.id, s]));
        const convs = new Map<string, Conversation>();
        
        messages.forEach(msg => {
            const studentId = msg.isFromAdmin ? msg.recipientId : msg.senderId;

            if (!convs.has(studentId)) {
                 const student = studentMap.get(studentId);
                 if (student) {
                    convs.set(studentId, {
                        studentId: studentId,
                        studentName: `${student.firstName} ${student.lastName}`,
                        studentAvatar: student.photoURL,
                        lastMessage: msg.text,
                        lastMessageAt: msg.createdAt,
                        unreadCount: (!msg.isFromAdmin && !msg.isRead) ? 1 : 0
                    })
                 }
            } else {
                const existing = convs.get(studentId)!;
                if (!msg.isFromAdmin && !msg.isRead) {
                    existing.unreadCount++;
                }
            }
        })
        
        return Array.from(convs.values());
    }, [messages, students]);
    
    // Auto-select first conversation
    useEffect(() => {
        if (!activeConversation && conversations.length > 0) {
            setActiveConversation(conversations[0].studentId);
        }
    }, [conversations, activeConversation]);


    return (
        <Card className="h-[calc(100vh-8rem)] w-full">
            <div className="grid md:grid-cols-[300px_1fr] h-full">
                <ChatView studentId={activeConversation} />
                <div className="border-r border-border flex flex-col h-full">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold text-right">صندوق ورودی سوالات</h2>
                    </div>
                    <ConversationList 
                        conversations={conversations} 
                        activeConversation={activeConversation} 
                        onSelect={setActiveConversation}
                        isLoading={isLoadingMessages || isLoadingStudents}
                    />
                </div>
            </div>
        </Card>
    );
}
