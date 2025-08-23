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

// Revenue data types
type RevenueStats = {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
  growth: number;
  topItems: {
    name: string;
    count: number;
    revenue: number;
  }[];
  dailyData: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  categories: {
    name: string;
    revenue: number;
    percentage: number;
  }[];
  paymentMethods: {
    method: string;
    count: number;
    amount: number;
  }[];
};

// Mock revenue data
const mockRevenueData: Record<'daily' | 'weekly' | 'monthly' | 'yearly', RevenueStats> = {
  daily: {
    totalRevenue: 245000,
    totalOrders: 35,
    averageOrder: 7000,
    growth: 12.5,
    topItems: [
      { name: 'Chicken Yassa', count: 15, revenue: 90000 },
      { name: 'Thieboudienne', count: 12, revenue: 66000 },
      { name: 'Mafe', count: 8, revenue: 40000 },
      { name: 'Bissap Juice', count: 18, revenue: 27000 },
      { name: 'Attieke with Fish', count: 4, revenue: 26000 }
    ],
    dailyData: [
      { date: '08:00', revenue: 21000, orders: 3 },
      { date: '10:00', revenue: 35000, orders: 5 },
      { date: '12:00', revenue: 70000, orders: 10 },
      { date: '14:00', revenue: 42000, orders: 6 },
      { date: '16:00', revenue: 28000, orders: 4 },
      { date: '18:00', revenue: 49000, orders: 7 }
    ],
    categories: [
      { name: 'Main Dishes', revenue: 180000, percentage: 73.5 },
      { name: 'Beverages', revenue: 35000, percentage: 14.3 },
      { name: 'Appetizers', revenue: 15000, percentage: 6.1 },
      { name: 'Desserts', revenue: 10000, percentage: 4.1 },
      { name: 'Sides', revenue: 5000, percentage: 2 }
    ],
    paymentMethods: [
      { method: 'Mobile Money', count: 18, amount: 126000 },
      { method: 'Cash', count: 10, amount: 70000 },
      { method: 'Credit Card', count: 7, amount: 49000 }
    ]
  },
  weekly: {
    totalRevenue: 1650000,
    totalOrders: 236,
    averageOrder: 6992,
    growth: 8.2,
    topItems: [
      { name: 'Chicken Yassa', count: 76, revenue: 456000 },
      { name: 'Thieboudienne', count: 68, revenue: 374000 },
      { name: 'Mafe', count: 42, revenue: 210000 },
      { name: 'Attieke with Fish', count: 28, revenue: 182000 },
      { name: 'Bissap Juice', count: 112, revenue: 168000 }
    ],
    dailyData: [
      { date: 'Mon', revenue: 220000, orders: 31 },
      { date: 'Tue', revenue: 185000, orders: 26 },
      { date: 'Wed', revenue: 200000, orders: 29 },
      { date: 'Thu', revenue: 245000, orders: 35 },
      { date: 'Fri', revenue: 310000, orders: 44 },
      { date: 'Sat', revenue: 350000, orders: 50 },
      { date: 'Sun', revenue: 140000, orders: 21 }
    ],
    categories: [
      { name: 'Main Dishes', revenue: 1200000, percentage: 72.7 },
      { name: 'Beverages', revenue: 220000, percentage: 13.3 },
      { name: 'Appetizers', revenue: 105000, percentage: 6.4 },
      { name: 'Desserts', revenue: 75000, percentage: 4.5 },
      { name: 'Sides', revenue: 50000, percentage: 3.1 }
    ],
    paymentMethods: [
      { method: 'Mobile Money', count: 118, amount: 825000 },
      { method: 'Cash', count: 71, amount: 495000 },
      { method: 'Credit Card', count: 47, amount: 330000 }
    ]
  },
  monthly: {
    totalRevenue: 7200000,
    totalOrders: 1015,
    averageOrder: 7094,
    growth: 15.3,
    topItems: [
      { name: 'Chicken Yassa', count: 312, revenue: 1872000 },
      { name: 'Thieboudienne', count: 275, revenue: 1512500 },
      { name: 'Mafe', count: 180, revenue: 900000 },
      { name: 'Attieke with Fish', count: 126, revenue: 819000 },
      { name: 'Dibi Lamb', count: 98, revenue: 686000 }
    ],
    dailyData: [
      { date: 'Week 1', revenue: 1500000, orders: 210 },
      { date: 'Week 2', revenue: 1650000, orders: 236 },
      { date: 'Week 3', revenue: 1800000, orders: 254 },
      { date: 'Week 4', revenue: 2250000, orders: 315 }
    ],
    categories: [
      { name: 'Main Dishes', revenue: 5256000, percentage: 73 },
      { name: 'Beverages', revenue: 960000, percentage: 13.3 },
      { name: 'Appetizers', revenue: 456000, percentage: 6.3 },
      { name: 'Desserts', revenue: 312000, percentage: 4.3 },
      { name: 'Sides', revenue: 216000, percentage: 3 }
    ],
    paymentMethods: [
      { method: 'Mobile Money', count: 518, amount: 3672000 },
      { method: 'Cash', count: 304, amount: 2160000 },
      { method: 'Credit Card', count: 193, amount: 1368000 }
    ]
  },
  yearly: {
    totalRevenue: 83520000,
    totalOrders: 11872,
    averageOrder: 7037,
    growth: 22.5,
    topItems: [
      { name: 'Chicken Yassa', count: 3605, revenue: 21630000 },
      { name: 'Thieboudienne', count: 3256, revenue: 17908000 },
      { name: 'Mafe', count: 2148, revenue: 10740000 },
      { name: 'Attieke with Fish', count: 1520, revenue: 9880000 },
      { name: 'Dibi Lamb', count: 1205, revenue: 8435000 }
    ],
    dailyData: [
      { date: 'Jan', revenue: 6200000, orders: 870 },
      { date: 'Feb', revenue: 5800000, orders: 810 },
      { date: 'Mar', revenue: 6500000, orders: 910 },
      { date: 'Apr', revenue: 6800000, orders: 950 },
      { date: 'May', revenue: 7100000, orders: 990 },
      { date: 'Jun', revenue: 7200000, orders: 1015 },
      { date: 'Jul', revenue: 7500000, orders: 1050 },
      { date: 'Aug', revenue: 7600000, orders: 1070 },
      { date: 'Sep', revenue: 7400000, orders: 1030 },
      { date: 'Oct', revenue: 7200000, orders: 1020 },
      { date: 'Nov', revenue: 7000000, orders: 980 },
      { date: 'Dec', revenue: 7220000, orders: 1010 }
    ],
    categories: [
      { name: 'Main Dishes', revenue: 60970000, percentage: 73 },
      { name: 'Beverages', revenue: 11190000, percentage: 13.4 },
      { name: 'Appetizers', revenue: 5260000, percentage: 6.3 },
      { name: 'Desserts', revenue: 3590000, percentage: 4.3 },
      { name: 'Sides', revenue: 2510000, percentage: 3 }
    ],
    paymentMethods: [
      { method: 'Mobile Money', count: 6032, amount: 42460000 },
      { method: 'Cash', count: 3560, amount: 25060000 },
      { method: 'Credit Card', count: 2280, amount: 16000000 }
    ]
  }
};

