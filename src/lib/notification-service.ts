
'use client';

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Notification extends DocumentData {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'appointment' | 'medicine' | 'alert' | 'news' | 'trends';
  createdAt: Timestamp;
  isRead: boolean;
}

export const getNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): (() => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const notifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as Notification);
      });
      callback(notifications);
    },
    (error) => {
      console.error('Error fetching notifications:', error);
      callback([]);
    }
  );

  return unsubscribe;
};

    