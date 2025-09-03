import { useState } from 'react';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ShoppingCart,
  Users,
  Calendar,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { usePartnerRevenue } from '@/hooks/use-partner-revenue';
import { formatCurrency } from '@/lib/utils';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RealTimeStats from '@/components/dashboard/RealTimeStats';
import Unauthorized from '@/components/Unauthorized';
import { useCurrencyRole } from '@/contexts/UseRoleContext';
import { useToast } from '@/components/ui/use-toast';

// Helper function for percentage
const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const PartnerRevenue = () => {
  const { currencyRole, roles } = useCurrencyRole();
  const { toast } = useToast();

  if (!roles.includes("revenu") && !roles.includes("admin")) {
    return <Unauthorized />;
  }

  const { currentUser } = useAuth();
  
  // State for time period selection
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isExporting, setIsExporting] = useState(false);
  
  // Utiliser les hooks pour les données dynamiques
  const { 
    revenueData, 
    topItems, 
    stats, 
    isLoading, 
    error, 
    refetch 
  } = usePartnerRevenue(period);

  // Formater les montants
  const formatCurrencyDisplay = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M GNF`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  // Fonction pour exporter en Excel
  const handleExportToExcel = async () => {
    if (!revenueData) {
      toast({
        title: "Erreur",
        description: "Aucune donnée disponible pour l'export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Créer le contenu CSV avec un style amélioré
      let csvContent = '';
      
      // En-tête principal
      const periodLabels = {
        daily: 'Aujourd\'hui',
        weekly: 'Cette Semaine', 
        monthly: 'Ce Mois',
        yearly: 'Cette Année'
      };
      
      csvContent += `RAPPORT DE REVENUS - ${periodLabels[period].toUpperCase()}\n`;
      csvContent += `Généré le: ${new Date().toLocaleDateString('fr-FR')}\n`;
      csvContent += `Restaurant: ${currentUser?.business_name || 'Restaurant'}\n`;
      csvContent += '='.repeat(80) + '\n\n';
      
      // Statistiques globales en premier
      csvContent += '📊 STATISTIQUES GLOBALES\n';
      csvContent += '='.repeat(50) + '\n';
      csvContent += 'Métrique,Valeur\n';
      csvContent += `Revenus totaux,${formatCurrencyDisplay(totalRevenue)}\n`;
      csvContent += `Commandes totales,${totalOrders.toLocaleString()}\n`;
      csvContent += `Valeur moyenne par commande,${formatCurrencyDisplay(averageOrderValue)}\n`;
      csvContent += `Revenus de la période,${formatCurrencyDisplay(periodRevenue)}\n`;
      csvContent += `Commandes de la période,${periodOrders.toLocaleString()}\n`;
      csvContent += '\n';
      
      // Données de revenus par période
      if (revenueData.dailyData && revenueData.dailyData.length > 0) {
        csvContent += '📈 REVENUS PAR PÉRIODE\n';
        csvContent += '='.repeat(50) + '\n';
        csvContent += 'Date,Revenus (GNF),Commandes,Moyenne par commande\n';
        revenueData.dailyData.forEach(item => {
          const avgPerOrder = item.orders > 0 ? (item.revenue / item.orders) : 0;
          csvContent += `${item.date},${item.revenue.toLocaleString()},${item.orders},${avgPerOrder.toFixed(0)}\n`;
        });
        csvContent += '\n';
      }
      
      // Articles populaires
      if (revenueData.topItems && revenueData.topItems.length > 0) {
        csvContent += '🏆 ARTICLES POPULAIRES\n';
        csvContent += '='.repeat(50) + '\n';
        csvContent += 'Rang,Article,Revenus (GNF),Commandes,Pourcentage du total\n';
        revenueData.topItems.forEach((item, index) => {
          const percentage = ((item.revenue / totalRevenue) * 100).toFixed(1);
          csvContent += `${index + 1},${item.name},${item.revenue.toLocaleString()},${item.count},${percentage}%\n`;
        });
        csvContent += '\n';
      }
      
      // Répartition par catégorie
      if (revenueData.categories && revenueData.categories.length > 0) {
        csvContent += '📂 RÉPARTITION PAR CATÉGORIE\n';
        csvContent += '='.repeat(50) + '\n';
        csvContent += 'Catégorie,Revenus (GNF),Pourcentage\n';
        revenueData.categories.forEach(category => {
          csvContent += `${category.name},${category.revenue.toLocaleString()},${category.percentage.toFixed(1)}%\n`;
        });
        csvContent += '\n';
      }
      
      // Méthodes de paiement
      if (revenueData.paymentMethods && revenueData.paymentMethods.length > 0) {
        csvContent += '💳 MÉTHODES DE PAIEMENT\n';
        csvContent += '='.repeat(50) + '\n';
        csvContent += 'Méthode,Revenus (GNF),Commandes,Pourcentage\n';
        revenueData.paymentMethods.forEach(method => {
          csvContent += `${method.method},${method.amount.toLocaleString()},${method.count},${method.percentage.toFixed(1)}%\n`;
        });
        csvContent += '\n';
      }
      
      // Pied de page
      csvContent += '='.repeat(80) + '\n';
      csvContent += '📋 NOTES:\n';
      csvContent += '- Tous les montants sont en GNF (Franc Guinéen)\n';
      csvContent += '- Les pourcentages sont calculés sur les revenus totaux\n';
      csvContent += '- Les données sont basées sur les commandes payées uniquement\n';
      csvContent += `- Rapport généré automatiquement le ${new Date().toLocaleString('fr-FR')}\n`;
      
      // Générer le nom du fichier
      const fileName = `Revenus_${periodLabels[period]}_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Créer le blob et télécharger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export réussi",
        description: `Le fichier ${fileName} a été téléchargé avec succès.`,
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Calculer les statistiques globales
  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const averageOrderValue = stats?.averageOrderValue || 0;
  const periodRevenue = stats?.periodRevenue || 0;
  const periodOrders = stats?.periodOrders || 0;

  // Optional: Replace with actual chart component if available
  const renderBarChart = (data: { date: string; revenue: number; orders: number }[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Aucune donnée disponible pour cette période
        </div>
      );
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue));
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Revenue</span>
          <span>Orders</span>
        </div>
        
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.date}</span>
                <span className="text-gray-500">{item.orders} orders</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${(item.revenue / maxRevenue) * 100}%` }} 
                />
              </div>
              <div className="text-right text-sm font-medium">
                {formatCurrencyDisplay(item.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  

  return (
    <DashboardLayout navItems={partnerNavItems} title="Analyses des Revenus">
      <div className="space-y-6">

        {/* Affichage des erreurs */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-sm font-medium">Erreur de chargement des données:</span>
                <span className="text-sm">{error?.message || 'Erreur inconnue'}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contenue  */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Revenue & Sales</h2>
            <p className="text-gray-500">Track your restaurant's financial performance.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Today</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExportToExcel}
              disabled={isExporting || isLoading}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? 'Export...' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Banknote className="h-6 w-6 text-primary" />
                </div>
                {revenueData?.growth && revenueData.growth > 0 ? (
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>+{revenueData.growth.toFixed(1)}%</span>
                  </div>
                ) : revenueData?.growth && revenueData.growth < 0 ? (
                  <div className="flex items-center text-red-600">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    <span>{revenueData.growth.toFixed(1)}%</span>
                  </div>
                ) : null}
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    formatCurrencyDisplay(totalRevenue)
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    totalOrders.toLocaleString()
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Average Order</p>
                <h3 className="text-2xl font-bold mt-1">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    formatCurrencyDisplay(averageOrderValue)
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {period === 'daily' 
                    ? 'Orders per Hour' 
                    : period === 'weekly' 
                      ? 'Orders per Day' 
                      : period === 'monthly' 
                        ? 'Orders per Week' 
                        : 'Orders per Month'}
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : revenueData?.dailyData && revenueData.dailyData.length > 0 ? (
                    (totalOrders / revenueData.dailyData.length).toFixed(1)
                  ) : (
                    '0'
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                {period === 'daily' 
                  ? 'Today\'s revenue by hour' 
                  : period === 'weekly' 
                    ? 'This week\'s revenue by day' 
                    : period === 'monthly' 
                      ? 'This month\'s revenue by week' 
                      : 'This year\'s revenue by month'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse ml-auto"></div>
                    </div>
                  ))}
                </div>
              ) : (
                renderBarChart(revenueData?.dailyData || [])
              )}
            </CardContent>
          </Card>
          
          {/* Top Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Menu Items</CardTitle>
              <CardDescription>
                Best-selling items by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : revenueData?.topItems && revenueData.topItems.length > 0 ? (
                  <div className="space-y-4">
                    {revenueData.topItems.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <div className="text-sm text-gray-500">{item.count} orders</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrencyDisplay(item.revenue)}</div>
                            <div className="text-sm text-gray-500">
                              {formatPercentage((item.revenue / totalRevenue) * 100)}
                            </div>
                          </div>
                        </div>
                        <Progress value={(item.revenue / totalRevenue) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun article vendu pour cette période
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Revenue breakdown by menu category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        <div className="text-right space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : revenueData?.categories && revenueData.categories.length > 0 ? (
                <div className="space-y-4">
                  {revenueData.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{category.name}</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrencyDisplay(category.revenue)}</div>
                          <div className="text-sm text-gray-500">{formatPercentage(category.percentage)}</div>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune donnée de catégorie disponible
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Revenue breakdown by payment type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="text-right space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : revenueData?.paymentMethods && revenueData.paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {revenueData.paymentMethods.map((method, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{method.method}</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrencyDisplay(method.amount)}</div>
                          <div className="text-sm text-gray-500">
                            {method.count} orders ({formatPercentage(method.percentage)})
                          </div>
                        </div>
                      </div>
                      <Progress value={method.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune donnée de méthode de paiement disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerRevenue; 