// Helper function for percentage
const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

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

  // Get current stats based on selected period
  const currentStats = mockRevenueData[period];

  // Optional: Replace with actual chart component if available
  const renderBarChart = (data: { date: string; revenue: number; orders: number }[]) => {
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
                {formatCurrency(item.revenue)}
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
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                {currentStats.growth > 0 ? (
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>+{currentStats.growth}%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    <span>{currentStats.growth}%</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(currentStats.totalRevenue)}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{currentStats.totalOrders}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(currentStats.averageOrder)}</h3>
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
                  {(currentStats.totalOrders / currentStats.dailyData.length).toFixed(1)}
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
              {renderBarChart(currentStats.dailyData)}
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
                <div className="space-y-4">
                  {currentStats.topItems.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <div className="text-sm text-gray-500">{item.count} orders</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.revenue)}</div>
                          <div className="text-sm text-gray-500">
                            {formatPercentage((item.revenue / currentStats.totalRevenue) * 100)}
                          </div>
                        </div>
                      </div>
                      <Progress value={(item.revenue / currentStats.totalRevenue) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
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
              <div className="space-y-4">
                {currentStats.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{category.name}</span>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(category.revenue)}</div>
                        <div className="text-sm text-gray-500">{formatPercentage(category.percentage)}</div>
                      </div>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                {currentStats.paymentMethods.map((method, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{method.method}</span>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(method.amount)}</div>
                        <div className="text-sm text-gray-500">
                          {method.count} orders ({formatPercentage((method.amount / currentStats.totalRevenue) * 100)})
                        </div>
                      </div>
                    </div>
                    <Progress value={(method.amount / currentStats.totalRevenue) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerRevenue; 