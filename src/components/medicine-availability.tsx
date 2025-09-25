'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, ShoppingCart, ArrowLeft, CheckCircle2, Minus, Plus, Building, ChevronDown, CheckCircle, XCircle, Send, FileText } from 'lucide-react';
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
import { MedicalTabState, Tab } from './app-shell';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Prescription } from '@/lib/prescription-service';
import { Medication } from '@/lib/user-service';

type View = 'list' | 'pharmacy' | 'payment' | 'confirmation' | 'send-prescription' | 'send-confirmation';
type CartItem = { medicine: string; pharmacy: Pharmacy; quantity: number, price: number };

interface MedicineAvailabilityProps {
  initialState?: MedicalTabState;
  setActiveTab: (tab: Tab, state?: MedicalTabState) => void;
}

const MedicineAvailability = ({ initialState, setActiveTab }: MedicineAvailabilityProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<View>('list');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<{name: string, price: number, quantity: number} | null>(null);
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>(pharmacies);
  const { toast } = useToast();
  const [billQuantities, setBillQuantities] = useState<{[key: string]: number}>({});
  const [maxBillQuantities, setMaxBillQuantities] = useState<{[key: string]: number}>({});

  const medicinesToFind = initialState?.medicinesToFind;
  const prescriptionToBill = initialState?.prescriptionToBill;
  const prescriptionToSend = initialState?.prescriptionToSend;


  useEffect(() => {
    if (medicinesToFind && medicinesToFind.length > 0) {
      setSearchTerm(medicinesToFind.join(', '));
      
      const sortedPharmacies = [...pharmacies]
        .map(pharmacy => {
          const matchCount = medicinesToFind.reduce((count, medName) => {
            const hasMed = Object.keys(pharmacy.medicines).some(
              (m) => m.toLowerCase().includes(medName.toLowerCase()) && pharmacy.medicines[m].status === 'In Stock'
            );
            return count + (hasMed ? 1 : 0);
          }, 0);
          return { ...pharmacy, matchCount };
        })
        .filter(p => p.matchCount > 0) // Only show pharmacies that have at least one medicine
        .sort((a, b) => b.matchCount - a.matchCount);

      setFilteredPharmacies(sortedPharmacies);
    } else if (prescriptionToSend) {
        setView('send-prescription');
    } else if (initialState?.pharmacy && initialState?.medicineName) {
      const pharmacy = pharmacies.find(p => p.id === initialState.pharmacy?.id);
      if (pharmacy) {
        const medicineKey = Object.keys(pharmacy.medicines).find(m => m.toLowerCase().includes(initialState.medicineName!.toLowerCase()));
        if (medicineKey) {
            const medicineInfo = pharmacy.medicines[medicineKey];
            handleSelectPharmacy(pharmacy);
            handleSelectMedicine(medicineKey, medicineInfo.price, medicineInfo.quantity);
        }
      }
    } else {
        const f = searchTerm
        ? pharmacies.filter((pharmacy) =>
            Object.keys(pharmacy.medicines).some(
              (med) => med.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        : pharmacies;
        setFilteredPharmacies(f);
    }
  }, [initialState, searchTerm, prescriptionToSend, medicinesToFind]);

  const handleSelectPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setSelectedMedicine(null);
    setSearchTerm('');
    setView('pharmacy');
  };
  
  const handleSelectPharmacyForSending = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    // Simulate sending prescription
    toast({
        title: "Prescription Sent",
        description: `Your prescription has been sent to ${pharmacy.name}. They will contact you shortly.`,
    });
    setView('send-confirmation');
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
    setActiveTab('medical', {}); // Reset state in app-shell
  }
  
  const handleBackToHome = () => {
    handleReset();
    setActiveTab('home');
  }

  const updateQuantity = (amount: number) => {
    if (!cartItem || !selectedMedicine) return;
    const newQuantity = cartItem.quantity + amount;
    if (newQuantity > 0 && newQuantity <= selectedMedicine.quantity) {
      setCartItem({ ...cartItem, quantity: newQuantity });
    }
  }

  const getMedicineInfo = (pharmacy: Pharmacy, medName: string) => {
    const medKey = Object.keys(pharmacy.medicines).find(m => m.toLowerCase().includes(medName.toLowerCase()));
    return medKey ? pharmacy.medicines[medKey] : null;
  }
  
  const calculateQuantity = (med: Medication): number => {
    if (!med.frequency || !med.days) return 1;

    let freqMultiplier = 0;
    const freqLower = med.frequency.toLowerCase();
    if (freqLower.includes('once')) {
        freqMultiplier = 1;
    } else if (freqLower.includes('twice')) {
        freqMultiplier = 2;
    } else if (freqLower.includes('thrice')) {
        freqMultiplier = 3;
    } else {
        const match = freqLower.match(/(\d+)\s+time/);
        if (match) {
            freqMultiplier = parseInt(match[1], 10);
        } else {
            return 1; // Default to 1 if frequency is unparseable
        }
    }

    const numDays = parseInt(med.days, 10);

    if (freqMultiplier > 0 && !isNaN(numDays)) {
        return freqMultiplier * numDays;
    }

    return 1;
  };
  
  const calculateTotalBill = (pharmacy: Pharmacy, prescription: Prescription) => {
    return prescription.medications.reduce((total, med) => {
        const medInfo = getMedicineInfo(pharmacy, med.name);
        if (medInfo && medInfo.status === 'In Stock') {
            const price = medInfo.price;
            const quantity = billQuantities[med.name] || calculateQuantity(med);
            return total + price * quantity; 
        }
        return total;
    }, 0);
  }

  const handleOpenBillDialog = (prescription: Prescription) => {
    const initialQuantities = prescription.medications.reduce((acc, med) => {
        const qty = calculateQuantity(med);
        acc[med.name] = qty;
        return acc;
    }, {} as {[key: string]: number});
    setBillQuantities(initialQuantities);
    setMaxBillQuantities(initialQuantities); // Store the initial quantities as the max
  }

  const handleUpdateBillQuantity = (medName: string, amount: number) => {
    setBillQuantities(prev => {
        const currentQuantity = prev[medName] || 0;
        const maxQuantity = maxBillQuantities[medName] || currentQuantity;
        const newQuantity = Math.max(1, Math.min(currentQuantity + amount, maxQuantity));
        return {
            ...prev,
            [medName]: newQuantity,
        };
    });
  }


  if (view === 'send-confirmation') {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
            <Send className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold font-headline">Prescription Sent!</h2>
            <p className="text-muted-foreground">
                Your prescription from <strong>Dr. {prescriptionToSend?.doctorName}</strong> has been sent to <strong>{selectedPharmacy?.name}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
                The pharmacy will contact you shortly to confirm your order.
            </p>
            <Button
                onClick={handleBackToHome}
                className="mt-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Button>
        </div>
    );
  }

  if (view === 'send-prescription' && prescriptionToSend) {
      return (
        <div className="animate-in fade-in duration-500">
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('prescriptions')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to prescriptions
            </Button>
            <h3 className="text-xl font-bold font-headline mb-4">Select a Pharmacy to Send To</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {pharmacies.map((pharmacy) => (
              <Card key={pharmacy.id} className="rounded-xl shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                      <div>
                          <h3 className="font-semibold">{pharmacy.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              <span>{pharmacy.distance}</span>
                          </div>
                      </div>
                  </CardContent>
                  <CardFooter className='border-t p-2 flex gap-2'>
                        <Dialog onOpenChange={(isOpen) => {
                            if(isOpen) {
                                const prescription = { medications: prescriptionToSend.medications } as Prescription;
                                handleOpenBillDialog(prescription);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full text-primary">
                                    <FileText className="mr-2 h-4 w-4" /> View Bill
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Estimated Bill at {pharmacy.name}</DialogTitle>
                                    <DialogDescription>
                                        This is an estimate for the prescribed medicines.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                    {prescriptionToSend.medications.map((med, i) => {
                                        const medInfo = getMedicineInfo(pharmacy, med.name);
                                        if (!medInfo || medInfo.status !== 'In Stock') return null;
                                        
                                        const price = medInfo.price;
                                        const quantity = billQuantities[med.name] || 0;
                                        const maxQuantity = maxBillQuantities[med.name] || 0;
                                        return (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <div className="w-2/5 break-words">
                                                    <span className='capitalize'>{med.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-6 w-6 text-red-500 hover:text-red-600" 
                                                      onClick={() => handleUpdateBillQuantity(med.name, -1)}
                                                      disabled={quantity <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="font-semibold w-8 text-center border rounded-md px-2 py-0.5">{quantity}</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-green-500 hover:text-green-600" 
                                                        onClick={() => handleUpdateBillQuantity(med.name, 1)}
                                                        disabled={quantity >= maxQuantity}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <span className='font-mono w-32 text-right'>
                                                   ₹{price.toFixed(2)} x {quantity} = ₹{(price * quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                    <Separator className='my-2'/>
                                     <div className="flex justify-between items-center font-bold text-base">
                                        <span>Total</span>
                                        <span className='font-mono'>₹{prescriptionToSend.medications.reduce((acc, med) => {
                                            const medInfo = getMedicineInfo(pharmacy, med.name);
                                            if (medInfo && medInfo.status === 'In Stock') {
                                                const quantity = billQuantities[med.name] || 0;
                                                return acc + (medInfo.price * quantity);
                                            }
                                            return acc;
                                        }, 0).toFixed(2)}</span>
                                    </div>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                      <Button type="button" variant="secondary">Close</Button>
                                  </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Separator orientation='vertical' className='h-6' />
                        <Button variant="ghost" size="sm" className="w-full text-primary" onClick={() => handleSelectPharmacyForSending(pharmacy)}>
                            <Send className="mr-2 h-4 w-4" /> Send
                        </Button>
                    </CardFooter>
              </Card>
            ))}
            </div>
        </div>
      )
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
                                    <div className='flex items-center gap-2 text-sm'>
                                        <p className="text-muted-foreground">Price: ₹{selectedMedicine.price}</p>
                                        <Separator orientation='vertical' className='h-4'/>
                                         <Badge variant={selectedMedicine.quantity > 0 ? "default" : "destructive"} className={cn(selectedMedicine.quantity > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", "font-semibold")}>
                                          {selectedMedicine.quantity > 0 ? "In Stock" : "Out of Stock"}
                                        </Badge>
                                    </div>
                                </div>
                                <Button size="sm" onClick={handleOrder} disabled={selectedMedicine.quantity === 0}>
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
      
      {medicinesToFind && (
        <p className="text-sm text-muted-foreground">Showing pharmacies that have all prescribed medicines in stock.</p>
      )}

      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {filteredPharmacies.length > 0 ? (
          filteredPharmacies.map((pharmacy) => {
            const medInfo = searchTerm && !medicinesToFind ? getMedicineInfo(pharmacy, searchTerm) : null;
            return (
              <Card key={pharmacy.id} className="rounded-xl shadow-sm">
                  <CardContent className="p-4 flex items-start justify-between" onClick={() => handleSelectPharmacy(pharmacy)}>
                      <div className="cursor-pointer flex-grow">
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
                      {medInfo && (
                         <div className='text-right'>
                            <Badge variant={medInfo.status === 'In Stock' ? 'default' : 'destructive'} className={cn('capitalize', medInfo.status === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                {medInfo.status === 'In Stock' ? <CheckCircle className='w-3 h-3 mr-1.5'/> : <XCircle className='w-3 h-3 mr-1.5'/>}
                                {medInfo.status}
                            </Badge>
                            <p className='text-sm font-semibold mt-1'>₹{medInfo.price}</p>
                         </div>
                      )}
                  </CardContent>
                  {prescriptionToBill && medicinesToFind && (
                    <CardFooter className='border-t p-2 flex gap-2'>
                       <Dialog onOpenChange={(isOpen) => {
                           if (isOpen) {
                               handleOpenBillDialog(prescriptionToBill)
                           }
                       }}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full text-primary">
                                    <FileText className="mr-2 h-4 w-4" /> View Bill
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Estimated Bill at {pharmacy.name}</DialogTitle>
                                    <DialogDescription>
                                        This is an estimate for the prescribed medicines.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                    {prescriptionToBill.medications.map((med, i) => {
                                        const medInfo = getMedicineInfo(pharmacy, med.name);
                                        if (!medInfo || medInfo.status !== 'In Stock') return null;
                                        
                                        const price = medInfo.price;
                                        const quantity = billQuantities[med.name] || 0;
                                        const maxQuantity = maxBillQuantities[med.name] || 0;
                                        return (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <div className="w-2/5 break-words">
                                                    <span className='capitalize'>{med.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-6 w-6 text-red-500 hover:text-red-600" 
                                                      onClick={() => handleUpdateBillQuantity(med.name, -1)}
                                                      disabled={quantity <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="font-semibold w-8 text-center border rounded-md px-2 py-0.5">{quantity}</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-green-500 hover:text-green-600" 
                                                        onClick={() => handleUpdateBillQuantity(med.name, 1)}
                                                        disabled={quantity >= maxQuantity}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <span className='font-mono w-32 text-right'>
                                                   ₹{price.toFixed(2)} x {quantity} = ₹{(price * quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                    <Separator className='my-2'/>
                                     <div className="flex justify-between items-center font-bold text-base">
                                        <span>Total</span>
                                        <span className='font-mono'>₹{calculateTotalBill(pharmacy, prescriptionToBill).toFixed(2)}</span>
                                    </div>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                      <Button type="button" variant="secondary">Close</Button>
                                  </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Separator orientation='vertical' className='h-6' />
                        <Button variant="ghost" size="sm" className="w-full text-primary" onClick={() => handleSelectPharmacyForSending(pharmacy)}>
                            <Send className="mr-2 h-4 w-4" /> Send
                        </Button>
                    </CardFooter>
                  )}
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
