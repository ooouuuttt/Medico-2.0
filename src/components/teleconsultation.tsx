'use client';

import { useState } from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { specialties, doctors, Doctor } from '@/lib/dummy-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import VideoConsultation from './video-consultation';
import AudioConsultation from './audio-consultation';
import ChatConsultation from './chat-consultation';


type ConsultationStep = 'specialty' | 'doctors' | 'payment' | 'confirmation' | 'consulting';
type ConsultationType = 'video' | 'audio' | 'chat';

const consultationPrices = {
  video: 500,
  audio: 300,
  chat: 150,
};

const Teleconsultation = () => {
  const [step, setStep] = useState<ConsultationStep>('specialty');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [consultationType, setConsultationType] =
    useState<ConsultationType | null>(null);

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
    setStep('payment');
  };

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
  }

  const doctorsForSpecialty = selectedSpecialty
    ? doctors.filter((d) => d.specialty === selectedSpecialty)
    : [];

  const doctorAvatar = (id: string) =>
    PlaceHolderImages.find((img) => img.id === `doctor-avatar-${id}`);

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
        <Button variant="ghost" size="sm" onClick={() => setStep('doctors')} className="mb-4">
          <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
          Back to doctors
        </Button>
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Confirm & Pay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              {selectedDoctor && doctorAvatar(selectedDoctor.id) && (
                <Image
                  src={doctorAvatar(selectedDoctor.id)?.imageUrl || ''}
                  alt={`Dr. ${selectedDoctor.name}`}
                  data-ai-hint={doctorAvatar(selectedDoctor.id)?.imageHint}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-primary"
                />
              )}
              <div>
                <h3 className="font-bold text-lg">Dr. {selectedDoctor?.name}</h3>
                <p className="text-muted-foreground">{selectedDoctor?.specialty}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Consultation Type</span>
                    <span className="font-semibold capitalize">{consultationType}</span>
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
          {doctorsForSpecialty.map((doctor) => (
            <Card key={doctor.id} className="rounded-xl shadow-sm overflow-hidden">
              <CardContent className="p-4 flex gap-4">
                {doctorAvatar(doctor.id) && (
                  <Image
                    src={doctorAvatar(doctor.id)?.imageUrl || ''}
                    alt={`Dr. ${doctor.name}`}
                    data-ai-hint={doctorAvatar(doctor.id)?.imageHint}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                )}
                <div className="flex-grow">
                  <h3 className="font-bold">{`Dr. ${doctor.name}`}</h3>
                  <p className="text-sm text-muted-foreground">{doctor.experience} yrs experience</p>
                  <Badge variant="secondary" className="mt-1">{doctor.availability}</Badge>
                  <div className="flex gap-2 mt-3">
                      <Button size="icon" variant="outline" onClick={() => handleSelectDoctor(doctor, 'video')}><LucideIcons.Video className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" onClick={() => handleSelectDoctor(doctor, 'audio')}><LucideIcons.Phone className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" onClick={() => handleSelectDoctor(doctor, 'chat')}><LucideIcons.MessageSquare className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
