import React, { useState } from 'react';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  DollarSign,
  User,
  Building2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminOrders = () => {
  const {
    orders,
    ordersTotal,
    ordersPage,
    ordersStatus,
    loading,
    error,
    handleOrdersStatusFilter,
    handleOrdersPageChange,
    refreshData
  } = useAdminDashboard();

  const [statusFilter, setStatusFilter] = useState(ordersStatus);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    handleOrdersStatusFilter(status);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M GNF`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'Confirmée', variant: 'default' as const, icon: CheckCircle },
      preparing: { label: 'En préparation', variant: 'default' as const, icon: Clock },
      ready: { label: 'Prête', variant: 'default' as const, icon: CheckCircle },
      out_for_delivery: { label: 'En livraison', variant: 'default' as const, icon: Truck },
      delivered: { label: 'Livrée', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Annulée', variant: 'destructive' as const, icon: XCircle }
  };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: Clock 
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      completed: { label: 'Payé', variant: 'default' as const },
      failed: { label: 'Échoué', variant: 'destructive' as const },
      refunded: { label: 'Remboursé', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'outline' as const 
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalPages = Math.ceil(ordersTotal / 10);

  if (loading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Gestion des Commandes">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Gestion des Commandes">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Gestion des Commandes">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des Commandes</h2>
            <p className="text-muted-foreground">
              Gérez toutes les commandes de la plateforme - {ordersTotal} commandes au total
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="icon" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                  <p className="text-2xl font-bold">{ordersTotal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">En Livraison</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'out_for_delivery').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(orders.reduce((sum, o) => sum + (o.grand_total || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrer les commandes</CardTitle>
            <CardDescription>
              Filtrez les commandes par statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[200px]">
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setStatusFilter('all');
                  handleOrdersStatusFilter('all');
                }}
              >
                    <Filter className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des commandes */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Commandes</CardTitle>
            <CardDescription>
              {orders.length} commandes affichées sur {ordersTotal} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Commerce</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Livreur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>#{order.id.slice(-4)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Commande #{order.id.slice(-8)}</p>
                            <p className="text-sm text-gray-500">
                              {order.items?.length || 0} article(s)
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <User className="h-3 w-3 mr-1" />
                            {order.user_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.user_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Building2 className="h-3 w-3 mr-1" />
                          {order.business_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(order.grand_total)}
                          </div>
                          <div className="text-xs text-gray-500">
                            + {formatCurrency(order.delivery_fee)} livraison
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getPaymentStatusBadge(order.payment_status)}
                          <div className="text-xs text-gray-500">
                            {order.payment_method}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.driver_name ? (
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Truck className="h-3 w-3 mr-1" />
                              {order.driver_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.driver_phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                              </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handleOrdersPageChange(ordersPage - 1)}
                        className={ordersPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handleOrdersPageChange(page)}
                            isActive={page === ordersPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handleOrdersPageChange(totalPages)}
                            isActive={totalPages === ordersPage}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handleOrdersPageChange(ordersPage + 1)}
                        className={ordersPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders; 