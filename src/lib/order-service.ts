
'use client';

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  DocumentData,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CartItem } from '@/components/medicine-availability';
import { createNotification } from './notification-service';
import { Medication } from './user-service';
import { Pharmacy } from './pharmacy-service';

export type OrderStatus = 'pending' | 'ready' | 'completed';
export type OrderType = 'single_med' | 'prescription';

export interface OrderItem {
  medicine: {
    id?: string;
    name: string;
    manufacturer: string;
    price: number;
  };
  quantity: number;
}

export interface Order extends DocumentData {
  id: string;
  userId: string;
  pharmacyId: string;
  pharmacyName: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Timestamp;
  type: OrderType;
}

// Function to create a new order (for single medicine or full prescription)
export const createOrder = async (
  userId: string,
  customerName: string,
  pharmacy: Pharmacy,
  items: OrderItem[],
  total: number,
  type: OrderType
): Promise<string> => {
  try {
    const orderData = {
      userId,
      customerName,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.pharmacyName,
      items,
      total,
      status: 'pending' as OrderStatus,
      createdAt: serverTimestamp(),
      type,
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    const notificationTitle = type === 'prescription' ? 'Prescription Sent!' : 'Order Placed!';
    const notificationDesc = type === 'prescription' 
      ? `Your prescription has been sent to ${pharmacy.pharmacyName}.`
      : `Your order from ${pharmacy.pharmacyName} has been placed.`;

    await createNotification(userId, {
      title: notificationTitle,
      description: notificationDesc,
      type: 'medicine',
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order.');
  }
};


// Function to get all orders for a user
export const getOrdersForUser = (
  userId: string,
  callback: (orders: Order[]) => void
): (() => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      callback(orders);
    },
    (error) => {
      console.error('Error fetching orders:', error);
      callback([]);
    }
  );

  return unsubscribe;
};
