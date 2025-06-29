import { useState, useEffect, createContext, useContext } from 'react';
import { DriverAuthService, DriverAuthData, DriverRegistrationData, DriverLoginData, DriverUpdateData } from '@/lib/services/driver-auth';

interface DriverAuthContextType {
  driver: DriverAuthData | null;
  loading: boolean;
  error: string | null;
  login: (data: DriverLoginData) => Promise<{ success: boolean; error?: string }>;
  register: (data: DriverRegistrationData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: DriverUpdateData) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshDriver: () => Promise<void>;
  isAuthenticated: boolean;
}

const DriverAuthContext = createContext<DriverAuthContextType | undefined>(undefined);

export const useDriverAuth = () => {
  const context = useContext(DriverAuthContext);
  if (context === undefined) {
    throw new Error('useDriverAuth must be used within a DriverAuthProvider');
  }
  return context;
};

export const DriverAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [driver, setDriver] = useState<DriverAuthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const { driver: currentDriver, error: authError } = await DriverAuthService.getCurrentDriver();

      if (authError) {
        setDriver(null);
        setError(authError);
      } else if (currentDriver) {
        setDriver(currentDriver);
        setError(null);
      }
    } catch (err) {
      setDriver(null);
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification de l\'authentification');
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: DriverLoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const { driver: loggedDriver, error: loginError } = await DriverAuthService.login(data);

      if (loginError) {
        setError(loginError);
        return { success: false, error: loginError };
      }

      if (loggedDriver) {
        setDriver(loggedDriver);
        setError(null);
        return { success: true };
      }

      return { success: false, error: 'Erreur lors de la connexion' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: DriverRegistrationData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const { driver: newDriver, error: registerError } = await DriverAuthService.register(data);

      if (registerError) {
        setError(registerError);
        return { success: false, error: registerError };
      }

      if (newDriver) {
        setDriver(newDriver);
        setError(null);
        return { success: true };
      }

      return { success: false, error: 'Erreur lors de l\'inscription' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error: logoutError } = await DriverAuthService.logout();

      if (logoutError) {
        setError(logoutError);
      } else {
        setDriver(null);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la déconnexion';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: DriverUpdateData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!driver) {
        return { success: false, error: 'Aucun livreur connecté' };
      }

      setLoading(true);
      setError(null);

      const { driver: updatedDriver, error: updateError } = await DriverAuthService.updateDriverProfile(driver.id, data);

      if (updateError) {
        setError(updateError);
        return { success: false, error: updateError };
      }

      if (updatedDriver) {
        setDriver(updatedDriver);
        setError(null);
        return { success: true };
      }

      return { success: false, error: 'Erreur lors de la mise à jour' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const { error: changeError } = await DriverAuthService.changePassword(currentPassword, newPassword);

      if (changeError) {
        setError(changeError);
        return { success: false, error: changeError };
      }

      setError(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const { error: resetError } = await DriverAuthService.resetPassword(email);

      if (resetError) {
        setError(resetError);
        return { success: false, error: resetError };
      }

      setError(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshDriver = async (): Promise<void> => {
    await checkAuth();
  };

  const value: DriverAuthContextType = {
    driver,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    refreshDriver,
    isAuthenticated: !!driver
  };

  return (
    <DriverAuthContext.Provider value={value}>
      {children}
    </DriverAuthContext.Provider>
  );
}; 