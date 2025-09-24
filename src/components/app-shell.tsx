
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Home, Stethoscope, ClipboardList, User as UserIcon, LogOut, CalendarCheck, Languages, ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Dashboard from '@/components/dashboard';
import SymptomChecker from '@/components/symptom-checker';
import Teleconsultation from '@/components/teleconsultation';
import HealthRecords from '@/components/health-records';
import Profile from '@/components/profile';
import { Logo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Medical from './medical';
import PrescriptionReader from './prescription-reader';
import { Pharmacy } from '@/lib/dummy-data';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Appointments from './appointments';
import { useTranslation } from '@/context/i18n';
import Prescriptions from './prescriptions';
import { Medication } from '@/lib/user-service';

export type Tab = 'home' | 'symptoms' | 'consult' | 'records' | 'profile' | 'medical' | 'scan-prescription' | 'appointments' | 'prescriptions';

export interface MedicalTabState {
  pharmacy?: Pharmacy;
  medicineName?: string;
  medicinesToFind?: string[]; // For finding all medicines in a prescription
  prescriptionToSend?: { doctorName: string; date: string, medications: Medication[] }; // For sending a prescription
}

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

interface AppShellProps {
  user: User;
}

const languageNames: {[key: string]: string} = {
  en: 'English',
  hi: 'हिन्दी',
  pa: 'ਪੰਜਾਬੀ',
};

export default function AppShell({ user }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [medicalTabState, setMedicalTabState] = useState<MedicalTabState>({});
  const { toast } = useToast();
  const { language, t, setLanguage } = useTranslation();


  const handleSetActiveTab = (tab: Tab, state?: MedicalTabState) => {
    if (tab === 'medical' && state) {
      setMedicalTabState(state);
    } else {
      setMedicalTabState({});
    }
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    await auth.signOut();
    toast({ title: 'Signed out successfully.'});
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard setActiveTab={handleSetActiveTab} />;
      case 'symptoms':
        return <SymptomChecker />;
      case 'consult':
        return <Teleconsultation user={user} />;
      case 'records':
        return <HealthRecords user={user} />;
      case 'appointments':
        return <Appointments user={user} />;
      case 'medical':
        return <Medical initialState={medicalTabState} setActiveTab={handleSetActiveTab} />;
      case 'scan-prescription':
        return <PrescriptionReader user={user} setActiveTab={handleSetActiveTab} />;
      case 'prescriptions':
        return <Prescriptions user={user} setActiveTab={handleSetActiveTab} />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return <Dashboard setActiveTab={handleSetActiveTab} />;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'consult', icon: Stethoscope, label: t('consult') },
    { id: 'prescriptions', icon: FileText, label: t('prescriptions')},
    { id: 'appointments', icon: CalendarCheck, label: t('appointments') },
    { id: 'records', icon: ClipboardList, label: t('records') },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto bg-card shadow-2xl flex flex-col min-h-screen">
        <header className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <h1 className="text-xl font-bold font-headline text-primary">
              Medico
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto text-sm bg-primary/10 hover:bg-primary/20">
                      <Languages className="w-5 h-5 text-primary"/>
                      <span>{languageNames[language]}</span>
                      <ChevronDown className="w-4 h-4 text-primary/80"/>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')}>हिन्दी</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('pa')}>ਪੰਜਾਬੀ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label="Open user menu"
                  >
                    <Image
                      src={user.photoURL || userAvatar?.imageUrl || ''}
                      alt={user.displayName || 'User Avatar'}
                      data-ai-hint={userAvatar?.imageHint}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-primary/50 object-cover"
                    />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('my_account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('log_out')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
          {renderContent()}
        </main>

        <footer className="sticky bottom-0 bg-card border-t border-border mt-auto">
          <nav className="flex justify-around items-center p-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'flex flex-col h-auto items-center justify-center gap-1 p-2 w-full rounded-lg transition-colors duration-200',
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground'
                )}
                onClick={() => setActiveTab(item.id as Tab)}
                aria-label={item.label}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}
