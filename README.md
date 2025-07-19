
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Admin User Management Setup

To enable administrator user management, you need to perform two quick steps in your Firebase project console.

### 1. Enable Email/Password Authentication

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and select your project (`icare-ndfy5`).
2.  In the left-hand menu, go to **Build > Authentication**.
3.  Click the **Get started** button.
4.  In the list of Sign-in providers, select **Email/Password** and enable it.
5.  Click **Save**.
6.  Navigate to the **Users** tab. Click **Add user**, and create your first admin user (e.g., `admin@ibreakfree.com` with a secure password). This will be your primary login.

### 2. Configure a Service Account for the Admin SDK

The application uses the Firebase Admin SDK to securely manage users from the server-side. This requires a "service account" key.

1.  In the Firebase Console, click the gear icon next to **Project Overview** (top-left) and select **Project settings**.
2.  Go to the **Service accounts** tab.
3.  Click the **Generate new private key** button. A JSON file will be downloaded.
4.  Open the downloaded JSON file. Copy the entire contents of the file.
5.  In your project's code, open the `.env` file.
6.  Paste the entire JSON content you copied into the `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON` variable. Make sure it is all on one line and enclosed in quotes if necessary.

Once these two steps are complete, your admin user management system will be fully functional. You can log in with the user you created and start managing other admins from the **User Management** page in the dashboard.
