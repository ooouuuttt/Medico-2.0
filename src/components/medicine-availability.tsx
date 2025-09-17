'use client';

import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { pharmacies, Pharmacy } from '@/lib/dummy-data';

const MedicineAvailability = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPharmacies = pharmacies.filter((pharmacy) =>
    Object.keys(pharmacy.medicines).some(
      (med) => med.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStockStatus = (pharmacy: Pharmacy, medicine: string): 'In Stock' | 'Out of Stock' | 'Not Sold' => {
      const lowerCaseMedicine = medicine.toLowerCase();
      for (const medKey in pharmacy.medicines) {
          if (medKey.toLowerCase().includes(lowerCaseMedicine)) {
              return pharmacy.medicines[medKey];
          }
      }
      return 'Not Sold';
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
              
              return (
                <div key={pharmacy.id} className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{pharmacy.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      <span>{pharmacy.distance}</span>
                    </div>
                  </div>
                  <Badge variant={status === 'In Stock' ? 'default' : 'destructive'}>
                    {status}
                  </Badge>
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
