'use client';

import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { specialties } from '@/lib/dummy-data';

const Teleconsultation = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );

  const handleSelectSpecialty = (name: string) => {
    setSelectedSpecialty(name);
  };

  const DynamicIcon = ({ name }: { name: keyof typeof LucideIcons }) => {
    const Icon = LucideIcons[name] as React.ElementType;
    if (!Icon) return <LucideIcons.Stethoscope />;
    return <Icon className="h-10 w-10 text-primary" />;
  };

  if (selectedSpecialty) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
        <LucideIcons.CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold font-headline">Request Sent!</h2>
        <p className="text-muted-foreground">
          You are in the queue for a consultation with a{' '}
          <strong>{selectedSpecialty}</strong>.
        </p>
        <p className="text-sm text-muted-foreground">
          You will be notified when a doctor is available.
        </p>
        <Button
          onClick={() => setSelectedSpecialty(null)}
          variant="outline"
          className="mt-4"
        >
          <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
          Choose another specialty
        </Button>
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
              <p className="font-semibold text-center text-sm">{specialty.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Teleconsultation;
