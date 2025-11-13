'use client';
import { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  
  // Connect to the production proxy
  connectFirestoreEmulator(firestore, 'lernova-firebase-proxy-production.up.railway.app', 443);

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: firestore,
  };
}
