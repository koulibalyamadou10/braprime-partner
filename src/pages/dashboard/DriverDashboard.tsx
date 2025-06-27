import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  Mail, 
  Car, 
  Star, 
  TrendingUp,
  DollarSign,
  Calendar,
  Navigation,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface DriverOrder {
  id: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  created_at: string;
  estimated_delivery_time: string;
}

interface DriverStats {
  total_deliveries: number;
  completed_deliveries: number;
  pending_deliveries: number;
  total_earnings: number;
  rating: number;
  active_hours: number;
}

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadDriverData();
    }
  }, [user]);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données de test
      const mockOrders: DriverOrder[] = [
        {
          id: '1',
          customer_name: 'Mamadou Diallo',
          customer_address: '123 Rue de la Paix, Conakry',
          customer_phone: '+224 123 456 789',
          total_amount: 25000,
          status: 'en_cours',
          created_at: '2024-01-15T10:30:00Z',
          estimated_delivery_time: '2024-01-15T11:30:00Z'
        },
        {
          id: '2',
          customer_name: 'Fatoumata Camara',
          customer_address: '456 Avenue de la République, Conakry',
          customer_phone: '+224 987 654 321',
          total_amount: 18000,
          status: 'terminé',
          created_at: '2024-01-15T09:00:00Z',
          estimated_delivery_time: '2024-01-15T10:00:00Z'
        }
      ];

      const mockStats: DriverStats = {
        total_deliveries: 45,
        completed_deliveries: 42,
        pending_deliveries: 3,
        total_earnings: 1250000,
        rating: 4.8,
        active_hours: 8
      };

      setOrders(mockOrders);
      setStats(mockStats);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      // Simuler la mise à jour
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En cours</Badge>;
      case 'terminé':
        return <Badge variant="default" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'annulé':
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Livreur</h1>
          <p className="text-muted-foreground">Bienvenue, {user?.email}</p>
        </div>
        <Button onClick={loadDriverData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livraisons totales</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_deliveries}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completed_deliveries} terminées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gains totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_earnings.toLocaleString()} FG</div>
              <p className="text-xs text-muted-foreground">
                Ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rating}</div>
              <p className="text-xs text-muted-foreground">
                Sur 5 étoiles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heures actives</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_hours}h</div>
              <p className="text-xs text-muted-foreground">
                Aujourd'hui
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commandes récentes</CardTitle>
              <CardDescription>
                Vos dernières livraisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {order.customer_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{order.customer_address}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.total_amount.toLocaleString()} FG</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {order.status === 'en_cours' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'terminé')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Terminer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'annulé')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Annuler
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les commandes</CardTitle>
              <CardDescription>
                Historique complet de vos livraisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {order.customer_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{order.customer_address}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.total_amount.toLocaleString()} FG</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {order.status === 'en_cours' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'terminé')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Terminer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'annulé')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Annuler
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil du livreur</CardTitle>
              <CardDescription>
                Vos informations personnelles et véhicule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Nom complet</div>
                      <div className="text-sm text-muted-foreground">Mamadou Diallo</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Téléphone</div>
                      <div className="text-sm text-muted-foreground">+224 123 456 789</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">{user?.email}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Type de véhicule</div>
                      <div className="text-sm text-muted-foreground">Moto</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Navigation className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Plaque d'immatriculation</div>
                      <div className="text-sm text-muted-foreground">ABC 123</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Note moyenne</div>
                      <div className="text-sm text-muted-foreground">4.8/5</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverDashboard; 