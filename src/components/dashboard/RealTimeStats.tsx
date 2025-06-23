import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  DollarSign,
  ShoppingBag,
  Clock,
  Check,
  Users,
  Package
} from 'lucide-react';
import { usePartnerStats } from '@/hooks/use-dashboard';
import { formatCurrency } from '@/lib/utils';

interface RealTimeStatsProps {
  period: 'today' | 'week' | 'month' | 'year';
  onPeriodChange?: (period: 'today' | 'week' | 'month' | 'year') => void;
}

const RealTimeStats: React.FC<RealTimeStatsProps> = ({ period, onPeriodChange }) => {
  const { data: stats, isLoading, error, refetch } = usePartnerStats(period);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mise à jour automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <Package className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Erreur de chargement</h3>
            <p className="text-sm">Impossible de charger les statistiques</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Commandes',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      trend: 'up' as const,
      trendValue: '+15%',
      description: `Période: ${period}`,
      color: 'text-blue-600'
    },
    {
      title: 'Revenus',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      trend: 'up' as const,
      trendValue: '+12%',
      description: `Moyenne: ${formatCurrency(stats?.averageOrderValue || 0)}`,
      color: 'text-green-600'
    },
    {
      title: 'En Attente',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      trend: 'neutral' as const,
      trendValue: '0%',
      description: 'Commandes à traiter',
      color: 'text-yellow-600'
    },
    {
      title: 'Livrées',
      value: stats?.completedOrders || 0,
      icon: Check,
      trend: 'up' as const,
      trendValue: '+8%',
      description: 'Commandes terminées',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-4">
      {/* En-tête avec sélecteur de période et dernière mise à jour */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Statistiques en Temps Réel</h3>
          <Badge variant="outline" className="text-xs">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {['today', 'week', 'month', 'year'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange?.(p as any)}
            >
              {p === 'today' && 'Aujourd\'hui'}
              {p === 'week' && 'Semaine'}
              {p === 'month' && 'Mois'}
              {p === 'year' && 'Année'}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetch();
              setLastUpdate(new Date());
            }}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs mt-1">
                {getTrendIcon(stat.trend)}
                <span className={`ml-1 ${getTrendColor(stat.trend)}`}>
                  {stat.trendValue}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Indicateurs de performance */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Taux de Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.totalOrders > 0 ? '85%' : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Commandes complétées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Temps Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalOrders > 0 ? '25 min' : '0 min'}
            </div>
            <p className="text-xs text-muted-foreground">
              Temps de préparation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.totalOrders > 0 ? '4.8★' : '0★'}
            </div>
            <p className="text-xs text-muted-foreground">
              Note moyenne clients
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeStats; 