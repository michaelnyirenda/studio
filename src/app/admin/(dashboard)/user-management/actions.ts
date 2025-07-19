
'use server';

import { 
  getAuth, 
  UserRecord, 
  ListUsersResult 
} from 'firebase-admin/auth';
import { initAdminApp } from '@/lib/firebase-admin';
import { format } from 'date-fns';

export interface AdminUser {
  uid: string;
  email: string | undefined;
  createdOn: string;
}

/**
 * Initializes the Firebase Admin SDK and returns the Auth instance.
 * This is a helper function to avoid re-initializing the app on every call.
 */
async function getAdminAuth() {
  await initAdminApp();
  return getAuth();
}

/**
 * Fetches all admin users from Firebase Authentication.
 * @returns A promise that resolves to an array of AdminUser objects.
 */
export async function getAllAdmins(): Promise<AdminUser[]> {
  try {
    const auth = await getAdminAuth();
    const listUsersResult: ListUsersResult = await auth.listUsers(1000);
    return listUsersResult.users.map((userRecord: UserRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      createdOn: userRecord.metadata.creationTime 
        ? format(new Date(userRecord.metadata.creationTime), 'PP') 
        : 'N/A',
    }));
  } catch (error: any) {
    console.error('Error fetching admin users:', error.message);
    throw new Error('Could not retrieve admin users.');
  }
}

/**
 * Creates a new admin user in Firebase Authentication.
 * @param email - The email for the new user.
 * @param password - The password for the new user.
 * @returns A promise that resolves to a success status or an error message.
 */
export async function createAdminUser(email: string, password: string): Promise<{ success: boolean; uid?: string; error?: string }> {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  try {
    const auth = await getAdminAuth();
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true, // Admins are created verified.
    });
    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error('Error creating admin user:', error.message);
    if (error.code === 'auth/email-already-exists') {
      return { success: false, error: 'An account with this email already exists.' };
    }
    return { success: false, error: 'Failed to create admin user.' };
  }
}

/**
 * Deletes an admin user from Firebase Authentication.
 * @param uid - The UID of the user to delete.
 * @returns A promise that resolves to a success status or an error message.
 */
export async function deleteAdminUser(uid: string): Promise<{ success: boolean; error?: string }> {
  if (!uid) {
    return { success: false, error: 'User ID is required.' };
  }
  
  try {
    const auth = await getAdminAuth();
    const user = await auth.getUser(uid);
    // As a safeguard, prevent deletion of the main demo admin account
    if (user.email === 'admin@ibreakfree.com') {
        return { success: false, error: 'The primary demo admin cannot be deleted.' };
    }
    await auth.deleteUser(uid);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting admin user:', error.message);
    return { success: false, error: 'Failed to delete admin user.' };
  }
}

/**
 * Changes the password for an admin user.
 * @param uid - The UID of the user whose password is to be changed.
 * @param newPassword - The new password.
 * @returns A promise that resolves to a success status or an error message.
 */
export async function changeAdminPassword(uid: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!uid || !newPassword) {
    return { success: false, error: 'User ID and a new password are required.' };
  }
   if (newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  try {
    const auth = await getAdminAuth();
    await auth.updateUser(uid, {
      password: newPassword,
    });
    // Revoke refresh tokens to force re-login
    await auth.revokeRefreshTokens(uid);
    return { success: true };
  } catch (error: any) {
    console.error('Error changing admin password:', error.message);
    return { success: false, error: 'Failed to change password.' };
  }
}
