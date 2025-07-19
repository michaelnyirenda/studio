
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

    // The private_key field in the service account JSON contains literal "\n" characters
    // which need to be replaced with actual newline characters.
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
     console.error('Failed to parse or initialize Firebase Admin SDK:', error);
     throw new Error('The Firebase service account JSON is malformed or initialization failed.');
  }
}
