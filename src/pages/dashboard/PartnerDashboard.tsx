import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  PowerOff
} from 'lucide-react';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { usePartnerDashboard } from '@/hooks/use-partner-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardService } from '@/lib/services/dashboard'
import { toast } from 'sonner';

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

  // Utiliser le hook pour les données dynamiques
  const { 
    business,
    stats,
    recentOrders,
    menu,
    isLoading,
    error,
    isAuthenticated,
    currentUser: partnerCurrentUser,
    updateOrderStatus,
    toggleBusinessStatus,
    refresh
  } = usePartnerDashboard();

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

  // Gérer le changement de statut du business
  const handleToggleStatus = async () => {
    const newStatus = !business?.is_open;
    const success = await toggleBusinessStatus(newStatus);
    
    if (success) {
      toast.success(`Business ${newStatus ? 'ouvert' : 'fermé'} avec succès`);
    } else {
      toast.error('Erreur lors du changement de statut');
    }
  };

  // Gérer le changement de statut d'une commande
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const success = await updateOrderStatus(orderId, newStatus);
    
    if (success) {
      toast.success('Statut de la commande mis à jour');
    } else {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Fonction de diagnostic temporaire
  const runDiagnostic = async () => {
    console.log('=== LANCEMENT DU DIAGNOSTIC ===')
    const { PartnerDashboardService } = await import('@/lib/services/partner-dashboard')
    const result = await PartnerDashboardService.diagnoseAuthAndData()
    console.log('Résultat du diagnostic:', result)
    
    if (result.success) {
      toast.success('✅ Diagnostic réussi! Vérifiez la console pour les détails.')
    } else {
      toast.error(`❌ Diagnostic échoué: ${result.error}`)
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
              <p className="text-gray-500">Chargement de vos données...</p>
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
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
              <p className="text-gray-500">Erreur lors du chargement des données.</p>
            </div>
            <Button onClick={runDiagnostic} variant="outline" size="sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              Diagnostic
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={refresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
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

  return (
    <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
      <div className="space-y-6">
        {/* Header avec informations du business */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
            <p className="text-gray-500">
              Bienvenue, {partnerCurrentUser?.name} - {business.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={refresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button 
              onClick={handleToggleStatus}
              variant={business.is_open ? "destructive" : "default"}
              size="sm"
            >
              {business.is_open ? (
                <>
                  <PowerOff className="h-4 w-4 mr-2" />
                  Fermer
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  Ouvrir
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Informations du business */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Informations du Business
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Adresse</p>
                  <p className="text-sm text-gray-500">{business.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <p className="text-sm text-gray-500">{business.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-500">{business.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Horaires</p>
                  <p className="text-sm text-gray-500">{business.opening_hours}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Badge variant={business.is_open ? "default" : "secondary"}>
                {business.is_open ? "Ouvert" : "Fermé"}
              </Badge>
              <Badge variant="outline">{business.business_type}</Badge>
              {business.cuisine_type && (
                <Badge variant="outline">{business.cuisine_type}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commandes Totales</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.completedOrders} livrées
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Moyenne: {formatCurrency(stats.averageOrderValue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Clients uniques
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Note</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.reviewCount} avis
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Commandes récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
            <CardDescription>
              Les dernières commandes de votre business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.grand_total)}</p>
                        <p className="text-sm text-gray-500">{order.items.length} articles</p>
                      </div>
                      <Badge 
                        variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'cancelled' ? 'destructive' : 'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                      <div className="flex gap-1">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderStatusChange(order.id, 'confirmed')}
                          >
                            Confirmer
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderStatusChange(order.id, 'preparing')}
                          >
                            Préparer
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderStatusChange(order.id, 'ready')}
                          >
                            Prêt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune commande récente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Menu ({menu.length} articles)</CardTitle>
            <CardDescription>
              Articles de votre menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {menu.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menu.slice(0, 6).map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant={item.is_available ? "default" : "secondary"}>
                        {item.is_available ? "Disponible" : "Indisponible"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                    <p className="font-medium">{formatCurrency(item.price)}</p>
                    <p className="text-xs text-gray-500">{item.category_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun article dans le menu</p>
                <Button asChild className="mt-2">
                  <Link to="/partner-dashboard/menu">
                    Ajouter des articles
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard; 