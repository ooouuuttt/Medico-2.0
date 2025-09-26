
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

export type OrderStatus = 'pending' | 'ready' | 'completed';

export interface Order extends DocumentData {
  id: string;
  userId: string;
  pharmacyId: string;
  pharmacyName: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Timestamp;
}

// Function to create a new order
export const createOrder = async (userId: string, cartItem: CartItem): Promise<string> => {
  try {
    const orderData = {
      userId,
      pharmacyId: cartItem.pharmacy.id,
      pharmacyName: cartItem.pharmacy.pharmacyName,
      items: [
        {
          medicine: {
             id: cartItem.medicine.id,
             name: cartItem.medicine.name,
             manufacturer: cartItem.medicine.manufacturer,
             price: cartItem.medicine.price
          },
          quantity: cartItem.quantity
        }
      ],
      total: cartItem.medicine.price * cartItem.quantity,
      status: 'pending' as OrderStatus,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    // Create notification for the user
    await createNotification(userId, {
      title: 'Order Placed!',
      description: `Your order from ${cartItem.pharmacy.pharmacyName} has been placed.`,
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
