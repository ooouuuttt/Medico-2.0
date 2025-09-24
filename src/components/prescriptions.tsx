
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getPrescriptions, Prescription } from '@/lib/prescription-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { FileText, Clock, Download, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import jsPDF from 'jspdf';
import type { Tab } from './app-shell';

interface PrescriptionsProps {
  user: User;
  setActiveTab: (tab: Tab, state?: any) => void;
}

const Prescriptions = ({ user, setActiveTab }: PrescriptionsProps) => {
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
  
  const handleDownload = (prescription: Prescription) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Medico Prescription', 10, 20);

    doc.setFontSize(14);
    doc.text(`Doctor: Dr. ${prescription.doctorName}`, 10, 40);
    doc.text(`Patient: ${prescription.patientName}`, 10, 50);
    const formattedDate = new Date(prescription.createdAt.toDate()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Date: ${formattedDate}`, 10, 60);
    
    doc.setFontSize(16);
    doc.text('Medications', 10, 80);
    
    let yPos = 90;
    prescription.medications.forEach((med, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${med.name} (${med.dosage})`, 15, yPos);
      doc.setFontSize(10);
      doc.text(`  - Frequency: ${med.frequency}`, 15, yPos + 7);
      if(med.duration) {
          doc.text(`  - Duration: ${med.duration}`, 15, yPos + 14);
          yPos += 21;
      } else {
          yPos += 14;
      }
      if(yPos > 280) { // New page if content overflows
          doc.addPage();
          yPos = 20;
      }
    });

    if(prescription.instructions) {
        doc.setFontSize(12);
        doc.text('Instructions:', 10, yPos + 10);
        doc.setFontSize(10);
        doc.text(prescription.instructions, 15, yPos + 17);
        yPos += 24;
    }

    if(prescription.followUp) {
        doc.setFontSize(12);
        doc.text(`Follow-up: ${prescription.followUp}`, 10, yPos + 10);
    }

    doc.save(`prescription-${prescription.id}.pdf`);
  }

  const handleOrder = (prescription: Prescription) => {
    if (prescription.medications.length > 0) {
      setActiveTab('medical', { medicineName: prescription.medications[0].name });
    }
  };

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
          <CardFooter className='gap-2 pt-4 border-t'>
              <Button variant='outline' className='w-full' onClick={() => handleDownload(prescription)}>
                  <Download className='mr-2 h-4 w-4'/>
                  Download
              </Button>
              <Button className='w-full' onClick={() => handleOrder(prescription)}>
                  <ShoppingCart className='mr-2 h-4 w-4'/>
                  Order Medicines
              </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Prescriptions;
