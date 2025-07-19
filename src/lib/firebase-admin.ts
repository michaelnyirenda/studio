
import * as admin from 'firebase-admin';

// This function ensures that the Firebase Admin SDK is initialized only once.
export async function initAdminApp() {
  if (admin.apps.length > 0) {
    return;
  }

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error(
      'Firebase service account key not found in environment variables. ' +
      'Please set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON in your .env file.'
    );
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
     console.error('Failed to parse Firebase service account JSON:', error);
     throw new Error('The Firebase service account JSON is malformed.');
  }
}
