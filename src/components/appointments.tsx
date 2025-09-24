
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Video, Phone, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, DocumentData, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Skeleton } from './ui/skeleton';

interface Appointment extends DocumentData {
    id: string;
    doctorName: string;
    specialty: string;
    type: 'video' | 'audio' | 'chat';
    date: Timestamp;
    status: 'upcoming' | 'completed' | 'cancelled';
}

interface AppointmentsProps {
    user: User;
}

const AppointmentIcon = ({ type }: { type: 'video' | 'audio' | 'chat' }) => {
    switch (type) {
        case 'video': return <Video className="h-5 w-5 text-primary" />;
        case 'audio': return <Phone className="h-5 w-5 text-primary" />;
        case 'chat': return <MessageSquare className="h-5 w-5 text-primary" />;
        default: return <Calendar className="h-5 w-5 text-primary" />;
    }
};

const Appointments = ({ user }: AppointmentsProps) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        const q = query(
            collection(db, 'appointments'),
            where('patientId', '==', user.uid),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedAppointments: Appointment[] = [];
            querySnapshot.forEach((doc) => {
                fetchedAppointments.push({ id: doc.id, ...doc.data() } as Appointment);
            });
            setAppointments(fetchedAppointments);
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to fetch appointments:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');
    const pastAppointments = appointments.filter(a => a.status !== 'upcoming');
    
    const formatDate = (timestamp: Timestamp) => {
        return timestamp.toDate();
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-headline">Your Appointments</h2>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>
            </div>
        );
    }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline">Your Appointments</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary"/>
            Upcoming
        </h3>
        {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(apt => (
                <Card key={apt.id} className="shadow-sm rounded-xl">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-secondary p-3 rounded-full">
                                <AppointmentIcon type={apt.type} />
                            </div>
                            <div>
                                <p className="font-bold">{apt.doctorName}</p>
                                <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(apt.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    {' at '}
                                    {formatDate(apt.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <Button>Join Call</Button>
                    </CardContent>
                </Card>
            ))
        ) : (
            <p className="text-muted-foreground text-sm text-center py-4">You have no upcoming appointments.</p>
        )}
      </div>

       <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600"/>
            Past
        </h3>
        {pastAppointments.length > 0 ? (
            pastAppointments.map(apt => (
                <Card key={apt.id} className="shadow-sm rounded-xl opacity-70">
                    <CardContent className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="bg-secondary p-3 rounded-full">
                                <AppointmentIcon type={apt.type} />
                            </div>
                            <div>
                                <p className="font-bold">{apt.doctorName}</p>
                                <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(apt.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                         <Badge variant={apt.status === 'completed' ? 'default' : 'destructive'} className='capitalize bg-green-100 text-green-800'>{apt.status}</Badge>
                    </CardContent>
                </Card>
            ))
        ) : (
            <p className="text-muted-foreground text-sm text-center py-4">You have no past appointments.</p>
        )}
      </div>

    </div>
  );
};

export default Appointments;
