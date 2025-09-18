'use client';

import { useState } from 'react';
import AppShell from '@/components/app-shell';
import LandingPage from '@/components/landing-page';

export default function Home() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return (
      <div className="bg-background">
        <AppShell />
      </div>
    );
  }

  return <LandingPage onGetStarted={() => setShowApp(true)} />;
}
