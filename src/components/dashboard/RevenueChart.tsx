import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';
import { usePartnerRevenueData } from '@/hooks/use-partner-revenue';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
  period: 'daily' | 'weekly' | 'monthly';
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly') => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ period, onPeriodChange }) => {
  const { data: revenueData, isLoading, error } = usePartnerRevenueData(period);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (period) {
      case 'daily':
        return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      case 'weekly':
        const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
        return `Sem. ${weekNumber}`;
      case 'monthly':
        return date.toLocaleDateString('fr-FR', { month: 'short' });
      default:
        return dateString;
    }
  };

  const getMaxRevenue = () => {
    if (!revenueData || revenueData.length === 0) return 1;
    return Math.max(...revenueData.map(d => d.revenue));
  };

  const getTotalRevenue = () => {
    if (!revenueData) return 0;
    return revenueData.reduce((sum, d) => sum + d.revenue, 0);
  };

  const getTotalOrders = () => {
    if (!revenueData) return 0;
    return revenueData.reduce((sum, d) => sum + d.orders, 0);
  };

  const getGrowthPercentage = () => {
    if (!revenueData || revenueData.length < 2) return 0;
    const current = revenueData[revenueData.length - 1]?.revenue || 0;
    const previous = revenueData[revenueData.length - 2]?.revenue || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Graphique des Revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Erreur de chargement</h3>
            <p className="text-sm">Impossible de charger les données de revenus</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = getMaxRevenue();
  const totalRevenue = getTotalRevenue();
  const totalOrders = getTotalOrders();
  const growthPercentage = getGrowthPercentage();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Évolution des Revenus
          </CardTitle>
          <div className="flex items-center gap-2">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange?.(p as any)}
              >
                {p === 'daily' && 'Jour'}
                {p === 'weekly' && 'Semaine'}
                {p === 'monthly' && 'Mois'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Résumé des statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-sm text-green-700">Revenus totaux</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalOrders}
            </div>
            <p className="text-sm text-blue-700">Commandes totales</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}%
            </div>
            <p className="text-sm text-yellow-700">Croissance</p>
          </div>
        </div>

        {/* Graphique en barres */}
        {revenueData && revenueData.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Revenus</span>
              <span>Commandes</span>
            </div>
            
            <div className="space-y-3">
              {revenueData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{formatDate(item.date)}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{item.orders} commandes</span>
                      <span className="font-semibold">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(item.revenue / maxRevenue) * 100}%`,
                        minWidth: '4px'
                      }}
                    />
                  </div>
                  
                  {/* Indicateur de tendance */}
                  {index > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      {item.revenue > revenueData[index - 1].revenue ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : item.revenue < revenueData[index - 1].revenue ? (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      ) : (
                        <div className="h-3 w-3 text-gray-400">—</div>
                      )}
                      <span className="text-gray-500">
                        {item.revenue > revenueData[index - 1].revenue ? 'Hausse' :
                         item.revenue < revenueData[index - 1].revenue ? 'Baisse' :
                         'Stable'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune donnée</h3>
            <p className="text-muted-foreground">
              Aucune donnée de revenus disponible pour cette période
            </p>
          </div>
        )}

        {/* Légende */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Revenus</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Période: {period}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart; 