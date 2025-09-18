
'use client';

import { useState } from 'react';
import AppShell from '@/components/app-shell';
import LandingPage from '@/components/landing-page';

type View = 'landing' | 'app';

export default function Home() {
  const [view, setView] = useState<View>('landing');

  if (view === 'app') {
    return (
      <div className="bg-background">
        <AppShell />
      </div>
    );
  }

  return <LandingPage onGetStarted={() => setView('app')} />;
}
