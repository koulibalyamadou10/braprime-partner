import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Home, 
  Power, 
  PowerOff, 
  Calendar, 
  Timer, 
  TrendingUp, 
  CreditCard, 
  Settings,
  Loader2,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { PartnerDashboardService, PartnerBusiness, PartnerStats, PartnerMenuItem, PartnerOrder } from '../../lib/services/partner-dashboard';

const PartnerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // États pour les données
  const [business, setBusiness] = useState<PartnerBusiness | null>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [menu, setMenu] = useState<PartnerMenuItem[]>([]);
  const [orders, setOrders] = useState<PartnerOrder[]>([]);
  
  // États de chargement
  const [isLoading, setIsLoading] = useState(true);
  const [isBusinessLoading, setIsBusinessLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  
  // États d'erreur
  const [error, setError] = useState<string | null>(null);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Charger les données du business
  const loadBusiness = async () => {
    setIsBusinessLoading(true);
    setBusinessError(null);
    try {
      const result = await PartnerDashboardService.getPartnerBusiness();
      if (result.error) {
        setBusinessError(result.error);
        toast.error(`❌ Erreur business: ${result.error}`);
      } else if (result.business) {
        setBusiness(result.business);
        toast.success('✅ Business récupéré avec succès!');
      } else {
        setBusinessError('Aucun business trouvé');
        toast.error('❌ Aucun business trouvé');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inattendue';
      setBusinessError(errorMessage);
      toast.error(`❌ Erreur lors du chargement du business: ${errorMessage}`);
    } finally {
      setIsBusinessLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async (businessId: number) => {
    setIsStatsLoading(true);
    setStatsError(null);
    try {
      const result = await PartnerDashboardService.getPartnerStats(businessId);
      if (result.error) {
        setStatsError(result.error);
        toast.error(`❌ Erreur stats: ${result.error}`);
      } else if (result.stats) {
        setStats(result.stats);
        toast.success('✅ Statistiques récupérées avec succès!');
      } else {
        setStatsError('Aucune statistique trouvée');
        toast.error('❌ Aucune statistique trouvée');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inattendue';
      setStatsError(errorMessage);
      toast.error(`❌ Erreur lors du chargement des statistiques: ${errorMessage}`);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Charger le menu
  const loadMenu = async (businessId: number) => {
    setIsMenuLoading(true);
    setMenuError(null);
    try {
      const result = await PartnerDashboardService.getPartnerMenu(businessId, 5);
      if (result.error) {
        setMenuError(result.error);
        toast.error(`❌ Erreur menu: ${result.error}`);
      } else if (result.menu) {
        setMenu(result.menu);
        toast.success('✅ Menu récupéré avec succès!');
      } else {
        setMenuError('Aucun menu trouvé');
        toast.error('❌ Aucun menu trouvé');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inattendue';
      setMenuError(errorMessage);
      toast.error(`❌ Erreur lors du chargement du menu: ${errorMessage}`);
    } finally {
      setIsMenuLoading(false);
    }
  };

  // Charger les commandes
  const loadOrders = async (businessId: number) => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const result = await PartnerDashboardService.getPartnerOrders(businessId, 5);
      if (result.error) {
        setOrdersError(result.error);
        toast.error(`❌ Erreur orders: ${result.error}`);
      } else if (result.orders) {
        setOrders(result.orders);
        toast.success('✅ Commandes récupérées avec succès!');
      } else {
        setOrdersError('Aucune commande trouvée');
        toast.error('❌ Aucune commande trouvée');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inattendue';
      setOrdersError(errorMessage);
      toast.error(`❌ Erreur lors du chargement des commandes: ${errorMessage}`);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Charger toutes les données
  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Charger le business
      await loadBusiness();
      
      // 2. Si le business est chargé, charger les autres données
      if (business) {
        await Promise.all([
          loadStats(business.id),
          loadMenu(business.id),
          loadOrders(business.id)
        ]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inattendue';
      setError(errorMessage);
      toast.error(`❌ Erreur lors du chargement des données: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (currentUser?.role === 'partner') {
      loadAllData();
    }
  }, [currentUser]);

  // Recharger les données quand le business change
  useEffect(() => {
    if (business) {
      loadStats(business.id);
      loadMenu(business.id);
      loadOrders(business.id);
    }
  }, [business]);

  // Rediriger si l'utilisateur n'est pas un partenaire
  useEffect(() => {
    if (currentUser && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'partner') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Partenaire</h1>
        <p className="text-gray-600">Gérez votre commerce et suivez vos performances</p>
      </div>

      {/* Informations du Business */}
      {business && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {business.name}
            </CardTitle>
            <CardDescription>{business.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={business.is_active ? "default" : "secondary"}>
                  {business.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={business.is_open ? "default" : "secondary"}>
                  {business.is_open ? "Ouvert" : "Fermé"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {business.delivery_time} • {business.delivery_fee} FCFA
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes Totales</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.todayOrders} aujourd'hui
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</div>
              <p className="text-xs text-muted-foreground">
                +{stats.todayRevenue.toLocaleString()} aujourd'hui
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
                {stats.rating} ⭐ ({stats.reviewCount} avis)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur Moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageOrderValue.toLocaleString()} FCFA</div>
              <p className="text-xs text-muted-foreground">
                Par commande
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets principaux */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commandes récentes */}
            <Card>
              <CardHeader>
                <CardTitle>Commandes Récentes</CardTitle>
                <CardDescription>Dernières commandes reçues</CardDescription>
              </CardHeader>
              <CardContent>
                {isOrdersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-8 text-red-600">
                    <p>Erreur: {ordersError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => business && loadOrders(business.id)}
                      className="mt-2"
                    >
                      Réessayer
                    </Button>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">#{order.order_number}</p>
                          <p className="text-sm text-gray-600">{order.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{order.status}</Badge>
                          <p className="text-sm font-medium">{order.grand_total.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune commande récente</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu populaire */}
            <Card>
              <CardHeader>
                <CardTitle>Menu Populaire</CardTitle>
                <CardDescription>Articles les plus commandés</CardDescription>
              </CardHeader>
              <CardContent>
                {isMenuLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : menuError ? (
                  <div className="text-center py-8 text-red-600">
                    <p>Erreur: {menuError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => business && loadMenu(business.id)}
                      className="mt-2"
                    >
                      Réessayer
                    </Button>
                  </div>
                ) : menu.length > 0 ? (
                  <div className="space-y-3">
                    {menu.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.category_name}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{item.is_available ? "Disponible" : "Indisponible"}</Badge>
                          <p className="text-sm font-medium">{item.price.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucun article de menu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Commandes */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Commandes</CardTitle>
              <CardDescription>Suivez et gérez toutes vos commandes</CardDescription>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : ordersError ? (
                <div className="text-center py-8 text-red-600">
                  <p>Erreur: {ordersError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => business && loadOrders(business.id)}
                    className="mt-2"
                  >
                    Réessayer
                  </Button>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">Commande #{order.order_number}</h3>
                          <p className="text-sm text-gray-600">
                            {order.customer_name} • {order.customer_phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{order.status}</Badge>
                          <p className="text-lg font-bold">{order.grand_total.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm"><strong>Adresse:</strong> {order.delivery_address}</p>
                          <p className="text-sm"><strong>Instructions:</strong> {order.delivery_instructions || 'Aucune'}</p>
                          <p className="text-sm"><strong>Méthode:</strong> {order.payment_method}</p>
                        </div>
                        <div>
                          <p className="text-sm"><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                          <p className="text-sm"><strong>Livraison:</strong> {order.delivery_type}</p>
                          <p className="text-sm"><strong>Statut paiement:</strong> {order.payment_status}</p>
                        </div>
                      </div>

                      {order.items.length > 0 && (
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium mb-2">Articles commandés:</p>
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.name} x{item.quantity}</span>
                                <span>{item.price.toLocaleString()} FCFA</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune commande trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu */}
        <TabsContent value="menu" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion du Menu</CardTitle>
              <CardDescription>Gérez vos articles de menu</CardDescription>
            </CardHeader>
            <CardContent>
              {isMenuLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : menuError ? (
                <div className="text-center py-8 text-red-600">
                  <p>Erreur: {menuError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => business && loadMenu(business.id)}
                    className="mt-2"
                  >
                    Réessayer
                  </Button>
                </div>
              ) : menu.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menu.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge variant={item.is_available ? "default" : "secondary"}>
                          {item.is_available ? "Disponible" : "Indisponible"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{item.price.toLocaleString()} FCFA</span>
                        <span className="text-sm text-gray-500">{item.category_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun article de menu trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du Business</CardTitle>
              <CardDescription>Gérez les paramètres de votre commerce</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Statut du Business</p>
                    <p className="text-sm text-gray-600">Activer ou désactiver votre commerce</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Heures d'ouverture</p>
                    <p className="text-sm text-gray-600">Définir vos horaires de travail</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Zone de livraison</p>
                    <p className="text-sm text-gray-600">Configurer votre zone de livraison</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bouton de rechargement */}
      <div className="mt-8 text-center">
        <Button 
          onClick={loadAllData} 
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Chargement...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recharger les données
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PartnerDashboard; 