import { supabase } from '@/lib/supabase'

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export interface TopMenuItem {
  id: number
  name: string
  count: number
  revenue: number
  percentage: number
}

export interface RevenueStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  growthPercentage: number
  periodRevenue: number
  periodOrders: number
}

export interface RevenueAnalytics {
  revenueByPeriod: RevenueData[]
  topItems: TopMenuItem[]
  stats: RevenueStats
  comparison: {
    previousPeriod: number
    growth: number
  }
}

export class PartnerRevenueService {
  // Récupérer les données de revenus par période
  static async getRevenueData(
    businessId: number, 
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Promise<{ data: RevenueData[] | null; error: string | null }> {
    try {
      const now = new Date()
      let startDate: Date
      let interval: string

      switch (period) {
        case 'daily':
          // 7 derniers jours
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          interval = 'day'
          break
        case 'weekly':
          // 4 dernières semaines
          startDate = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000)
          interval = 'week'
          break
        case 'monthly':
          // Cette année (pour voir tous les mois)
          startDate = new Date(now.getFullYear(), 0, 1)
          interval = 'month'
          break
        case 'yearly':
          // 2 dernières années
          startDate = new Date(now.getFullYear() - 1, 0, 1)
          interval = 'year'
          break
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('grand_total, created_at, status')
        .eq('business_id', businessId)
        .in('status', ['delivered', 'completed'])
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erreur lors de la récupération des données de revenus:', error)
        return { data: null, error: error.message }
      }

      // Grouper par période
      const groupedData: Record<string, { revenue: number; orders: number }> = {}

      orders?.forEach(order => {
        const date = new Date(order.created_at)
        let key: string

        switch (interval) {
          case 'day':
            key = date.toISOString().split('T')[0]
            break
          case 'week':
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            key = weekStart.toISOString().split('T')[0]
            break
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            break
          case 'year':
            key = `${date.getFullYear()}`
            break
        }

        if (!groupedData[key]) {
          groupedData[key] = { revenue: 0, orders: 0 }
        }
        groupedData[key].revenue += order.grand_total || 0
        groupedData[key].orders += 1
      })

      // Convertir en tableau et trier
      const result = Object.entries(groupedData)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return { data: result, error: null }
    } catch (error) {
      console.error('Erreur lors du calcul des données de revenus:', error)
      return { data: null, error: 'Erreur lors du calcul des données de revenus' }
    }
  }

