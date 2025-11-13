import * as admin from 'firebase-admin';

// Ensure the process.env values are handled correctly, especially the private key.
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!privateKey) {
  console.error("FIREBASE_ADMIN_PRIVATE_KEY is not set. Admin SDK will not be initialized.");
}

const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: privateKey,
};

function getAdminApp() {
    if (admin.apps.length > 0) {
        return admin.apps[0] as admin.app.App;
    }
    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

function getAdminFirestore() {
    return getAdminApp().firestore();
}

function getAdminAuth() {
    return getAdminApp().auth();
}

export { getAdminApp, getAdminFirestore, getAdminAuth };
