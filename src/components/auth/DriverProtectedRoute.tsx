import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDriverAuth } from '@/contexts/DriverAuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Truck } from 'lucide-react';

interface DriverProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

const DriverProtectedRoute: React.FC<DriverProtectedRouteProps> = ({ 
  children, 
  requireVerification = false 
}) => {
  const { driver, loading, isAuthenticated } = useDriverAuth();
  const location = useLocation();

  // Afficher un skeleton pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated || !driver) {
    return <Navigate to="/driver/login" state={{ from: location }} replace />;
  }

  // Vérifier si le compte est actif
  if (!driver.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Truck className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Compte désactivé</h2>
            <p className="text-gray-600 mb-4">
              Votre compte livreur a été désactivé. Veuillez contacter l'administrateur pour plus d'informations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vérifier la vérification si requise
  if (requireVerification && !driver.is_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Truck className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Compte en attente de vérification</h2>
            <p className="text-gray-600 mb-4">
              Votre compte est en cours de vérification. Vous recevrez une notification une fois votre compte approuvé.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Afficher le contenu protégé
  return <>{children}</>;
};

export default DriverProtectedRoute; 