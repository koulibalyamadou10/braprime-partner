import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { PartnerDashboardSkeleton, PartnerDashboardProgressiveSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { SubscriptionStatus } from '@/components/dashboard/SubscriptionStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { usePartnerDashboard } from '@/hooks/use-partner-dashboard';
import { usePartnerAccessCheck } from '@/hooks/use-subscription';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    AlertCircle,
    ArrowUpRight,
    Calendar,
    CheckCircle,
    ChevronRight as ChevronRightIcon,
    Clock,
    DollarSign,
    Home,
    Mail,
    MapPin,
    Package,
    Phone,
    Power,
    PowerOff,
    RefreshCw,
    ShoppingBag,
    Star,
    Timer,
    TrendingUp,
    Truck,
    Users,
    XCircle,
    CreditCard,
    Bell,
    Settings
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { isInternalUser } from '@/hooks/use-internal-users';

// Composant de chargement - remplacé par PartnerDashboardSkeleton

// Données mock supprimées - remplacées par des données dynamiques


// Données mock hebdomadaires supprimées - remplacées par des données dynamiques

// Fonction pour obtenir la couleur du statut
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return "bg-blue-100 text-blue-800";
    case 'confirmed': return "bg-yellow-100 text-yellow-800";
    case 'preparing': return "bg-orange-100 text-orange-800";
    case 'ready': return "bg-green-100 text-green-800";
    case 'out_for_delivery': return "bg-purple-100 text-purple-800";
    case 'delivered': return "bg-gray-100 text-gray-800";
    case 'cancelled': return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// Fonction pour obtenir l'icône du statut
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <AlertCircle className="h-4 w-4" />;
    case 'confirmed': return <Clock className="h-4 w-4" />;
    case 'preparing': return <Timer className="h-4 w-4" />;
    case 'ready': return <CheckCircle className="h-4 w-4" />;
    case 'out_for_delivery': return <Truck className="h-4 w-4" />;
    case 'delivered': return <CheckCircle className="h-4 w-4" />;
    case 'cancelled': return <XCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

// Fonction pour obtenir le label du statut
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'confirmed': return 'Confirmée';
    case 'preparing': return 'En préparation';
    case 'ready': return 'Prête';
    case 'out_for_delivery': return 'En livraison';
    case 'delivered': return 'Livrée';
    case 'cancelled': return 'Annulée';
    default: return status;
  }
};


