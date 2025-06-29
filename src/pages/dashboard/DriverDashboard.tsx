import React, { useState, useEffect } from 'react';
import { useDriverAuth } from '@/contexts/DriverAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
import { supabase } from '@/lib/supabase';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  delivery_fee: number;
  status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
  created_at: string;
  pickup_address?: string;
  estimated_delivery_time?: string;
}

interface DriverStats {
  total_deliveries: number;
  total_earnings: number;
  rating: number;
  active_orders: number;
  completed_today: number;
  earnings_today: number;
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
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_name,
          customer_phone,
          delivery_address,
          total_amount,
          delivery_fee,
          status,
          created_at,
          pickup_address,
          estimated_delivery_time
        `)
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        toast.error('Erreur lors du chargement des commandes');
      } else {
        setOrders(data || []);
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
      // Calculer les statistiques
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayOrders, error: todayError } = await supabase
        .from('orders')
        .select('delivery_fee, status')
        .eq('driver_id', driver.id)
        .gte('created_at', today);

      if (todayError) {
        console.error('Erreur lors du calcul des stats:', todayError);
      } else {
        const completedToday = todayOrders?.filter(order => order.status === 'delivered').length || 0;
        const earningsToday = todayOrders?.filter(order => order.status === 'delivered')
          .reduce((sum, order) => sum + (order.delivery_fee || 0), 0) || 0;
        const activeOrders = orders.filter(order => 
          ['assigned', 'picked_up'].includes(order.status)
        ).length;

        setStats({
          total_deliveries: driver.total_deliveries || 0,
          total_earnings: driver.total_earnings || 0,
          rating: driver.rating || 0,
          active_orders: activeOrders,
          completed_today: completedToday,
          earnings_today: earningsToday
        });
      }
    } catch (err) {
      console.error('Erreur lors du calcul des stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        throw new Error(error.message);
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

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      assigned: { label: 'Assignée', variant: 'default' as const },
      picked_up: { label: 'Récupérée', variant: 'default' as const },
      delivered: { label: 'Livrée', variant: 'default' as const },
      cancelled: { label: 'Annulée', variant: 'destructive' as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'assigned':
        return <Package className="h-4 w-4" />;
      case 'picked_up':
        return <Navigation className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
            <p className="text-gray-600 mb-4">
              Vous devez être connecté en tant que livreur pour accéder à cette page.
            </p>
            <Button onClick={() => window.location.href = '/driver/login'}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
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
                  <p className="text-gray-500">{driver.driver_type === 'independent' ? 'Indépendant' : 'Service'}</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Livraisons totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingStats ? <Skeleton className="h-8 w-16" /> : stats?.total_deliveries || 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gains totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingStats ? <Skeleton className="h-8 w-20" /> : `${(stats?.total_earnings || 0).toLocaleString()} GNF`}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingStats ? <Skeleton className="h-8 w-16" /> : `${(stats?.rating || 0).toFixed(1)}/5`}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commandes actives</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingStats ? <Skeleton className="h-8 w-16" /> : stats?.active_orders || 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Statistiques du jour */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Aujourd'hui
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Livraisons effectuées</span>
                      <span className="font-semibold">{stats?.completed_today || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gains du jour</span>
                      <span className="font-semibold text-green-600">
                        {stats?.earnings_today ? `${stats.earnings_today.toLocaleString()} GNF` : '0 GNF'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations véhicule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    Véhicule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Type</span>
                      <span className="font-medium">{driver.vehicle_type || 'Non spécifié'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Plaque</span>
                      <span className="font-medium">{driver.vehicle_plate || 'Non spécifiée'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Statut</span>
                      <Badge variant={driver.is_active ? 'default' : 'destructive'}>
                        {driver.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commandes récentes */}
            <Card>
              <CardHeader>
                <CardTitle>Commandes récentes</CardTitle>
                <CardDescription>
                  Vos dernières commandes assignées
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
                    <p className="text-gray-600">Aucune commande pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            {getStatusBadge(order.status)}
                          </div>
                          <div>
                            <p className="font-medium">#{order.order_number}</p>
                            <p className="text-sm text-gray-600">{order.customer_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{order.total_amount.toLocaleString()} GNF</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commandes */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Toutes mes commandes</CardTitle>
                <CardDescription>
                  Gérez vos commandes assignées
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune commande assignée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              {getStatusBadge(order.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold">#{order.order_number}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{order.total_amount.toLocaleString()} GNF</p>
                            <p className="text-sm text-gray-600">Frais: {order.delivery_fee.toLocaleString()} GNF</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium mb-2">Client</h4>
                            <div className="space-y-1">
                              <p className="text-sm">{order.customer_name}</p>
                              <p className="text-sm text-gray-600">{order.customer_phone}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Adresse de livraison</h4>
                            <p className="text-sm text-gray-600">{order.delivery_address}</p>
                          </div>
                        </div>

                        {/* Actions selon le statut */}
                        <div className="flex space-x-2">
                          {order.status === 'assigned' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => updateOrderStatus(order.id, 'picked_up')}
                              >
                                Marquer comme récupérée
                              </Button>
                            </>
                          )}
                          {order.status === 'picked_up' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                            >
                              Marquer comme livrée
                            </Button>
                          )}
                          {['assigned', 'picked_up'].includes(order.status) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            >
                              Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mon profil</CardTitle>
                <CardDescription>
                  Informations personnelles et paramètres
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Informations personnelles */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Informations personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Nom complet</Label>
                        <p className="text-sm text-gray-600">{driver.name}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-gray-600">{driver.email}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Téléphone</Label>
                        <p className="text-sm text-gray-600">{driver.phone}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Type de livreur</Label>
                        <p className="text-sm text-gray-600">
                          {driver.driver_type === 'independent' ? 'Indépendant' : 'Service'}
                        </p>
                      </div>
                      {driver.business_name && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Service/Commerce</Label>
                          <p className="text-sm text-gray-600">{driver.business_name}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Statistiques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{driver.total_deliveries}</p>
                        <p className="text-sm text-gray-600">Livraisons totales</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {driver.total_earnings.toLocaleString()} GNF
                        </p>
                        <p className="text-sm text-gray-600">Gains totaux</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{driver.rating.toFixed(1)}/5</p>
                        <p className="text-sm text-gray-600">Note moyenne</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Modifier le profil
                    </Button>
                    <Button variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Voir l'historique
                    </Button>
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