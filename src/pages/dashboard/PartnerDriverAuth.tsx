import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { DriverAuthManager } from '@/components/dashboard/DriverAuthManager';
import { usePartnerDashboard } from '@/hooks/use-partner-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Users, Shield, AlertCircle } from 'lucide-react';
import { useUserRole } from '@/contexts/UserRoleContext';

const PartnerDriverAuth = () => {
  const { currentUser } = useAuth();
  const { 
    business,
    isAuthenticated,
    currentUser: partnerCurrentUser
  } = usePartnerDashboard();
  const { isPartner } = useUserRole();

  // Vérifier l'authentification
  if (!isAuthenticated) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Comptes Livreurs">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Authentification Requise</h3>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder à cette page
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Vérifier le rôle
  if (!isPartner) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Comptes Livreurs">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
            <p className="text-muted-foreground mb-4">
              Cette page est réservée aux partenaires.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={partnerNavItems} title="Comptes Livreurs">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Comptes de Connexion des Livreurs</h2>
            <p className="text-gray-500">
              Gérez les comptes de connexion de vos livreurs pour qu'ils puissent accéder à l'application.
            </p>
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Livreurs Totaux</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Avec Compte</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Sans Compte</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestionnaire d'auth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Gestion des Comptes
            </CardTitle>
            <CardDescription>
              Créez et gérez les comptes de connexion de vos livreurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DriverAuthManager businessId={business?.id || 0} />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>
              Comment utiliser cette page pour gérer les comptes de vos livreurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Créer un compte pour un livreur</h4>
              <p className="text-sm text-gray-600">
                - Trouvez le livreur dans la liste "Livreurs sans compte auth"
                - Cliquez sur "Créer compte"
                - Définissez un mot de passe sécurisé
                - Le livreur pourra se connecter avec son email et ce mot de passe
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Informations importantes</h4>
              <p className="text-sm text-gray-600">
                - Les livreurs ont besoin d'un email valide pour créer un compte
                - Le mot de passe doit être communiqué de manière sécurisée au livreur
                - Les livreurs peuvent se connecter via la page de connexion dédiée
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Sécurité</h4>
              <p className="text-sm text-gray-600">
                - Changez régulièrement les mots de passe
                - Désactivez les comptes des livreurs qui ne travaillent plus
                - Surveillez les connexions suspectes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDriverAuth; 