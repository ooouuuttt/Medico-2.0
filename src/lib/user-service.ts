

'use client';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

const USERS_COLLECTION = 'users';

export type UserProfile = {
  name: string;
  age: number;
  gender: string;
  contact: string;
  village: string;
  medicalHistory?: string;
};

// Function to get user profile from Firestore
export const getUserProfile = async (user: User): Promise<UserProfile | null> => {
  if (!user) return null;

  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserProfile;
    } else {
      console.log('No such document! Creating a default profile.');
      // If no profile exists, create one with default values
      const defaultProfile: UserProfile = {
        name: user.displayName || 'New User',
        age: 30,
        gender: 'other',
        contact: '0000000000',
        village: 'My Village',
        medicalHistory: '',
      };
      await setDoc(userDocRef, defaultProfile);
      return defaultProfile;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Function to get just the patient's name
export const getPatientName = async (uid: string): Promise<string | null> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as UserProfile;
      return userData.name;
    }
    return null;
  } catch (error) {
    console.error('Error fetching patient name:', error);
    return null;
  }
};


// Function to update user profile in Firestore
export const updateUserProfile = async (uid: string, data: UserProfile): Promise<void> => {
  const userDocRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(userDocRef, data, { merge: true });
};

    