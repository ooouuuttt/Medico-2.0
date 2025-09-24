
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
} from 'firebase/firestore';
import { db } from './firebase';
import type { PrescriptionReaderOutput } from '@/ai/flows/prescription-reader';

const USERS_COLLECTION = 'users';
const PRESCRIPTIONS_COLLECTION = 'prescriptions';

export interface Prescription extends DocumentData {
  id: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  doctorName: string;
  date: string;
  source: 'scanned' | 'e-prescription';
  createdAt: any;
}

// Function to save a scanned prescription to Firestore
export const saveScannedPrescription = async (
  uid: string,
  data: PrescriptionReaderOutput
): Promise<void> => {
  if (!uid || !data) {
    throw new Error('User ID and prescription data are required.');
  }
  const userPrescriptionsRef = collection(
    db,
    USERS_COLLECTION,
    uid,
    PRESCRIPTIONS_COLLECTION
  );
  await addDoc(userPrescriptionsRef, {
    ...data,
    source: 'scanned',
    createdAt: serverTimestamp(),
  });
};

// Function to get real-time updates for user prescriptions
export const getPrescriptions = (
  uid: string,
  callback: (prescriptions: Prescription[]) => void
) => {
  const userPrescriptionsRef = collection(
    db,
    USERS_COLLECTION,
    uid,
    PRESCRIPTIONS_COLLECTION
  );
  const q = query(userPrescriptionsRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const prescriptions: Prescription[] = [];
      querySnapshot.forEach((doc) => {
        prescriptions.push({ id: doc.id, ...doc.data() } as Prescription);
      });
      callback(prescriptions);
    },
    (error) => {
      console.error('Error fetching prescriptions:', error);
      callback([]);
    }
  );

  return unsubscribe;
};
