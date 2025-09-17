import type { LucideIcon } from "lucide-react";

export type Consultation = {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  notes?: string;
};

export type Prescription = {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedOn: string;
};

export type Document = {
  id: string;
  name: string;
  type: string;
  date: string;
}

export type Pharmacy = {
  id:string;
  name: string;
  distance: string;
  address: string;
  medicines: { [key: string]: { status: 'In Stock' | 'Out of Stock', quantity: number, price: number } };
};

export type Doctor = {
    id: string;
    name: string;
    specialty: string;
    experience: number;
    availability: 'Available Today' | 'Available Tomorrow';
    availabilitySlots: { date: string, slots: string[] }[]
}

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);

export const doctors: Doctor[] = [
    { 
      id: 'd1', name: 'Anjali Sharma', specialty: 'General Physician', experience: 10, availability: 'Available Today',
      availabilitySlots: [
        { date: today.toISOString().split('T')[0], slots: ['10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM'] },
        { date: tomorrow.toISOString().split('T')[0], slots: ['09:00 AM', '09:30 AM', '11:30 AM'] },
      ]
    },
    { 
      id: 'd2', name: 'Rajesh Gupta', specialty: 'General Physician', experience: 15, availability: 'Available Tomorrow',
      availabilitySlots: [
        { date: tomorrow.toISOString().split('T')[0], slots: ['10:00 AM', '10:30 AM', '03:00 PM', '03:30 PM'] },
        { date: dayAfter.toISOString().split('T')[0], slots: ['09:00 AM', '09:30 AM', '11:30 AM'] },
      ]
    },
    { 
      id: 'd3', name: 'Rohan Mehra', specialty: 'Pediatrics', experience: 8, availability: 'Available Today',
      availabilitySlots: [
        { date: today.toISOString().split('T')[0], slots: ['11:00 AM', '11:30 AM', '12:00 PM'] },
        { date: dayAfter.toISOString().split('T')[0], slots: ['02:00 PM', '02:30 PM'] },
      ]
    },
    { 
      id: 'd4', name: 'Priya Singh', specialty: 'Gynecology', experience: 12, availability: 'Available Today',
      availabilitySlots: [
         { date: today.toISOString().split('T')[0], slots: ['10:00 AM', '10:30 AM', '11:00 AM'] },
         { date: tomorrow.toISOString().split('T')[0], slots: ['02:00 PM', '02:30 PM', '03:00 PM'] },
      ]
    },
    { 
      id: 'd5', name: 'Sunita Patil', specialty: 'Gynecology', experience: 20, availability: 'Available Tomorrow',
      availabilitySlots: [
        { date: tomorrow.toISOString().split('T')[0], slots: ['11:00 AM', '11:30 AM'] },
        { date: dayAfter.toISOString().split('T')[0], slots: ['10:00 AM', '10:30 AM', '11:00 AM'] },
      ]
    },
    { 
      id: 'd6', name: 'Vikram Rathod', specialty: 'Dermatology', experience: 7, availability: 'Available Today',
      availabilitySlots: [
        { date: today.toISOString().split('T')[0], slots: ['04:00 PM', '04:30 PM'] },
        { date: tomorrow.toISOString().split('T')[0], slots: ['04:00 PM', '04:30 PM'] },
      ]
    },
    { 
      id: 'd7', name: 'Sanjay Verma', specialty: 'Orthopedics', experience: 18, availability: 'Available Tomorrow',
      availabilitySlots: [
        { date: tomorrow.toISOString().split('T')[0], slots: ['12:00 PM', '12:30 PM'] },
        { date: dayAfter.toISOString().split('T')[0], slots: ['11:00 AM', '11:30 AM'] },
      ]
    },
    { 
      id: 'd8', name: 'Amit Desai', specialty: 'Cardiology', experience: 22, availability: 'Available Today',
      availabilitySlots: [
         { date: today.toISOString().split('T')[0], slots: ['09:00 AM', '09:30 AM'] },
         { date: dayAfter.toISOString().split('T')[0], slots: ['09:00 AM', '09:30 AM'] },
      ]
    },
]

