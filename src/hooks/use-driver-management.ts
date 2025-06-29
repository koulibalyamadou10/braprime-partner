import { useState, useEffect } from 'react';
import { DriverManagementService, DriverManagementData, DriverCreateData, DriverUpdateData, DriverFilters } from '@/lib/services/driver-management';
import { toast } from 'sonner';

interface UseDriverManagementReturn {
  // État
  drivers: DriverManagementData[];
  loading: boolean;
  error: string | null;
  total: number;
  stats: any;
  
  // Actions
  loadDrivers: (filters?: DriverFilters, page?: number) => Promise<void>;
  loadDriverById: (driverId: string) => Promise<DriverManagementData | null>;
  createDriver: (driverData: DriverCreateData) => Promise<boolean>;
  updateDriver: (driverId: string, updateData: DriverUpdateData) => Promise<boolean>;
  deleteDriver: (driverId: string) => Promise<boolean>;
  toggleDriverStatus: (driverId: string, isActive: boolean) => Promise<boolean>;
  verifyDriver: (driverId: string) => Promise<boolean>;
  loadStats: () => Promise<void>;
  resetDriverPassword: (driverId: string, newPassword: string) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  
  // Utilitaires
  refreshDrivers: () => Promise<void>;
  clearError: () => void;
}

export const useDriverManagement = (): UseDriverManagementReturn => {
  const [drivers, setDrivers] = useState<DriverManagementData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [currentFilters, setCurrentFilters] = useState<DriverFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

  const loadDrivers = async (filters: DriverFilters = {}, page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const { drivers: driversData, total: totalCount, error: loadError } = await DriverManagementService.getDrivers(filters, page);
      
      if (loadError) {
        setError(loadError);
        toast.error(loadError);
      } else {
        setDrivers(driversData);
        setTotal(totalCount);
        setCurrentFilters(filters);
        setCurrentPage(page);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des livreurs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadDriverById = async (driverId: string): Promise<DriverManagementData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { driver, error: loadError } = await DriverManagementService.getDriverById(driverId);
      
      if (loadError) {
        setError(loadError);
        toast.error(loadError);
        return null;
      }
      
      return driver || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du livreur';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createDriver = async (driverData: DriverCreateData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { driver, error: createError } = await DriverManagementService.createDriver(driverData);
      
      if (createError) {
        setError(createError);
        toast.error(createError);
        return false;
      }
      
      if (driver) {
        // Ajouter le nouveau livreur à la liste
        setDrivers(prev => [driver, ...prev]);
        setTotal(prev => prev + 1);
        toast.success('Livreur créé avec succès');
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du livreur';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDriver = async (driverId: string, updateData: DriverUpdateData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { driver, error: updateError } = await DriverManagementService.updateDriver(driverId, updateData);
      
      if (updateError) {
        setError(updateError);
        toast.error(updateError);
        return false;
      }
      
      if (driver) {
        // Mettre à jour le livreur dans la liste
        setDrivers(prev => prev.map(d => d.id === driverId ? driver : d));
        toast.success('Livreur mis à jour avec succès');
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du livreur';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (driverId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await DriverManagementService.deleteDriver(driverId);
      
      if (deleteError) {
        setError(deleteError);
        toast.error(deleteError);
        return false;
      }
      
      // Supprimer le livreur de la liste
      setDrivers(prev => prev.filter(d => d.id !== driverId));
      setTotal(prev => prev - 1);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du livreur';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleDriverStatus = async (driverId: string, isActive: boolean): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: toggleError } = await DriverManagementService.toggleDriverStatus(driverId, isActive);
      
      if (toggleError) {
        setError(toggleError);
        toast.error(toggleError);
        return false;
      }
      
      // Mettre à jour le statut dans la liste
      setDrivers(prev => prev.map(d => 
        d.id === driverId ? { ...d, is_active: isActive } : d
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de statut';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyDriver = async (driverId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: verifyError } = await DriverManagementService.verifyDriver(driverId);
      
      if (verifyError) {
        setError(verifyError);
        toast.error(verifyError);
        return false;
      }
      
      // Mettre à jour le statut de vérification dans la liste
      setDrivers(prev => prev.map(d => 
        d.id === driverId ? { ...d, is_verified: true } : d
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { stats: statsData, error: statsError } = await DriverManagementService.getDriverStats();
      
      if (statsError) {
        setError(statsError);
        toast.error(statsError);
      } else {
        setStats(statsData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetDriverPassword = async (driverId: string, newPassword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: resetError } = await DriverManagementService.resetDriverPassword(driverId, newPassword);
      
      if (resetError) {
        setError(resetError);
        toast.error(resetError);
        return false;
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation du mot de passe';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: sendError } = await DriverManagementService.sendPasswordResetEmail(email);
      
      if (sendError) {
        setError(sendError);
        toast.error(sendError);
        return false;
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshDrivers = async () => {
    await loadDrivers(currentFilters, currentPage);
  };

  const clearError = () => {
    setError(null);
  };

  // Charger les données initiales
  useEffect(() => {
    loadDrivers();
    loadStats();
  }, []);

  return {
    // État
    drivers,
    loading,
    error,
    total,
    stats,
    
    // Actions
    loadDrivers,
    loadDriverById,
    createDriver,
    updateDriver,
    deleteDriver,
    toggleDriverStatus,
    verifyDriver,
    loadStats,
    resetDriverPassword,
    sendPasswordResetEmail,
    
    // Utilitaires
    refreshDrivers,
    clearError
  };
}; 