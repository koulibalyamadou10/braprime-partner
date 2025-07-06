import React, { useState, useEffect } from 'react';
import { useDriverAuth } from '@/contexts/DriverAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { 
  Truck, 
  Package, 
  DollarSign, 
  Star, 
  Clock, 
  MapPin,
  User, 
  Phone, 
  Mail, 
  Car, 
  Building,
  LogOut,
  Settings,
  Activity,
  TrendingUp,
  Calendar,
  Navigation,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { DriverDashboardService } from '@/lib/services/driver-dashboard';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  business_name: string;
  total_amount: number;
  delivery_fee: number;
  status: string;
  created_at: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  items?: any[];
}

interface DriverStats {
  total_deliveries: number;
  completed_deliveries: number;
  pending_deliveries: number;
  cancelled_deliveries: number;
  total_earnings: number;
  average_rating: number;
  total_reviews: number;
  active_hours: number;
  on_time_deliveries: number;
  late_deliveries: number;
}

const DriverDashboard = () => {
  const { driver, logout, loading } = useDriverAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (driver) {
      loadOrders();
      loadStats();
    }
  }, [driver]);

  const loadOrders = async () => {
    if (!driver) return;
    setLoadingOrders(true);
    try {
      // Utiliser le service driver-dashboard
      const { orders, error } = await DriverDashboardService.getDriverOrders();
      if (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        toast.error('Erreur lors du chargement des commandes');
      } else {
        setOrders(orders || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des commandes:', err);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadStats = async () => {
    if (!driver) return;

    setLoadingStats(true);
    try {
      // Utiliser le service pour les stats
      const { stats: driverStats, error } = await DriverDashboardService.getDriverStats();
      
      if (error) {
        console.error('Erreur lors du calcul des stats:', error);
        // Fallback: calculer les stats localement
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(order => 
          order.created_at.startsWith(today) && order.status === 'delivered'
        );
        
        setStats({
          total_deliveries: driver.total_deliveries || 0,
          completed_deliveries: orders.filter(order => order.status === 'delivered').length,
          pending_deliveries: orders.filter(order => 
            ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
          ).length,
          cancelled_deliveries: orders.filter(order => order.status === 'cancelled').length,
          total_earnings: orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + (order.delivery_fee || 0), 0),
          average_rating: driver.rating || 0,
          total_reviews: 0,
          active_hours: 8,
          on_time_deliveries: 0,
          late_deliveries: 0
        });
      } else {
        setStats(driverStats);
      }
    } catch (err) {
      console.error('Erreur lors du calcul des stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { success, error } = await DriverDashboardService.updateOrderStatus(orderId, newStatus);
      
      if (error) {
        throw new Error(error);
      }

      toast.success('Statut de la commande mis à jour');
      loadOrders();
      loadStats();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie');
    } catch (err) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' }> = {
      pending: { label: 'En attente', variant: 'secondary' },
      confirmed: { label: 'Confirmée', variant: 'default' },
      preparing: { label: 'En préparation', variant: 'default' },
      ready: { label: 'Prête', variant: 'default' },
      picked_up: { label: 'Récupérée', variant: 'default' },
      out_for_delivery: { label: 'En livraison', variant: 'default' },
      delivered: { label: 'Livrée', variant: 'default' },
      cancelled: { label: 'Annulée', variant: 'destructive' },
      assigned: { label: 'Assignée', variant: 'default' },
      completed: { label: 'Terminée', variant: 'default' }
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return <Package className="h-4 w-4" />;
      case 'picked_up':
      case 'out_for_delivery':
        return <Navigation className="h-4 w-4" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 bg-guinea-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-6 w-6 text-guinea-red" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Accès non autorisé</h2>
            <p className="text-gray-600 mb-4">
              Vous devez être connecté en tant que livreur pour accéder à cette page.
            </p>
            <Button 
              className="bg-guinea-red hover:bg-guinea-red/90 text-white"
              onClick={() => window.location.href = '/driver/login'}
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-br from-guinea-red to-guinea-red/80 rounded-full flex items-center justify-center shadow-md">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard Livreur
                </h1>
                <p className="text-sm text-gray-600">
                  Bienvenue, {driver.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={driver.avatar_url} />
                  <AvatarFallback>
                    {driver.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{driver.name}</p>
                  <p className="text-gray-500">{driver.business_id ? 'Service' : 'Indépendant'}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-guinea-red text-guinea-red hover:bg-guinea-red hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
              </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Livraisons</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.total_deliveries || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gains Totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats?.total_earnings || 0).toLocaleString()} FCFA
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                  <div className="flex items-center">
                                      <p className="text-2xl font-bold text-gray-900">
                    {stats?.average_rating || 0}
                  </p>
                    <Star className="h-4 w-4 text-yellow-400 ml-1" />
                  </div>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commandes Actives</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.pending_deliveries || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistiques du jour */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Aujourd'hui
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Livraisons terminées</span>
                      <span className="font-semibold">{stats?.completed_deliveries || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gains totaux</span>
                      <span className="font-semibold">{(stats?.total_earnings || 0).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux de réussite</span>
                      <span className="font-semibold">
                        {stats?.total_deliveries ? Math.round((stats.completed_deliveries / stats.total_deliveries) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gain moyen</span>
                      <span className="font-semibold">
                        {stats?.total_deliveries ? Math.round((stats.total_earnings / stats.total_deliveries)) : 0} FCFA
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commandes récentes */}
            <Card>
              <CardHeader>
                <CardTitle>Commandes Récentes</CardTitle>
                <CardDescription>
                  Vos dernières commandes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune commande pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-gray-500">{order.business_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(order.total_amount || 0).toLocaleString()} FCFA</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les Commandes</CardTitle>
                <CardDescription>
                  Gérez vos commandes et suivez leur progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune commande pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold">Commande #{order.id.slice(0, 8)}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{(order.total_amount || 0).toLocaleString()} FCFA</p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium mb-2">Informations client</h4>
                            <div className="space-y-1 text-sm">
                              <p><User className="h-4 w-4 inline mr-2" />{order.customer_name}</p>
                              <p><Phone className="h-4 w-4 inline mr-2" />{order.customer_phone}</p>
                              <p><Building className="h-4 w-4 inline mr-2" />{order.business_name}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Adresse de livraison</h4>
                            <p className="text-sm text-gray-600">{order.customer_address}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Frais de livraison: {(order.delivery_fee || 0).toLocaleString()} FCFA
                          </div>
                          <div className="flex space-x-2">
                            {order.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateOrderStatus(order.id, 'picked_up')}
                                className="bg-guinea-red hover:bg-guinea-red/90"
                              >
                                Accepter
                              </Button>
                            )}
                            {order.status === 'picked_up' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Terminer
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profil Livreur</CardTitle>
                <CardDescription>
                  Vos informations personnelles et statistiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={driver.avatar_url} />
                        <AvatarFallback>
                          {driver.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{driver.name}</h3>
                        <p className="text-gray-500">{driver.email}</p>
                        <p className="text-sm text-gray-400">{driver.business_id ? 'Service' : 'Indépendant'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{driver.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{driver.vehicle_type || 'Non spécifié'}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Note: {driver.rating || 0}/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Statistiques</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-guinea-red">{driver.total_deliveries || 0}</p>
                        <p className="text-sm text-gray-600">Livraisons</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-guinea-red">{(stats?.total_earnings || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Gains (FCFA)</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Statut</span>
                      <Badge variant={driver.is_active ? 'default' : 'secondary'}>
                        {driver.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverDashboard; 