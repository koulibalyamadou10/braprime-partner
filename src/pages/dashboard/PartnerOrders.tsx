import React, { useState, useEffect } from 'react';
import DashboardLayout, { partnerNavItems } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw,
  Package,
  User,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  MoreHorizontal,
  ChevronDown,
  Truck,
  Zap,
  Timer,
  AlertCircle
} from 'lucide-react';
import { usePartnerDashboard } from '@/hooks/use-partner-dashboard';
import { PartnerDashboardService, PartnerOrder } from '@/lib/services/partner-dashboard';
import { toast } from 'sonner';
import { AssignDriverDialog } from '@/components/AssignDriverDialog';
import { PartnerOrdersSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { DeliveryInfoBadge } from '@/components/DeliveryInfoBadge';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface DashboardOrder extends PartnerOrder {
  business_id: number;
}

const PartnerOrders = () => {
  const { business, updateOrderStatus, refresh } = usePartnerDashboard();
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
    loadOrders();
  }, [business]);

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

  // Gérer la sélection d'une commande
  const handleOrderSelect = (order: DashboardOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Gérer l'ouverture du dialogue d'assignation de livreur
  const handleAssignDriver = (order: DashboardOrder) => {
    setOrderToAssign(order);
    setIsAssignDriverOpen(true);
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

  if (isLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Commandes">
        <PartnerOrdersSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
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
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={loadOrders}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
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
          <Button onClick={loadOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
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
                    <TableHead>ID Commande</TableHead>
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
                      <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
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
                <span>Commande {selectedOrder.id.slice(0, 8)}...</span>
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
                      <span className="font-medium capitalize">{selectedOrder.delivery_method || 'livraison'}</span>
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
                  <span className="text-sm text-gray-500">ID: {selectedOrder.id.slice(0, 8)}...</span>
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
          orderNumber={orderToAssign.id.slice(0, 8)}
          businessId={business.id}
          onDriverAssigned={handleDriverAssigned}
        />
      )}
    </DashboardLayout>
  );
};

export default PartnerOrders; 