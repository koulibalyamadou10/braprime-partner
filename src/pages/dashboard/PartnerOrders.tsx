import React, { useState, useEffect } from 'react';
import DashboardLayout, { partnerNavItems } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
  DollarSign
} from 'lucide-react';
import { usePartnerDashboard } from '@/hooks/use-partner-dashboard';
import { PartnerDashboardService, PartnerOrder } from '@/lib/services/partner-dashboard';
import { toast } from 'sonner';

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Filtrer par recherche
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone.includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filterStatus, searchQuery]);

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
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'preparing': return 'default';
      case 'ready': return 'default';
      case 'out_for_delivery': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  // Obtenir l'icône selon le statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Package className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'out_for_delivery': return <Package className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Obtenir les statistiques des commandes
  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const confirmed = orders.filter(order => order.status === 'confirmed').length;
    const preparing = orders.filter(order => order.status === 'preparing').length;
    const ready = orders.filter(order => order.status === 'ready').length;
    const delivered = orders.filter(order => order.status === 'delivered').length;
    const cancelled = orders.filter(order => order.status === 'cancelled').length;

    return { total, pending, confirmed, preparing, ready, delivered, cancelled };
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
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Gestion des Commandes</h2>
              <p className="text-gray-500">Chargement de vos commandes...</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinea-red"></div>
          </div>
        </div>
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

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Préparation</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.preparing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prêtes</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ready}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livrées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annulées</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Rechercher par client, téléphone ou ID commande..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status-filter">Statut</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="status-filter" className="w-[180px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="confirmed">Confirmée</SelectItem>
                    <SelectItem value="preparing">En préparation</SelectItem>
                    <SelectItem value="ready">Prête</SelectItem>
                    <SelectItem value="out_for_delivery">En livraison</SelectItem>
                    <SelectItem value="delivered">Livrée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des commandes */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes ({filteredOrders.length})</CardTitle>
            <CardDescription>
              Liste de toutes les commandes de votre business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(order.grand_total)}</p>
                          <p className="text-sm text-gray-500">{order.items.length} articles</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDate(order.created_at)}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOrderSelect(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Détails de la commande</DialogTitle>
                                <DialogDescription>
                                  Commande #{order.id.slice(0, 8)}...
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* Informations client */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Client</h4>
                                    <div className="space-y-1">
                                      <p className="text-sm flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {order.customer_name}
                                      </p>
                                      <p className="text-sm flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        {order.customer_phone}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Livraison</h4>
                                    <div className="space-y-1">
                                      <p className="text-sm flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {order.delivery_address}
                                      </p>
                                      {order.delivery_instructions && (
                                        <p className="text-sm text-gray-500">
                                          {order.delivery_instructions}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Articles */}
                                <div>
                                  <h4 className="font-medium mb-2">Articles</h4>
                                  <div className="space-y-2">
                                    {order.items.map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                                        <div>
                                          <p className="font-medium">{item.name}</p>
                                          <p className="text-sm text-gray-500">
                                            Quantité: {item.quantity}
                                          </p>
                                        </div>
                                        <p className="font-medium">
                                          {formatCurrency(item.price * item.quantity)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Résumé */}
                                <div className="border-t pt-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Sous-total:</span>
                                      <span>{formatCurrency(order.total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Frais de livraison:</span>
                                      <span>{formatCurrency(order.delivery_fee)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                      <span>Total:</span>
                                      <span>{formatCurrency(order.grand_total)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  {order.status === 'pending' && (
                                    <Button
                                      onClick={() => handleStatusChange(order.id, 'confirmed')}
                                      className="flex-1"
                                    >
                                      Confirmer
                                    </Button>
                                  )}
                                  {order.status === 'confirmed' && (
                                    <Button
                                      onClick={() => handleStatusChange(order.id, 'preparing')}
                                      className="flex-1"
                                    >
                                      Commencer la préparation
                                    </Button>
                                  )}
                                  {order.status === 'preparing' && (
                                    <Button
                                      onClick={() => handleStatusChange(order.id, 'ready')}
                                      className="flex-1"
                                    >
                                      Marquer comme prêt
                                    </Button>
                                  )}
                                  {order.status === 'ready' && (
                                    <Button
                                      onClick={() => handleStatusChange(order.id, 'out_for_delivery')}
                                      className="flex-1"
                                    >
                                      En livraison
                                    </Button>
                                  )}
                                  {order.status === 'out_for_delivery' && (
                                    <Button
                                      onClick={() => handleStatusChange(order.id, 'delivered')}
                                      className="flex-1"
                                    >
                                      Livrée
                                    </Button>
                                  )}
                                  {(order.status === 'pending' || order.status === 'confirmed') && (
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                                      className="flex-1"
                                    >
                                      Annuler
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Aucune commande ne correspond aux critères de recherche'
                    : 'Aucune commande trouvée'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerOrders; 