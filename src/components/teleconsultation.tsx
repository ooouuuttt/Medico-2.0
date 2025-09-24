
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { specialties } from '@/lib/dummy-data';
import { Badge } from '@/components/ui/badge';
import VideoConsultation from './video-consultation';
import AudioConsultation from './audio-consultation';
import ChatConsultation from './chat-consultation';
import { Calendar } from './ui/calendar';
import { add, format, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, DocumentData, addDoc, Timestamp, where } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { getPatientName } from '@/lib/user-service';

interface Doctor extends DocumentData {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  avatar?: string;
  consultationTypes: Array<'video' | 'audio' | 'chat'>;
}

interface TeleconsultationProps {
  user: User;
}

type ConsultationStep = 'specialty' | 'doctors' | 'time' | 'payment' | 'confirmation' | 'consulting';
type ConsultationType = 'video' | 'audio' | 'chat';

const consultationPrices = {
  video: 500,
  audio: 300,
  chat: 150,
};

const Teleconsultation = ({ user }: TeleconsultationProps) => {
  const [step, setStep] = useState<ConsultationStep>('specialty');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'doctors'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const doctorsFromDb: Doctor[] = [];
      querySnapshot.forEach((doc) => {
        doctorsFromDb.push({ id: doc.id, ...doc.data() } as Doctor);
      });
      setAllDoctors(doctorsFromDb);
      setIsLoading(false);
    }, (error) => {
        console.error("Failed to fetch doctors:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Effect to fetch booked slots for the selected doctor and date
  useEffect(() => {
    if (step !== 'time' || !selectedDoctor || !selectedDate) {
      return;
    }
    
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', selectedDoctor.id),
      where('date', '>=', start),
      where('date', '<=', end)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booked = snapshot.docs
        .filter(doc => doc.data().status === 'upcoming')
        .map(doc => {
          const appointmentDate = (doc.data().date as Timestamp).toDate();
          return format(appointmentDate, 'hh:mm a');
      });
      setBookedSlots(booked);
    });

    return () => unsubscribe();

  }, [step, selectedDoctor, selectedDate]);


  const DynamicIcon = ({ name }: { name: keyof typeof LucideIcons }) => {
    const Icon = LucideIcons[name] as React.ElementType;
    if (!Icon) return <LucideIcons.Stethoscope />;
    return <Icon className="h-10 w-10 text-primary" />;
  };

  const handleSelectSpecialty = (name: string) => {
    setSelectedSpecialty(name);
    setStep('doctors');
  };

  const handleSelectDoctor = (
    doctor: Doctor,
    type: ConsultationType
  ) => {
    setSelectedDoctor(doctor);
    setConsultationType(type);
    setSelectedTime(null); // Reset time selection when doctor changes
    setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('payment');
  }

  const handlePayment = async () => {
    if (!selectedDoctor || !consultationType || !selectedDate || !selectedTime || !user) {
        toast({
            variant: "destructive",
            title: "Booking Failed",
            description: "Missing information for booking.",
        });
        return;
    }

    try {
        const patientName = await getPatientName(user.uid);

        const appointmentDate = new Date(selectedDate);
        const [time, period] = selectedTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours < 12) {
            hours += 12;
        }
        if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        appointmentDate.setHours(hours, minutes, 0, 0);

        await addDoc(collection(db, "appointments"), {
            patientId: user.uid,
            patientName: patientName || user.displayName || 'Unknown',
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            specialty: selectedDoctor.specialization,
            type: consultationType,
            date: Timestamp.fromDate(appointmentDate),
            status: 'upcoming',
        });
        setStep('confirmation');
    } catch (error) {
        console.error("Error booking appointment: ", error);
        toast({
            variant: "destructive",
            title: "Booking Error",
            description: "Could not save the appointment. Please try again.",
        });
    }
  };

  const handleEndConsultation = () => {
    setStep('specialty');
  }

  const handleReset = () => {
    setStep('specialty');
    setSelectedSpecialty(null);
    setSelectedDoctor(null);
    setConsultationType(null);
    setSelectedDate(new Date());
    setSelectedTime(null);
  }

  const doctorsForSpecialty = selectedSpecialty
    ? allDoctors.filter((d) => d.specialization === selectedSpecialty)
    : allDoctors;

  const doctorAvatar = (doctor: Doctor) =>
    doctor.avatar || `https://picsum.photos/seed/${doctor.id}/80/80`;

  const today = new Date();
  const defaultSlots = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'];
  const availableSlots = defaultSlots.filter(slot => !bookedSlots.includes(slot));


  const consultTypeIcons = {
    video: LucideIcons.Video,
    audio: LucideIcons.Phone,
    chat: LucideIcons.MessageSquare,
  };

  if (step === 'consulting' && selectedDoctor && consultationType) {
    // This step is no longer the direct outcome of booking. 
    // It would be initiated from the "Appointments" page.
    const dummyDoctorForConsult = {
        id: selectedDoctor.id,
        name: selectedDoctor.name,
        specialty: selectedDoctor.specialization,
        experience: 0,
    };
    switch (consultationType) {
      case 'video':
        return <VideoConsultation doctor={dummyDoctorForConsult} onEnd={handleEndConsultation} />;
      case 'audio':
        return <AudioConsultation doctor={dummyDoctorForConsult} onEnd={handleEndConsultation} />;
      case 'chat':
        return <ChatConsultation doctor={dummyDoctorForConsult} onEnd={handleEndConsultation} />;
      default:
        handleReset();
        return null;
    }
  }


  if (step === 'confirmation') {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
        <LucideIcons.CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold font-headline">Appointment Scheduled!</h2>
        <p className="text-muted-foreground">
          Your {consultationType} appointment with{' '}
          <strong>{selectedDoctor?.name}</strong> for{' '}
          <strong>{selectedDate && format(selectedDate, 'dd MMM yyyy')} at {selectedTime}</strong> has been successfully booked.
        </p>
        <p className="text-sm text-muted-foreground">
          You can track your appointment in the "Appointments" section. You will receive a notification upon confirmation.
        </p>
        <Button
          onClick={handleReset}
          className="mt-4"
        >
          Book another appointment
        </Button>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="animate-in fade-in duration-500">
        <Button variant="ghost" size="sm" onClick={() => setStep('time')} className="mb-4">
          <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
          Back to time selection
        </Button>
        <Card className="rounded-xl shadow-lg">
           <CardHeader>
             <CardTitle>Confirm & Pay</CardTitle>
           </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              {selectedDoctor && (
                <Image
                  src={doctorAvatar(selectedDoctor)}
                  alt={selectedDoctor.name}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-primary object-cover"
                />
              )}
              <div>
                <h3 className="font-bold text-lg">{selectedDoctor?.name}</h3>
                <p className="text-muted-foreground">{selectedDoctor?.specialization}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Consultation Type</span>
                    <span className="font-semibold capitalize">{consultationType}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-semibold capitalize">{selectedDate && format(selectedDate, 'dd MMM yyyy')}, {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-semibold">₹{consultationType ? consultationPrices[consultationType] : 0}</span>
                </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Select Payment Method</h4>
              <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline">UPI</Button>
                  <Button variant="outline">Card</Button>
                  <Button variant="outline">Netbanking</Button>
                  <Button variant="outline">Wallet</Button>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handlePayment}>
              Pay ₹{consultationType ? consultationPrices[consultationType] : 0}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'time') {
    return (
        <div className="animate-in fade-in duration-500">
            <Button variant="ghost" size="sm" onClick={() => setStep('doctors')} className="mb-4">
                <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
                Back to doctors
            </Button>
             <h2 className="text-2xl font-bold font-headline mb-4">
                Select a Time Slot
            </h2>
            <Card className='rounded-xl shadow-sm'>
                <CardContent className='p-2 flex justify-center'>
                     <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            setSelectedDate(date);
                            setSelectedTime(null); // Reset time when date changes
                        }}
                        fromDate={today}
                        toDate={add(today, { days: 6 })}
                    />
                </CardContent>
            </Card>

            <div className='mt-4'>
                <h3 className='font-semibold mb-2 text-center'>Available Slots for {selectedDate && format(selectedDate, 'dd MMM yyyy')}</h3>
                <div className='grid grid-cols-3 gap-2'>
                    {availableSlots.length > 0 ? (
                        availableSlots.map(time => (
                            <Button 
                                key={time} 
                                variant='outline' 
                                onClick={() => handleTimeSelect(time)}
                                className={cn(selectedTime === time && 'bg-primary text-primary-foreground')}
                            >
                                {time}
                            </Button>
                        ))
                    ) : (
                        <p className='col-span-3 text-center text-muted-foreground text-sm py-4'>No slots available for this day.</p>
                    )}
                </div>
            </div>
        </div>
    )
  }

  if (step === 'doctors') {
    return (
      <div className="animate-in fade-in duration-500">
        <Button variant="ghost" size="sm" onClick={() => { setStep('specialty'); setSelectedSpecialty(null); }} className="mb-4">
          <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
          Back to specialties
        </Button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-headline">
            Available Doctors
          </h2>
          <p className="text-muted-foreground">
            {selectedSpecialty ? `For ${selectedSpecialty}` : 'All Specialists'}
          </p>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({length: 3}).map((_, i) => (
                <Card key={i} className="rounded-xl shadow-sm overflow-hidden">
                     <CardContent className="p-4 flex gap-4 items-center">
                        <Skeleton className="h-20 w-20 rounded-lg" />
                        <div className="flex-grow space-y-2">
                           <Skeleton className="h-5 w-3/4" />
                           <Skeleton className="h-4 w-1/2" />
                           <Skeleton className="h-4 w-1/3" />
                           <div className="flex gap-2 mt-2">
                               <Skeleton className="h-8 w-16" />
                               <Skeleton className="h-8 w-16" />
                           </div>
                        </div>
                     </CardContent>
                </Card>
            ))
          ) : doctorsForSpecialty.length > 0 ? (
            doctorsForSpecialty.map((doctor) => (
              <Card key={doctor.id} className="rounded-xl shadow-sm overflow-hidden">
                <CardHeader className="p-4">
                   <div className="flex gap-4">
                     <Image
                        src={doctor.avatar}
                        alt={doctor.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    <div className="flex-grow">
                      <CardTitle className="text-xl">{doctor.name}</CardTitle>
                      <CardDescription>{doctor.specialization}</CardDescription>
                       <Badge variant="secondary" className="mt-2">10+ years experience</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                   <p className="text-sm text-muted-foreground">{doctor.bio}</p>
                   <Separator />
                   <div className="space-y-2">
                       <h4 className="text-sm font-semibold">Book Appointment</h4>
                        <div className="flex gap-2">
                            {(doctor.consultationTypes || ['video', 'audio', 'chat']).map(type => {
                                const Icon = consultTypeIcons[type];
                                return (
                                    <Button key={type} size="sm" variant="outline" className='h-auto flex-1' onClick={() => handleSelectDoctor(doctor, type)}>
                                      <Icon className="h-4 w-4 mr-2" />
                                      <span className='capitalize'>{type}</span>
                                    </Button>
                                )
                            })}
                        </div>
                   </div>
                </CardContent>
              </Card>
            ))
           ) : (
             <p className="text-center text-muted-foreground p-4">No doctors found for this specialty.</p>
           )
          }
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-headline">Book Consultation</h2>
        <p className="text-muted-foreground">
          Choose a specialty to connect with a doctor.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {specialties.map((specialty) => (
          <Card
            key={specialty.name}
            className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
            onClick={() => handleSelectSpecialty(specialty.name)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
              <DynamicIcon name={specialty.icon as keyof typeof LucideIcons} />
              <p className="font-semibold text-center text-sm">
                {specialty.name}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
       <Button onClick={() => setStep('doctors')} className="w-full mt-4">View All Doctors</Button>
    </div>
  );
};

export default Teleconsultation;

    