  // Récupérer les articles les plus populaires
  static async getTopItems(
    businessId: number, 
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<{ data: TopMenuItem[] | null; error: string | null }> {
    try {
      const now = new Date()
      let startDate: Date

      switch (period) {
        case 'daily':
          // Aujourd'hui (depuis minuit)
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'weekly':
          // Cette semaine (depuis lundi)
          const dayOfWeek = now.getDay()
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday)
          break
        case 'monthly':
          // Ce mois (depuis le 1er du mois)
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'yearly':
          // Cette année (depuis le 1er janvier)
          startDate = new Date(now.getFullYear(), 0, 1)
          break
      }

      // Récupérer les commandes avec les items
      const { data: orders, error } = await supabase
        .from('orders')
        .select('items, grand_total, created_at')
        .eq('business_id', businessId)
        .in('status', ['delivered', 'completed'])
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())

      if (error) {
        console.error('Erreur lors de la récupération des commandes:', error)
        return { data: null, error: error.message }
      }

      // Analyser les items
      const itemStats: Record<string, { count: number; revenue: number; name: string }> = {}
      let totalOrders = 0

      orders?.forEach(order => {
        totalOrders++
        const items = order.items || []
        
        items.forEach((item: any) => {
          const itemKey = item.id || item.name
          if (!itemStats[itemKey]) {
            itemStats[itemKey] = { count: 0, revenue: 0, name: item.name }
          }
          itemStats[itemKey].count += item.quantity || 1
          itemStats[itemKey].revenue += (item.price || 0) * (item.quantity || 1)
        })
      })

      // Convertir en tableau et calculer les pourcentages
      const result = Object.entries(itemStats)
        .map(([id, stats]) => ({
          id: parseInt(id) || 0,
          name: stats.name,
          count: stats.count,
          revenue: stats.revenue,
          percentage: totalOrders > 0 ? (stats.count / totalOrders) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10

      return { data: result, error: null }
    } catch (error) {
      console.error('Erreur lors du calcul des articles populaires:', error)
      return { data: null, error: 'Erreur lors du calcul des articles populaires' }
    }
  }

  // Récupérer les statistiques de revenus
  static async getRevenueStats(
    businessId: number, 
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<{ data: RevenueStats | null; error: string | null }> {
    try {
      const now = new Date()
      let startDate: Date
      let previousStartDate: Date

      switch (period) {
        case 'daily':
          // Aujourd'hui (depuis minuit)
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          // Hier
          previousStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
          break
        case 'weekly':
          // Cette semaine (depuis lundi)
          const dayOfWeek = now.getDay()
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday)
          // Semaine précédente
          previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          // Ce mois (depuis le 1er du mois)
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          // Mois précédent
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          break
        case 'yearly':
          // Cette année (depuis le 1er janvier)
          startDate = new Date(now.getFullYear(), 0, 1)
          // Année précédente
          previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
          break
      }

      // Récupérer les commandes de la période actuelle
      const { data: currentOrders, error: currentError } = await supabase
        .from('orders')
        .select('grand_total, created_at')
        .eq('business_id', businessId)
        .in('status', ['delivered', 'completed'])
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())

      if (currentError) {
        console.error('Erreur lors de la récupération des commandes actuelles:', currentError)
        return { data: null, error: currentError.message }
      }

      // Récupérer les commandes de la période précédente
      const { data: previousOrders, error: previousError } = await supabase
        .from('orders')
        .select('grand_total, created_at')
        .eq('business_id', businessId)
        .in('status', ['delivered', 'completed'])
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())

      if (previousError) {
        console.error('Erreur lors de la récupération des commandes précédentes:', previousError)
        return { data: null, error: previousError.message }
      }

      // Récupérer toutes les commandes pour les statistiques globales
      const { data: allOrders, error: allError } = await supabase
        .from('orders')
        .select('grand_total, created_at')
        .eq('business_id', businessId)
        .in('status', ['delivered', 'completed'])

      if (allError) {
        console.error('Erreur lors de la récupération de toutes les commandes:', allError)
        return { data: null, error: allError.message }
      }

      // Calculer les statistiques
      const periodRevenue = currentOrders?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0
      const periodOrders = currentOrders?.length || 0
      const previousRevenue = previousOrders?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0
      const totalRevenue = allOrders?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0
      const totalOrders = allOrders?.length || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Calculer la croissance
      const growthPercentage = previousRevenue > 0 
        ? ((periodRevenue - previousRevenue) / previousRevenue) * 100 
        : 0

      const stats: RevenueStats = {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        growthPercentage,
        periodRevenue,
        periodOrders
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques de revenus:', error)
      return { data: null, error: 'Erreur lors du calcul des statistiques de revenus' }
    }
  }

  // Récupérer toutes les analytics de revenus
  static async getRevenueAnalytics(
    businessId: number, 
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<{ data: RevenueAnalytics | null; error: string | null }> {
    try {
      const [revenueData, topItems, stats] = await Promise.all([
        this.getRevenueData(businessId, period),
        this.getTopItems(businessId, period),
        this.getRevenueStats(businessId, period)
      ])

      if (revenueData.error || topItems.error || stats.error) {
        return { 
          data: null, 
          error: revenueData.error || topItems.error || stats.error 
        }
      }

      // Calculer la comparaison avec la période précédente
      const now = new Date()
      let previousStartDate: Date
      let currentStartDate: Date

      switch (period) {
        case 'daily':
          // Aujourd'hui (depuis minuit)
          currentStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          // Hier
          previousStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
          break
        case 'weekly':
          // Cette semaine (depuis lundi)
          const dayOfWeek = now.getDay()
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          currentStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday)
          // Semaine précédente
          previousStartDate = new Date(currentStartDate.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          // Ce mois (depuis le 1er du mois)
          currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
          // Mois précédent
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          break
        case 'yearly':
          // Cette année (depuis le 1er janvier)
          currentStartDate = new Date(now.getFullYear(), 0, 1)
          // Année précédente
          previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
          break
      }

      const { data: previousOrders } = await supabase
        .from('orders')
        .select('grand_total')
        .eq('business_id', businessId)
        .in('status', ['delivered', 'completed'])
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', currentStartDate.toISOString())

      const previousPeriodRevenue = previousOrders?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0
      const currentPeriodRevenue = stats.data?.periodRevenue || 0
      const growth = previousPeriodRevenue > 0 
        ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
        : 0

      const analytics: RevenueAnalytics = {
        revenueByPeriod: revenueData.data || [],
        topItems: topItems.data || [],
        stats: stats.data!,
        comparison: {
          previousPeriod: previousPeriodRevenue,
          growth
        }
      }

      return { data: analytics, error: null }
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics de revenus:', error)
      return { data: null, error: 'Erreur lors de la récupération des analytics de revenus' }
    }
  }
} 