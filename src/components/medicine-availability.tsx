
'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, ShoppingCart, ArrowLeft, CheckCircle2, Minus, Plus, Building, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { pharmacies, Pharmacy } from '@/lib/dummy-data';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from './ui/card';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MedicalTabState } from './app-shell';

type View = 'list' | 'pharmacy' | 'payment' | 'confirmation';
type CartItem = { medicine: string; pharmacy: Pharmacy; quantity: number, price: number };

interface MedicineAvailabilityProps {
  initialState?: MedicalTabState;
}

const MedicineAvailability = ({ initialState }: MedicineAvailabilityProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<View>('list');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<{name: string, price: number, quantity: number} | null>(null);
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialState?.pharmacy && initialState?.medicineName) {
      const pharmacy = pharmacies.find(p => p.id === initialState.pharmacy?.id);
      if (pharmacy) {
        const medicineKey = Object.keys(pharmacy.medicines).find(m => m.toLowerCase().includes(initialState.medicineName!.toLowerCase()));
        if (medicineKey) {
            const medicineInfo = pharmacy.medicines[medicineKey];
            handleSelectPharmacy(pharmacy);
            handleSelectMedicine(medicineKey, medicineInfo.price, medicineInfo.quantity);
        }
      }
    }
  }, [initialState]);

  const handleSelectPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setSelectedMedicine(null);
    setSearchTerm('');
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
          (med) => med.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : pharmacies;

  const getMedicineInfo = (pharmacy: Pharmacy, medName: string) => {
    const medKey = Object.keys(pharmacy.medicines).find(m => m.toLowerCase().includes(medName.toLowerCase()));
    return medKey ? pharmacy.medicines[medKey] : null;
  }

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
          You will receive a notification when it's ready for collection.
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
    const allMedicines = [...new Set(pharmacies.flatMap(p => Object.keys(p.medicines)))];
    return (
        <div className="animate-in fade-in duration-500">
             <Button variant="ghost" size="sm" onClick={() => { setView('list'); setSelectedPharmacy(null); }} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to list
            </Button>
            <Card className="rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle>{selectedPharmacy.name}</CardTitle>
                    <CardDescription className="flex items-center text-sm pt-1">
                        <Building className="w-4 h-4 mr-2" />
                        <span>{selectedPharmacy.address}, {selectedPharmacy.distance}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h4 className='font-semibold'>Check Medicine Availability</h4>
                    <div className="space-y-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span className='capitalize'>{selectedMedicine ? selectedMedicine.name : "Select a medicine"}</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                          {allMedicines.map((medicineName) => {
                              const medicineInfo = getMedicineInfo(selectedPharmacy, medicineName);
                              return (
                                <DropdownMenuItem key={medicineName} onClick={() => medicineInfo && handleSelectMedicine(medicineName, medicineInfo.price, medicineInfo.quantity)}>
                                    <span className='capitalize'>{medicineName}</span>
                                </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {selectedMedicine && (
                        <div className="border-t pt-4 space-y-4 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium capitalize">{selectedMedicine.name}</p>
                                    <p className="text-sm text-muted-foreground">Price: ₹{selectedMedicine.price} | In Stock: {selectedMedicine.quantity}</p>
                                </div>
                                <Button size="sm" onClick={handleOrder}>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Order
                                </Button>
                            </div>
                        </div>
                      )}
                    </div>
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
          filteredPharmacies.map((pharmacy) => {
            const medInfo = searchTerm ? getMedicineInfo(pharmacy, searchTerm) : null;
            return (
              <Card key={pharmacy.id} className="rounded-xl shadow-sm cursor-pointer" onClick={() => handleSelectPharmacy(pharmacy)}>
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
                      {searchTerm && medInfo && (
                         <div className='text-right'>
                            <Badge variant={medInfo.status === 'In Stock' ? 'default' : 'destructive'} className='bg-green-100 text-green-800'>
                                {medInfo.status === 'In Stock' ? <CheckCircle className='w-3 h-3 mr-1.5'/> : <XCircle className='w-3 h-3 mr-1.5'/>}
                                {medInfo.status}
                            </Badge>
                            <p className='text-sm font-semibold mt-1'>₹{medInfo.price}</p>
                         </div>
                      )}
                  </CardContent>
              </Card>
            )
          })
        ) : (
          <p className="text-center text-muted-foreground p-4">
            {searchTerm ? 'No pharmacies found with this medicine.' : 'Search to see pharmacy stock.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicineAvailability;
