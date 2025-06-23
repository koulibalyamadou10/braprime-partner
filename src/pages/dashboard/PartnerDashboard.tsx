import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Package
} from 'lucide-react';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { usePartnerDashboard } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardService } from '@/lib/services/dashboard'

// Composant de chargement
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Composant pour afficher les statistiques
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  subtitle 
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && trendValue && (
        <div className={`flex items-center text-xs ${
          trend === 'up' ? 'text-green-500' : 
          trend === 'down' ? 'text-red-500' : 
          'text-muted-foreground'
        }`}>
          {trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
          {trend === 'down' && <TrendingUp className="h-3 w-3 mr-1" />}
          <span>{trendValue}</span>
        </div>
      )}
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </CardContent>
  </Card>
);

// Composant pour afficher les commandes récentes
const RecentOrdersTable = ({ orders }: { orders: any[] }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Commandes Récentes</h3>
      <Button variant="outline" size="sm" asChild>
        <Link to="/partner-dashboard/orders">
          Voir toutes
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </Button>
    </div>
    
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.slice(0, 5).map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.customer_name}</TableCell>
              <TableCell>{(order.total / 1000).toFixed(0)}k GNF</TableCell>
              <TableCell>
                <Badge variant={
                  order.status === 'delivered' ? 'default' :
                  order.status === 'pending' ? 'secondary' :
                  order.status === 'cancelled' ? 'destructive' :
                  'outline'
                }>
                  {order.status === 'delivered' ? 'Livrée' :
                   order.status === 'pending' ? 'En attente' :
                   order.status === 'cancelled' ? 'Annulée' :
                   order.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(order.created_at), 'dd/MM HH:mm', { locale: fr })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

const PartnerDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isOpen, setIsOpen] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Utiliser les hooks pour les données dynamiques
  const { 
    stats, 
    recentOrders, 
    topItems, 
    notifications, 
    revenueData, 
    refresh, 
    isLoading, 
    error,
    isAuthenticated,
    currentUser: partnerCurrentUser
  } = usePartnerDashboard(period);

  // Données du restaurant (à remplacer par des données dynamiques)
  const restaurantData = {
    name: "Le Petit Conakry Restaurant",
    image: "/placeholder-restaurant.jpg",
    address: "15 Rue du Port, Kaloum, Conakry",
    cuisine: "Cuisine Guinéenne & Africaine",
    rating: 4.7,
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

  // Fonction de diagnostic temporaire
  const runDiagnostic = async () => {
    console.log('=== LANCEMENT DU DIAGNOSTIC ===')
    const result = await DashboardService.diagnoseAuthAndData()
    console.log('Résultat du diagnostic:', result)
    
    if (result.success) {
      alert('✅ Diagnostic réussi! Vérifiez la console pour les détails.')
    } else {
      alert(`❌ Diagnostic échoué: ${result.error}`)
    }
  }

  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Authentification Requise</h3>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder au dashboard partenaire
            </p>
            <Button asChild>
              <Link to="/login">
                Se connecter
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Vérifier si l'utilisateur est un partenaire
  if (partnerCurrentUser?.role !== 'partner') {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
            <p className="text-muted-foreground mb-4">
              Cette page est réservée aux partenaires. Vous êtes connecté en tant que client.
            </p>
            <Button asChild>
              <Link to="/dashboard">
                Aller au dashboard client
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground mb-4">
              Impossible de charger les données du dashboard
            </p>
            <Button onClick={() => refresh.mutate()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Bienvenue, {partnerCurrentUser?.name || restaurantData.name}
            </h2>
            <p className="text-muted-foreground">
              Gérez votre restaurant et suivez vos commandes et revenus.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={isOpen ? "default" : "outline"}
              className={isOpen ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? "Restaurant Ouvert" : "Restaurant Fermé"}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${refresh.isPending ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={runDiagnostic}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              🔧 Diagnostic
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Restaurant Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Avatar className="w-24 h-24 rounded-md">
                    <AvatarImage src={restaurantData.image} alt={restaurantData.name} />
                    <AvatarFallback className="rounded-md text-xl">LC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{restaurantData.name}</h3>
                    <div className="flex items-center text-muted-foreground">
                      <Utensils className="h-4 w-4 mr-1" />
                      <span>{restaurantData.cuisine}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Star className="h-4 w-4 mr-1 fill-amber-500 stroke-amber-500" />
                      <span>{restaurantData.rating} (245 avis)</span>
                    </div>
                    <p className="text-sm">{restaurantData.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Commandes du Jour"
                value={stats.data?.totalOrders || 0}
                icon={ShoppingBag}
                trend="up"
                trendValue="+15% par rapport à hier"
              />
              
              <StatsCard
                title="Revenus du Jour"
                value={formatCurrency(stats.data?.totalRevenue || 0)}
                icon={DollarSign}
                subtitle={`${formatCurrency(stats.data?.averageOrderValue || 0)} en moyenne`}
              />
              
              <StatsCard
                title="Commandes en Attente"
                value={stats.data?.pendingOrders || 0}
                icon={Clock}
                trend="neutral"
              />
              
              <StatsCard
                title="Commandes Livrées"
                value={stats.data?.completedOrders || 0}
                icon={Check}
                trend="up"
                trendValue="+8% cette semaine"
              />
            </div>

            {/* Commandes Récentes */}
            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
                <CardDescription>
                  Vos dernières commandes et activités
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.data && recentOrders.data.length > 0 ? (
                  <RecentOrdersTable orders={recentOrders.data} />
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune commande récente</h3>
                    <p className="text-muted-foreground">
                      Les nouvelles commandes apparaîtront ici
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Commandes</CardTitle>
                <CardDescription>
                  Consultez l'aperçu complet de la page des commandes
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-10">
                <Button asChild>
                  <Link to="/partner-dashboard/orders">
                    Aller à la page des commandes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyses et Rapports</CardTitle>
                <CardDescription>
                  Consultez l'aperçu complet de la page des revenus
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-10">
                <Button asChild>
                  <Link to="/partner-dashboard/revenue">
                    Aller à la page des revenus
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Restez informé des mises à jour importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.data && notifications.data.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.data.map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
                    <p className="text-muted-foreground">
                      Vous êtes à jour !
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard; 