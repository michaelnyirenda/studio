// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBSS--6-vWCKgNSREbsi4d0A87M3B4xjCo",
    authDomain: "icare-ndfy5.firebaseapp.com",
    projectId: "icare-ndfy5",
    storageBucket: "icare-ndfy5.firebasestorage.app",
    messagingSenderId: "528039469405",
    appId: "1:528039469405:web:243c77dbae0136b3e8c8b4"
  };
  

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };