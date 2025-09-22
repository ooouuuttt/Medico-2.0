
'use client';

import { Calendar, Video, Phone, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

// Dummy data for appointments - in a real app, this would come from Firestore
const appointments = [
  {
    id: 'apt1',
    doctorName: 'Dr. Anjali Sharma',
    specialty: 'General Physician',
    type: 'video' as const,
    date: '2024-08-05T10:00:00',
    status: 'upcoming' as const,
  },
  {
    id: 'apt2',
    doctorName: 'Dr. Rohan Mehra',
    specialty: 'Pediatrics',
    type: 'chat' as const,
    date: '2024-07-28T14:30:00',
    status: 'completed' as const,
  },
  {
    id: 'apt3',
    doctorName: 'Dr. Priya Singh',
    specialty: 'Gynecology',
    type: 'audio' as const,
    date: '2024-07-25T11:00:00',
    status: 'completed' as const,
  },
];

const AppointmentIcon = ({ type }: { type: 'video' | 'audio' | 'chat' }) => {
    switch (type) {
        case 'video': return <Video className="h-5 w-5 text-primary" />;
        case 'audio': return <Phone className="h-5 w-5 text-primary" />;
        case 'chat': return <MessageSquare className="h-5 w-5 text-primary" />;
        default: return <Calendar className="h-5 w-5 text-primary" />;
    }
};

const Appointments = () => {
    const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');
    const pastAppointments = appointments.filter(a => a.status === 'completed');

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
                                    {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    {' at '}
                                    {new Date(apt.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
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
                                    {new Date(apt.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline">View Details</Button>
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
