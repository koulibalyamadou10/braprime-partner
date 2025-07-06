import { useState } from 'react';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
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

const PartnerRevenue = () => {
  const { currentUser } = useAuth();
  
  // State for time period selection
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [compareEnabled, setCompareEnabled] = useState(false);
  
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

  // Calculer les statistiques globales
  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const averageOrderValue = stats?.averageOrderValue || 0;
  const periodRevenue = stats?.periodRevenue || 0;
  const periodOrders = stats?.periodOrders || 0;

  return (
    <DashboardLayout navItems={partnerNavItems} title="Analyses des Revenus">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analyses des Revenus</h2>
            <p className="text-gray-500">Suivez vos performances financières en temps réel.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner la période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Aujourd'hui</SelectItem>
                <SelectItem value="weekly">Cette Semaine</SelectItem>
                <SelectItem value="monthly">Ce Mois</SelectItem>
                <SelectItem value="yearly">Cette Année</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isLoading ? 'Chargement...' : 'Actualiser'}
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Exporter
            </Button>
          </div>
        </div>
        
        {/* Statistiques en temps réel */}
        <RealTimeStats 
          period={period === 'yearly' ? 'year' : period === 'monthly' ? 'month' : period === 'weekly' ? 'week' : 'today'}
          onPeriodChange={(newPeriod) => {
            const periodMap = {
              'today': 'daily',
              'week': 'weekly', 
              'month': 'monthly',
              'year': 'yearly'
            } as const;
            setPeriod(periodMap[newPeriod]);
          }}
        />

        {/* Affichage des erreurs */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-sm font-medium">Erreur de chargement des données:</span>
                <span className="text-sm">{error.message}</span>
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
        
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Évolution des Revenus</TabsTrigger>
            <TabsTrigger value="top-items">Articles Populaires</TabsTrigger>
            <TabsTrigger value="analytics">Analyses Détaillées</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Chargement des données de revenus...</span>
                </CardContent>
              </Card>
            ) : (
              <RevenueChart 
                period={period === 'yearly' ? 'monthly' : period}
                onPeriodChange={(newPeriod) => {
                  const periodMap = {
                    'daily': 'daily',
                    'weekly': 'weekly',
                    'monthly': 'monthly'
                  } as const;
                  setPeriod(periodMap[newPeriod]);
                }}
              />
            )}
          </TabsContent>
          
          <TabsContent value="top-items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Articles les Plus Populaires</CardTitle>
                <CardDescription>
                  Vos articles les plus commandés et leurs performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : topItems && topItems.length > 0 ? (
                  <div className="space-y-4">
                    {topItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{item.name}</h4>
                            <span className="text-sm text-gray-500">
                              {item.percentage.toFixed(1)}% des commandes
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{item.count} commandes</span>
                            <span>•</span>
                            <span>{formatCurrencyDisplay(item.revenue)}</span>
                          </div>
                          <Progress value={item.percentage} className="mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun article populaire</h3>
                    <p className="text-muted-foreground">
                      Les articles populaires apparaîtront ici une fois que vous aurez des commandes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Analyse des tendances */}
              <Card>
                <CardHeader>
                  <CardTitle>Analyse des Tendances</CardTitle>
                  <CardDescription>
                    Évolution de vos performances sur différentes périodes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-700">Revenus de la période</p>
                        <p className="text-xs text-green-600">Revenus générés cette période</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-700">{formatCurrencyDisplay(periodRevenue)}</p>
                        <TrendingUp className="h-4 w-4 text-green-600 ml-auto" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Commandes de la période</p>
                        <p className="text-xs text-blue-600">Nombre de commandes cette période</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-700">{periodOrders}</p>
                        <ArrowUpRight className="h-4 w-4 text-blue-600 ml-auto" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-yellow-700">Valeur moyenne</p>
                        <p className="text-xs text-yellow-600">Par commande</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-700">{formatCurrencyDisplay(averageOrderValue)}</p>
                        <DollarSign className="h-4 w-4 text-yellow-600 ml-auto" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Métriques de performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Métriques de Performance</CardTitle>
                  <CardDescription>
                    Indicateurs clés de performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                        <p className="text-xs text-gray-600">Total Commandes</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrencyDisplay(totalRevenue)}</p>
                        <p className="text-xs text-gray-600">Revenus Totaux</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taux de conversion</span>
                        <span className="font-semibold">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Satisfaction client</span>
                        <span className="font-semibold">4.8★</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Temps de préparation</span>
                        <span className="font-semibold">25 min</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PartnerRevenue; 