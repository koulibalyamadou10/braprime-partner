import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Car, 
  Zap, 
  Bike, 
  Truck, 
  Star, 
  Package, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  DollarSign,
  Calendar,
  MessageSquare,
  Award,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { DriverDetailsService, DriverDetails, DriverOrder, DriverReview, DriverStats } from '@/lib/services/driver-details';
import { useAuth } from '@/contexts/AuthContext';

const DriverDetailsPage = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  // États pour les données
  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [reviews, setReviews] = useState<DriverReview[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [currentOrder, setCurrentOrder] = useState<DriverOrder | null>(null);
  
  // États de chargement
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du livreur
  useEffect(() => {
    if (driverId) {
      loadDriverData();
    }
  }, [driverId]);

  const loadDriverData = async () => {
    if (!driverId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Charger les détails du livreur
      const { driver: driverData, error: driverError } = await DriverDetailsService.getDriverDetails(driverId);
      if (driverError) {
        setError(driverError);
        return;
      }
      setDriver(driverData);

      // Charger les commandes
      const { orders: driverOrders, error: ordersError } = await DriverDetailsService.getDriverOrders(driverId);
      if (ordersError) {
        console.error('Erreur chargement commandes:', ordersError);
      } else {
        setOrders(driverOrders || []);
      }

      // Charger les avis
      const { reviews: driverReviews, error: reviewsError } = await DriverDetailsService.getDriverReviews(driverId);
      if (reviewsError) {
        console.error('Erreur chargement avis:', reviewsError);
      } else {
        setReviews(driverReviews || []);
      }

      // Charger les statistiques
      const { stats: driverStats, error: statsError } = await DriverDetailsService.getDriverStats(driverId);
      if (statsError) {
        console.error('Erreur chargement stats:', statsError);
      } else {
        setStats(driverStats);
      }

      // Charger la commande actuelle
      const { order: currentDriverOrder, error: currentOrderError } = await DriverDetailsService.getCurrentOrder(driverId);
      if (currentOrderError) {
        console.error('Erreur chargement commande actuelle:', currentOrderError);
      } else {
        setCurrentOrder(currentDriverOrder);
      }

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier l'authentification
  if (!isAuthenticated) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Détails du Livreur">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Authentification Requise</h3>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder à cette page
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Vérifier le rôle
  if (currentUser?.role !== 'partner') {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Détails du Livreur">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
            <p className="text-muted-foreground mb-4">
              Cette page est réservée aux partenaires.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fonctions utilitaires
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      confirmed: { label: 'Confirmée', variant: 'default' as const },
      preparing: { label: 'En préparation', variant: 'default' as const },
      ready: { label: 'Prête', variant: 'default' as const },
      out_for_delivery: { label: 'En livraison', variant: 'default' as const },
      delivered: { label: 'Livrée', variant: 'default' as const },
      cancelled: { label: 'Annulée', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeliveryTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  // Affichage de chargement
  if (isLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Détails du Livreur">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/partner-dashboard/drivers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Affichage d'erreur
  if (error || !driver) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Détails du Livreur">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/partner-dashboard/drivers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-500 mb-4">{error || 'Livreur non trouvé'}</p>
              <Button onClick={loadDriverData}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={partnerNavItems} title={`Détails - ${driver.name}`}>
      <div className="space-y-6">
        {/* En-tête avec bouton retour */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/partner-dashboard/drivers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux livreurs
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{driver.name}</h1>
            <p className="text-gray-500">Détails et performances du livreur</p>
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte d'information du livreur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{driver.name}</p>
                  <p className="text-sm text-gray-500">ID: {driver.id.slice(0, 8)}...</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{driver.phone}</span>
                </div>
                {driver.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{driver.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {getVehicleIcon(driver.vehicle_type)}
                  <span className="text-sm">
                    {getVehicleLabel(driver.vehicle_type)}
                    {driver.vehicle_plate && ` - ${driver.vehicle_plate}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={driver.is_active ? "default" : "secondary"}>
                  {driver.is_active ? "Actif" : "Inactif"}
                </Badge>
                {driver.current_order_id && (
                  <Badge variant="outline">En livraison</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques principales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                      <p className="text-sm text-gray-500">Commandes totales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{stats.completedOrders}</p>
                      <p className="text-sm text-gray-500">Livrées</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{stats.averageRating.toFixed(1)}/5</span>
                    <span className="text-sm text-gray-500">({stats.totalReviews} avis)</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Revenus générés:</span>
                      <span className="font-medium">{formatCurrency(stats.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Temps moyen:</span>
                      <span className="font-medium">{formatDeliveryTime(stats.averageDeliveryTime)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Aucune donnée disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Commande actuelle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Commande actuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentOrder ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">#{currentOrder.id.slice(0, 8)}...</span>
                    {getStatusBadge(currentOrder.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{currentOrder.customer_name}</p>
                    <p className="text-xs text-gray-500">{currentOrder.customer_phone}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{formatCurrency(currentOrder.grand_total)}</p>
                    <p className="text-gray-500">{formatDate(currentOrder.created_at)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucune commande en cours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Onglets pour les détails */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Commandes ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avis ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Statistiques détaillées
            </TabsTrigger>
          </TabsList>

          {/* Onglet Commandes */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historique des commandes</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Commande</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            #{order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-sm text-gray-500">{order.customer_phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              <p className="text-sm">{order.delivery_address}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{formatCurrency(order.grand_total)}</p>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{formatDate(order.created_at)}</p>
                          </TableCell>
                          <TableCell>
                            {order.driver_rating ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">{order.driver_rating}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune commande trouvée</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Avis */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Avis des clients</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{review.customer_name}</p>
                            <p className="text-sm text-gray-500">
                              Commande #{review.order_id.slice(0, 8)}...
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{review.rating}/5</span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun avis trouvé</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Statistiques détaillées */}
          <TabsContent value="stats" className="space-y-4">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Commandes totales</p>
                        <p className="text-2xl font-bold">{stats.totalOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Livrées</p>
                        <p className="text-2xl font-bold">{stats.completedOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">À l'heure</p>
                        <p className="text-2xl font-bold">{stats.onTimeDeliveries}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">En retard</p>
                        <p className="text-2xl font-bold">{stats.lateDeliveries}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Revenus générés</p>
                        <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                        <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avis reçus</p>
                        <p className="text-2xl font-bold">{stats.totalReviews}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Temps moyen</p>
                        <p className="text-2xl font-bold">{formatDeliveryTime(stats.averageDeliveryTime)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DriverDetailsPage; 