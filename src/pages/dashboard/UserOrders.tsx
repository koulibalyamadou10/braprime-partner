import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Clock, ExternalLink, Filter, Package, Search, ShoppingBag, Tag, Truck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useDashboardOrders, type DashboardOrder } from '@/hooks/use-dashboard-orders';
import { type Order as SupabaseOrder } from '@/lib/services/orders';
import { UserOrdersSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { useNavigate } from 'react-router-dom';

// Define the Order type
type OrderStatus = SupabaseOrder['status'];

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface LocalOrder {
  id: string;
  date: Date;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  trackingNumber?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  estimatedDelivery?: Date;
}

// Helper function to get status badge color and label
const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return { color: 'bg-blue-100 text-blue-800', label: 'En attente', icon: <Clock className="h-4 w-4 mr-1" /> };
    case 'confirmed':
      return { color: 'bg-amber-100 text-amber-800', label: 'Confirmée', icon: <Package className="h-4 w-4 mr-1" /> };
    case 'preparing':
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Préparation', icon: <Clock className="h-4 w-4 mr-1" /> };
    case 'ready':
      return { color: 'bg-green-100 text-green-800', label: 'Prête', icon: <Package className="h-4 w-4 mr-1" /> };
    case 'picked_up':
      return { color: 'bg-purple-100 text-purple-800', label: 'En livraison', icon: <Truck className="h-4 w-4 mr-1" /> };
    case 'delivered':
      return { color: 'bg-green-200 text-green-900', label: 'Livrée', icon: <Tag className="h-4 w-4 mr-1" /> };
    case 'cancelled':
      return { color: 'bg-red-100 text-red-800', label: 'Annulée', icon: <Tag className="h-4 w-4 mr-1" /> };
    default:
      return { color: 'bg-gray-100 text-gray-800', label: status, icon: <Clock className="h-4 w-4 mr-1" /> };
  }
};

