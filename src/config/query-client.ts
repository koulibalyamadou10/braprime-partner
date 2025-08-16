import { QueryClient } from '@tanstack/react-query'

// Configuration optimisée du client React Query pour de meilleures performances
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Temps avant qu'une requête soit considérée comme périmée
        staleTime: 1 * 60 * 1000, // 1 minute par défaut
        
        // Temps de vie en cache
        gcTime: 10 * 60 * 1000, // 10 minutes par défaut
        
        // Nombre de tentatives en cas d'échec
        retry: (failureCount, error: any) => {
          // Ne pas retenter pour les erreurs d'authentification
          if (error?.code === 'PGRST116' || error?.status === 401) {
            return false
          }
          // Maximum 2 tentatives pour les autres erreurs
          return failureCount < 2
        },
        
        // Délai entre les tentatives (en millisecondes)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch automatique quand la fenêtre reprend le focus
        refetchOnWindowFocus: false,
        
        // Refetch automatique quand la connexion reprend
        refetchOnReconnect: true,
        
        // Refetch automatique quand le composant remonte
        refetchOnMount: true,
      },
      mutations: {
        // Nombre de tentatives pour les mutations
        retry: (failureCount, error: any) => {
          if (error?.code === 'PGRST116' || error?.status === 401) {
            return false
          }
          return failureCount < 1 // Pas de retry pour les mutations
        },
        
        // Délai entre les tentatives
        retryDelay: 1000,
      },
    },
  })
}

// Configuration spécifique pour les dashboards (données plus sensibles au temps)
export const dashboardQueryConfig = {
  staleTime: 30 * 1000, // 30 secondes
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 2 * 60 * 1000, // 2 minutes
}

// Configuration pour les données en temps réel (commandes, notifications)
export const realtimeQueryConfig = {
  staleTime: 10 * 1000, // 10 secondes
  gcTime: 2 * 60 * 1000, // 2 minutes
  refetchInterval: 30 * 1000, // 30 secondes
}

// Configuration pour les données statiques (menu, profil)
export const staticQueryConfig = {
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
  refetchInterval: false, // Pas de refetch automatique
}
