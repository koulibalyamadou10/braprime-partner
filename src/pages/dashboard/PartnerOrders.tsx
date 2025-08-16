import { AssignDriverDialog } from '@/components/AssignDriverDialog';
import { PartnerOrdersSkeleton, PartnerOrdersProgressiveSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { DeliveryInfoBadge } from '@/components/DeliveryInfoBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { usePartnerDashboard } from '@/hooks/use-partner-dashboard';
import { DriverService } from '@/lib/services/drivers';
import { PartnerDashboardService, PartnerOrder } from '@/lib/services/partner-dashboard';
import { supabase } from '@/lib/supabase';
import {
    AlertCircle,
    Check,
    CheckCircle,
    Clock,
    Eye,
    Filter,
    MapPin,
    MoreHorizontal,
    Package,
    Phone,
    RefreshCw,
    Search,
    Timer,
    Truck,
    User,
    XCircle,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout, { partnerNavItems } from '../../components/dashboard/DashboardLayout';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface DashboardOrder extends PartnerOrder {
  business_id: number;
}

const PartnerOrders = () => {
  // Utiliser le hook optimisé avec chargement progressif
  const { 
    business, 
    updateOrderStatus, 
    refresh,
    isBusinessLoading,
    isOrdersLoading,
    error: dashboardError
  } = usePartnerDashboard();
  
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DashboardOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDeliveryType, setFilterDeliveryType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État pour l'assignation de livreur
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<DashboardOrder | null>(null);

  // État pour la sélection multiple de commandes prêtes
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  // État pour l'assignation multiple de livreur
  const [isMultipleAssignOpen, setIsMultipleAssignOpen] = useState(false);
  const [ordersToAssign, setOrdersToAssign] = useState<DashboardOrder[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);

  // Charger les commandes du business
  const loadOrders = async () => {
    if (!business) return;

    try {
      setIsLoading(true);
      setError(null);

      const { orders: businessOrders, error: ordersError } = await PartnerDashboardService.getPartnerOrders(business.id, 100);

      if (ordersError) {
        setError(ordersError);
        return;
      }

      if (businessOrders) {
        const ordersWithBusinessId = businessOrders.map(order => ({
          ...order,
          business_id: business.id
        }));
        setOrders(ordersWithBusinessId);
        setFilteredOrders(ordersWithBusinessId);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des commandes:', err);
      setError('Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les commandes au montage et quand le business change
  useEffect(() => {
    if (business && !isBusinessLoading) {
      loadOrders();
    }
  }, [business, isBusinessLoading]);

  // Filtrer les commandes
  useEffect(() => {
    let filtered = orders;

    // Filtrer par statut
    if (filterStatus !== "all") {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Filtrer par type de livraison
    if (filterDeliveryType !== "all") {
      filtered = filtered.filter(order => order.delivery_type === filterDeliveryType);
    }

    // Filtrer par recherche
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone.includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filterStatus, filterDeliveryType, searchQuery]);

  // Charger les livreurs disponibles pour l'assignation multiple
  const loadAvailableDrivers = async () => {
    if (!business) return;
    
    try {
      setIsLoadingDrivers(true);
      const { drivers, error } = await DriverService.getBusinessDrivers(business.id);
      
      if (error) {
        toast.error('Erreur lors du chargement des livreurs');
        return;
      }
      
      // Filtrer les livreurs disponibles (max 5 commandes pour l'assignation multiple)
      const available = drivers.filter(driver => 
        driver.is_active && 
        driver.is_verified && 
        (driver.active_orders_count || 0) < 5
      );
      
      setAvailableDrivers(available);
    } catch (err) {
      console.error('Erreur chargement livreurs:', err);
      toast.error('Erreur lors du chargement des livreurs');
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  // Gérer le changement de statut
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    
    if (success) {
      toast.success('Statut de la commande mis à jour');
      // Recharger les commandes
      await loadOrders();
    } else {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Gérer la sélection d'une commande pour le modal
  const handleOrderSelect = (order: DashboardOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Gérer la sélection multiple pour les batchs
  const handleBatchSelection = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    setSelectedOrderIds((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        // Vérifier que toutes les commandes sélectionnées sont du même type
        const selectedOrders = orders.filter(o => prev.includes(o.id) || o.id === orderId);
        const allSameType = selectedOrders.every(o => o.delivery_type === order.delivery_type);
        
        if (allSameType) {
          return [...prev, orderId];
        } else {
          toast.error('Vous ne pouvez sélectionner que des commandes du même type de livraison');
          return prev;
        }
      }
    });
  };

  // Obtenir le type de livraison des commandes sélectionnées
  const getSelectedOrdersDeliveryType = () => {
    if (selectedOrderIds.length === 0) return null;
    const firstOrder = orders.find(o => o.id === selectedOrderIds[0]);
    return firstOrder?.delivery_type;
  };

  // Fonction pour gérer l'action selon le type de livraison
  const handleBatchAction = () => {
    const deliveryType = getSelectedOrdersDeliveryType();
    
    if (deliveryType === 'asap') {
      // Pour les commandes ASAP : assignation directe
      if (selectedOrderIds.length === 1) {
        const order = orders.find(o => o.id === selectedOrderIds[0]);
        if (order) {
    setOrderToAssign(order);
    setIsAssignDriverOpen(true);
        }
      } else {
        // Assigner un livreur pour toutes les commandes ASAP sélectionnées
        const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
        setOrdersToAssign(selectedOrders);
        setIsMultipleAssignOpen(true);
        loadAvailableDrivers(); // Charger les livreurs quand le modal s'ouvre
      }
    } else {
      // Pour les commandes Scheduled : créer un batch
      createBatch();
    }
  };

  // Gérer l'assignation réussie d'un livreur
  const handleDriverAssigned = async (driverId: string, driverName: string, driverPhone: string) => {
    if (!orderToAssign) return;

    try {
      // Mettre à jour le statut de la commande vers "out_for_delivery"
      const success = await updateOrderStatus(orderToAssign.id, 'out_for_delivery');
      
      if (success) {
        toast.success(`Livreur assigné et commande mise en livraison`);
        // Recharger les commandes
        await loadOrders();
      } else {
        toast.error('Erreur lors de la mise à jour du statut');
      }
    } catch (err) {
      console.error('Erreur lors de l\'assignation:', err);
      toast.error('Erreur lors de l\'assignation du livreur');
    }
  };

  // Gérer l'assignation multiple réussie d'un livreur
  const handleMultipleDriverAssigned = async () => {
    if (!selectedDriverId) {
      toast.error('Veuillez sélectionner un livreur');
      return;
    }

    const selectedDriver = availableDrivers.find(d => d.id === selectedDriverId);
    if (!selectedDriver) {
      toast.error('Livreur non trouvé');
      return;
    }

    try {
      let successCount = 0;
      
      for (const order of ordersToAssign) {
        // Mettre à jour le statut de chaque commande vers "out_for_delivery"
        const success = await updateOrderStatus(order.id, 'out_for_delivery');
        if (success) {
          successCount++;
        }
      }
      
      if (successCount === ordersToAssign.length) {
        toast.success(`${successCount} commande(s) ASAP assignée(s) au livreur ${selectedDriver.name}`);
      } else {
        toast.warning(`${successCount}/${ordersToAssign.length} commande(s) assignée(s) avec succès`);
      }
      
      // Recharger les commandes et fermer le modal
      await loadOrders();
      setIsMultipleAssignOpen(false);
      setOrdersToAssign([]);
      setSelectedOrderIds([]);
      setSelectedDriverId('');
    } catch (err) {
      console.error('Erreur lors de l\'assignation multiple:', err);
      toast.error('Erreur lors de l\'assignation multiple');
    }
  };

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M GNF`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return "bg-blue-100 text-blue-800";
      case 'confirmed': return "bg-yellow-100 text-yellow-800";
      case 'preparing': return "bg-orange-100 text-orange-800";
      case 'ready': return "bg-green-100 text-green-800";
      case 'out_for_delivery': return "bg-purple-100 text-purple-800";
      case 'delivered': return "bg-gray-100 text-gray-800";
      case 'cancelled': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Obtenir l'icône selon le statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'confirmed': return <Clock className="h-4 w-4" />;
      case 'preparing': return <Timer className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'out_for_delivery': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Obtenir les options de statut disponibles selon le statut actuel
  const getAvailableStatusOptions = (currentStatus: string) => {
    const statusOptions = [
      { value: 'pending', label: 'En attente', icon: <AlertCircle className="h-4 w-4" /> },
      { value: 'confirmed', label: 'Confirmée', icon: <Clock className="h-4 w-4" /> },
      { value: 'preparing', label: 'En préparation', icon: <Timer className="h-4 w-4" /> },
      { value: 'ready', label: 'Prête', icon: <CheckCircle className="h-4 w-4" /> },
      { value: 'out_for_delivery', label: 'En livraison', icon: <Truck className="h-4 w-4" /> },
      { value: 'delivered', label: 'Livrée', icon: <CheckCircle className="h-4 w-4" /> },
      { value: 'cancelled', label: 'Annulée', icon: <XCircle className="h-4 w-4" /> }
    ];

    // Filtrer les options selon le statut actuel
    switch (currentStatus) {
      case 'pending':
        return statusOptions.filter(option => 
          ['confirmed', 'cancelled'].includes(option.value)
        );
      case 'confirmed':
        return statusOptions.filter(option => 
          ['preparing', 'cancelled'].includes(option.value)
        );
      case 'preparing':
        return statusOptions.filter(option => 
          ['ready'].includes(option.value)
        );
      case 'ready':
        return statusOptions.filter(option => 
          ['out_for_delivery'].includes(option.value)
        );
      case 'out_for_delivery':
        return statusOptions.filter(option => 
          ['delivered'].includes(option.value)
        );
      case 'delivered':
        return []; // Aucune option disponible une fois livrée
      case 'cancelled':
        return []; // Aucune option disponible une fois annulée
      default:
        return statusOptions;
    }
  };

  // Obtenir le label du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prête';
      case 'out_for_delivery': return 'En livraison';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  // Obtenir les statistiques des commandes
  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const confirmed = orders.filter(order => order.status === 'confirmed').length;
    const preparing = orders.filter(order => order.status === 'preparing').length;
    const ready = orders.filter(order => order.status === 'ready').length;
    const delivering = orders.filter(order => order.status === 'out_for_delivery').length;
    const delivered = orders.filter(order => order.status === 'delivered').length;
    const cancelled = orders.filter(order => order.status === 'cancelled').length;

    return { total, pending, confirmed, preparing, ready, delivering, delivered, cancelled };
  };

  const stats = getOrderStats();

  // Fonction pour créer un batch
  const createBatch = async () => {
    if (selectedOrderIds.length < 2) return;
    setIsBatchLoading(true);
    try {
      // 1. Créer le batch
      const { data: batch, error: batchError } = await supabase
        .from('delivery_batches')
        .insert({ status: 'pending' })
        .select()
        .single();
      if (batchError) {
        toast.error('Erreur création batch');
        setIsBatchLoading(false);
        return;
      }
      // 2. Associer les commandes
      const batchOrders = selectedOrderIds.map(orderId => ({
        batch_id: batch.id,
        order_id: orderId,
      }));
      const { error: linkError } = await supabase
        .from('delivery_batch_orders')
        .insert(batchOrders);
      if (linkError) {
        toast.error('Erreur association commandes');
        setIsBatchLoading(false);
        return;
      }
      toast.success('Batch créé avec succès !');
      setSelectedOrderIds([]);
      await loadOrders();
    } catch (e) {
      toast.error('Erreur inattendue');
    } finally {
      setIsBatchLoading(false);
    }
  };

  // Gérer l'ouverture du dialogue d'assignation de livreur
  const handleAssignDriver = (order: DashboardOrder) => {
    setOrderToAssign(order);
    setIsAssignDriverOpen(true);
  };

  // Fonction de préchargement manuel des données
  const preloadData = async () => {
    try {
      toast.info('🔄 Préchargement des données...')
      await refresh()
      await loadOrders()
      toast.success('✅ Données préchargées avec succès!')
    } catch (error) {
      toast.error('❌ Erreur lors du préchargement')
      console.error('Erreur de préchargement:', error)
    }
  }

  // Vérifier si l'utilisateur est authentifié et si le business est chargé
  if (!business && isBusinessLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Commandes">
        <PartnerOrdersSkeleton />
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Commandes">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Aucun Business Trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Aucun business n'est associé à votre compte partenaire.
            </p>
            <Button onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Afficher le chargement progressif une fois que le business est chargé
  if (business && (isOrdersLoading || isLoading)) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Commandes">
        <PartnerOrdersProgressiveSkeleton
          business={business}
          isBusinessLoading={false}
          isOrdersLoading={isOrdersLoading || isLoading}
        />
      </DashboardLayout>
    );
  }

  if (error || dashboardError) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Commandes">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Gestion des Commandes</h2>
              <p className="text-gray-500">Erreur lors du chargement des commandes.</p>
            </div>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-500 mb-4">{error || dashboardError}</p>
              <div className="flex gap-2">
                <Button onClick={preloadData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Précharger
                </Button>
                <Button onClick={loadOrders}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={partnerNavItems} title="Gestion des Commandes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des Commandes</h2>
            <p className="text-gray-500">
              Gérez les commandes de {business.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={preloadData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Précharger
            </Button>
            <Button onClick={loadOrders} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="search" 
                placeholder="Rechercher par client ou ID commande..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select 
              value={filterStatus} 
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les commandes</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="preparing">En préparation</SelectItem>
                <SelectItem value="ready">Prête</SelectItem>
                <SelectItem value="out_for_delivery">En livraison</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filterDeliveryType} 
              onValueChange={setFilterDeliveryType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de livraison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="asap">Rapide</SelectItem>
                <SelectItem value="scheduled">Programmée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Nouvelles commandes</p>
              <h3 className="text-2xl font-bold mt-1">{stats.pending}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">En préparation</p>
              <h3 className="text-2xl font-bold mt-1">{stats.preparing}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Prêtes</p>
              <h3 className="text-2xl font-bold mt-1">{stats.ready}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">En livraison</p>
              <h3 className="text-2xl font-bold mt-1">{stats.delivering}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Bouton d'action selon le type */}
        {selectedOrderIds.length >= 1 && (
          <Button onClick={handleBatchAction} disabled={isBatchLoading} className="mb-4">
            {isBatchLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {getSelectedOrdersDeliveryType() === 'asap' ? 'Assignation en cours...' : 'Création en cours...'}
              </>
            ) : (
              getSelectedOrdersDeliveryType() === 'asap' 
                ? `Assigner livreur (${selectedOrderIds.length} commande${selectedOrderIds.length > 1 ? 's' : ''} ASAP)`
                : `Créer un batch de livraison (${selectedOrderIds.length} commande${selectedOrderIds.length > 1 ? 's' : ''} programmée${selectedOrderIds.length > 1 ? 's' : ''})`
            )}
          </Button>
        )}

        {/* Liste des commandes */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
            <CardDescription>
              Gérez les commandes de vos clients et mettez à jour leur statut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.filter(o => o.status === 'ready').length}
                        onCheckedChange={() => {
                          const readyOrders = filteredOrders.filter(o => o.status === 'ready');
                          if (readyOrders.length === 0) return;
                          
                          // Vérifier que toutes les commandes prêtes sont du même type
                          const firstType = readyOrders[0].delivery_type;
                          const allSameType = readyOrders.every(o => o.delivery_type === firstType);
                          
                          if (allSameType) {
                            const readyIds = readyOrders.map(o => o.id);
                            setSelectedOrderIds(selectedOrderIds.length === readyIds.length ? [] : readyIds);
                          } else {
                            toast.error('Les commandes prêtes sont de types différents. Sélectionnez manuellement.');
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Livraison</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {order.status === 'ready' && (
                          <Checkbox
                            checked={selectedOrderIds.includes(order.id)}
                            onCheckedChange={() => handleBatchSelection(order.id)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{order.order_number || order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <DeliveryInfoBadge
                          deliveryType={order.delivery_type}
                          preferredDeliveryTime={order.preferred_delivery_time}
                          scheduledWindowStart={order.scheduled_delivery_window_start}
                          scheduledWindowEnd={order.scheduled_delivery_window_end}
                          estimatedDeliveryTime={order.estimated_delivery_time}
                          actualDeliveryTime={order.actual_delivery_time}
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(order.grand_total)}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} flex w-fit items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{getStatusLabel(order.status)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleOrderSelect(order)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Voir les détails</span>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Plus d'options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {order.status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'confirmed')}>
                                  Confirmer la commande
                                </DropdownMenuItem>
                              )}
                              {order.status === 'confirmed' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'preparing')}>
                                  Commencer la préparation
                                </DropdownMenuItem>
                              )}
                              {order.status === 'preparing' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'ready')}>
                                  Marquer comme prête
                                </DropdownMenuItem>
                              )}
                              {order.status === 'ready' && (
                                <DropdownMenuItem onClick={() => handleAssignDriver(order)}>
                                  Assigner un livreur
                                </DropdownMenuItem>
                              )}
                              {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'cancelled')}>
                                  Annuler la commande
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-500 mb-2">Aucune commande trouvée</p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                  >
                    Effacer la recherche
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Dialogue de détails de commande */}
      {selectedOrder && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Commande {selectedOrder.order_number || selectedOrder.id.slice(0, 8)}...</span>
                <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="capitalize">{getStatusLabel(selectedOrder.status)}</span>
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              {/* Colonne principale - Articles et Actions */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Articles de la commande</h3>
                  <div className="border rounded-md">
                    <ScrollArea className="h-80">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Article</TableHead>
                            <TableHead className="text-right">Qté</TableHead>
                            <TableHead className="text-right">Prix</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  {item.special_instructions && (
                                    <p className="text-xs text-gray-500 mt-1">{item.special_instructions}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    <div className="p-4 border-t bg-gray-50">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Sous-total:</span>
                          <span>{formatCurrency(selectedOrder.total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais de livraison:</span>
                          <span>{formatCurrency(selectedOrder.delivery_fee)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedOrder.grand_total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-3">Actions rapides</h3>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableStatusOptions(selectedOrder.status).map((option) => (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(selectedOrder.id, option.value as OrderStatus)}
                      >
                        {option.icon}
                        <span className="ml-1">{option.label}</span>
                      </Button>
                    ))}
                    {selectedOrder.status === 'ready' && (
                      <Button
                        onClick={() => handleAssignDriver(selectedOrder)}
                        className="flex items-center gap-1"
                      >
                        <Truck className="h-4 w-4" />
                        Assigner livreur
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Colonne latérale - Informations */}
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Informations client */}
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-lg">{selectedOrder.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{selectedOrder.customer_phone}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      Appeler le client
                    </Button>
                  </div>
                </div>
                
                {/* Informations de livraison */}
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Livraison
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm text-gray-600">Adresse</p>
                      <p className="text-sm">{selectedOrder.delivery_address}</p>
                      {selectedOrder.landmark && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                          <p className="text-sm text-blue-700 font-medium">
                            📍 Point de repère
                          </p>
                          <p className="text-sm text-blue-600">{selectedOrder.landmark}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedOrder.delivery_instructions && (
                      <div>
                        <p className="font-medium text-sm text-gray-600">Instructions</p>
                        <p className="text-sm bg-gray-50 p-2 rounded">{selectedOrder.delivery_instructions}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <DeliveryInfoBadge
                        deliveryType={selectedOrder.delivery_type}
                        preferredDeliveryTime={selectedOrder.preferred_delivery_time}
                        scheduledWindowStart={selectedOrder.scheduled_delivery_window_start}
                        scheduledWindowEnd={selectedOrder.scheduled_delivery_window_end}
                        estimatedDeliveryTime={selectedOrder.estimated_delivery_time}
                        actualDeliveryTime={selectedOrder.actual_delivery_time}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Détails de la commande */}
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Détails
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paiement:</span>
                      <span className="font-medium">{selectedOrder.payment_method || 'Non spécifié'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{selectedOrder.delivery_type || 'livraison'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponible:</span>
                      <span className={selectedOrder.available_for_drivers ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {selectedOrder.available_for_drivers ? "Oui" : "Non"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informations de livraison détaillées */}
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horaires
                  </h3>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.delivery_type === 'scheduled' && selectedOrder.preferred_delivery_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heure préférée:</span>
                        <span className="font-medium">{formatDate(selectedOrder.preferred_delivery_time)}</span>
                      </div>
                    )}
                    
                    {selectedOrder.delivery_type === 'scheduled' && selectedOrder.scheduled_delivery_window_start && selectedOrder.scheduled_delivery_window_end && (
                      <div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fenêtre:</span>
                          <span className="font-medium text-xs">
                            {formatDate(selectedOrder.scheduled_delivery_window_start).split(' ')[1]} - {formatDate(selectedOrder.scheduled_delivery_window_end).split(' ')[1]}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {selectedOrder.estimated_delivery_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimée:</span>
                        <span className="font-medium">{formatDate(selectedOrder.estimated_delivery_time)}</span>
                      </div>
                    )}
                    
                    {selectedOrder.actual_delivery_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Livré à:</span>
                        <span className="font-medium">{formatDate(selectedOrder.actual_delivery_time)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations du livreur */}
                {selectedOrder.driver_name && (
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Livreur
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom:</span>
                        <span className="font-medium">{selectedOrder.driver_name}</span>
                      </div>
                      {selectedOrder.driver_phone && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Téléphone:</span>
                            <span className="font-medium">{selectedOrder.driver_phone}</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                            <Phone className="h-4 w-4" />
                            Appeler le livreur
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="border-t pt-4">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">ID: {selectedOrder.order_number || selectedOrder.id.slice(0, 8)}...</span>
                  <Badge className={`${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed' || selectedOrder.status === 'preparing') && (
                    <Button variant="destructive" size="sm" onClick={() => {
                      handleStatusChange(selectedOrder.id, 'cancelled');
                      setIsDetailsOpen(false);
                    }}>
                      Annuler
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogue d'assignation de livreur */}
      {orderToAssign && (
        <AssignDriverDialog
          isOpen={isAssignDriverOpen}
          onClose={() => {
            setIsAssignDriverOpen(false);
            setOrderToAssign(null);
          }}
          orderId={orderToAssign.id}
          orderNumber={orderToAssign.order_number || orderToAssign.id.slice(0, 8)}
          businessId={business.id}
          onDriverAssigned={handleDriverAssigned}
        />
      )}

      {/* Dialogue d'assignation multiple de livreur */}
      {ordersToAssign.length > 0 && (
        <Dialog open={isMultipleAssignOpen} onOpenChange={setIsMultipleAssignOpen}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Assigner un livreur à {ordersToAssign.length} commande(s) ASAP
              </DialogTitle>
              <DialogDescription>
                Sélectionnez un livreur pour prendre en charge toutes ces commandes de livraison rapide.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
              {/* Liste des commandes à assigner */}
              <div className="space-y-4 flex flex-col">
                <h3 className="text-lg font-medium flex-shrink-0">Commandes à assigner</h3>
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-4">
                    {ordersToAssign.map((order) => (
                      <Card key={order.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">#{order.order_number || order.id.slice(0, 8)}</h4>
                            <p className="text-sm text-gray-600">{order.customer_name}</p>
                            <p className="text-sm text-gray-500">{order.delivery_address}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-green-100 text-green-800">
                                <Zap className="h-3 w-3 mr-1" />
                                ASAP
                              </Badge>
                              <span className="text-sm font-medium">{formatCurrency(order.grand_total)}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Sélection du livreur */}
              <div className="space-y-4 flex flex-col flex-1 min-h-0">
                <h3 className="text-lg font-medium flex-shrink-0">Sélectionner un livreur</h3>
                
                {isLoadingDrivers ? (
                  <div className="space-y-3 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : availableDrivers.length === 0 ? (
                  <div className="text-center py-8 flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Aucun livreur disponible</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1">
                      <div className="space-y-3 pr-4">
                        {availableDrivers.map((driver) => (
                          <Card 
                            key={driver.id} 
                            className={`p-4 cursor-pointer transition-colors ${
                              selectedDriverId === driver.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedDriverId(driver.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                                <p className="text-sm text-gray-500">{driver.phone}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {driver.active_orders_count || 0} commande{(driver.active_orders_count || 0) > 1 ? 's' : ''}
                                  </Badge>
                                  {driver.vehicle_type && (
                                    <Badge variant="outline" className="text-xs">
                                      {driver.vehicle_type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {selectedDriverId === driver.id && (
                                <div className="flex-shrink-0">
                                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
                
                {selectedDriverId && (
                  <div className="pt-4 border-t flex-shrink-0">
                    <Button 
                      onClick={handleMultipleDriverAssigned}
                      className="w-full"
                      disabled={isBatchLoading}
                    >
                      {isBatchLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Assignation en cours...
                        </>
                      ) : (
                        `Assigner ${ordersToAssign.length} commande(s) au livreur`
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default PartnerOrders; 