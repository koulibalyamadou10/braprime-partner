import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BillingStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
  ordersPerWeek: number;
  weeklyData: Array<{
    week: number;
    orders: number;
    revenue: number;
  }>;
  topMenuItems: Array<{
    name: string;
    orders: number;
    revenue: number;
    percentage: number;
  }>;
}

export interface BillingInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  due_date: string;
  paid_date?: string;
  created_at: string;
  subscription_id?: string;
  order_id?: string;
}

export interface BillingPayment {
  id: string;
  amount: number;
  method: string;
  status: string;
  transaction_id?: string;
  payment_date?: string;
  created_at: string;
  order_id?: string;
  subscription_id?: string;
}

export class BillingService {
  // Récupérer les statistiques de facturation pour un business (OPTIMISÉ avec RPC)
  static async getBillingStats(businessId: number, period: 'week' | 'month' | 'year' = 'month'): Promise<BillingStats | null> {
    try {
      console.log('🚀 [getBillingStats] Utilisation de la fonction RPC pour businessId:', businessId);

      // Essayer d'utiliser la fonction RPC optimisée
      const { data, error } = await supabase.rpc('get_billing_stats', {
        p_business_id: businessId,
        p_period: period
      });

      if (error) {
        console.warn('⚠️ [getBillingStats] Erreur RPC, utilisation du fallback:', error);
        return await this.getBillingStatsFallback(businessId, period);
      }

      console.log('✅ [getBillingStats] Statistiques récupérées via RPC');
      return data as BillingStats;
    } catch (error) {
      console.error('❌ [getBillingStats] Exception:', error);
      return await this.getBillingStatsFallback(businessId, period);
    }
  }

  // Fallback pour getBillingStats (ancienne méthode)
  private static async getBillingStatsFallback(businessId: number, period: 'week' | 'month' | 'year' = 'month'): Promise<BillingStats | null> {
    try {
      // Récupérer les commandes du business
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, grand_total, created_at, status')
        .eq('business_id', businessId)
        .eq('status', 'delivered')
        .gte('created_at', this.getDateRange(period));

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        return {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrder: 0,
          ordersPerWeek: 0,
          weeklyData: [],
          topMenuItems: []
        };
      }

      // Calculer les statistiques de base
      const totalRevenue = orders.reduce((sum, order) => sum + (order.grand_total || 0), 0);
      const totalOrders = orders.length;
      const averageOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      // Calculer les données hebdomadaires
      const weeklyData = this.calculateWeeklyData(orders, period);

      // Récupérer les articles de menu les plus vendus
      const topMenuItems = await this.getTopMenuItems(businessId, period);

      return {
        totalRevenue,
        totalOrders,
        averageOrder,
        ordersPerWeek: Math.round(totalOrders / this.getWeeksInPeriod(period)),
        weeklyData,
        topMenuItems
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de facturation:', error);
      return null;
    }
  }

  // Récupérer les factures d'un business
  static async getBusinessInvoices(businessId: number): Promise<BillingInvoice[]> {
    try {
      // Récupérer les factures liées aux commandes du business
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, grand_total, created_at')
        .eq('business_id', businessId);

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) return [];

      // Créer des factures simulées basées sur les commandes
      const invoices: BillingInvoice[] = orders.map((order, index) => ({
        id: `invoice-${order.id}`,
        invoice_number: `INV-${String(index + 1).padStart(6, '0')}`,
        amount: order.grand_total || 0,
        tax_amount: Math.round((order.grand_total || 0) * 0.18), // 18% de TVA
        total_amount: Math.round((order.grand_total || 0) * 1.18),
        status: 'completed' as const,
        due_date: new Date(order.created_at).toISOString(),
        paid_date: new Date(order.created_at).toISOString(),
        created_at: order.created_at,
        order_id: order.id
      }));

      return invoices;
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      return [];
    }
  }

  // Récupérer les paiements d'un business
  static async getBusinessPayments(businessId: number): Promise<BillingPayment[]> {
    try {
      // Récupérer les paiements liés aux commandes du business
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, method, status, transaction_id, created_at, order_id')
        .in('order_id', 
          supabase
            .from('orders')
            .select('id')
            .eq('business_id', businessId)
        );

      if (paymentsError) throw paymentsError;

      if (!payments) return [];

      return payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transaction_id: payment.transaction_id,
        payment_date: payment.created_at,
        created_at: payment.created_at,
        order_id: payment.order_id
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      return [];
    }
  }

  // Récupérer les articles de menu les plus vendus
  private static async getTopMenuItems(businessId: number, period: 'week' | 'month' | 'year'): Promise<Array<{
    name: string;
    orders: number;
    revenue: number;
    percentage: number;
  }>> {
    try {
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          name,
          price,
          quantity,
          order_id,
          orders!inner(business_id, created_at, status)
        `)
        .eq('orders.business_id', businessId)
        .eq('orders.status', 'delivered')
        .gte('orders.created_at', this.getDateRange(period));

      if (error) throw error;

      if (!orderItems || orderItems.length === 0) return [];

      // Grouper par nom d'article et calculer les statistiques
      const itemStats = new Map<string, { orders: number; revenue: number; count: number }>();

      orderItems.forEach(item => {
        const name = item.name;
        const revenue = (item.price || 0) * (item.quantity || 1);
        
        if (itemStats.has(name)) {
          const existing = itemStats.get(name)!;
          existing.orders += 1;
          existing.revenue += revenue;
          existing.count += item.quantity || 1;
        } else {
          itemStats.set(name, { orders: 1, revenue, count: item.quantity || 1 });
        }
      });

      // Convertir en tableau et calculer les pourcentages
      const totalRevenue = Array.from(itemStats.values()).reduce((sum, item) => sum + item.revenue, 0);
      
      return Array.from(itemStats.entries())
        .map(([name, stats]) => ({
          name,
          orders: stats.count,
          revenue: stats.revenue,
          percentage: totalRevenue > 0 ? Math.round((stats.revenue / totalRevenue) * 100) : 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5); // Top 5
    } catch (error) {
      console.error('Erreur lors de la récupération des articles populaires:', error);
      return [];
    }
  }

  // Calculer les données hebdomadaires
  private static calculateWeeklyData(orders: any[], period: 'week' | 'month' | 'year'): Array<{
    week: number;
    orders: number;
    revenue: number;
  }> {
    const weeks = this.getWeeksInPeriod(period);
    const weeklyData = [];

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weeks - i - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= weekStart && orderDate <= weekEnd;
      });

      const weekRevenue = weekOrders.reduce((sum, order) => sum + (order.grand_total || 0), 0);

      weeklyData.push({
        week: i + 1,
        orders: weekOrders.length,
        revenue: weekRevenue
      });
    }

    return weeklyData;
  }

  // Obtenir la plage de dates pour une période donnée
  private static getDateRange(period: 'week' | 'month' | 'year'): string {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return startDate.toISOString();
  }

  // Obtenir le nombre de semaines dans une période
  private static getWeeksInPeriod(period: 'week' | 'month' | 'year'): number {
    switch (period) {
      case 'week': return 1;
      case 'month': return 4;
      case 'year': return 52;
      default: return 4;
    }
  }
}
