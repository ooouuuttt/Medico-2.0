'use client';

import { useState } from 'react';
import { Search, MapPin, ShoppingCart, ArrowLeft, CheckCircle2, Minus, Plus, Building, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { pharmacies, Pharmacy } from '@/lib/dummy-data';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type View = 'list' | 'pharmacy' | 'payment' | 'confirmation';
type CartItem = { medicine: string; pharmacy: Pharmacy; quantity: number, price: number };

const MedicineAvailability = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<View>('list');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<{name: string, price: number, quantity: number} | null>(null);
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const { toast } = useToast();

  const handleSelectPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setSelectedMedicine(null);
    setView('pharmacy');
  };

  const handleSelectMedicine = (name: string, price: number, quantity: number) => {
    setSelectedMedicine({name, price, quantity});
  }

  const handleOrder = () => {
    if (!selectedPharmacy || !selectedMedicine) return;
    setCartItem({ pharmacy: selectedPharmacy, medicine: selectedMedicine.name, quantity: 1, price: selectedMedicine.price });
    setView('payment');
  }

  const handlePayment = () => {
    setView('confirmation');
  };

  const handleReset = () => {
    setView('list');
    setSearchTerm('');
    setCartItem(null);
    setSelectedPharmacy(null);
    setSelectedMedicine(null);
  }

  const updateQuantity = (amount: number) => {
    if (!cartItem || !selectedMedicine) return;
    const newQuantity = cartItem.quantity + amount;
    if (newQuantity > 0 && newQuantity <= selectedMedicine.quantity) {
      setCartItem({ ...cartItem, quantity: newQuantity });
    }
  }

  const filteredPharmacies = searchTerm
    ? pharmacies.filter((pharmacy) =>
        Object.keys(pharmacy.medicines).some(
          (med) => med.toLowerCase().includes(searchTerm.toLowerCase()) && pharmacy.medicines[med].status === 'In Stock'
        )
      )
    : pharmacies;
  
  const availableMedicines = selectedPharmacy 
    ? Object.entries(selectedPharmacy.medicines).filter(([, medInfo]) => medInfo.status === 'In Stock')
    : [];

  if (view === 'confirmation') {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold font-headline">Order Placed!</h2>
        <p className="text-muted-foreground">
          Your order for <strong>{cartItem?.quantity} x {cartItem?.medicine}</strong> from{' '}
          <strong>{cartItem?.pharmacy?.name}</strong> has been placed.
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

  if (view === 'payment' && cartItem) {
    return (
      <div className="animate-in fade-in duration-500">
        <Button variant="ghost" size="sm" onClick={() => setView('pharmacy')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to pharmacy
        </Button>
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Confirm & Pay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="font-bold text-lg">{cartItem.pharmacy.name}</h3>
                <p className="text-muted-foreground text-sm">{cartItem.pharmacy.distance}</p>
            </div>
            <Separator />
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Medicine</span>
                    <span className="font-semibold capitalize">{cartItem.medicine}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Quantity</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(-1)}><Minus className="h-4 w-4" /></Button>
                        <span className="font-semibold w-4 text-center">{cartItem.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Price</span>
                    <span className="font-semibold">₹{cartItem.price * cartItem.quantity}</span>
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
              Pay ₹{cartItem.price * cartItem.quantity} & Order
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (view === 'pharmacy' && selectedPharmacy) {
    return (
        <div className="animate-in fade-in duration-500">
             <Button variant="ghost" size="sm" onClick={() => { setView('list'); setSelectedPharmacy(null); }} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to list
            </Button>
            <Card className="rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle>{selectedPharmacy.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground pt-1">
                        <Building className="w-4 h-4 mr-2" />
                        <span>{selectedPharmacy.address}</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h4 className='font-semibold'>Available Medicines</h4>
                    {availableMedicines.length > 0 ? (
                      <div className="space-y-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              <span>{selectedMedicine ? selectedMedicine.name : "Select a medicine"}</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                            {availableMedicines.map(([medicineName, medicineInfo]) => (
                                <DropdownMenuItem key={medicineName} onClick={() => handleSelectMedicine(medicineName, medicineInfo.price, medicineInfo.quantity)}>
                                    {medicineName}
                                </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {selectedMedicine && (
                          <div className="border-t pt-4 space-y-4">
                              <div className="flex justify-between items-center">
                                  <div>
                                      <p className="font-medium capitalize">{selectedMedicine.name}</p>
                                      <p className="text-sm text-muted-foreground">₹{selectedMedicine.price} | Qty: {selectedMedicine.quantity}</p>
                                  </div>
                                  <Button size="sm" onClick={handleOrder}>
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      Order
                                  </Button>
                              </div>
                          </div>
                        )}
                      </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center pt-4">No medicines currently available.</p>
                    )}
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

      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {filteredPharmacies.length > 0 ? (
          filteredPharmacies.map((pharmacy) => (
            <Card key={pharmacy.id} className="rounded-xl shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">{pharmacy.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            <span>{pharmacy.distance}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Building className="w-3 h-3 mr-1.5" />
                            <span>{pharmacy.address}</span>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => handleSelectPharmacy(pharmacy)}>
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Shop at {pharmacy.name}</span>
                    </Button>
                </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground p-4">
            {searchTerm ? 'No pharmacies found with this medicine.' : 'No pharmacies found.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicineAvailability;
