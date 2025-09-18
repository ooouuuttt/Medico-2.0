
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  Bot,
  Stethoscope,
  ClipboardList,
  Pill,
  Bell,
  Newspaper,
  Calendar,
  AlertTriangle,
  ScanText
} from 'lucide-react';
import type { Tab } from '@/components/app-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reminders } from '@/lib/dummy-data';
import { getHealthNewsSummary } from '@/ai/flows/health-news-summaries';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardProps {
  setActiveTab: (tab: Tab) => void;
}

const iconMap: { [key: string]: React.ElementType } = {
  appointment: Calendar,
  medicine: Pill,
  vaccine: AlertTriangle,
};

const Dashboard: FC<DashboardProps> = ({ setActiveTab }) => {
  const [newsSummary, setNewsSummary] = useState('');
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoadingNews(true);
        const { summary } = await getHealthNewsSummary({ query: 'latest health news for rural India' });
        setNewsSummary(summary);
      } catch (error) {
        console.error('Failed to fetch health news:', error);
        setNewsSummary('The health news service is currently busy. Please try again in a few moments.');
      } finally {
        setIsLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  const quickAccessItems = [
    { title: 'Symptom Checker', icon: Bot, tab: 'symptoms' },
    { title: 'Book Consultation', icon: Stethoscope, tab: 'consult' },
    { title: 'Scan Prescription', icon: ScanText, tab: 'prescription' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-3 gap-3 text-center">
        {quickAccessItems.map((item) => (
          <div key={item.title}>
            <Button
              variant="outline"
              className="bg-card h-24 w-full flex flex-col justify-center items-center gap-2 rounded-xl shadow-sm hover:bg-primary/5"
              onClick={() => setActiveTab(item.tab as Tab)}
            >
              <item.icon className="h-8 w-8 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {item.title}
              </span>
            </Button>
          </div>
        ))}
      </div>

       <div className="grid grid-cols-2 gap-3">
         <Button
            variant="outline"
            className="w-full justify-center p-4 h-auto bg-card rounded-xl shadow-sm flex flex-col items-center gap-2 text-center"
            onClick={() => setActiveTab('medical')}
          >
            <Pill className="h-8 w-8 text-primary" />
            <div>
              <p className="font-bold text-base">Nearby Medical</p>
              <p className="text-sm text-muted-foreground">Order medicines</p>
            </div>
          </Button>
           <Button
            variant="outline"
            className="w-full justify-center p-4 h-auto bg-card rounded-xl shadow-sm flex flex-col items-center gap-2 text-center"
            onClick={() => setActiveTab('records')}
          >
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <p className="font-bold text-base">Health Records</p>
              <p className="text-sm text-muted-foreground">View your history</p>
            </div>
          </Button>
      </div>

      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center space-y-0 p-4 bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg ml-2">Reminders</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-sm space-y-3">
          {reminders.map((reminder) => {
            const Icon = iconMap[reminder.type] || Bell;
            return (
              <div key={reminder.id} className="flex items-center gap-3">
                <div className="bg-secondary p-2 rounded-full">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{reminder.title}</p>
                  <p className="text-muted-foreground">{reminder.time}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center space-y-0 p-4 bg-primary/10">
          <Newspaper className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg ml-2">Health News</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-sm">
          {isLoadingNews ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-muted-foreground leading-relaxed">{newsSummary}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
