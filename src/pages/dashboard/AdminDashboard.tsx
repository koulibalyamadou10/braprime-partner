import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
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
  Database,
  FileText,
  Map,
  Star as StarIcon,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Download,
  Upload,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Tag,
  Award,
  Zap,
  Target,
  TrendingDown,
  Minus,
  Equal
} from 'lucide-react';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import AdminRealTimeStats from '@/components/dashboard/AdminRealTimeStats';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Utiliser le hook pour les données du dashboard admin
  const { 
    stats, 
    users,
    businesses,
    orders,
    drivers,
    analytics,
    loading, 
    error,
    refreshData,
    period,
    handlePeriodChange
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

  if (loading) {
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
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData}>
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
            <Select value={period} onValueChange={(value: 'today' | 'week' | 'month' | 'year') => handlePeriodChange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
        <AdminRealTimeStats 
          stats={stats}
          period={period}
          onPeriodChange={handlePeriodChange}
          onRefresh={refreshData}
          isLoading={loading}
        />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="businesses">Commerces</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="drivers">Livreurs</TabsTrigger>
            <TabsTrigger value="requests">Demandes</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                      <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                      <p className="text-sm text-gray-500">Commandes totales</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">+12.5%</span>
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
                      <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                      <p className="text-sm text-gray-500">Revenus totaux</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">+8.3%</span>
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
                      <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                      <p className="text-sm text-gray-500">Utilisateurs actifs</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">+15.7%</span>
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
                      <p className="text-2xl font-bold">{stats?.totalBusinesses || 0}</p>
                      <p className="text-sm text-gray-500">Commerces actifs</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">+5.2%</span>
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
                      Gérer Commandes
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/admin-dashboard/drivers">
                      <Truck className="h-6 w-6" />
                      Gérer Livreurs
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
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
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
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Commerces Actifs</p>
                          <p className="text-2xl font-bold">{stats?.activeBusinesses || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Revenus Moyens</p>
                          <p className="text-2xl font-bold">{formatCurrency(250000)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                          <p className="text-2xl font-bold">4.2</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Liste des commerces récents */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Commerces Récents</h3>
                  <div className="space-y-3">
                    {businesses.slice(0, 5).map((business) => (
                      <div key={business.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{business.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{business.name}</p>
                            <p className="text-sm text-gray-500">{business.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={business.is_active ? "default" : "secondary"}>
                            {business.is_active ? "Actif" : "Inactif"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
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
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
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
                          <p className="text-2xl font-bold">{stats?.customerCount || 0}</p>
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
                          <p className="text-2xl font-bold">{stats?.partnerCount || 0}</p>
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
                          <p className="text-2xl font-bold">{stats?.driverCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Livreurs</CardTitle>
                <CardDescription>
                  Gérez tous les livreurs et leurs documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                    <Button variant="outline" size="sm">
                      <Map className="h-4 w-4 mr-2" />
                      Localisation
                    </Button>
                  </div>
                  <Button asChild>
                    <Link to="/admin-dashboard/drivers">
                      Voir tous les livreurs
                    </Link>
                  </Button>
                </div>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Livreurs Actifs</p>
                          <p className="text-2xl font-bold">{stats?.activeDrivers || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">En Livraison</p>
                          <p className="text-2xl font-bold">{stats?.deliveringDrivers || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Documents Expirés</p>
                          <p className="text-2xl font-bold">{stats?.expiredDocuments || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du Contenu</CardTitle>
                <CardDescription>
                  Gérez les catégories, types de commerce et contenu de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Tag className="h-4 w-4 mr-2" />
                      Catégories
                    </Button>
                    <Button variant="outline" size="sm">
                      <Award className="h-4 w-4 mr-2" />
                      Types
                    </Button>
                  </div>
                  <Button asChild>
                    <Link to="/admin-dashboard/content">
                      Gérer le contenu
                    </Link>
                  </Button>
                </div>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Catégories</p>
                          <p className="text-2xl font-bold">{stats?.categoriesCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Types de Commerce</p>
                          <p className="text-2xl font-bold">{stats?.businessTypesCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avis</p>
                          <p className="text-2xl font-bold">{stats?.reviewsCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Demandes</CardTitle>
                <CardDescription>
                  Gérez les demandes de partenaires et chauffeurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Statistiques
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                  <Button asChild>
                    <Link to="/admin-dashboard/requests">
                      Gérer les demandes
                    </Link>
                  </Button>
                </div>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Demandes</p>
                          <p className="text-2xl font-bold">0</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">En Attente</p>
                          <p className="text-2xl font-bold">0</p>
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
                          <p className="text-2xl font-bold">0</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Chauffeurs</p>
                          <p className="text-2xl font-bold">0</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Demandes Récentes</h3>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune demande pour le moment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics et Rapports</CardTitle>
                <CardDescription>
                  Analysez les performances et générez des rapports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Graphiques
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                  <Button asChild>
                    <Link to="/admin-dashboard/analytics">
                      Voir les analytics
                    </Link>
                  </Button>
                </div>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Croissance</p>
                          <p className="text-2xl font-bold">{formatPercentage(stats?.growthRate || 0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Objectifs</p>
                          <p className="text-2xl font-bold">{stats?.targetAchievement || 0}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Performance</p>
                          <p className="text-2xl font-bold">{stats?.performanceScore || 0}/100</p>
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