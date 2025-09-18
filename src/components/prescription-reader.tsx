'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ScanText, Upload, Activity, AlertTriangle, CheckCircle, MapPin, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { readPrescription, PrescriptionReaderOutput } from '@/ai/flows/prescription-reader';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { pharmacies, Pharmacy } from '@/lib/dummy-data';
import { Tab, MedicalTabState } from './app-shell';

interface PrescriptionReaderProps {
  setActiveTab: (tab: Tab, state?: MedicalTabState) => void;
}


const PrescriptionReader = ({ setActiveTab }: PrescriptionReaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<PrescriptionReaderOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            setResult(null);
            setError(null);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
    });
    
    const handleAnalyze = async () => {
        if (!file || !preview) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const imageDataUri = preview;
            const res = await readPrescription({ imageDataUri });
            setResult(res);
        } catch (e) {
            console.error(e);
            setError('The AI service is currently busy. Please try again in a few moments.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
        setIsLoading(false);
    };

    const findPharmaciesForMedicine = (medicineName: string): Pharmacy[] => {
        if (!medicineName) return [];
        const medicineNameLower = medicineName.toLowerCase().trim();
        return pharmacies.filter(pharmacy => 
            Object.keys(pharmacy.medicines).some(med => 
                med.toLowerCase().trim().includes(medicineNameLower) && pharmacy.medicines[med].status === 'In Stock'
            )
        );
    };
    
    const handleOrderClick = (pharmacy: Pharmacy, medicineName: string) => {
        setActiveTab('medical', { pharmacy, medicineName });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <ScanText className="mx-auto h-12 w-12 text-primary" />
                <h2 className="text-2xl font-bold font-headline">AI Prescription Reader</h2>
                <p className="text-muted-foreground">
                    Upload a photo of your prescription to digitize it.
                </p>
            </div>

            {!preview && (
                <Card {...getRootProps()} className="border-2 border-dashed rounded-xl text-center flex flex-col justify-center items-center h-48 cursor-pointer hover:border-primary/80 hover:bg-primary/5 transition-colors">
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 text-muted-foreground"/>
                    <p className="text-muted-foreground text-sm mt-2">{isDragActive ? 'Drop the image here...' : 'Drag & drop an image, or click to select'}</p>
                </Card>
            )}

            {preview && (
                 <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-4">
                        <img src={preview} alt="Prescription preview" className="rounded-lg max-h-64 w-full object-contain" />
                        <div className="flex gap-2 mt-4">
                             <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
                                {isLoading ? <><Activity className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : 'Analyze Prescription'}
                            </Button>
                            <Button onClick={handleReset} variant="outline" className="w-full">
                                Upload New
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="bg-destructive/10 border-destructive rounded-xl">
                    <CardContent className="p-4 text-center text-destructive font-medium flex items-center justify-center gap-2">
                       <AlertTriangle className='h-5 w-5' /> {error}
                    </CardContent>
                </Card>
            )}

            {result && (
                <Card className="rounded-xl animate-in fade-in duration-500">
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><CheckCircle className='text-green-500' /> Analysis Complete</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <div><span className="font-semibold">Doctor:</span> {result.doctorName}</div>
                            <div><span className="font-semibold">Date:</span> {result.date}</div>
                        </div>
                        <Separator />
                        <h4 className="font-semibold">Medicines</h4>
                        <div className='space-y-4'>
                        {result.medicines.map((med, index) => {
                            const availablePharmacies = findPharmaciesForMedicine(med.name);
                            return (
                                <div key={index} className="border p-3 rounded-lg text-sm">
                                    <div className='font-bold text-base capitalize mb-2'>{med.name}</div>
                                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                                        <div><Badge variant="secondary" className='w-full justify-center text-center'>{med.dosage}</Badge></div>
                                        <div><Badge variant="secondary" className='w-full justify-center text-center'>{med.frequency}</Badge></div>
                                        <div><Badge variant="secondary" className='w-full justify-center text-center'>{med.duration}</Badge></div>
                                    </div>
                                    {availablePharmacies.length > 0 && (
                                        <div className='mt-3 pt-3 border-t'>
                                             <h5 className='text-xs font-bold mb-2 text-primary'>Available at:</h5>
                                             <div className='space-y-2'>
                                                {availablePharmacies.map(p => (
                                                    <div key={p.id} className='flex items-center justify-between text-xs'>
                                                        <div className='flex items-center gap-2'>
                                                            <MapPin className='w-3 h-3' />
                                                            <div>
                                                                <span>{p.name}</span>
                                                                <span className='text-muted-foreground/80 ml-1'>({p.distance})</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOrderClick(p, med.name)}>
                                                            <ShoppingCart className="h-4 w-4 text-primary" />
                                                        </Button>
                                                    </div>
                                                ))}
                                             </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        </div>
                        <p className="text-xs text-muted-foreground/80 pt-4 border-t">
                            Disclaimer: This is an AI-generated analysis. Always verify with your doctor or pharmacist.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PrescriptionReader;
