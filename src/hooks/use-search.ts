import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { SearchService, SearchFilters, SearchResponse } from '@/lib/services/search'

// Hook pour la recherche dynamique
export const useSearch = (query: string, filters: SearchFilters = {}, limit: number = 20) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce la requête pour éviter trop d'appels API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300) // 300ms de délai

    return () => clearTimeout(timer)
  }, [query])

  const {
    data: searchResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['search', debouncedQuery, filters, limit],
    queryFn: () => SearchService.search(debouncedQuery, filters, limit),
    enabled: debouncedQuery.length >= 2, // Rechercher seulement si 2 caractères ou plus
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  return {
    results: searchResponse?.results || [],
    total: searchResponse?.total || 0,
    hasMore: searchResponse?.hasMore || false,
    suggestions: searchResponse?.suggestions || [],
    isLoading,
    error,
    refetch
  }
}

// Hook pour la recherche rapide (autocomplétion)
export const useQuickSearch = (query: string, limit: number = 5) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce plus court pour l'autocomplétion
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 200) // 200ms de délai

    return () => clearTimeout(timer)
  }, [query])

  const {
    data: results,
    isLoading,
    error
  } = useQuery({
    queryKey: ['quick-search', debouncedQuery, limit],
    queryFn: () => SearchService.quickSearch(debouncedQuery, limit),
    enabled: debouncedQuery.length >= 1, // Rechercher dès 1 caractère
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    retryDelay: 1000
  })

  return {
    results: results || [],
    isLoading,
    error
  }
}

// Hook pour la recherche par catégorie
export const useSearchByCategory = (categoryName: string, limit: number = 10) => {
  const {
    data: results,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['search-by-category', categoryName, limit],
    queryFn: () => SearchService.searchByCategory(categoryName, limit),
    enabled: !!categoryName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  return {
    results: results || [],
    isLoading,
    error,
    refetch
  }
}

// Hook pour la recherche avec filtres avancés
export const useAdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [query, setQuery] = useState('')

  const {
    data: searchResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['advanced-search', query, filters],
    queryFn: () => SearchService.search(query, filters, 50),
    enabled: query.length >= 2,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({})
  }, [])

  const performSearch = useCallback((searchQuery: string, searchFilters: SearchFilters = {}) => {
    setQuery(searchQuery)
    setFilters(searchFilters)
  }, [])

  return {
    results: searchResponse?.results || [],
    total: searchResponse?.total || 0,
    hasMore: searchResponse?.hasMore || false,
    suggestions: searchResponse?.suggestions || [],
    filters,
    query,
    isLoading,
    error,
    updateFilters,
    resetFilters,
    performSearch,
    refetch
  }
}

// Hook pour l'historique de recherche
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Charger l'historique depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('search-history')
    if (saved) {
      try {
        const history = JSON.parse(saved)
        setSearchHistory(Array.isArray(history) ? history : [])
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique de recherche:', error)
      }
    }
  }, [])

  // Sauvegarder l'historique dans localStorage
  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return

    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10)
      localStorage.setItem('search-history', JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem('search-history')
  }, [])

  const removeFromHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item !== query)
      localStorage.setItem('search-history', JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory
  }
} 