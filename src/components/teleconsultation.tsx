
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { specialties } from '@/lib/dummy-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import VideoConsultation from './video-consultation';
import AudioConsultation from './audio-consultation';
import ChatConsultation from './chat-consultation';
import { Calendar } from './ui/calendar';
import { add, format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, DocumentData } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

interface Doctor extends DocumentData {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  photoURL?: string;
}

type ConsultationStep = 'specialty' | 'doctors' | 'time' | 'payment' | 'confirmation' | 'consulting';
type ConsultationType = 'video' | 'audio' | 'chat';

const consultationPrices = {
  video: 500,
  audio: 300,
  chat: 150,
};

const Teleconsultation = () => {
  const [step, setStep] = useState<ConsultationStep>('specialty');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('payment');
  }

  const handlePayment = () => {
    setStep('consulting');
  };

  const handleEndConsultation = () => {
    setStep('confirmation');
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
    ? allDoctors.filter((d) => d.specialty === selectedSpecialty)
    : [];

  const doctorAvatar = (doctor: Doctor) =>
    doctor.photoURL || PlaceHolderImages.find((img) => img.id === `doctor-avatar-${doctor.id}`)?.imageUrl || `https://picsum.photos/seed/${doctor.id}/80/80`;

  const today = new Date();
  // Using dummy availability for now
  const availableSlots = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM'];


  if (step === 'consulting' && selectedDoctor && consultationType) {
    switch (consultationType) {
      case 'video':
        return <VideoConsultation doctor={selectedDoctor} onEnd={handleEndConsultation} />;
      case 'audio':
        return <AudioConsultation doctor={selectedDoctor} onEnd={handleEndConsultation} />;
      case 'chat':
        return <ChatConsultation doctor={selectedDoctor} onEnd={handleEndConsultation} />;
      default:
        handleReset();
        return null;
    }
  }


  if (step === 'confirmation') {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
        <LucideIcons.CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold font-headline">Consultation Ended</h2>
        <p className="text-muted-foreground">
          Your {consultationType} consultation with{' '}
          <strong>Dr. {selectedDoctor?.name}</strong> has ended.
        </p>
        <p className="text-sm text-muted-foreground">
          We hope you found it helpful.
        </p>
        <Button
          onClick={handleReset}
          variant="outline"
          className="mt-4"
        >
          <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
          Book another consultation
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
                  alt={`Dr. ${selectedDoctor.name}`}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-primary object-cover"
                />
              )}
              <div>
                <h3 className="font-bold text-lg">Dr. {selectedDoctor?.name}</h3>
                <p className="text-muted-foreground">{selectedDoctor?.specialty}</p>
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
                        onSelect={setSelectedDate}
                        fromDate={today}
                        toDate={add(today, { days: 6 })}
                        // disabled={(date) => !selectedDoctor?.availabilitySlots.some(day => isSameDay(new Date(day.date), date))}
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
        <Button variant="ghost" size="sm" onClick={() => setStep('specialty')} className="mb-4">
          <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
          Back to specialties
        </Button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-headline">
            Available Doctors
          </h2>
          <p className="text-muted-foreground">
            For {selectedSpecialty}
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
                        </div>
                     </CardContent>
                </Card>
            ))
          ) : doctorsForSpecialty.length > 0 ? (
            doctorsForSpecialty.map((doctor) => (
              <Card key={doctor.id} className="rounded-xl shadow-sm overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                    <Image
                      src={doctorAvatar(doctor)}
                      alt={`Dr. ${doctor.name}`}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  <div className="flex-grow">
                    <h3 className="font-bold">{`Dr. ${doctor.name}`}</h3>
                    <p className="text-sm text-muted-foreground">{doctor.experience} yrs experience</p>
                    <Badge variant="secondary" className="mt-1">Available Today</Badge>
                    <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className='h-auto' onClick={() => handleSelectDoctor(doctor, 'video')}>
                          <LucideIcons.Video className="h-4 w-4 mr-2" />
                          Video
                        </Button>
                        <Button size="sm" variant="outline" className='h-auto' onClick={() => handleSelectDoctor(doctor, 'audio')}>
                          <LucideIcons.Phone className="h-4 w-4 mr-2" />
                          Audio
                        </Button>
                        <Button size="sm" variant="outline" className='h-auto' onClick={() => handleSelectDoctor(doctor, 'chat')}>
                          <LucideIcons.MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
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
    </div>
  );
};

export default Teleconsultation;

    