export const consultations: Consultation[] = [
  { id: 'c1', doctor: 'Dr. Anjali Sharma', specialty: 'General Physician', date: '2024-07-15' },
  { id: 'c2', doctor: 'Dr. Rohan Mehra', specialty: 'Pediatrics', date: '2024-06-20' },
  { id: 'c3', doctor: 'Dr. Priya Singh', specialty: 'Gynecology', date: '2024-05-10' },
];

export const prescriptions: Prescription[] = [
  { id: 'p1', medicine: 'Paracetamol', dosage: '500mg', frequency: 'Twice a day', duration: '3 days', prescribedOn: '2024-07-15' },
  { id: 'p2', medicine: 'Amoxicillin', dosage: '250mg', frequency: 'Thrice a day', duration: '5 days', prescribedOn: '2024-06-20' },
  { id: 'p3', medicine: 'Folic Acid', dosage: '5mg', frequency: 'Once a day', duration: '30 days', prescribedOn: '2024-05-10' },
];

export const documents: Document[] = [
    { id: 'doc1', name: 'Blood Test Report', type: 'PDF', date: '2024-07-10'},
    { id: 'doc2', name: 'X-Ray Scan', type: 'JPG', date: '2024-05-22'},
];

export const pharmacies: Pharmacy[] = [
  {
    id: 'ph1',
    name: 'Apollo Pharmacy',
    distance: '1.2 km away',
    address: 'Main Road, Rampur',
    medicines: { 
      'Paracetamol': { status: 'In Stock', quantity: 50, price: 30 },
      'Amoxicillin': { status: 'Out of Stock', quantity: 0, price: 80 },
      'Ibuprofen': { status: 'In Stock', quantity: 30, price: 45 }
    },
  },
  {
    id: 'ph2',
    name: 'Jan Aushadhi Kendra',
    distance: '2.5 km away',
    address: 'Bus Stand Road, Govindpur',
    medicines: { 
      'Paracetamol': { status: 'In Stock', quantity: 100, price: 25 },
      'Amoxicillin': { status: 'In Stock', quantity: 20, price: 70 },
      'Folic Acid': { status: 'Out of Stock', quantity: 0, price: 50 }
    },
  },
  {
    id: 'ph3',
    name: 'Wellness Forever',
    distance: '3.1 km away',
    address: 'Market Square, Sitapur',
    medicines: { 
      'Ibuprofen': { status: 'In Stock', quantity: 45, price: 40 },
      'Cough Syrup': { status: 'In Stock', quantity: 25, price: 120 }
    },
  },
   {
    id: 'ph4',
    name: 'City Medicals',
    distance: '4.0 km away',
    address: 'Hospital Road, Alipur',
    medicines: { 
      'Paracetamol': { status: 'Out of Stock', quantity: 0, price: 32 },
      'Amoxicillin': { status: 'In Stock', quantity: 15, price: 75 },
      'Folic Acid': { status: 'In Stock', quantity: 60, price: 45 }
    },
  },
];

export const reminders = [
  { id: 'r1', title: 'Consultation with Dr. Verma', time: 'Tomorrow, 10:00 AM', type: 'appointment' },
  { id: 'r2', title: 'Take Paracetamol', time: 'Today, 9:00 PM', type: 'medicine' },
  { id: 'r3', title: 'Child Vaccination - Polio', time: '2024-08-05', type: 'vaccine' },
];

export const specialties = [
    { name: 'General Physician', icon: 'Stethoscope' },
    { name: 'Pediatrics', icon: 'Baby' },
    { name: 'Gynecology', icon: 'HeartPulse' },
    { name: 'Dermatology', icon: 'Sparkles' },
    { name: 'Orthopedics', icon: 'Bone' },
    { name: 'Cardiology', icon: 'Activity' },
];


function generateVitals(days: number, min: number, max: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * (max - min + 1)) + min,
    };
  });
}

function generateBloodPressure(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const systolic = Math.floor(Math.random() * (130 - 110 + 1)) + 110;
    const diastolic = Math.floor(Math.random() * (85 - 70 + 1)) + 70;
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      systolic,
      diastolic
    };
  });
}

export const vitalsData = {
  heartRate: generateVitals(7, 60, 90),
  bloodPressure: generateBloodPressure(7),
  temperature: generateVitals(7, 97, 100),
}
