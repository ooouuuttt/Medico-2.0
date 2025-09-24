
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getPrescriptions, Prescription } from '@/lib/prescription-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { FileText, Clock } from 'lucide-react';
import { Separator } from './ui/separator';

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
      <div className="space-y-4 animate-pulse">
        <Skeleton className="h-8 w-48 rounded-md" />
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
                Your e-prescriptions from doctors will appear here.
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
                  {new Date(prescription.createdAt.toDate()).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </div>
               <Badge variant='default' className="capitalize">
                E-Prescription
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {prescription.medications.map((med, index) => (
              <div key={index} className="border p-3 rounded-lg text-sm bg-background">
                <p className="font-bold text-base capitalize">{med.name}</p>
                <div className="flex flex-wrap gap-2 text-muted-foreground mt-2">
                    {med.dosage && <div><Badge variant="outline">{med.dosage}</Badge></div>}
                    {med.frequency && <div><Badge variant="outline">{med.frequency}</Badge></div>}
                    {med.duration && <div><Badge variant="outline">{med.duration}</Badge></div>}
                </div>
                 {med.notes && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">Notes: {med.notes}</p>}
              </div>
            ))}
          </CardContent>
          {(prescription.followUp || prescription.instructions) && (
             <CardFooter className='flex-col items-start gap-2 pt-4 border-t'>
                {prescription.instructions && <p className='text-sm text-muted-foreground'>**Instructions:** {prescription.instructions}</p>}
                {prescription.followUp && <p className='text-sm font-semibold flex items-center gap-2'><Clock className='w-4 h-4 text-primary' /> {prescription.followUp}</p>}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default Prescriptions;
