import { supabase } from "../supabase";

// Types pour les données de revenus

export interface RevenueStats {
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
    percentage: number;
  }[];
}

export interface OrderRevenue {
  id: string;
  total: number;
  grand_total: number;
  delivery_fee: number;
  service_fee: number;
  status: string;
  created_at: string;
  customer_name: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface MenuItemRevenue {
  id: number;
  name: string;
  price: number;
  category_name: string;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
}

export interface CategoryRevenue {
  id: number;
  name: string;
  total_revenue: number;
  total_orders: number;
  percentage: number;
}

export interface PaymentMethodRevenue {
  method: string;
  total_count: number;
  total_amount: number;
  percentage: number;
}

class KBilling {
  /**
   * Récupère les statistiques de revenus pour une période donnée
   */
  async getRevenueStats(
    businessId: number, 
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Promise<RevenueStats> {
    try {
      // Calculer les dates de début et fin selon la période
      const { start, end } = this.calculateDateRange(period, startDate, endDate);
      
      // Récupérer les commandes pour la période
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          grand_total,
          delivery_fee,
          service_fee,
          status,
          created_at,
          payment_method,
          user_id
        `)
        .eq('business_id', businessId)
        .eq('status', 'delivered')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      console.log('🔍 Debug - Orders found:', orders?.length || 0);
      console.log('🔍 Debug - Business ID:', businessId);
      console.log('🔍 Debug - Date range:', { start, end });

      // Récupérer les données de la période précédente pour calculer la croissance
      const { start: prevStart, end: prevEnd } = this.calculateDateRange(period, start, end, true);
      
      const { data: prevOrders, error: prevOrdersError } = await supabase
        .from('orders')
        .select('grand_total')
        .eq('business_id', businessId)
        .gte('created_at', prevStart)
        .lte('created_at', prevEnd)
        .eq('status', 'delivered');

      if (prevOrdersError) throw prevOrdersError;

      // Calculer les statistiques de base
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Calculer la croissance par rapport à la période précédente
      const prevRevenue = prevOrders?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0;
      const growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      // Récupérer les articles les plus vendus
      const topItems = await this.getTopMenuItems(businessId, start, end);
      
      // Calculer les données par période
      const dailyData = this.calculateRevenueByPeriod(orders || [], period);
      
      // Récupérer les revenus par catégorie
      const categories = await this.getRevenueByCategory(businessId, start, end);
      
      // Calculer les revenus par méthode de paiement
      const paymentMethods = this.calculatePaymentMethodsFromOrders(orders || []);

      return {
        totalRevenue,
        totalOrders,
        averageOrder: Math.round(averageOrder),
        growth: Math.round(growth * 100) / 100,
        topItems,
        dailyData,
        categories,
        paymentMethods
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de revenus:', error);
      throw error;
    }
  }

  /**
   * Calcule les articles les plus vendus à partir des données des commandes
   */
  private calculateTopItemsFromOrders(orders: any[]): { name: string; count: number; revenue: number }[] {
    const itemStats = new Map<string, { count: number; revenue: number }>();
    
    orders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach((item: any) => {
          const name = item.name;
          const revenue = (item.price || 0) * (item.quantity || 1);
          
          if (itemStats.has(name)) {
            const existing = itemStats.get(name)!;
            existing.count += item.quantity || 1;
            existing.revenue += revenue;
          } else {
            itemStats.set(name, { count: item.quantity || 1, revenue });
          }
        });
      }
    });
    
    return Array.from(itemStats.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  /**
   * Calcule les revenus par période à partir des données des commandes
   */
  private calculateRevenueByPeriod(orders: any[], period: 'daily' | 'weekly' | 'monthly' | 'yearly'): { date: string; revenue: number; orders: number }[] {
    const periodData = new Map<string, { revenue: number; orders: number }>();
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      let periodKey: string;
      
      switch (period) {
        case 'daily':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          periodKey = date.getFullYear().toString();
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }
      
      if (periodData.has(periodKey)) {
        const existing = periodData.get(periodKey)!;
        existing.revenue += order.grand_total || 0;
        existing.orders += 1;
      } else {
        periodData.set(periodKey, { revenue: order.grand_total || 0, orders: 1 });
      }
    });
    
    return Array.from(periodData.entries())
      .map(([date, stats]) => ({
        date,
        revenue: stats.revenue,
        orders: stats.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calcule les revenus par méthode de paiement à partir des données des commandes
   */
  private calculatePaymentMethodsFromOrders(orders: any[]): { method: string; count: number; amount: number; percentage: number }[] {
    const methodStats = new Map<string, { count: number; amount: number }>();
    let totalAmount = 0;
    
    orders.forEach(order => {
      const method = order.payment_method || 'unknown';
      const amount = order.grand_total || 0;
      totalAmount += amount;
      
      if (methodStats.has(method)) {
        const existing = methodStats.get(method)!;
        existing.count += 1;
        existing.amount += amount;
      } else {
        methodStats.set(method, { count: 1, amount });
      }
    });
    
    return Array.from(methodStats.entries())
      .map(([method, stats]) => ({
        method,
        count: stats.count,
        amount: stats.amount,
        percentage: totalAmount > 0 ? Math.round((stats.amount / totalAmount) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Récupère les articles de menu les plus vendus
   */
  async getTopMenuItems(
    businessId: number, 
    startDate: string, 
    endDate: string,
    limit: number = 10
  ): Promise<{ name: string; count: number; revenue: number }[]> {
    try {
      // D'abord récupérer les IDs des commandes du business
      const { data: orderIds, error: orderIdsError } = await supabase
        .from('orders')
        .select('id')
        .eq('business_id', businessId)
        .eq('status', 'delivered')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (orderIdsError) throw orderIdsError;

      if (!orderIds || orderIds.length === 0) {
        return [];
      }

      const orderIdList = orderIds.map(order => order.id);

      // Ensuite récupérer les articles de ces commandes
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          name,
          price,
          quantity
        `)
        .in('order_id', orderIdList);

      if (error) throw error;

      // Grouper par nom d'article
      const itemMap = new Map<string, { count: number; revenue: number }>();
      
      data?.forEach(item => {
        const existing = itemMap.get(item.name);
        if (existing) {
          existing.count += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          itemMap.set(item.name, {
            count: item.quantity,
            revenue: item.price * item.quantity
          });
        }
      });

      // Trier par revenus et limiter
      return Array.from(itemMap.entries())
        .map(([name, stats]) => ({
          name,
          count: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des articles populaires:', error);
      return [];
    }
  }

  /**
   * Récupère les revenus par période (jour/semaine/mois)
   */
  async getRevenueByPeriod(
    businessId: number,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: string,
    endDate: string
  ): Promise<{ date: string; revenue: number; orders: number }[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('grand_total, created_at, status')
        .eq('business_id', businessId)
        .eq('status', 'delivered')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Grouper par période selon le type demandé
      const periodMap = new Map<string, { revenue: number; orders: number }>();
      
      data?.forEach(order => {
        let periodKey: string;
        const date = new Date(order.created_at);
        
        switch (period) {
          case 'daily':
            periodKey = date.toLocaleDateString('fr-FR', { 
              month: 'short', 
              day: 'numeric' 
            });
            break;
          case 'weekly':
            periodKey = date.toLocaleDateString('fr-FR', { 
              weekday: 'short' 
            });
            break;
          case 'monthly':
            const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
            periodKey = `Semaine ${weekNumber}`;
            break;
          case 'yearly':
            periodKey = date.toLocaleDateString('fr-FR', { 
              month: 'short' 
            });
            break;
          default:
            periodKey = date.toLocaleDateString();
        }

        const existing = periodMap.get(periodKey);
        if (existing) {
          existing.revenue += order.grand_total || 0;
          existing.orders += 1;
        } else {
          periodMap.set(periodKey, {
            revenue: order.grand_total || 0,
            orders: 1
          });
        }
      });

      return Array.from(periodMap.entries())
        .map(([date, stats]) => ({
          date,
          revenue: stats.revenue,
          orders: stats.orders
        }))
        .sort((a, b) => {
          // Trier par ordre chronologique
          if (period === 'daily') {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
          return 0;
        });
    } catch (error) {
      console.error('Erreur lors de la récupération des revenus par période:', error);
      return [];
    }
  }

  /**
   * Récupère les revenus par catégorie de menu
   */
  async getRevenueByCategory(
    businessId: number,
    startDate: string,
    endDate: string
  ): Promise<{ name: string; revenue: number; percentage: number }[]> {
    try {
      // Récupérer d'abord les commandes avec leurs articles
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          grand_total,
          order_items (
            price,
            quantity,
            menu_item_id
          )
        `)
        .eq('business_id', businessId)
        .eq('status', 'delivered')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (ordersError) throw ordersError;

      // Récupérer les informations des articles de menu avec leurs catégories
      const menuItemIds = orders?.flatMap(order => 
        order.order_items?.map(item => item.menu_item_id).filter(Boolean) || []
      ) || [];

      if (menuItemIds.length === 0) {
        return [];
      }

      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select(`
          id,
          category_id
        `)
        .in('id', menuItemIds);

      if (menuError) throw menuError;

      // Récupérer les noms des catégories
      const categoryIds = menuItems?.map(item => item.category_id).filter(Boolean) || [];
      
      let categoryNames: Record<number, string> = {};
      if (categoryIds.length > 0) {
        const { data: categories, error: catError } = await supabase
          .from('menu_categories')
          .select('id, name')
          .in('id', categoryIds);
        
        if (!catError && categories) {
          categoryNames = categories.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
          }, {} as Record<number, string>);
        }
      }

      // Créer un map des articles vers leurs catégories
      const itemCategoryMap = new Map<number, string>();
      menuItems?.forEach(item => {
        itemCategoryMap.set(item.id, categoryNames[item.category_id] || 'Sans catégorie');
      });

      // Grouper par catégorie
      const categoryMap = new Map<string, number>();
      let totalRevenue = 0;
      
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          const categoryName = itemCategoryMap.get(item.menu_item_id) || 'Sans catégorie';
          const itemRevenue = item.price * item.quantity;
          
          const existing = categoryMap.get(categoryName);
          if (existing) {
            categoryMap.set(categoryName, existing + itemRevenue);
          } else {
            categoryMap.set(categoryName, itemRevenue);
          }
          
          totalRevenue += itemRevenue;
        });
      });

      // Calculer les pourcentages et trier
      return Array.from(categoryMap.entries())
        .map(([name, revenue]) => ({
          name,
          revenue,
          percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error('Erreur lors de la récupération des revenus par catégorie:', error);
      return [];
    }
  }

  /**
   * Récupère les revenus par méthode de paiement
   */
  async getRevenueByPaymentMethod(
    businessId: number,
    startDate: string,
    endDate: string
  ): Promise<{ method: string; count: number; amount: number; percentage: number }[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('grand_total, payment_method, status')
        .eq('business_id', businessId)
        .eq('status', 'delivered')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      // Grouper par méthode de paiement
      const methodMap = new Map<string, { count: number; amount: number }>();
      let totalRevenue = 0;
      
      data?.forEach(order => {
        const method = order.payment_method || 'Non spécifié';
        const amount = order.grand_total || 0;
        
        const existing = methodMap.get(method);
        if (existing) {
          existing.count += 1;
          existing.amount += amount;
        } else {
          methodMap.set(method, { count: 1, amount });
        }
        
        totalRevenue += amount;
      });

      // Calculer les pourcentages et trier
      return Array.from(methodMap.entries())
        .map(([method, stats]) => ({
          method,
          count: stats.count,
          amount: stats.amount,
          percentage: totalRevenue > 0 ? (stats.amount / totalRevenue) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);
    } catch (error) {
      console.error('Erreur lors de la récupération des revenus par méthode de paiement:', error);
      return [];
    }
  }

  /**
   * Récupère l'historique des revenus pour les graphiques
   */
  async getRevenueHistory(
    businessId: number,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    days: number = 30
  ): Promise<{ date: string; revenue: number; orders: number }[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('orders')
        .select('grand_total, created_at, status')
        .eq('business_id', businessId)
        .eq('status', 'delivered')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Créer un tableau de dates pour la période
      const dateArray: { date: string; revenue: number; orders: number }[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        let dateKey: string;
        
        switch (period) {
          case 'daily':
            dateKey = currentDate.toLocaleDateString('fr-FR', { 
              month: 'short', 
              day: 'numeric' 
            });
            break;
          case 'weekly':
            dateKey = currentDate.toLocaleDateString('fr-FR', { 
              weekday: 'short' 
            });
            break;
          case 'monthly':
            const weekNumber = Math.ceil((currentDate.getDate() + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7);
            dateKey = `Semaine ${weekNumber}`;
            break;
          case 'yearly':
            dateKey = currentDate.toLocaleDateString('fr-FR', { 
              month: 'short' 
            });
            break;
          default:
            dateKey = currentDate.toLocaleDateString();
        }

        dateArray.push({
          date: dateKey,
          revenue: 0,
          orders: 0
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Remplir avec les données réelles
      data?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const dateKey = this.getDateKey(orderDate, period);
        
        const existingDate = dateArray.find(d => d.date === dateKey);
        if (existingDate) {
          existingDate.revenue += order.grand_total || 0;
          existingDate.orders += 1;
        }
      });

      return dateArray;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des revenus:', error);
      return [];
    }
  }

  /**
   * Récupère les statistiques en temps réel
   */
  async getRealTimeStats(businessId: number): Promise<{
    todayRevenue: number;
    todayOrders: number;
    pendingOrders: number;
    activeOrders: number;
  }> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      // Revenus et commandes d'aujourd'hui
      const { data: todayOrders, error: todayError } = await supabase
        .from('orders')
        .select('grand_total, status')
        .eq('business_id', businessId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      if (todayError) throw todayError;

      // Commandes en attente et actives
      const { data: statusOrders, error: statusError } = await supabase
        .from('orders')
        .select('status')
        .eq('business_id', businessId)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'assigned']);

      if (statusError) throw statusError;

      const todayRevenue = todayOrders?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0;
      const todayOrdersCount = todayOrders?.length || 0;
      const pendingOrders = statusOrders?.filter(order => ['pending', 'confirmed'].includes(order.status)).length || 0;
      const activeOrders = statusOrders?.filter(order => ['preparing', 'ready', 'assigned'].includes(order.status)).length || 0;

      return {
        todayRevenue,
        todayOrders: todayOrdersCount,
        pendingOrders,
        activeOrders
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques en temps réel:', error);
      throw error;
    }
  }

  /**
   * Calcule la plage de dates selon la période
   */
  private calculateDateRange(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string,
    isPrevious: boolean = false
  ): { start: string; end: string } {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case 'daily':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'weekly':
          const dayOfWeek = now.getDay();
          const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
          start = new Date(now.getFullYear(), now.getMonth(), diff);
          end = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59);
          break;
        case 'monthly':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          break;
        case 'yearly':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
          break;
        default:
          start = now;
          end = now;
      }
    }

    if (isPrevious) {
      const diff = end.getTime() - start.getTime();
      end = new Date(start.getTime());
      start = new Date(start.getTime() - diff);
    }

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  /**
   * Génère une clé de date selon la période
   */
  private getDateKey(date: Date, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): string {
    switch (period) {
      case 'daily':
        return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
      case 'weekly':
        return date.toLocaleDateString('fr-FR', { weekday: 'short' });
      case 'monthly':
        const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
        return `Semaine ${weekNumber}`;
      case 'yearly':
        return date.toLocaleDateString('fr-FR', { month: 'short' });
      default:
        return date.toLocaleDateString();
    }
  }
}

export const kBilling = new KBilling();
export default kBilling;