import { useEffect, useState } from 'react';
import { AdminBusinessRequestsService } from '../lib/services/admin-business-requests';

interface BusinessRequestFilters {
  status?: string;
  search?: string;
}

interface CreateAccountResult {
  success: boolean;
  error?: string;
  credentials?: {
    email: string;
    password: string;
    businessName: string;
  };
}

export const useAdminRequests = (filters: BusinessRequestFilters = {}) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const result = await AdminBusinessRequestsService.getBusinessRequests(filters);
      setRequests(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des demandes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await AdminBusinessRequestsService.getBusinessRequestStats();
      setStats(result);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const approveRequest = async (requestId: number) => {
    try {
      await AdminBusinessRequestsService.approveBusinessRequest(requestId);
      await fetchRequests();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'approbation';
      throw new Error(errorMessage);
    }
  };

  const rejectRequest = async (requestId: number) => {
    try {
      await AdminBusinessRequestsService.rejectBusinessRequest(requestId);
      await fetchRequests();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du rejet';
      throw new Error(errorMessage);
    }
  };

  const createUserAccount = async (requestId: number): Promise<CreateAccountResult> => {
    try {
      const result = await AdminBusinessRequestsService.createUserAccountForBusiness(requestId);
      
      if (result.success && result.userId) {
        // Récupérer les informations du business pour les credentials
        const businessRequest = await AdminBusinessRequestsService.getBusinessRequest(requestId);
        
        if (businessRequest.data) {
          return {
            success: true,
            credentials: {
              email: businessRequest.data.owner_email,
              password: result.password || 'Mot de passe généré automatiquement',
              businessName: businessRequest.data.name
            }
          };
        }
      }
      
      return {
        success: false,
        error: result.error || 'Erreur lors de la création du compte'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du compte';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filters.status, filters.search]);

  return {
    requests,
    isLoading,
    error,
    stats,
    approveRequest,
    rejectRequest,
    createUserAccount,
    refetch: fetchRequests
  };
};

// Hook pour une demande spécifique
export const useAdminRequest = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: request,
    isLoading,
    error
  } = useQuery({
    queryKey: ['admin-request', id],
    queryFn: () => AdminBusinessRequestsService.getBusinessRequest(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    request: request?.data,
    isLoading,
    error: error?.message || request?.error
  };
}; 