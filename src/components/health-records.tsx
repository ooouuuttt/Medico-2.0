'use client';

import {
  FileText,
  Stethoscope,
  Calendar,
  Pill,
  Repeat,
  Clock,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { consultations, prescriptions } from '@/lib/dummy-data';

const HealthRecords = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline mb-4">Health Records</h2>
      <Tabs defaultValue="consultations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="consultations" className="space-y-4">
          {consultations.map((consultation) => (
            <Card key={consultation.id} className="shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="text-primary" />
                  <span>{consultation.specialty}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Doctor:</strong> {consultation.doctor}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(consultation.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="prescriptions" className="space-y-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="text-primary" />
                  <span>{prescription.medicine}</span>
                </CardTitle>
                <p className="text-sm font-normal text-muted-foreground">{prescription.dosage}</p>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-primary/80" />
                  <div>
                    <p className="font-semibold">Frequency</p>
                    <p className="text-muted-foreground">{prescription.frequency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary/80" />
                  <div>
                    <p className="font-semibold">Duration</p>
                    <p className="text-muted-foreground">{prescription.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthRecords;
