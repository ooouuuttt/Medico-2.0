'use client';

import { useState } from 'react';
import { Search, MapPin, ShoppingCart, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { pharmacies, Pharmacy } from '@/lib/dummy-data';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

type View = 'search' | 'payment' | 'confirmation';


const MedicineAvailability = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<View>('search');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const { toast } = useToast();

  const handleOrder = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setView('payment');
  }

  const handlePayment = () => {
    setView('confirmation');
  };

  const handleReset = () => {
    setView('search');
    setSearchTerm('');
    setSelectedPharmacy(null);
  }

  const filteredPharmacies = searchTerm ? pharmacies.filter((pharmacy) =>
    Object.keys(pharmacy.medicines).some(
      (med) => med.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) : [];

  const getStockStatus = (pharmacy: Pharmacy, medicine: string): 'In Stock' | 'Out of Stock' | 'Not Sold' => {
      if (!medicine) return 'Not Sold';
      const lowerCaseMedicine = medicine.toLowerCase();
      for (const medKey in pharmacy.medicines) {
          if (medKey.toLowerCase().includes(lowerCaseMedicine)) {
              return pharmacy.medicines[medKey];
          }
      }
      return 'Not Sold';
  }

  if (view === 'confirmation') {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold font-headline">Order Placed!</h2>
        <p className="text-muted-foreground">
          Your order for <strong>{searchTerm}</strong> from{' '}
          <strong>{selectedPharmacy?.name}</strong> has been placed.
        </p>
        <p className="text-sm text-muted-foreground">
          It will be delivered to your address soon.
        </p>
        <Button
          onClick={handleReset}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Order another medicine
        </Button>
      </div>
    );
  }

  if (view === 'payment') {
    return (
      <div className="animate-in fade-in duration-500">
        <Button variant="ghost" size="sm" onClick={() => setView('search')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to search
        </Button>
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Confirm & Pay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="font-bold text-lg">{selectedPharmacy?.name}</h3>
                <p className="text-muted-foreground text-sm">{selectedPharmacy?.distance}</p>
            </div>
            <Separator />
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Medicine</span>
                    <span className="font-semibold capitalize">{searchTerm}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">₹150</span>
                </div>
                 <div className="flex justify-between text-xs text-muted-foreground">
                    <span>(Price is for one strip/bottle)</span>
                </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Select Payment Method</h4>
              <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline">UPI</Button>
                  <Button variant="outline">Card</Button>
                  <Button variant="outline">Cash on Delivery</Button>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handlePayment}>
              Pay ₹150 & Order
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a medicine..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm && (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {filteredPharmacies.length > 0 ? (
            filteredPharmacies.map((pharmacy) => {
              const status = getStockStatus(pharmacy, searchTerm);
              if (status === 'Not Sold') return null;
              
              const isInStock = status === 'In Stock';

              return (
                <div key={pharmacy.id} className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{pharmacy.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      <span>{pharmacy.distance}</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant={isInStock ? 'outline' : 'destructive'} className={isInStock ? 'text-green-600 border-green-600' : ''}>
                      {status}
                    </Badge>
                    {isInStock && (
                      <Button size="icon" className='h-8 w-8' onClick={() => handleOrder(pharmacy)}>
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground p-4">No pharmacies found with this medicine.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineAvailability;
