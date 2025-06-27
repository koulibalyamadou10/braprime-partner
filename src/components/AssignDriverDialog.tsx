import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Phone, Car, Zap, Bike, Truck, Star } from 'lucide-react';
import { toast } from 'sonner';
import { DriverService, Driver } from '@/lib/services/drivers';
import { OrderService } from '@/lib/services/orders';

interface AssignDriverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  businessId: number;
  onDriverAssigned: (driverId: string, driverName: string, driverPhone: string) => void;
}

export const AssignDriverDialog: React.FC<AssignDriverDialogProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  businessId,
  onDriverAssigned
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les livreurs disponibles
  useEffect(() => {
    if (isOpen && businessId) {
      loadDrivers();
    }
  }, [isOpen, businessId]);

  const loadDrivers = async () => {
    try {
      setIsLoadingDrivers(true);
      setError(null);

      const { drivers: availableDrivers, error: driversError } = await DriverService.getAvailableDrivers(businessId);

      if (driversError) {
        throw new Error(driversError);
      }

      setDrivers(availableDrivers || []);
    } catch (err) {
      console.error('Erreur chargement livreurs:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des livreurs');
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) {
      toast.error('Veuillez sélectionner un livreur');
      return;
    }

    const selectedDriver = drivers.find(d => d.id === selectedDriverId);
    if (!selectedDriver) {
      toast.error('Livreur non trouvé');
      return;
    }

    try {
      setIsLoading(true);

      // Assigner le livreur à la commande via le service
      const { error: assignError } = await OrderService.assignDriver(
        orderId, 
        selectedDriver.id, 
        selectedDriver.name, 
        selectedDriver.phone
      );

      if (assignError) {
        throw new Error(assignError);
      }

      // Assigner le livreur dans la table drivers
      const { error: driverAssignError } = await DriverService.assignDriverToOrder(
        selectedDriver.id, 
        orderId
      );

      if (driverAssignError) {
        throw new Error(driverAssignError);
      }

      toast.success(`Livreur ${selectedDriver.name} assigné avec succès`);
      onDriverAssigned(selectedDriver.id, selectedDriver.name, selectedDriver.phone);
      onClose();
    } catch (err) {
      console.error('Erreur assignation livreur:', err);
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'assignation du livreur');
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = (vehicleType?: string) => {
    switch (vehicleType) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'motorcycle': return <Zap className="h-4 w-4" />;
      case 'bike': return <Bike className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  const getVehicleLabel = (vehicleType?: string) => {
    switch (vehicleType) {
      case 'car': return 'Voiture';
      case 'motorcycle': return 'Moto';
      case 'bike': return 'Vélo';
      default: return 'Véhicule';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner un livreur</DialogTitle>
          <DialogDescription>
            Sélectionnez un livreur pour la commande #{orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoadingDrivers ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={loadDrivers}>
                Réessayer
              </Button>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-4">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-2">Aucun livreur disponible</p>
              <p className="text-sm text-gray-400">
                Tous les livreurs sont actuellement occupés ou inactifs
              </p>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="driver-select">Sélectionner un livreur</Label>
                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                  <SelectTrigger id="driver-select">
                    <SelectValue placeholder="Choisir un livreur" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{driver.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {getVehicleIcon(driver.vehicle_type)}
                            {getVehicleLabel(driver.vehicle_type)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDriverId && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Informations du livreur</h4>
                  {(() => {
                    const driver = drivers.find(d => d.id === selectedDriverId);
                    if (!driver) return null;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{driver.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{driver.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getVehicleIcon(driver.vehicle_type)}
                          <span className="text-sm text-gray-600">
                            {getVehicleLabel(driver.vehicle_type)}
                            {driver.vehicle_plate && ` - ${driver.vehicle_plate}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {driver.rating.toFixed(1)}/5 ({driver.total_deliveries} livraisons)
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssignDriver} 
            disabled={!selectedDriverId || isLoading || drivers.length === 0}
          >
            {isLoading ? 'Assignation...' : 'Assigner le livreur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 