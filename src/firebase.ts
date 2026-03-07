/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD8slbajyTvi2hBnTvDBx_mO0uY1LqATBw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lockin-e2f60.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lockin-e2f60",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lockin-e2f60.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "10426021034",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:10426021034:web:727fc6743a04e052b28cd3"
};

// Initialize Firebase only if config is provided
const isConfigured = !!firebaseConfig.projectId;
export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
