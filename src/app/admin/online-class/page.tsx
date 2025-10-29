'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Video } from 'lucide-react';

export default function AdminOnlineClassPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const getCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);

            if (videoRef.current) {
            videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
            variant: 'destructive',
            title: 'دسترسی به دوربین رد شد',
            description: 'لطفاً برای استفاده از این قابلیت، دسترسی به دوربین را در تنظیمات مرورگر خود فعال کنید.',
            });
        }
        };

        getCameraPermission();

        // Clean up function to stop the video stream when the component unmounts
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [toast]);

    return (
        <Card>
        <CardHeader>
            <CardTitle>مدیریت کلاس آنلاین</CardTitle>
            <CardDescription>تصویر شما برای شروع یا مدیریت کلاس آنلاین.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted aspect-video overflow-hidden flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            </div>
            {hasCameraPermission === false && (
            <Alert variant="destructive">
                <Video className="h-4 w-4" />
                <AlertTitle>دسترسی به دوربین الزامی است</AlertTitle>
                <AlertDescription>
                برای استفاده از کلاس آنلاین، لطفاً اجازه دسترسی به دوربین را بدهید.
                </AlertDescription>
            </Alert>
            )}
        </CardContent>
        </Card>
    );
}
