
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getOrdersForUser, Order, OrderStatus } from '@/lib/order-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ShoppingBag, Package, CheckCircle, Clock, PackageSearch, XCircle } from 'lucide-react';
import type { Tab } from './app-shell';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface OrderHistoryProps {
  user: User;
  setActiveTab: (tab: Tab, state?: any) => void;
}

const statusConfig: Record<OrderStatus, {
    label: string;
    icon: React.ElementType;
    description: string;
}> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    description: 'Your order has been placed and is waiting for confirmation from the pharmacy.',
  },
  processing: {
    label: 'Processing',
    icon: PackageSearch,
    description: 'The pharmacy is preparing your order.',
  },
  ready: {
    label: 'Ready for Pickup',
    icon: Package,
    description: 'Your order is packed and ready for you to pick up from the pharmacy.',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    description: 'Your order has been picked up.',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    description: 'This order has been cancelled.',
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
  
  const TimelineStep = ({ status, isCurrent, isCompleted, isFirst, isCancelled }: { status: OrderStatus, isCurrent: boolean, isCompleted: boolean, isFirst: boolean, isCancelled: boolean }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <div className="relative flex flex-col items-center justify-start flex-1">
          {/* Connecting line */}
          <div className={cn(
            "absolute top-[14px] h-0.5 w-full",
            !isFirst && "left-[-50%]",
            isFirst && "left-0",
            (isCompleted || isCurrent) && !isCancelled ? 'bg-primary' : 'bg-border',
             isCancelled && isCurrent && 'bg-destructive'
          )} />
          
          {/* Circle and Icon */}
          <div className={cn(
              "relative z-10 flex h-7 w-7 items-center justify-center rounded-full", 
              isCompleted && !isCancelled ? 'bg-primary' : 'bg-border',
              isCurrent && !isCancelled && "bg-primary ring-2 ring-primary ring-offset-2 ring-offset-background",
              isCancelled && isCurrent && "bg-destructive ring-2 ring-destructive ring-offset-2 ring-offset-background"
          )}>
              <Icon className={cn("h-4 w-4", (isCompleted || isCurrent) ? 'text-primary-foreground' : 'text-muted-foreground', isCancelled && isCurrent && 'text-destructive-foreground')} />
          </div>

          {/* Label */}
          <span className={cn("text-xs text-center mt-2", (isCompleted || isCurrent) ? 'font-semibold text-foreground' : 'text-muted-foreground', isCancelled && isCurrent && 'text-destructive')}>
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
        const isCancelled = order.status === 'cancelled';
        const currentStatusIndex = isCancelled ? -1 : (order.status ? statuses.indexOf(order.status) : -1);
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
                      <Badge variant={order.status === 'completed' ? 'default' : isCancelled ? 'destructive' : 'secondary'} className='capitalize'>
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
                      {isCancelled ? (
                         <Alert variant="destructive" className="mt-4">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Order Cancelled</AlertTitle>
                            <AlertDescription>
                                {order.cancellationReason || 'This order was cancelled by the pharmacy.'}
                            </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                            <div className="flex justify-between items-start w-full">
                                {statuses.map((status, index) => (
                                    <TimelineStep key={status} status={status} isCurrent={index === currentStatusIndex} isCompleted={index < currentStatusIndex} isFirst={index === 0} isCancelled={false} />
                                ))}
                            </div>
                            {statusInfo && <p className='text-xs text-muted-foreground mt-4 text-center'>{statusInfo.description}</p>}
                        </>
                      )}
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
