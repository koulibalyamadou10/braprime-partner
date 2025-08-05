import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, AuthUser } from '@/lib/services/auth';
import { validateEnv } from '@/config/env';

// Define user types
export type UserRole = 'customer' | 'partner' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  profileImage?: string;
  // Propriétés spécifiques aux livreurs
  driverId?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  businessId?: number;
  businessName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Valider les variables d'environnement
  useEffect(() => {
    validateEnv();
  }, []);

  // Check for saved user on initial load and set up auth listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Vérifier l'utilisateur actuel
        const { user, error: userError } = await AuthService.getCurrentUser();
        
        if (userError) {
          console.warn('Erreur lors de la récupération de l\'utilisateur:', userError);
        } else if (user) {
          // Convertir AuthUser vers User
          const convertedUser: User = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phoneNumber: user.phone_number,
            address: user.address,
            profileImage: user.profile_image,
            // Données spécifiques aux livreurs
            driverId: user.driver_id,
            vehicleType: user.vehicle_type,
            vehiclePlate: user.vehicle_plate,
            businessId: user.business_id,
            businessName: user.business_name
          };
          setCurrentUser(convertedUser);
        }

        // Écouter les changements d'authentification
        const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
          if (user) {
            const convertedUser: User = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              phoneNumber: user.phone_number,
              address: user.address,
              profileImage: user.profile_image,
              // Données spécifiques aux livreurs
              driverId: user.driver_id,
              vehicleType: user.vehicle_type,
              vehiclePlate: user.vehicle_plate,
              businessId: user.business_id,
              businessName: user.business_name
            };
            setCurrentUser(convertedUser);
            
            // Optimisation : Précharger les données du dashboard si l'utilisateur est un client
            if (user.role === 'customer') {
              // Précharger les données en arrière-plan
              setTimeout(() => {
                import('@/lib/services/dashboard').then(({ DashboardService }) => {
                  DashboardService.getCustomerStats(user.id).catch(console.error);
                  DashboardService.getRecentCustomerOrders(user.id, 5).catch(console.error);
                  DashboardService.getNotifications(user.id, 'customer').catch(console.error);
                });
              }, 100);
            }
          } else {
            setCurrentUser(null);
          }
        });

        setIsLoading(false);

        // Cleanup subscription
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user, error } = await AuthService.login(email, password);
      
      if (error) {
        setError(error);
        setIsLoading(false);
        return false;
      }
      
      if (user) {
        const convertedUser: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phone_number,
          address: user.address,
          profileImage: user.profile_image,
          // Données spécifiques aux livreurs
          driverId: user.driver_id,
          vehicleType: user.vehicle_type,
          vehiclePlate: user.vehicle_plate,
          businessId: user.business_id,
          businessName: user.business_name
        };
        setCurrentUser(convertedUser);
        setIsLoading(false);
        return true;
      }
      
      setError('Erreur lors de la connexion');
      setIsLoading(false);
      return false;
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
      setIsLoading(false);
      return false;
    }
  };

  // Signup function
  const signup = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!userData.email || !userData.name || !userData.role) {
        setError('Toutes les informations requises doivent être fournies');
        setIsLoading(false);
        return false;
      }

      const { user, error } = await AuthService.signup({
        email: userData.email,
        password,
        name: userData.name,
        role: userData.role,
        phone_number: userData.phoneNumber,
        address: userData.address
      });
      
      if (error) {
        setError(error);
        setIsLoading(false);
        return false;
      }
      
      if (user) {
        const convertedUser: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phone_number,
          address: user.address,
          profileImage: user.profile_image,
          // Données spécifiques aux livreurs
          driverId: user.driver_id,
          vehicleType: user.vehicle_type,
          vehiclePlate: user.vehicle_plate,
          businessId: user.business_id,
          businessName: user.business_name
        };
        setCurrentUser(convertedUser);
        setIsLoading(false);
        return true;
      }
      
      setError('Erreur lors de l\'inscription');
      setIsLoading(false);
      return false;
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription');
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AuthService.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    signup,
    logout,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 