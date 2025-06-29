import { useState, useEffect } from 'react';
import { AdminDashboardService, AdminStats, AdminUser, AdminBusiness, AdminOrder, AdminDriver, AdminAnalytics, AvailableBusiness } from '@/lib/services/admin-dashboard';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [availableBusinesses, setAvailableBusinesses] = useState<AvailableBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la pagination
  const [usersPage, setUsersPage] = useState(1);
  const [businessesPage, setBusinessesPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [driversPage, setDriversPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [businessesTotal, setBusinessesTotal] = useState(0);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [driversTotal, setDriversTotal] = useState(0);

  // États pour la recherche
  const [usersSearch, setUsersSearch] = useState('');
  const [businessesSearch, setBusinessesSearch] = useState('');
  const [driversSearch, setDriversSearch] = useState('');
  const [ordersStatus, setOrdersStatus] = useState('');

  // Charger les statistiques générales
  const loadStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await AdminDashboardService.getStats();
      
      if (error) {
        setError(error);
        return;
      }
      
      setStats(data);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les utilisateurs
  const loadUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const { data, error, total } = await AdminDashboardService.getUsers(page, 10, search);
      
      if (error) {
        setError(error);
        return;
      }
      
      setUsers(data || []);
      setUsersTotal(total);
      setUsersPage(page);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les commerces
  const loadBusinesses = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const { data, error, total } = await AdminDashboardService.getBusinesses(page, 10, search);
      
      if (error) {
        setError(error);
        return;
      }
      
      setBusinesses(data || []);
      setBusinessesTotal(total);
      setBusinessesPage(page);
    } catch (err) {
      setError('Erreur lors du chargement des commerces');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les commandes
  const loadOrders = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const { data, error, total } = await AdminDashboardService.getOrders(page, 10, status);
      
      if (error) {
        setError(error);
        return;
      }
      
      setOrders(data || []);
      setOrdersTotal(total);
      setOrdersPage(page);
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les livreurs
  const loadDrivers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const { data, error, total } = await AdminDashboardService.getDrivers(page, 10, search);
      
      if (error) {
        setError(error);
        return;
      }
      
      setDrivers(data || []);
      setDriversTotal(total);
      setDriversPage(page);
    } catch (err) {
      setError('Erreur lors du chargement des livreurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les analytics
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await AdminDashboardService.getAnalytics();
      
      if (error) {
        setError(error);
        return;
      }
      
      setAnalytics(data);
    } catch (err) {
      setError('Erreur lors du chargement des analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les commerces disponibles
  const loadAvailableBusinesses = async () => {
    try {
      const { data, error } = await AdminDashboardService.getAvailableBusinesses();
      
      if (error) {
        console.error('Erreur lors du chargement des commerces disponibles:', error);
        return;
      }
      
      setAvailableBusinesses(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des commerces disponibles:', err);
    }
  };

  // Charger toutes les données initiales
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        loadStats(),
        loadUsers(1),
        loadBusinesses(1),
        loadOrders(1),
        loadDrivers(1),
        loadAnalytics(),
        loadAvailableBusinesses()
      ]);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaires de recherche
  const handleUsersSearch = (search: string) => {
    setUsersSearch(search);
    loadUsers(1, search);
  };

  const handleBusinessesSearch = (search: string) => {
    setBusinessesSearch(search);
    loadBusinesses(1, search);
  };

  const handleDriversSearch = (search: string) => {
    setDriversSearch(search);
    loadDrivers(1, search);
  };

  const handleOrdersStatusFilter = (status: string) => {
    setOrdersStatus(status);
    loadOrders(1, status);
  };

  // Gestionnaires de pagination
  const handleUsersPageChange = (page: number) => {
    loadUsers(page, usersSearch);
  };

  const handleBusinessesPageChange = (page: number) => {
    loadBusinesses(page, businessesSearch);
  };

  const handleOrdersPageChange = (page: number) => {
    loadOrders(page, ordersStatus);
  };

  const handleDriversPageChange = (page: number) => {
    loadDrivers(page, driversSearch);
  };

  // Recharger les données
  const refreshData = () => {
    loadAllData();
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadAllData();
  }, []);

  return {
    // Données
    stats,
    users,
    businesses,
    orders,
    drivers,
    analytics,
    availableBusinesses,
    
    // États de chargement et d'erreur
    loading,
    error,
    
    // Pagination
    usersPage,
    businessesPage,
    ordersPage,
    driversPage,
    usersTotal,
    businessesTotal,
    ordersTotal,
    driversTotal,
    
    // Recherche
    usersSearch,
    businessesSearch,
    driversSearch,
    ordersStatus,
    
    // Actions
    loadStats,
    loadUsers,
    loadBusinesses,
    loadOrders,
    loadDrivers,
    loadAnalytics,
    loadAllData,
    refreshData,
    loadAvailableBusinesses,
    
    // Gestionnaires
    handleUsersSearch,
    handleBusinessesSearch,
    handleDriversSearch,
    handleOrdersStatusFilter,
    handleUsersPageChange,
    handleBusinessesPageChange,
    handleOrdersPageChange,
    handleDriversPageChange,
  };
}; 