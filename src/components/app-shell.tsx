'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Home, Stethoscope, ClipboardList, User } from 'lucide-react';
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

export type Tab = 'home' | 'symptoms' | 'consult' | 'records' | 'profile' | 'medical' | 'prescription';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'symptoms':
        return <SymptomChecker />;
      case 'consult':
        return <Teleconsultation />;
      case 'records':
        return <HealthRecords />;
      case 'medical':
        return <Medical />;
      case 'prescription':
        return <PrescriptionReader />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'consult', icon: Stethoscope, label: 'Consult' },
    { id: 'records', icon: ClipboardList, label: 'Records' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto bg-card shadow-2xl flex flex-col min-h-screen">
        <header className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <h1 className="text-xl font-bold font-headline text-primary">
              ArogyaSetu Mini
            </h1>
          </div>
          {userAvatar && (
            <Image
              src={userAvatar.imageUrl}
              alt={userAvatar.description}
              data-ai-hint={userAvatar.imageHint}
              width={40}
              height={40}
              className="rounded-full border-2 border-primary/50"
            />
          )}
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
