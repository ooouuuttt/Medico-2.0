
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getPrescriptions, Prescription } from '@/lib/prescription-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { FileText, Scan, ServerCrash } from 'lucide-react';

interface PrescriptionsProps {
  user: User;
}

const Prescriptions = ({ user }: PrescriptionsProps) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = getPrescriptions(user.uid, (data) => {
      setPrescriptions(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }
  
  if (prescriptions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold font-headline">No Prescriptions Found</h2>
            <p className="text-muted-foreground">
                Your saved and e-prescriptions will appear here.
            </p>
        </div>
      )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline">Your Prescriptions</h2>
      {prescriptions.map((prescription) => (
        <Card key={prescription.id} className="shadow-sm rounded-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Dr. {prescription.doctorName}</CardTitle>
                <CardDescription className="pt-1">
                  {new Date(prescription.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </div>
              <Badge variant={prescription.source === 'scanned' ? 'secondary' : 'default'} className="capitalize">
                 {prescription.source === 'scanned' ? <Scan className="w-3 h-3 mr-1.5"/> : null}
                {prescription.source}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {prescription.medicines.map((med, index) => (
              <div key={index} className="border p-3 rounded-lg text-sm bg-background">
                <p className="font-bold text-base capitalize">{med.name}</p>
                <div className="grid grid-cols-3 gap-2 text-muted-foreground mt-2">
                    <div><Badge variant="outline" className='w-full justify-center text-center'>{med.dosage}</Badge></div>
                    <div><Badge variant="outline" className='w-full justify-center text-center'>{med.frequency}</Badge></div>
                    <div><Badge variant="outline" className='w-full justify-center text-center'>{med.duration}</Badge></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Prescriptions;
