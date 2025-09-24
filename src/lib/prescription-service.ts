
'use client';

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  DocumentData,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PrescriptionReaderOutput } from '@/ai/flows/prescription-reader';
import { PastPrescription } from './user-service';

const USERS_COLLECTION = 'users';

// This function is now deprecated in favor of storing prescriptions in the user document.
// It can be removed or kept for legacy purposes if needed.
export const getPrescriptions = (
  uid: string,
  callback: (prescriptions: PastPrescription[]) => void
) => {
  const userDocRef = doc(db, USERS_COLLECTION, uid);

  const unsubscribe = onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        callback(userData.pastPrescriptions || []);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Error fetching prescriptions:', error);
      callback([]);
    }
  );

  return unsubscribe;
};

// Function to save a scanned prescription to the user's profile
export const saveScannedPrescription = async (
  uid: string,
  data: PrescriptionReaderOutput
): Promise<void> => {
  if (!uid || !data) {
    throw new Error('User ID and prescription data are required.');
  }

  const newPrescription: PastPrescription = {
    id: `scan_${Date.now()}`, // Generate a unique ID
    date: data.date,
    doctorName: data.doctorName,
    medications: data.medicines.map(med => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
    })),
  };

  const userDocRef = doc(db, USERS_COLLECTION, uid);
  
  await updateDoc(userDocRef, {
    pastPrescriptions: arrayUnion(newPrescription)
  });
};
