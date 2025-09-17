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

export type Pharmacy = {
  id:string;
  name: string;
  distance: string;
  medicines: { [key: string]: 'In Stock' | 'Out of Stock' };
};

export type Doctor = {
    id: string;
    name: string;
    specialty: string;
    experience: number;
    availability: 'Available Today' | 'Available Tomorrow';
}

export const doctors: Doctor[] = [
    { id: 'd1', name: 'Anjali Sharma', specialty: 'General Physician', experience: 10, availability: 'Available Today'},
    { id: 'd2', name: 'Rajesh Gupta', specialty: 'General Physician', experience: 15, availability: 'Available Tomorrow'},
    { id: 'd3', name: 'Rohan Mehra', specialty: 'Pediatrics', experience: 8, availability: 'Available Today'},
    { id: 'd4', name: 'Priya Singh', specialty: 'Gynecology', experience: 12, availability: 'Available Today'},
    { id: 'd5', name: 'Sunita Patil', specialty: 'Gynecology', experience: 20, availability: 'Available Tomorrow'},
    { id: 'd6', name: 'Vikram Rathod', specialty: 'Dermatology', experience: 7, availability: 'Available Today'},
    { id: 'd7', name: 'Sanjay Verma', specialty: 'Orthopedics', experience: 18, availability: 'Available Tomorrow'},
    { id: 'd8', name: 'Amit Desai', specialty: 'Cardiology', experience: 22, availability: 'Available Today'},
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

export const pharmacies: Pharmacy[] = [
  {
    id: 'ph1',
    name: 'Apollo Pharmacy',
    distance: '1.2 km away',
    medicines: { 'Paracetamol': 'In Stock', 'Amoxicillin': 'Out of Stock', 'Ibuprofen': 'In Stock' },
  },
  {
    id: 'ph2',
    name: 'Jan Aushadhi Kendra',
    distance: '2.5 km away',
    medicines: { 'Paracetamol': 'In Stock', 'Amoxicillin': 'In Stock', 'Folic Acid': 'Out of Stock' },
  },
  {
    id: 'ph3',
    name: 'Wellness Forever',
    distance: '3.1 km away',
    medicines: { 'Paracetamol': 'Out of Stock', 'Amoxicillin': 'In Stock', 'Ibuprofen': 'In Stock' },
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
