import { supabase } from '@/lib/supabase'

export interface SearchResult {
  type: 'business' | 'menu_item' | 'category'
  id: number | string
  name: string
  description?: string
  image?: string
  price?: number
  rating?: number
  address?: string
  cuisine_type?: string
  business_name?: string
  delivery_time?: string
  delivery_fee?: number
  business_type?: string
  category_name?: string
}

export interface SearchFilters {
  query?: string
  type?: 'business' | 'menu_item' | 'category' | 'all'
  category_id?: number
  business_type_id?: number
  is_open?: boolean
  min_rating?: number
  max_price?: number
  location?: {
    lat: number
    lng: number
    radius: number
  }
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  hasMore: boolean
  suggestions: string[]
}

export class SearchService {
  // Recherche globale dynamique
  static async search(query: string, filters: SearchFilters = {}, limit: number = 20): Promise<SearchResponse> {
    try {
      console.log('🔍 [SearchService] Recherche pour:', query, filters)

      const results: SearchResult[] = []
      const searchTerm = query.toLowerCase().trim()

      if (!searchTerm) {
        return {
          results: [],
          total: 0,
          hasMore: false,
          suggestions: []
        }
      }

      // Recherche dans les commerces/services
      if (filters.type === 'all' || filters.type === 'business' || !filters.type) {
        const businesses = await this.searchBusinesses(searchTerm, filters, limit)
        results.push(...businesses)
      }

      // Recherche dans les articles de menu
      if (filters.type === 'all' || filters.type === 'menu_item' || !filters.type) {
        const menuItems = await this.searchMenuItems(searchTerm, filters, limit)
        results.push(...menuItems)
      }

      // Recherche dans les catégories
      if (filters.type === 'all' || filters.type === 'category' || !filters.type) {
        const categories = await this.searchCategories(searchTerm, limit)
        results.push(...categories)
      }

      // Trier les résultats par pertinence
      const sortedResults = this.sortByRelevance(results, searchTerm)

      // Générer des suggestions
      const suggestions = this.generateSuggestions(searchTerm, results)

      return {
        results: sortedResults.slice(0, limit),
        total: sortedResults.length,
        hasMore: sortedResults.length > limit,
        suggestions
      }
    } catch (error) {
      console.error('❌ [SearchService] Erreur lors de la recherche:', error)
      return {
        results: [],
        total: 0,
        hasMore: false,
        suggestions: []
      }
    }
  }

  // Recherche dans les commerces/services
  private static async searchBusinesses(query: string, filters: SearchFilters, limit: number): Promise<SearchResult[]> {
    try {
      let supabaseQuery = supabase
        .from('businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            icon,
            color
          ),
          categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('is_active', true)

      // Appliquer les filtres
      if (filters.category_id) {
        supabaseQuery = supabaseQuery.eq('category_id', filters.category_id)
      }
      if (filters.business_type_id) {
        supabaseQuery = supabaseQuery.eq('business_type_id', filters.business_type_id)
      }
      if (filters.is_open !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_open', filters.is_open)
      }
      if (filters.min_rating) {
        supabaseQuery = supabaseQuery.gte('rating', filters.min_rating)
      }

      // Recherche textuelle améliorée dans les champs directs du commerce
      const directSearchFilters = [
        `name.ilike.%${query}%`,
        `description.ilike.%${query}%`,
        `cuisine_type.ilike.%${query}%`,
        `address.ilike.%${query}%`
      ].join(',')

      supabaseQuery = supabaseQuery.or(directSearchFilters)

      const { data, error } = await supabaseQuery
        .order('rating', { ascending: false })
        .order('is_open', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ [SearchService] Erreur recherche commerces:', error)
        return []
      }

      // Filtrer les résultats pour inclure les recherches dans les relations
      const filteredData = (data || []).filter(business => {
        const searchTerm = query.toLowerCase()
        
        // Vérifier les champs directs (déjà filtrés par la requête)
        const directMatch = 
          business.name?.toLowerCase().includes(searchTerm) ||
          business.description?.toLowerCase().includes(searchTerm) ||
          business.cuisine_type?.toLowerCase().includes(searchTerm) ||
          business.address?.toLowerCase().includes(searchTerm)
        
        // Vérifier les relations
        const relationMatch = 
          business.business_types?.name?.toLowerCase().includes(searchTerm) ||
          business.categories?.name?.toLowerCase().includes(searchTerm)
        
        return directMatch || relationMatch
      })

      return filteredData.map(business => ({
        type: 'business' as const,
        id: business.id,
        name: business.name,
        description: business.description,
        image: business.cover_image,
        rating: business.rating,
        address: business.address,
        cuisine_type: business.cuisine_type || business.business_types?.name,
        business_type: business.business_types?.name,
        category_name: business.categories?.name,
        delivery_time: business.delivery_time,
        delivery_fee: business.delivery_fee
      }))
    } catch (error) {
      console.error('❌ [SearchService] Erreur recherche commerces:', error)
      return []
    }
  }

