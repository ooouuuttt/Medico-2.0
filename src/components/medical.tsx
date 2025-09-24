
'use client'

import { Pill } from "lucide-react";
import MedicineAvailability from "./medicine-availability";
import { MedicalTabState, Tab } from "./app-shell";

interface MedicalProps {
  initialState?: MedicalTabState;
  setActiveTab: (tab: Tab, state?: MedicalTabState) => void;
}

const Medical = ({ initialState, setActiveTab }: MedicalProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <Pill className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-2xl font-bold font-headline">Nearby Medical</h2>
        <p className="text-muted-foreground">
          Find pharmacies and order medicines online.
        </p>
      </div>
      <MedicineAvailability initialState={initialState} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Medical;
