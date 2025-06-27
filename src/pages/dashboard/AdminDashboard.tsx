import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingBag, 
  Clock, 
  Check, 
  X, 
  Utensils,
  DollarSign,
  Calendar,
  ArrowUpRight,
  Star,
  Bell,
  ChevronRight as ChevronRightIcon,
  RefreshCw,
  TrendingUp,
  Users,
  Package,
  Home,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Power,
  PowerOff,
  Shield,
  Settings,
  BarChart3,
  UserCheck,
  Building2,
  Truck,
  CreditCard,
  Activity,
  Globe,
  Database
} from 'lucide-react';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import RealTimeStats from '@/components/dashboard/RealTimeStats';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Utiliser le hook pour les données du dashboard admin
  const { 
    stats, 
    recentOrders, 
    topBusinesses, 
    systemHealth,
    refresh, 
    isLoading, 
    error 
  } = useAdminDashboard();

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M GNF`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  // Formater les pourcentages
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Obtenir le statut de la commande avec couleur
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

  if (isLoading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Administration">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Administration">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refresh.mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Administration">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tableau de bord Administrateur</h2>
            <p className="text-muted-foreground">
              Gestion complète de la plateforme BraPrime - {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${refresh.isPending ? 'animate-spin' : ''}`} />
            </Button>
            <Button asChild>
              <Link to="/admin-dashboard/settings">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistiques en temps réel */}
        <RealTimeStats />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="businesses">Commerces</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Cartes de statistiques principales */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.data?.totalOrders || 0}</p>
                      <p className="text-sm text-gray-500">Commandes totales</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">{formatPercentage(stats?.data?.orderGrowth || 0)}</span>
                    <span className="text-gray-500 ml-1">vs hier</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(stats?.data?.totalRevenue || 0)}</p>
                      <p className="text-sm text-gray-500">Revenus totaux</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">{formatPercentage(stats?.data?.revenueGrowth || 0)}</span>
                    <span className="text-gray-500 ml-1">vs hier</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.data?.totalUsers || 0}</p>
                      <p className="text-sm text-gray-500">Utilisateurs actifs</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">{formatPercentage(stats?.data?.userGrowth || 0)}</span>
                    <span className="text-gray-500 ml-1">vs hier</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Building2 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.data?.totalBusinesses || 0}</p>
                      <p className="text-sm text-gray-500">Commerces actifs</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">{formatPercentage(stats?.data?.businessGrowth || 0)}</span>
                    <span className="text-gray-500 ml-1">vs hier</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>
                  Accédez rapidement aux fonctionnalités d'administration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/admin-dashboard/businesses">
                      <Building2 className="h-6 w-6" />
                      Gérer Commerces
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/admin-dashboard/users">
                      <Users className="h-6 w-6" />
                      Gérer Utilisateurs
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/admin-dashboard/orders">
                      <ShoppingBag className="h-6 w-6" />
                      Suivre Commandes
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/admin-dashboard/system">
                      <Settings className="h-6 w-6" />
                      Configuration
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="businesses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Commerces</CardTitle>
                <CardDescription>
                  Gérez tous les commerces de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Statistiques
                    </Button>
                  </div>
                  <Button asChild>
                    <Link to="/admin-dashboard/businesses">
                      Voir tous les commerces
                    </Link>
                  </Button>
                </div>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Clients</p>
                          <p className="text-2xl font-bold">{stats?.data?.customerCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Partenaires</p>
                          <p className="text-2xl font-bold">{stats?.data?.partnerCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Livreurs</p>
                          <p className="text-2xl font-bold">{stats?.data?.driverCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suivi des Commandes</CardTitle>
                <CardDescription>
                  Surveillez toutes les commandes de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Rapports
                    </Button>
                  </div>
                  <Button asChild>
                    <Link to="/admin-dashboard/orders">
                      Voir toutes les commandes
                    </Link>
                  </Button>
                </div>
                
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune commande récente à afficher</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>
                  Gérez tous les utilisateurs de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Vérification
                    </Button>
                  </div>
                  <Button asChild>
                    <Link to="/admin-dashboard/users">
                      Voir tous les utilisateurs
                    </Link>
                  </Button>
                </div>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Clients</p>
                          <p className="text-2xl font-bold">{stats?.data?.customerCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Partenaires</p>
                          <p className="text-2xl font-bold">{stats?.data?.partnerCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Livreurs</p>
                          <p className="text-2xl font-bold">{stats?.data?.driverCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Santé du système */}
              <Card>
                <CardHeader>
                  <CardTitle>Santé du Système</CardTitle>
                  <CardDescription>
                    État général de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Base de données</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Opérationnel
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Opérationnel
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stockage</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Opérationnel
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Notifications</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Opérationnel
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques système */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques Système</CardTitle>
                  <CardDescription>
                    Métriques de performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Utilisation CPU</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Utilisation Mémoire</span>
                        <span>62%</span>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Espace Disque</span>
                        <span>28%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Réponse API</span>
                        <span>120ms</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions système */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Système</CardTitle>
                <CardDescription>
                  Actions d'administration système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Database className="h-6 w-6" />
                    Sauvegarde
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <RefreshCw className="h-6 w-6" />
                    Redémarrer
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Shield className="h-6 w-6" />
                    Sécurité
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Activity className="h-6 w-6" />
                    Monitoring
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard; 