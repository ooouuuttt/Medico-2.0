
'use client';

import { useState } from 'react';
import {
  FileText,
  Stethoscope,
  Calendar,
  Pill,
  Repeat,
  Clock,
  Upload,
  HeartPulse,
  Droplets,
  Thermometer,
  LineChart,
  Bot
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { consultations, prescriptions, documents, vitalsData } from '@/lib/dummy-data';
import { Button } from './ui/button';
import { useDropzone } from 'react-dropzone';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from './ui/chart';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const HealthRecords = () => {
  const [myFiles, setMyFiles] = useState<File[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    setMyFiles([...myFiles, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': [],
    },
  });

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline mb-4">Health Records</h2>
      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="consultations">Consults</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
            <Card className="shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><HeartPulse className="text-primary"/>Heart Rate</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  heartRate: { label: "Heart Rate", color: "hsl(var(--primary))" },
                }} className="h-[150px] w-full">
                  <AreaChart data={vitalsData.heartRate}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis hide/>
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <Area dataKey="value" type="natural" fill="hsl(var(--primary))" fillOpacity={0.4} stroke="hsl(var(--primary))" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
             <Card className="shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Droplets className="text-primary"/>Blood Pressure</CardTitle>
                 <CardDescription>Last 7 days</CardDescription>
              </header>
              <CardContent>
                  <ChartContainer config={{
                    systolic: { label: "Systolic", color: "hsl(var(--primary))" },
                    diastolic: { label: "Diastolic", color: "hsl(var(--accent))" },
                  }} className="h-[150px] w-full">
                  <AreaChart data={vitalsData.bloodPressure}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis hide/>
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <Area dataKey="systolic" type="natural" fill="hsl(var(--primary))" fillOpacity={0.4} stroke="hsl(var(--primary))" stackId="a" />
                     <Area dataKey="diastolic" type="natural" fill="hsl(var(--accent))" fillOpacity={0.4} stroke="hsl(var(--accent))" stackId="a" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
                {consultations.map((consultation) => (
                    <AccordionItem key={consultation.id} value={consultation.id} className="border-none">
                        <Card className="shadow-sm rounded-xl overflow-hidden">
                            <AccordionTrigger className="p-4 hover:no-underline">
                                <CardHeader className="p-0 text-left">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Stethoscope className="text-primary" />
                                        <span>{consultation.specialty}</span>
                                    </CardTitle>
                                     <CardDescription className="flex items-center gap-2 pt-2 text-xs">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(consultation.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </CardDescription>
                                </CardHeader>
                            </AccordionTrigger>
                            <AccordionContent>
                                <CardContent className="text-sm space-y-4 pt-0">
                                    <Separator />
                                     <p>
                                        <strong>Doctor:</strong> {consultation.doctor}
                                    </p>
                                    {consultation.summary && (
                                        <div className="bg-primary/5 p-3 rounded-lg space-y-2 border border-primary/20">
                                            <h4 className="font-semibold flex items-center gap-2 text-primary"><Bot className="w-5 h-5"/> AI Summary</h4>
                                            <p className="text-muted-foreground text-xs leading-relaxed">{consultation.summary}</p>
                                        </div>
                                    )}
                                     <Button size="sm" variant="outline" className='w-full'>View Full Report</Button>
                                </CardContent>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                ))}
            </Accordion>
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

        <TabsContent value="documents" className="space-y-4">
            <Card {...getRootProps()} className="border-2 border-dashed rounded-xl text-center flex flex-col justify-center items-center h-32 cursor-pointer hover:border-primary/80 hover:bg-primary/5 transition-colors">
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 text-muted-foreground"/>
                <p className="text-muted-foreground text-sm mt-2">{isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to upload'}</p>
            </Card>
            <div className="space-y-2">
                {[...documents, ...myFiles.map(f => ({id: f.name, name: f.name, type: f.type.split('/')[1].toUpperCase(), date: f.lastModifiedDate?.toLocaleDateString() ?? new Date().toLocaleDateString()}))].map((doc) => (
                    <Card key={doc.id} className="shadow-sm rounded-xl">
                        <CardContent className="p-3 flex items-center gap-3">
                            <div className="bg-secondary p-2 rounded-md">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.date}</p>
                            </div>
                            <Badge variant="outline">{doc.type}</Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthRecords;
