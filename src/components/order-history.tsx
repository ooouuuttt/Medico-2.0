
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getOrdersForUser, Order, OrderStatus } from '@/lib/order-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ShoppingBag, Package, CheckCircle, Clock, PackageSearch } from 'lucide-react';
import type { Tab } from './app-shell';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface OrderHistoryProps {
  user: User;
  setActiveTab: (tab: Tab, state?: any) => void;
}

const statusConfig: Record<OrderStatus, {
    label: string;
    icon: React.ElementType;
    color: string;
    description: string;
}> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-500',
    description: 'Your order has been placed and is waiting for confirmation from the pharmacy.',
  },
  processing: {
    label: 'Processing',
    icon: PackageSearch,
    color: 'bg-orange-500',
    description: 'The pharmacy is preparing your order.',
  },
  ready: {
    label: 'Ready for Pickup',
    icon: Package,
    color: 'bg-blue-500',
    description: 'Your order is packed and ready for you to pick up from the pharmacy.',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-green-500',
    description: 'Your order has been picked up.',
  },
};

const OrderHistory = ({ user, setActiveTab }: OrderHistoryProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = getOrdersForUser(user.uid, (data) => {
      setOrders(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold font-headline">No Order History</h2>
        <p className="text-muted-foreground">
          Your past medicine orders will appear here.
        </p>
        <Button onClick={() => setActiveTab('medical')}>Order Medicines</Button>
      </div>
    );
  }
  
  const TimelineStep = ({ status, isActive, isFirst, isLast }: { status: OrderStatus, isActive: boolean, isFirst: boolean, isLast: boolean }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <div className="relative flex flex-col items-center justify-start flex-1">
          <div className={cn(
            "absolute top-[14px] w-full h-0.5",
            !isFirst && "left-[-50%]",
            isFirst && "left-0",
            isActive ? 'bg-primary' : 'bg-border'
          )} />
          
          <div className={cn("relative z-10 flex h-7 w-7 items-center justify-center rounded-full", isActive ? 'bg-primary' : 'bg-border')}>
              <Icon className={cn("h-4 w-4", isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
          </div>
          <span className={cn("text-xs text-center mt-2", isActive ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
              {config.label}
          </span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline">Your Order History</h2>
      {orders.map((order) => {
        const statuses: OrderStatus[] = ['pending', 'processing', 'ready', 'completed'];
        const currentStatusIndex = order.status ? statuses.indexOf(order.status) : -1;
        const statusInfo = order.status ? statusConfig[order.status] : null;

        return (
            <Card key={order.id} className="shadow-sm rounded-xl">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{order.pharmacyName}</CardTitle>
                        <CardDescription className="pt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            })}
                        </CardDescription>
                    </div>
                    {statusInfo && (
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className='capitalize'>
                          {statusInfo.label}
                      </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                     {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <p className='capitalize'>{item.name} <span className='text-muted-foreground'>x{item.quantity}</span></p>
                            
                        </div>
                     ))}
                     <Separator className='my-2'/>
                     <div className="flex justify-between items-center font-bold text-base">
                        <span>Total</span>
                        <span className='font-mono'>₹{order.total.toFixed(2)}</span>
                    </div>
                </div>
                
                {order.status && (
                  <div className='pt-4 border-t'>
                      <h4 className='font-semibold mb-4 text-center'>Order Status</h4>
                      <div className="flex justify-between items-start w-full">
                        {statuses.map((status, index) => (
                            <TimelineStep key={status} status={status} isActive={index <= currentStatusIndex} isFirst={index === 0} isLast={index === statuses.length - 1}/>
                        ))}
                      </div>
                      {statusInfo && <p className='text-xs text-muted-foreground mt-4 text-center'>{statusInfo.description}</p>}
                  </div>
                )}

            </CardContent>
            </Card>
        )
      })}
    </div>
  );
};

export default OrderHistory;
