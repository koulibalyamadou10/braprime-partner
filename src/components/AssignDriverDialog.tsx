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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Phone, Car, Zap, Bike, Truck, Star, RefreshCw, Search, Package } from 'lucide-react';
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
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les livreurs disponibles
  useEffect(() => {
    if (isOpen && businessId) {
      loadDrivers();
    }
  }, [isOpen, businessId]);

  // Filtrer les livreurs basé sur la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDrivers(drivers);
    } else {
      const filtered = drivers.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        (driver.vehicle_plate && driver.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDrivers(filtered);
    }
  }, [searchTerm, drivers]);

  const loadDrivers = async () => {
    try {
      setIsLoadingDrivers(true);
      setError(null);

      const { drivers: allDrivers, error: driversError } = await DriverService.getBusinessDrivers(businessId);

      if (driversError) {
        throw new Error(driversError);
      }

      setDrivers(allDrivers || []);
      setFilteredDrivers(allDrivers || []);
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

    // Vérifier si le livreur est disponible
    if (!selectedDriver.is_active) {
      toast.error('Ce livreur est inactif');
      return;
    }

    if (selectedDriver.current_order_id) {
      toast.error('Ce livreur a déjà une commande en cours');
      return;
    }

    if (!selectedDriver.is_verified) {
      toast.error('Ce livreur n\'est pas encore vérifié');
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

  const handleDriverSelect = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    // Vérifier si le livreur peut être sélectionné
    if (!driver.is_active) {
      toast.error('Ce livreur est inactif et ne peut pas être assigné');
      return;
    }

    // Vérifier le nombre de commandes actives (maximum 3)
    const activeOrdersCount = driver.active_orders_count || 0;
    if (activeOrdersCount >= 3) {
      toast.error('Ce livreur a déjà 3 commandes en cours et ne peut pas en accepter plus');
      return;
    }

    if (!driver.is_verified) {
      toast.error('Ce livreur n\'est pas encore vérifié');
      return;
    }

    setSelectedDriverId(driverId);
  };

  const isDriverAvailable = (driver: Driver) => {
    const activeOrdersCount = driver.active_orders_count || 0;
    return driver.is_active && activeOrdersCount < 3 && driver.is_verified;
  };

  const getDriverStatusBadge = (driver: Driver) => {
    if (!driver.is_active) {
      return <Badge variant="destructive" className="text-xs">Inactif</Badge>;
    }
    if (!driver.is_verified) {
      return <Badge variant="secondary" className="text-xs">Non vérifié</Badge>;
    }
    
    const activeOrdersCount = driver.active_orders_count || 0;
    if (activeOrdersCount >= 3) {
      return <Badge variant="outline" className="text-xs border-red-500 text-red-600">Surchargé</Badge>;
    } else if (activeOrdersCount > 0) {
      return <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
        {activeOrdersCount} commande{activeOrdersCount > 1 ? 's' : ''}
      </Badge>;
    }
    return <Badge variant="default" className="text-xs bg-green-500">Disponible</Badge>;
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Assigner un livreur</DialogTitle>
          <DialogDescription>
            Recherchez et sélectionnez un livreur pour la commande #{orderNumber}
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
              <p className="text-sm text-gray-400 mb-4">
                Tous les livreurs sont actuellement occupés ou inactifs
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={loadDrivers}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recharger les livreurs
                </Button>
                <p className="text-xs text-gray-400">
                  Business ID: {businessId}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="driver-search">Rechercher un livreur</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="driver-search"
                      placeholder="Rechercher par nom, téléphone ou plaque..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {filteredDrivers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Aucun livreur trouvé</p>
                      <p className="text-sm">Essayez avec d'autres termes de recherche</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredDrivers.map((driver) => {
                        const isAvailable = isDriverAvailable(driver);
                        return (
                          <div
                            key={driver.id}
                            className={`p-3 cursor-pointer transition-colors ${
                              selectedDriverId === driver.id 
                                ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                                : isAvailable 
                                  ? 'hover:bg-gray-50' 
                                  : 'opacity-60 hover:bg-gray-100'
                            } ${!isAvailable ? 'cursor-not-allowed' : ''}`}
                            onClick={() => isAvailable ? handleDriverSelect(driver.id) : null}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  <User className={`h-5 w-5 ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`font-medium text-sm truncate ${!isAvailable ? 'text-gray-500' : ''}`}>
                                      {driver.name}
                                    </span>
                                    {getDriverStatusBadge(driver)}
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        driver.business_id === businessId 
                                          ? 'border-blue-500 text-blue-600' 
                                          : 'border-green-500 text-green-600'
                                      }`}
                                    >
                                      {driver.business_id === businessId ? 'Service' : 'Indépendant'}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {driver.phone}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      {getVehicleIcon(driver.vehicle_type)}
                                      {getVehicleLabel(driver.vehicle_type)}
                                    </span>
                                    {driver.vehicle_plate && (
                                      <span className="font-mono">{driver.vehicle_plate}</span>
                                    )}
                                  </div>
                                  {!isAvailable && (
                                    <div className="mt-1 text-xs text-gray-400">
                                      {!driver.is_active && '• Livreur inactif'}
                                      {!driver.is_verified && '• Non vérifié'}
                                      {(driver.active_orders_count || 0) >= 3 && '• Trop de commandes (3 max)'}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{driver.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {filteredDrivers.length > 0 && (
                  <div className="text-xs text-gray-500 text-center space-y-1">
                    <p>
                      {filteredDrivers.length} livreur{filteredDrivers.length > 1 ? 's' : ''} trouvé{filteredDrivers.length > 1 ? 's' : ''}
                      {searchTerm && ` pour "${searchTerm}"`}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Disponible</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>En livraison</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Surchargé</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>Non disponible</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedDriverId && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Livreur sélectionné</h4>
                  {(() => {
                    const driver = drivers.find(d => d.id === selectedDriverId);
                    if (!driver) return null;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{driver.name}</span>
                          {getDriverStatusBadge(driver)}
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
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {driver.active_orders_count || 0} commande{(driver.active_orders_count || 0) > 1 ? 's' : ''} active{(driver.active_orders_count || 0) > 1 ? 's' : ''}
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
            disabled={
              !selectedDriverId || 
              isLoading || 
              drivers.length === 0 ||
              !isDriverAvailable(drivers.find(d => d.id === selectedDriverId))
            }
          >
            {isLoading ? 'Assignation...' : 'Assigner le livreur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 