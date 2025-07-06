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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Phone, 
  Car, 
  Zap, 
  Bike, 
  Truck, 
  Star, 
  RefreshCw, 
  Search,
  Package,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { DriverAssignmentService, DriverActiveOrders } from '@/lib/services/driver-assignment';

interface MultipleOrdersAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  onOrdersAssigned: (driverId: string, driverName: string, assignedOrders: string[]) => void;
}

export const MultipleOrdersAssignmentDialog: React.FC<MultipleOrdersAssignmentDialogProps> = ({
  isOpen,
  onClose,
  businessId,
  onOrdersAssigned
}) => {
  const [drivers, setDrivers] = useState<DriverActiveOrders[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<DriverActiveOrders[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unassignedOrders, setUnassignedOrders] = useState<any[]>([]);

  // Charger les livreurs disponibles et les commandes non assignées
  useEffect(() => {
    if (isOpen && businessId) {
      loadData();
    }
  }, [isOpen, businessId]);

  // Filtrer les livreurs basé sur la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDrivers(drivers);
    } else {
      const filtered = drivers.filter(driver =>
        driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.driver_phone.includes(searchTerm) ||
        (driver.vehicle_plate && driver.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDrivers(filtered);
    }
  }, [searchTerm, drivers]);

  const loadData = async () => {
    try {
      setIsLoadingDrivers(true);
      setError(null);

      // Charger les chauffeurs disponibles
      const { data: availableDrivers, error: driversError } = await DriverAssignmentService.getAvailableDriversForBusiness(businessId);

      if (driversError) {
        throw new Error(driversError);
      }

      setDrivers(availableDrivers || []);
      setFilteredDrivers(availableDrivers || []);

      // Charger les commandes non assignées
      const { data: unassigned, error: ordersError } = await DriverAssignmentService.getUnassignedOrders(businessId);

      if (ordersError) {
        console.error('Erreur chargement commandes non assignées:', ordersError);
      } else {
        setUnassignedOrders(unassigned || []);
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  const handleAssignOrders = async () => {
    if (!selectedDriverId || selectedOrders.length === 0) {
      toast.error('Veuillez sélectionner un livreur et au moins une commande');
      return;
    }

    const selectedDriver = drivers.find(d => d.driver_id === selectedDriverId);
    if (!selectedDriver) {
      toast.error('Livreur non trouvé');
      return;
    }

    // Vérifier si le livreur peut accepter ces commandes
    const maxOrders = 3;
    const totalOrders = selectedDriver.active_orders_count + selectedOrders.length;
    
    if (totalOrders > maxOrders) {
      toast.error(`Ce livreur ne peut pas accepter plus de ${maxOrders} commandes simultanément`);
      return;
    }

    try {
      setIsLoading(true);

      // Assigner les commandes au livreur
      const { success, assigned, failed, error: assignError } = await DriverAssignmentService.assignMultipleOrdersToDriver(
        selectedOrders,
        selectedDriverId
      );

      if (!success) {
        throw new Error(assignError || 'Erreur lors de l\'assignation');
      }

      if (assigned.length > 0) {
        toast.success(`${assigned.length} commande(s) assignée(s) avec succès à ${selectedDriver.driver_name}`);
        onOrdersAssigned(selectedDriverId, selectedDriver.driver_name, assigned);
        onClose();
      }

      if (failed.length > 0) {
        toast.error(`${failed.length} commande(s) n'ont pas pu être assignées`);
      }
    } catch (err) {
      console.error('Erreur assignation commandes:', err);
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'assignation des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriverSelect = (driverId: string) => {
    const driver = drivers.find(d => d.driver_id === driverId);
    if (!driver) return;

    // Vérifier si le livreur peut accepter des commandes
    if (driver.active_orders_count >= 3) {
      toast.error('Ce livreur a déjà le maximum de commandes actives (3)');
      return;
    }

    setSelectedDriverId(driverId);
    // Réinitialiser la sélection des commandes
    setSelectedOrders([]);
  };

  const handleOrderToggle = (orderId: string) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAllOrders = () => {
    if (selectedOrders.length === unassignedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(unassignedOrders.map(order => order.id));
    }
  };

  const isDriverAvailable = (driver: DriverActiveOrders) => {
    return driver.active_orders_count < 3;
  };

  const getDriverStatusBadge = (driver: DriverActiveOrders) => {
    if (driver.active_orders_count >= 3) {
      return <Badge variant="destructive" className="text-xs">Plein</Badge>;
    }
    if (driver.active_orders_count > 0) {
      return <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
        {driver.active_orders_count} commande(s)
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

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M GNF`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Assigner plusieurs commandes</DialogTitle>
          <DialogDescription>
            Sélectionnez un livreur et les commandes à lui assigner
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[60vh]">
          {/* Colonne gauche - Livreurs */}
          <div className="space-y-4">
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

            <div className="border rounded-lg h-[calc(60vh-120px)] overflow-hidden">
              {isLoadingDrivers ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-red-500 mb-2">{error}</p>
                  <Button variant="outline" size="sm" onClick={loadData}>
                    Réessayer
                  </Button>
                </div>
              ) : filteredDrivers.length === 0 ? (
                <div className="p-4 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun livreur disponible</p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="divide-y">
                    {filteredDrivers.map((driver) => {
                      const isAvailable = isDriverAvailable(driver);
                      const isSelected = selectedDriverId === driver.driver_id;
                      
                      return (
                        <div
                          key={driver.driver_id}
                          className={`p-3 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                              : isAvailable 
                                ? 'hover:bg-gray-50' 
                                : 'opacity-60 hover:bg-gray-100'
                          } ${!isAvailable ? 'cursor-not-allowed' : ''}`}
                          onClick={() => isAvailable ? handleDriverSelect(driver.driver_id) : null}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <User className={`h-5 w-5 ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`font-medium text-sm truncate ${!isAvailable ? 'text-gray-500' : ''}`}>
                                    {driver.driver_name}
                                  </span>
                                  {getDriverStatusBadge(driver)}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {driver.driver_phone}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    {getVehicleIcon(driver.vehicle_type)}
                                    {getVehicleLabel(driver.vehicle_type)}
                                  </span>
                                  {driver.vehicle_plate && (
                                    <span className="font-mono">{driver.vehicle_plate}</span>
                                  )}
                                </div>
                                {driver.active_orders_count > 0 && (
                                  <div className="mt-1 text-xs text-gray-400">
                                    {driver.active_orders_count} commande(s) en cours
                                  </div>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Colonne droite - Commandes non assignées */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Commandes non assignées</Label>
              {unassignedOrders.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllOrders}
                >
                  {selectedOrders.length === unassignedOrders.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </Button>
              )}
            </div>

            <div className="border rounded-lg h-[calc(60vh-120px)] overflow-hidden">
              {unassignedOrders.length === 0 ? (
                <div className="p-4 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune commande à assigner</p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="divide-y">
                    {unassignedOrders.map((order) => {
                      const isSelected = selectedOrders.includes(order.id);
                      
                      return (
                        <div
                          key={order.id}
                          className={`p-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-green-50 border-l-4 border-l-green-500' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleOrderToggle(order.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleOrderToggle(order.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">
                                  Commande #{order.id.slice(0, 8)}...
                                </span>
                                <span className="text-sm font-semibold">
                                  {formatCurrency(order.grand_total)}
                                </span>
                              </div>
                              <div className="space-y-1 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{order.customer_name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{order.delivery_address}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDate(order.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>

        {/* Résumé de la sélection */}
        {(selectedDriverId || selectedOrders.length > 0) && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2">Résumé de la sélection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDriverId && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Livreur sélectionné:</p>
                  {(() => {
                    const driver = drivers.find(d => d.driver_id === selectedDriverId);
                    if (!driver) return null;

                    return (
                      <div className="mt-1 space-y-1">
                        <p className="text-sm">{driver.driver_name}</p>
                        <p className="text-xs text-gray-500">{driver.driver_phone}</p>
                        <p className="text-xs text-gray-500">
                          {driver.active_orders_count} commande(s) actuelle(s) + {selectedOrders.length} nouvelle(s) = {driver.active_orders_count + selectedOrders.length}/3
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {selectedOrders.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Commandes sélectionnées:</p>
                  <p className="text-sm mt-1">{selectedOrders.length} commande(s)</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total: {formatCurrency(
                      selectedOrders.reduce((sum, orderId) => {
                        const order = unassignedOrders.find(o => o.id === orderId);
                        return sum + (order?.grand_total || 0);
                      }, 0)
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssignOrders} 
            disabled={
              !selectedDriverId || 
              selectedOrders.length === 0 || 
              isLoading
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assignation...
              </>
            ) : (
              `Assigner ${selectedOrders.length} commande(s)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 