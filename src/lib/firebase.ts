
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'studio-9797456116-e1010',
  appId: '1:126430681217:web:6161791df6da3aee971580',
  storageBucket: 'studio-9797456116-e1010.firebasestorage.app',
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'studio-9797456116-e1010.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '126430681217',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
