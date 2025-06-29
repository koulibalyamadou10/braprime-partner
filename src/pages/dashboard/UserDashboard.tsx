import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Clock, 
  Check, 
  X, 
  MapPin, 
  Star, 
  ArrowRight,
  Truck,
  Bell,
  RefreshCw,
  Package,
  Heart,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCustomerDashboard } from '@/hooks/use-dashboard';
import { PageSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { useUserRole } from '@/contexts/UserRoleContext';

// Composant pour afficher les statistiques
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

// Composant pour afficher les commandes récentes
const RecentOrdersList = ({ orders }: { orders: any[] }) => (
  <div className="space-y-4">
    {orders.map((order) => (
      <Card key={order.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{order.restaurant_name}</h4>
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
              </div>
              
              <div className="text-sm text-muted-foreground mb-2">
                {order.items?.slice(0, 2).map((item: any, index: number) => (
                  <span key={index}>
                    {item.quantity}x {item.name}
                    {index < Math.min(2, order.items.length - 1) && ', '}
                  </span>
                ))}
                {order.items?.length > 2 && ` et ${order.items.length - 2} autres...`}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{(order.total / 1000).toFixed(0)}k GNF</span>
                <span>•</span>
                <span>{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
              </div>
            </div>
            
            <Button variant="outline" size="sm" asChild>
              <Link to={`/orders/${order.id}`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const { isCustomer } = useUserRole();

  // Utiliser les hooks pour les données dynamiques
  const { 
    stats, 
    recentOrders, 
    notifications, 
    refresh, 
    isLoading, 
    error,
    isAuthenticated,
    currentUser: customerCurrentUser
  } = useCustomerDashboard();

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M GNF`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated) {
    return (
      <DashboardLayout navItems={userNavItems} title="Tableau de bord">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Authentification Requise</h3>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder à votre dashboard
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

  // Vérifier si l'utilisateur est un client
  if (!isCustomer) {
    return (
      <DashboardLayout navItems={userNavItems} title="Tableau de bord">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
            <p className="text-muted-foreground mb-4">
              Cette page est réservée aux clients. Vous n'avez pas le bon rôle.
            </p>
            {/* Redirection selon le rôle si besoin */}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout navItems={userNavItems} title="Tableau de bord">
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={userNavItems} title="Tableau de bord">
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
    <DashboardLayout navItems={userNavItems} title="Tableau de bord">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Bienvenue, {customerCurrentUser?.name}</h2>
            <p className="text-muted-foreground">
              Voici un aperçu de vos activités récentes et options de livraison à Conakry.
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
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Commandes"
                value={stats.data?.totalOrders || 0}
                icon={ShoppingBag}
                description="Toutes vos commandes"
              />
              
              <StatsCard
                title="Total Dépensé"
                value={formatCurrency(stats.data?.totalSpent || 0)}
                icon={CreditCard}
                description="Montant total dépensé"
              />
              
              <StatsCard
                title="Restaurants Favoris"
                value={stats.data?.favoriteRestaurants || 0}
                icon={Heart}
                description="Restaurants sauvegardés"
              />
              
              <StatsCard
                title="Adresses Sauvegardées"
                value={stats.data?.savedAddresses || 0}
                icon={MapPin}
                description="Adresses enregistrées"
              />
            </div>

            {/* Commandes Récentes */}
            <Card>
              <CardHeader>
                <CardTitle>Commandes Récentes</CardTitle>
                <CardDescription>
                  Vos dernières commandes et leur statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.data && recentOrders.data.length > 0 ? (
                  <RecentOrdersList orders={recentOrders.data} />
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune commande récente</h3>
                    <p className="text-muted-foreground mb-4">
                      Vous n'avez pas encore passé de commande
                    </p>
                    <Button asChild>
                      <Link to="/restaurants">
                        Découvrir des restaurants
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              {recentOrders.data && recentOrders.data.length > 0 && (
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard/orders">
                      Voir toutes mes commandes
                    </Link>
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Actions Rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>
                  Accédez rapidement aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/restaurants">
                      <ShoppingBag className="h-6 w-6" />
                      Commander
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/dashboard/addresses">
                      <MapPin className="h-6 w-6" />
                      Mes Adresses
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/dashboard/payments">
                      <CreditCard className="h-6 w-6" />
                      Paiements
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Commandes</CardTitle>
                <CardDescription>
                  Consultez l'aperçu complet de vos commandes
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-10">
                <Button asChild>
                  <Link to="/dashboard/orders">
                    Voir toutes mes commandes
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

export default UserDashboard; 