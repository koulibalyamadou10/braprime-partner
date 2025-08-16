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
import { KDriverAuthPartnerService } from '@/lib/kservices/k-driver-auth-partner';

interface AssignDriverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  businessId: number;
  onDriverAssigned: (driverId: string, driverName: string, driverPhone: string) => void;
  isMultipleAssignment?: boolean;
}

export const AssignDriverDialog: React.FC<AssignDriverDialogProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  businessId,
  onDriverAssigned,
  isMultipleAssignment = false
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  // Charger les livreurs disponibles
  useEffect(() => {
    if (isOpen && businessId) {
      loadDrivers();
    }
  }, [isOpen, businessId]);

  // Filtrer les livreurs basé sur la recherche et la disponibilité
  useEffect(() => {
    let filtered = drivers;
    
    // Filtrer par disponibilité si activé
    if (showOnlyAvailable) {
      filtered = filtered.filter(driver => isDriverAvailable(driver));
    }
    
    // Filtrer par recherche
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        (driver.vehicle_plate && driver.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredDrivers(filtered);
  }, [searchTerm, drivers, showOnlyAvailable]);

  const loadDrivers = async () => {
    try {
      setIsLoadingDrivers(true);
      setError(null);

      // Récupérer tous les drivers pour afficher leur statut complet
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

    // Vérifier le nombre de commandes actives (maximum 3)
    // const activeOrdersCount = selectedDriver.active_orders_count || 0;
    // const maxOrders = isMultipleAssignment ? 5 : 3; // Plus de flexibilité pour l'assignation multiple
    // if (activeOrdersCount >= maxOrders) {
    //   toast.error(`Ce livreur a déjà ${maxOrders} commandes en cours`);
    //   return;
    // }

    // if (!selectedDriver.is_available) {
    //   toast.error('Ce livreur n\'est pas disponible actuellement');
    //   return;
    // }

    try {
      setIsLoading(true);

      if (isMultipleAssignment) {
        // Pour l'assignation multiple, on ne fait pas l'assignation ici
        toast.success(`Livreur ${selectedDriver.name} sélectionné pour l'assignation multiple`);
        onClose();
      } else {
        // Assignation normale pour une seule commande
      
        const result = await KDriverAuthPartnerService.assignDriverToOrder(selectedDriver.id, orderId);
        if (result.success) {
          toast.success(`Livreur ${selectedDriver.name} assigné avec succès`);
          onClose();
        } else {
          toast.error(result.error || 'Erreur lors de l\'assignation du livreur');
        }

      toast.success(`Livreur ${selectedDriver.name} assigné avec succès`);
      onClose();
      }
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

    if (!driver.is_available) {
      toast.error('Ce livreur n\'est pas disponible actuellement');
      return;
    }

    setSelectedDriverId(driverId);
  };

  const isDriverAvailable = (driver: Driver) => {
    const activeOrdersCount = driver.active_orders_count || 0;
    const maxOrders = isMultipleAssignment ? 5 : 3;
    
    // Un driver est disponible s'il est actif ET disponible ET n'a pas trop de commandes
    return driver.is_active && driver.is_available && activeOrdersCount < maxOrders;
  };

  const getDriverStatusBadge = (driver: Driver) => {
    if (!driver.is_active) {
      return <Badge variant="destructive" className="text-xs">Inactif</Badge>;
    }
    if (!driver.is_available) {
      return <Badge variant="secondary" className="text-xs">Non disponible</Badge>;
    }
    
    const activeOrdersCount = driver.active_orders_count || 0;
    const maxOrders = isMultipleAssignment ? 5 : 3;
    
    if (activeOrdersCount >= maxOrders) {
      return <Badge variant="outline" className="text-xs border-red-500 text-red-600">Surchargé</Badge>;
    } else if (activeOrdersCount > 0) {
      return <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
        {activeOrdersCount} commande{activeOrdersCount > 1 ? 's' : ''}
      </Badge>;
    }
    return <Badge variant="default" className="text-xs bg-green-500">Disponible</Badge>;
  };

  // Fonction pour obtenir l'indicateur de disponibilité
  const getAvailabilityIndicator = (driver: Driver) => {
    const isAvailable = isDriverAvailable(driver);
    
    if (!driver.is_active) {
      return <div className="w-2 h-2 bg-gray-400 rounded-full" title="Inactif"></div>;
    }
    if (!driver.is_available) {
      return <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Non disponible"></div>;
    }
    
    const activeOrdersCount = driver.active_orders_count || 0;
    const maxOrders = isMultipleAssignment ? 5 : 3;
    
    if (activeOrdersCount >= maxOrders) {
      return <div className="w-2 h-2 bg-red-500 rounded-full" title="Surchargé"></div>;
    } else if (activeOrdersCount > 0) {
      return <div className="w-2 h-2 bg-orange-500 rounded-full" title={`En livraison (${activeOrdersCount} commande${activeOrdersCount > 1 ? 's' : ''})`}></div>;
    }
    
    return <div className="w-2 h-2 bg-green-500 rounded-full" title="Disponible"></div>;
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
      <DialogContent className="max-w-xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Assigner un livreur</DialogTitle>
          <DialogDescription>
            Recherchez et sélectionnez un livreur pour la commande #{orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          {isLoadingDrivers ? (
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : error ? (
            <div className="text-center py-4 flex-1 flex items-center justify-center">
              <div>
              <p className="text-red-500 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={loadDrivers}>
                Réessayer
              </Button>
              </div>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-4 flex-1 flex items-center justify-center">
              <div>
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-2">Aucun livreur trouvé</p>
              <p className="text-sm text-gray-400 mb-4">
                Aucun livreur n'est enregistré pour ce business
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
            </div>
          ) : (
            <>
              <div className="space-y-3 flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant={showOnlyAvailable ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                      className="text-xs"
                    >
                      {showOnlyAvailable ? "Disponibles" : "Tous"}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto border rounded-lg min-h-0">
                  {filteredDrivers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>
                        {showOnlyAvailable 
                          ? "Aucun livreur disponible" 
                          : "Aucun livreur trouvé"
                        }
                      </p>
                      <p className="text-sm">
                        {showOnlyAvailable 
                          ? "Tous les livreurs sont inactifs, non vérifiés ou surchargés" 
                          : "Essayez avec d'autres termes de recherche"
                        }
                      </p>
                      {showOnlyAvailable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowOnlyAvailable(false)}
                          className="mt-2"
                        >
                          Voir tous les livreurs
                        </Button>
                      )}
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
                                <div className="flex-shrink-0 flex items-center gap-2">
                                  {getAvailabilityIndicator(driver)}
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
                                      {!driver.is_available && '• Non disponible'}
                                      {(driver.active_orders_count || 0) >= 3 && '• Trop de commandes (3 max)'}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Package className="h-3 w-3 text-gray-400" />
                                <span>{driver.active_orders_count || 0} commande{(driver.active_orders_count || 0) > 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {filteredDrivers.length > 0 && (
                  <div className="text-xs text-gray-500 text-center space-y-1 flex-shrink-0">
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
                <div className="border rounded-lg p-4 bg-gray-50 flex-shrink-0">
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

        <DialogFooter className="flex-shrink-0">
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