const PartnerDashboard = () => {
  isInternalUser();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isOpen, setIsOpen] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const { isPartner } = useUserRole();

  // Vérifier l'accès partenaire et les besoins d'abonnement
  const { data: accessCheck, isLoading: accessLoading } = usePartnerAccessCheck();

  // Utiliser le hook pour les données dynamiques
  const { 
    business,
    stats,
    recentOrders,
    menu,
    weeklyData,
    isLoading,
    isBusinessLoading,
    isStatsLoading,
    isOrdersLoading,
    isMenuLoading,
    isWeeklyDataLoading,
    error,
    isAuthenticated,
    currentUser: partnerCurrentUser,
    updateOrderStatus,
    toggleBusinessStatus,
    refresh
  } = usePartnerDashboard();

  // Calculer le jour avec le plus de revenus à partir des données dynamiques
  const highestRevenueDay = weeklyData.length > 0 ? weeklyData.reduce((prev, current) => {
    return (prev.revenue > current.revenue) ? prev : current;
  }, weeklyData[0]) : { day: 'Aucun', orders: 0, revenue: 0 };

  // Données du restaurant dynamiques (utilisées pour l'affichage)
  const restaurantData = {
    name: business?.name || "Restaurant",
    image: "/placeholder-restaurant.jpg", // Pas de cover_image dans l'interface actuelle
    address: business?.address || "Adresse non définie",
    cuisine: business?.cuisine_type || "Cuisine",
    rating: business?.rating || 0,
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

  // Fonction de préchargement manuel des données
  const preloadData = async () => {
    try {
      toast.info('🔄 Préchargement des données...')
      await refresh()
      toast.success('✅ Données préchargées avec succès!')
    } catch (error) {
      toast.error('❌ Erreur lors du préchargement')
      console.error('Erreur de préchargement:', error)
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
  if (!isPartner) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
            <p className="text-muted-foreground mb-4">
              Cette page est réservée aux partenaires. Vous n'avez pas le bon rôle.
            </p>
            {/* Redirection selon le rôle si besoin */}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Vérifier si l'utilisateur a un abonnement actif
  if (accessCheck && !accessCheck.canAccess && accessCheck.requiresSubscription) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Abonnement Requis</h3>
              <p className="text-muted-foreground mb-6">
                Votre compte a été approuvé mais nécessite un abonnement pour être activé. 
                Choisissez un plan pour commencer à utiliser votre dashboard partenaire.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button asChild className="w-full bg-guinea-red hover:bg-guinea-red/90">
                <Link to="/partner-dashboard/settings?tab=billing">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Choisir un abonnement
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="/partner-dashboard/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Voir mes paramètres
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Utiliser le chargement progressif au lieu du chargement simple
  if (isBusinessLoading && !business) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
        <PartnerDashboardSkeleton />
      </DashboardLayout>
    );
  }

  // Afficher le chargement progressif une fois que le business est chargé
  if (business && (isStatsLoading || isOrdersLoading || isMenuLoading || isWeeklyDataLoading)) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord">
        <PartnerDashboardProgressiveSkeleton
          business={business}
          stats={stats}
          recentOrders={recentOrders}
          menu={menu}
          weeklyData={weeklyData}
          isBusinessLoading={false}
          isStatsLoading={isStatsLoading}
          isOrdersLoading={isOrdersLoading}
          isMenuLoading={isMenuLoading}
          isWeeklyDataLoading={isWeeklyDataLoading}
        />
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
            <Button 
              onClick={handleToggleStatus}
              variant={business.is_open ? "destructive" : "default"}
              size="sm"
              className={business.is_open ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
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

        {/* Statut d'abonnement */}
        <SubscriptionStatus />

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
                        <p className="text-sm text-gray-500">Articles de commande</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} flex w-fit items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{getStatusLabel(order.status)}</span>
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

        {/* Weekly Orders Stats */}
        <Card>
              <CardHeader>
                <CardTitle>Activité Hebdomadaire</CardTitle>
                <CardDescription>
                  Commandes et revenus cette semaine
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isWeeklyDataLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Chargement des données...</span>
                  </div>
                ) : weeklyData.length > 0 ? (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-lg font-semibold">
                          {formatCurrency(weeklyData.reduce((sum, day) => sum + day.revenue, 0))}
                        </p>
                        <p className="text-sm text-muted-foreground">Revenus hebdomadaires</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {highestRevenueDay.orders} commandes
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Meilleur jour: {highestRevenueDay.day}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 mt-4">
                      {weeklyData.map((day, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="h-28 w-full bg-muted rounded-md flex flex-col items-center justify-end p-1">
                            <div 
                              className="w-full bg-green-500 rounded-sm" 
                              style={{ 
                                height: `${highestRevenueDay.revenue > 0 ? (day.revenue / highestRevenueDay.revenue) * 100 : 0}%`,
                                minHeight: '4px'
                              }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1 font-medium">{day.day}</span>
                          <span className="text-xs text-muted-foreground">{day.orders}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune donnée disponible pour cette semaine</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Notifications */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Notifications Récentes</CardTitle>
                <CardDescription>
                  Mises à jour et alertes importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div key={notification.id} className="flex items-start border-b pb-4">
                      <div className="mr-4 mt-1">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p>{notification.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">il y a {notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Voir toutes les notifications
                </Button>
              </CardFooter>
            </Card> */}

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