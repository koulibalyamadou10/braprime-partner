// ============================================================================
// HOOK PERSONNALISÉ POUR LA GESTION DES COMMERCES
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { BusinessService } from '@/lib/services/business';
import { Business, SearchFilters, SearchResult, PaginationParams } from '@/lib/types';

// ============================================================================
// HOOK PRINCIPAL POUR LES COMMERCES
// ============================================================================

export const useBusiness = (businessType: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // État local pour les filtres
  const [filters, setFilters] = useState<SearchFilters>({
    businessType,
    isOpen: true
  });

  // État local pour la pagination
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 12
  });

  // Query pour récupérer les commerces
  const {
    data: searchResult,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['businesses', businessType, filters, pagination],
    queryFn: () => BusinessService.searchBusinesses(filters, pagination),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (remplace cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Mutation pour mettre à jour un commerce
  const updateBusinessMutation = useMutation({
    mutationFn: (data: Partial<Business>) => 
      BusinessService.updateBusiness(data.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast({
        title: "Succès",
        description: "Commerce mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le commerce",
        variant: "destructive",
      });
    }
  });

  // Fonction pour mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset à la première page
  }, []);

  // Fonction pour changer de page
  const changePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Fonction pour changer la limite
  const changeLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Fonction pour réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      businessType,
      isOpen: true
    });
    setPagination({
      page: 1,
      limit: 12
    });
  }, [businessType]);

  // Fonction pour mettre à jour un commerce
  const updateBusiness = useCallback((data: Partial<Business>) => {
    updateBusinessMutation.mutate(data);
  }, [updateBusinessMutation]);

  return {
    // Données
    businesses: searchResult?.businesses || [],
    total: searchResult?.total || 0,
    page: pagination.page,
    limit: pagination.limit,
    hasMore: searchResult?.hasMore || false,
    
    // État
    isLoading,
    error,
    isUpdating: updateBusinessMutation.isPending,
    
    // Filtres
    filters,
    updateFilters,
    resetFilters,
    
    // Pagination
    changePage,
    changeLimit,
    
    // Actions
    updateBusiness,
    refetch
  };
};

// ============================================================================
// HOOK POUR UN COMMERCE SPÉCIFIQUE
// ============================================================================

export const useBusinessById = (id: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query pour récupérer un commerce spécifique
  const {
    data: business,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['business', id],
    queryFn: () => BusinessService.getBusinessById(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (remplace cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!id
  });

  // Mutation pour mettre à jour le commerce
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Business>) => 
      BusinessService.updateBusiness(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', id] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast({
        title: "Succès",
        description: "Commerce mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le commerce",
        variant: "destructive",
      });
    }
  });

  // Mutation pour supprimer le commerce
  const deleteMutation = useMutation({
    mutationFn: () => BusinessService.deleteBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast({
        title: "Succès",
        description: "Commerce supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commerce",
        variant: "destructive",
      });
    }
  });

  return {
    // Données
    business: business?.data,
    
    // État
    isLoading,
    error,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Actions
    updateBusiness: updateMutation.mutate,
    deleteBusiness: deleteMutation.mutate,
    refetch
  };
};

// ============================================================================
// HOOK POUR LES COMMERCES POPULAIRES
// ============================================================================

export const usePopularBusinesses = (businessType: number, limit: number = 6) => {
  const { toast } = useToast();

  const {
    data: businesses,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['popular-businesses', businessType, limit],
    queryFn: () => BusinessService.getPopularBusinesses(businessType, limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (remplace cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  return {
    businesses: businesses?.data || [],
    isLoading,
    error,
    refetch
  };
};

// ============================================================================
// HOOK POUR LES COMMERCES À PROXIMITÉ
// ============================================================================

export const useNearbyBusinesses = (
  businessType: number, 
  latitude: number, 
  longitude: number, 
  radius: number = 10
) => {
  const { toast } = useToast();

  const {
    data: businesses,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['nearby-businesses', businessType, latitude, longitude, radius],
    queryFn: () => BusinessService.getNearbyBusinesses(businessType, latitude, longitude, radius),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (remplace cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!latitude && !!longitude
  });

  return {
    businesses: businesses?.data || [],
    isLoading,
    error,
    refetch
  };
};

// ============================================================================
// HOOK POUR LES COMMERCES OUVERTS
// ============================================================================

export const useOpenBusinesses = (businessType: number) => {
  const { toast } = useToast();

  const {
    data: businesses,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['open-businesses', businessType],
    queryFn: () => BusinessService.getOpenBusinesses(businessType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (remplace cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  return {
    businesses: businesses?.data || [],
    isLoading,
    error,
    refetch
  };
};

// ============================================================================
// HOOK POUR LA RECHERCHE DE COMMERCES
// ============================================================================

export const useBusinessSearch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // État local pour les filtres de recherche
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [searchPagination, setSearchPagination] = useState<PaginationParams>({
    page: 1,
    limit: 12
  });

  // Query pour la recherche
  const {
    data: searchResult,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['business-search', searchFilters, searchPagination],
    queryFn: () => BusinessService.searchBusinesses(searchFilters, searchPagination),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (remplace cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    enabled: !!searchFilters.query || !!searchFilters.businessType
  });

  // Fonction pour mettre à jour les filtres de recherche
  const updateSearchFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...newFilters }));
    setSearchPagination(prev => ({ ...prev, page: 1 })); // Reset à la première page
  }, []);

  // Fonction pour changer de page
  const changeSearchPage = useCallback((page: number) => {
    setSearchPagination(prev => ({ ...prev, page }));
  }, []);

  // Fonction pour réinitialiser la recherche
  const resetSearch = useCallback(() => {
    setSearchFilters({});
    setSearchPagination({
      page: 1,
      limit: 12
    });
  }, []);

  return {
    // Données
    businesses: searchResult?.businesses || [],
    total: searchResult?.total || 0,
    page: searchPagination.page,
    limit: searchPagination.limit,
    hasMore: searchResult?.hasMore || false,
    
    // État
    isLoading,
    error,
    
    // Filtres
    searchFilters,
    updateSearchFilters,
    resetSearch,
    
    // Pagination
    changeSearchPage,
    
    // Actions
    refetch
  };
}; 