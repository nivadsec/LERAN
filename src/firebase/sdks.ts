'use client';
import { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * فایل مرکزی برای گرفتن تمام SDKهای فایربیس.
 * این نسخه برای حالت های Production و Proxy تنظیم شده.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  // آدرس پروکسی برای درخواست‌های REST به جای Google Firestore API
  const FIRESTORE_PROXY_BASE =
    "https://lernova-firebase-proxy-production.up.railway.app/?url=https://firestore.googleapis.com/v1";

  return {
    firebaseApp,
    auth,
    firestore,
    FIRESTORE_PROXY_BASE, // اضافه برای استفاده در fetchها یا API calls
  };
}
