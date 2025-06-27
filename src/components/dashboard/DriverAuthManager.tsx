import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { DriverAuthAdminService, CreateDriverAuthRequest } from '@/lib/services/driver-auth-admin';
import { Loader2, UserPlus, Key, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface DriverAuthManagerProps {
  businessId: number;
}

export function DriverAuthManager({ businessId }: DriverAuthManagerProps) {
  const [driversWithoutAuth, setDriversWithoutAuth] = useState<any[]>([]);
  const [driverAuthAccounts, setDriverAuthAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingAuth, setCreatingAuth] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  // Charger les données
  const loadData = async () => {
    setLoading(true);
    try {
      const [driversResult, accountsResult] = await Promise.all([
        DriverAuthAdminService.getDriversWithoutAuth(),
        DriverAuthAdminService.getDriverAuthAccounts()
      ]);

      if (driversResult.error) {
        toast({
          title: "Erreur",
          description: driversResult.error,
          variant: "destructive"
        });
      }

      if (accountsResult.error) {
        toast({
          title: "Erreur",
          description: accountsResult.error,
          variant: "destructive"
        });
      }

      setDriversWithoutAuth(driversResult.drivers || []);
      setDriverAuthAccounts(accountsResult.accounts || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  // Créer un compte auth pour un livreur
  const createDriverAuth = async (driver: any) => {
    if (!password.trim()) {
      toast({
        title: "Erreur",
        description: "Le mot de passe est requis",
        variant: "destructive"
      });
      return;
    }

    setCreatingAuth(driver.id);
    try {
      const request: CreateDriverAuthRequest = {
        driver_id: driver.id,
        email: driver.email,
        phone: driver.phone,
        password: password
      };

      const result = await DriverAuthAdminService.createDriverAuthAccount(request);

      if (result.success) {
        toast({
          title: "Succès",
          description: "Compte auth créé avec succès",
        });
        setPassword('');
        setShowCreateForm(false);
        setSelectedDriver(null);
        loadData(); // Recharger les données
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la création du compte",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur création compte auth:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du compte auth",
        variant: "destructive"
      });
    } finally {
      setCreatingAuth(null);
    }
  };

  // Supprimer un compte auth
  const deleteDriverAuth = async (userProfileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte auth ?')) {
      return;
    }

    try {
      const result = await DriverAuthAdminService.deleteDriverAuthAccount(userProfileId);

      if (result.success) {
        toast({
          title: "Succès",
          description: "Compte auth supprimé avec succès",
        });
        loadData(); // Recharger les données
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la suppression",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur suppression compte auth:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du compte auth",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Gestion des comptes livreurs
          </CardTitle>
          <CardDescription>
            Créez et gérez les comptes de connexion de vos livreurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {driversWithoutAuth.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Tous vos livreurs ont déjà un compte de connexion
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {driversWithoutAuth.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{driver.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {driver.email} • {driver.phone}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedDriver(driver);
                      setShowCreateForm(true);
                    }}
                    disabled={creatingAuth === driver.id}
                  >
                    {creatingAuth === driver.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Créer compte
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateForm && selectedDriver && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un compte pour {selectedDriver.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Définissez un mot de passe"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => createDriverAuth(selectedDriver)}
                disabled={creatingAuth === selectedDriver.id || !password.trim()}
              >
                {creatingAuth === selectedDriver.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Créer le compte
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedDriver(null);
                  setPassword('');
                }}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Comptes auth existants */}
      <Card>
        <CardHeader>
          <CardTitle>Comptes auth des livreurs</CardTitle>
          <CardDescription>
            Gérer les comptes de connexion existants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {driverAuthAccounts.length === 0 ? (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun compte auth de livreur trouvé
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {driverAuthAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{account.user_profiles.name}</h4>
                      <Badge variant="secondary">
                        {account.user_profiles.user_roles.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.user_profiles.email} • {account.user_profiles.phone_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Véhicule: {account.drivers.vehicle_type} • {account.drivers.vehicle_plate}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Créé le {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteDriverAuth(account.user_profile_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 