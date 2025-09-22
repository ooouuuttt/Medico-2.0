
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Doctor } from '@/lib/dummy-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { Send, PhoneOff } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ChatConsultationProps {
  doctor: Doctor;
  onEnd: () => void;
}

type Message = {
    sender: 'user' | 'doctor';
    text: string;
    timestamp: string;
}

const ChatConsultation = ({ doctor, onEnd }: ChatConsultationProps) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'doctor', text: `Hello! I'm Dr. ${doctor.name}. How can I help you today?`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const doctorAvatar = PlaceHolderImages.find(
        (img) => img.id === `doctor-avatar-${doctor.id}`
    );
     const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const userMessage: Message = {
            sender: 'user',
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        
        // Simulate doctor's reply
        setTimeout(() => {
            const doctorReply: Message = {
                sender: 'doctor',
                text: 'Thank you for sharing. Could you please elaborate a bit more?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, doctorReply]);
        }, 1500)
    };


  return (
    <div className="flex flex-col h-[80vh] animate-in fade-in duration-500">
      <CardHeader className='flex-row items-center justify-between p-3 border-b'>
         <div className='flex items-center gap-3'>
            {doctorAvatar && (
                <Avatar>
                    <AvatarImage src={doctorAvatar.imageUrl} alt={`Dr. ${doctor.name}`} className="object-cover" />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div>
                <h2 className="font-semibold text-lg">
                    Dr. {doctor.name}
                </h2>
                <p className="text-sm text-green-500">Online</p>
            </div>
         </div>
          <Button variant="ghost" size="icon" onClick={onEnd}>
            <PhoneOff className="h-6 w-6 text-red-500" />
          </Button>
      </CardHeader>

      <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'doctor' && doctorAvatar && (
                     <Avatar className='h-8 w-8'>
                        <AvatarImage src={doctorAvatar.imageUrl} className="object-cover"/>
                        <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                <div className={`rounded-lg px-3 py-2 max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>{msg.timestamp}</p>
                </div>
                 {msg.sender === 'user' && userAvatar && (
                     <Avatar className='h-8 w-8'>
                        <AvatarImage src={userAvatar.imageUrl} className="object-cover" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                )}
            </div>
        ))}
      </CardContent>

      <CardFooter className='p-2 border-t'>
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                autoComplete='off'
            />
            <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
            </Button>
        </form>
      </CardFooter>
    </div>
  );
};

export default ChatConsultation;

