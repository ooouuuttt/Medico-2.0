
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AppShell from '@/components/app-shell';
import LandingPage from '@/components/landing-page';
import AuthPage from '@/components/auth-page';
import { Skeleton } from '@/components/ui/skeleton';

type View = 'landing' | 'auth' | 'app' | 'loading';

export default function Home() {
  const [view, setView] = useState<View>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setView('app');
      } else {
        setUser(null);
        // If there's no user, but the view is 'app' (e.g., after sign-out),
        // switch back to the landing page.
        // Otherwise, let the current view ('auth' or 'landing') persist.
        if (view === 'app') {
          setView('landing');
        } else if (view === 'loading') {
          setView('landing');
        }
      }
    });

    return () => unsubscribe();
  }, [view]);

  const handleSuccessfulSignIn = (signedInUser: User) => {
    setUser(signedInUser);
    setView('app');
  };

  if (view === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <Skeleton className="h-[80vh] w-full max-w-md" />
      </div>
    );
  }

  if (view === 'app' && user) {
    return (
      <div className="bg-background">
        <AppShell />
      </div>
    );
  }

  if (view === 'auth') {
    return <AuthPage onSignIn={handleSuccessfulSignIn} />;
  }

  return <LandingPage onGetStarted={() => setView('auth')} />;
}