  // Recherche dans les articles de menu
  private static async searchMenuItems(query: string, filters: SearchFilters, limit: number): Promise<SearchResult[]> {
    try {
      let supabaseQuery = supabase
        .from('menu_items')
        .select(`
          *,
          businesses (
            id,
            name,
            cuisine_type,
            address,
            delivery_time,
            delivery_fee,
            business_types (name)
          ),
          menu_categories (name)
        `)
        .eq('is_available', true)

      // Appliquer les filtres
      if (filters.max_price) {
        supabaseQuery = supabaseQuery.lte('price', filters.max_price)
      }

      // Recherche textuelle améliorée dans les champs directs de l'article
      const directSearchFilters = [
        `name.ilike.%${query}%`,
        `description.ilike.%${query}%`
      ].join(',')

      supabaseQuery = supabaseQuery.or(directSearchFilters)

      const { data, error } = await supabaseQuery
        .order('is_popular', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ [SearchService] Erreur recherche articles:', error)
        return []
      }

      // Filtrer les résultats pour inclure les recherches dans les relations
      const filteredData = (data || []).filter(item => {
        const searchTerm = query.toLowerCase()
        
        // Vérifier les champs directs (déjà filtrés par la requête)
        const directMatch = 
          item.name?.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm)
        
        // Vérifier les relations
        const relationMatch = 
          item.businesses?.name?.toLowerCase().includes(searchTerm) ||
          item.businesses?.cuisine_type?.toLowerCase().includes(searchTerm) ||
          item.businesses?.business_types?.name?.toLowerCase().includes(searchTerm) ||
          item.menu_categories?.name?.toLowerCase().includes(searchTerm)
        
        return directMatch || relationMatch
      })

      return filteredData.map(item => ({
        type: 'menu_item' as const,
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        price: item.price,
        business_name: item.businesses?.name,
        cuisine_type: item.businesses?.cuisine_type || item.businesses?.business_types?.name,
        delivery_time: item.businesses?.delivery_time,
        delivery_fee: item.businesses?.delivery_fee
      }))
    } catch (error) {
      console.error('❌ [SearchService] Erreur recherche articles:', error)
      return []
    }
  }

  // Recherche dans les catégories
  private static async searchCategories(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name')
        .limit(limit)

      if (error) {
        console.error('❌ [SearchService] Erreur recherche catégories:', error)
        return []
      }

      return (data || []).map(category => ({
        type: 'category' as const,
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image
      }))
    } catch (error) {
      console.error('❌ [SearchService] Erreur recherche catégories:', error)
      return []
    }
  }

  // Trier par pertinence
  private static sortByRelevance(results: SearchResult[], query: string): SearchResult[] {
    return results.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, query)
      const bScore = this.calculateRelevanceScore(b, query)
      return bScore - aScore
    })
  }

  // Calculer le score de pertinence
  private static calculateRelevanceScore(result: SearchResult, query: string): number {
    let score = 0
    const searchTerm = query.toLowerCase()

    // Score pour le nom (le plus important)
    if (result.name.toLowerCase().includes(searchTerm)) {
      score += 100
      // Bonus si le nom commence par le terme de recherche
      if (result.name.toLowerCase().startsWith(searchTerm)) {
        score += 50
      }
    }

    // Score pour la description
    if (result.description?.toLowerCase().includes(searchTerm)) {
      score += 30
    }

    // Score pour le type de cuisine/service
    if (result.cuisine_type?.toLowerCase().includes(searchTerm)) {
      score += 40
    }

    // Score pour le type de business
    if (result.business_type?.toLowerCase().includes(searchTerm)) {
      score += 35
    }

    // Score pour la catégorie
    if (result.category_name?.toLowerCase().includes(searchTerm)) {
      score += 30
    }

    // Score pour l'adresse
    if (result.address?.toLowerCase().includes(searchTerm)) {
      score += 20
    }

    // Bonus pour les commerces populaires/ouverts
    if (result.type === 'business' && result.rating && result.rating >= 4.5) {
      score += 10
    }

    // Bonus pour les articles populaires
    if (result.type === 'menu_item') {
      score += 5
    }

    return score
  }

  // Générer des suggestions
  private static generateSuggestions(query: string, results: SearchResult[]): string[] {
    const suggestions = new Set<string>()
    
    // Ajouter des suggestions basées sur les résultats
    results.forEach(result => {
      if (result.cuisine_type && !suggestions.has(result.cuisine_type)) {
        suggestions.add(result.cuisine_type)
      }
      if (result.business_type && !suggestions.has(result.business_type)) {
        suggestions.add(result.business_type)
      }
      if (result.category_name && !suggestions.has(result.category_name)) {
        suggestions.add(result.category_name)
      }
      if (result.address && !suggestions.has(result.address)) {
        suggestions.add(result.address)
      }
    })

    // Ajouter des suggestions communes pour la Guinée
    const commonSuggestions = [
      'Restaurant',
      'Café',
      'Pizza',
      'Burger',
      'Sushi',
      'Poulet',
      'Poisson',
      'Kaloum',
      'Dixinn',
      'Ratoma',
      'Matam',
      'Matoto',
      'Pharmacie',
      'Épicerie',
      'Boulangerie',
      'Coiffure',
      'Beauté',
      'Livraison',
      'Service'
    ]

    commonSuggestions.forEach(suggestion => {
      if (suggestion.toLowerCase().includes(query.toLowerCase()) && suggestions.size < 5) {
        suggestions.add(suggestion)
      }
    })

    return Array.from(suggestions).slice(0, 5)
  }

  // Recherche rapide (pour l'autocomplétion)
  static async quickSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const { results } = await this.search(query, {}, limit)
      return results
    } catch (error) {
      console.error('❌ [SearchService] Erreur recherche rapide:', error)
      return []
    }
  }

  // Recherche par catégorie
  static async searchByCategory(categoryName: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          categories (name),
          business_types (name)
        `)
        .eq('is_active', true)
        .eq('categories.name', categoryName)
        .order('rating', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ [SearchService] Erreur recherche par catégorie:', error)
        return []
      }

      return (data || []).map(business => ({
        type: 'business' as const,
        id: business.id,
        name: business.name,
        description: business.description,
        image: business.cover_image,
        rating: business.rating,
        address: business.address,
        cuisine_type: business.cuisine_type || business.business_types?.name,
        business_type: business.business_types?.name,
        category_name: business.categories?.name,
        delivery_time: business.delivery_time,
        delivery_fee: business.delivery_fee
      }))
    } catch (error) {
      console.error('❌ [SearchService] Erreur recherche par catégorie:', error)
      return []
    }
  }

  // Recherche par type de business
  static async searchByBusinessType(businessTypeName: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_types (name),
          categories (name)
        `)
        .eq('is_active', true)
        .eq('business_types.name', businessTypeName)
        .order('rating', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ [SearchService] Erreur recherche par type de business:', error)
        return []
      }

      return (data || []).map(business => ({
        type: 'business' as const,
        id: business.id,
        name: business.name,
        description: business.description,
        image: business.cover_image,
        rating: business.rating,
        address: business.address,
        cuisine_type: business.cuisine_type || business.business_types?.name,
        business_type: business.business_types?.name,
        category_name: business.categories?.name,
        delivery_time: business.delivery_time,
        delivery_fee: business.delivery_fee
      }))
    } catch (error) {
      console.error('❌ [SearchService] Erreur recherche par type de business:', error)
      return []
    }
  }
} 