// Helper function to get status icon
const StatusIcon = ({ status }: { status: OrderStatus }) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'confirmed':
      return <Package className="h-4 w-4" />;
    case 'preparing':
      return <Clock className="h-4 w-4" />;
    case 'ready':
      return <Package className="h-4 w-4" />;
    case 'picked_up':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
      return <Tag className="h-4 w-4" />;
    case 'cancelled':
      return <Tag className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const UserOrders = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { 
    orders: dashboardOrders, 
    loading, 
    error, 
    fetchUserOrders,
    updateOrderStatus,
    cancelOrder,
    getOrdersByStatus,
    getOrderStats
  } = useDashboardOrders();

  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les commandes au montage du composant
  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    }
  }, [currentUser, fetchUserOrders]);

  // Convertir les commandes du dashboard vers le format local
  const orders: LocalOrder[] = useMemo(() => dashboardOrders.map(dashboardOrder => ({
    id: dashboardOrder.id,
    date: new Date(dashboardOrder.orderDate),
    total: dashboardOrder.total,
    status: dashboardOrder.status,
    items: dashboardOrder.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: undefined
    })),
    deliveryAddress: {
      street: dashboardOrder.customerAddress,
      city: 'Conakry',
      state: 'Conakry',
      postalCode: '11000',
      country: 'Guinea',
    },
    estimatedDelivery: new Date(dashboardOrder.estimatedDelivery)
  })), [dashboardOrders]);

  // Filter orders based on selected filter and search term
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  }), [orders, filter, searchTerm]);

  // Group orders by time period
  const { recentOrders, past3MonthsOrders, olderOrders } = useMemo(() => {
    const currentDate = new Date();
    const last30Days = new Date(currentDate);
    last30Days.setDate(currentDate.getDate() - 30);
    
    const last90Days = new Date(currentDate);
    last90Days.setDate(currentDate.getDate() - 90);

    const recent = filteredOrders.filter(order => order.date >= last30Days);
    const past3Months = filteredOrders.filter(order => order.date >= last90Days && order.date < last30Days);
    const older = filteredOrders.filter(order => order.date < last90Days);

    return { recentOrders: recent, past3MonthsOrders: past3Months, olderOrders: older };
  }, [filteredOrders]);

  // Handle view order details
  const handleViewOrderDetails = useCallback((order: LocalOrder) => {
    const dashboardOrder = dashboardOrders.find(o => o.id === order.id);
    if (dashboardOrder) {
      setSelectedOrder(dashboardOrder);
      setShowOrderDetails(true);
    }
  }, [dashboardOrders]);

  // Handle cancel order
  const handleCancelOrder = useCallback(async (orderId: string) => {
    const success = await cancelOrder(orderId);
    if (success) {
      setShowOrderDetails(false);
      setSelectedOrder(null);
    }
  }, [cancelOrder]);

  // Handle search change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((value: OrderStatus | 'all') => {
    setFilter(value);
  }, []);

  if (loading) {
    return (
      <DashboardLayout navItems={userNavItems} title="Order History">
        <UserOrdersSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={userNavItems} title="Order History">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Vos Commandes</h2>
            <p className="text-muted-foreground">Erreur lors du chargement des commandes.</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchUserOrders}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={userNavItems} title="Order History">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vos Commandes</h2>
          <p className="text-muted-foreground">Consultez et suivez l'historique de vos commandes.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des commandes..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les commandes</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="preparing">En préparation</SelectItem>
                <SelectItem value="ready">Prête</SelectItem>
                <SelectItem value="picked_up">En livraison</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune commande trouvée</h3>
              <p className="text-center text-muted-foreground mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'Aucune commande ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                  : "Vous n'avez pas encore passé de commande."}
              </p>
              <Button asChild>
                <a href="/categories">Commander maintenant</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="recent">Récentes</TabsTrigger>
              <TabsTrigger value="past3months">3 derniers mois</TabsTrigger>
              <TabsTrigger value="older">Plus anciennes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <OrdersTable orders={filteredOrders} onViewDetails={handleViewOrderDetails} />
            </TabsContent>
            
            <TabsContent value="recent" className="mt-4">
              {recentOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">Aucune commande dans les 30 derniers jours.</p>
                  </CardContent>
                </Card>
              ) : (
                <OrdersTable orders={recentOrders} onViewDetails={handleViewOrderDetails} />
              )}
            </TabsContent>
            
            <TabsContent value="past3months" className="mt-4">
              {past3MonthsOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">Aucune commande entre 30 et 90 jours.</p>
                  </CardContent>
                </Card>
              ) : (
                <OrdersTable orders={past3MonthsOrders} onViewDetails={handleViewOrderDetails} />
              )}
            </TabsContent>
            
            <TabsContent value="older" className="mt-4">
              {olderOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">Aucune commande de plus de 90 jours.</p>
                  </CardContent>
                </Card>
              ) : (
                <OrdersTable orders={olderOrders} onViewDetails={handleViewOrderDetails} />
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
            <DialogContent className="w-[95vw] max-w-[425px] md:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-lg md:text-xl">Détails de la commande</DialogTitle>
                <DialogDescription className="text-sm">
                  Commande #{selectedOrder.order_number || selectedOrder.id.slice(0, 8)} - {format(new Date(selectedOrder.orderDate), 'dd MMM yyyy')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 md:space-y-6">
                {/* Order Status and Total - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center">
                    <span className={`flex items-center text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full font-medium ${getStatusBadge(selectedOrder.status).color}`}>
                      {getStatusBadge(selectedOrder.status).icon}
                      <span className="ml-1">{getStatusBadge(selectedOrder.status).label}</span>
                    </span>
                  </div>
                  <p className="font-semibold text-base md:text-lg text-right">Total: {formatCurrency(selectedOrder.total)}</p>
                </div>
                
                <Separator />
                
                {/* Order Items - Mobile Optimized */}
                <div>
                  <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Articles commandés</h3>
                  <div className="space-y-2 md:space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm md:text-base truncate">{item.name}</p>
                          <p className="text-xs md:text-sm text-gray-500">Quantité: {item.quantity}</p>
                          {item.specialInstructions && (
                            <p className="text-xs md:text-sm text-gray-500 mt-1 break-words">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <p className="font-medium text-sm md:text-base text-right sm:text-left">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Delivery Information - Mobile Optimized */}
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-3">Informations de livraison</h3>
                    <div className="space-y-2 text-sm md:text-base">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                        <span className="font-medium text-gray-700 min-w-[80px]">Adresse:</span>
                        <span className="break-words">{selectedOrder.customerAddress}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className="font-medium text-gray-700 min-w-[80px]">Méthode:</span>
                        <span>{selectedOrder.deliveryMethod === 'delivery' ? 'Livraison' : 'Retrait'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                        <span className="font-medium text-gray-700 min-w-[80px]">Restaurant:</span>
                        <span className="break-words">{selectedOrder.businessName}</span>
                      </div>
                      {selectedOrder.driverName && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="font-medium text-gray-700 min-w-[80px]">Livreur:</span>
                          <span>{selectedOrder.driverName}</span>
                        </div>
                      )}
                      {selectedOrder.driverPhone && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="font-medium text-gray-700 min-w-[80px]">Téléphone:</span>
                          <span className="break-all">{selectedOrder.driverPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-3">Informations de paiement</h3>
                    <div className="space-y-2 text-sm md:text-base">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className="font-medium text-gray-700 min-w-[80px]">Méthode:</span>
                        <span>{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                        <span className="font-medium text-gray-700 min-w-[80px]">Livraison:</span>
                        <span>{format(new Date(selectedOrder.estimatedDelivery), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button 
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setShowOrderDetails(false);
                      navigate(`/order-tracking/${selectedOrder.id}`);
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Suivre ma commande
                  </Button>
                  
                {selectedOrder.status === 'pending' && (
                    <Button 
                      variant="destructive" 
                      className="w-full sm:w-auto"
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                    >
                      Annuler la commande
                    </Button>
                  )}
                  </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

// OrdersTable component for displaying orders
const OrdersTable = ({ 
  orders, 
  onViewDetails 
}: { 
  orders: LocalOrder[],
  onViewDetails: (order: LocalOrder) => void
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Commande</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_number || order.id.slice(0, 8)}</TableCell>
              <TableCell>{format(order.date, 'dd MMM yyyy')}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className={`flex items-center text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(order.status).color}`}>
                    {getStatusBadge(order.status).icon}
                    {getStatusBadge(order.status).label}
                  </span>
                </div>
              </TableCell>
              <TableCell>{order.items.length} {order.items.length === 1 ? 'article' : 'articles'}</TableCell>
              <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewDetails(order)}
                  className="h-8 px-2"
                >
                  Voir
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserOrders; 