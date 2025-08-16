import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { DriverAuthPartnerService, CreateDriverAuthRequest } from '@/lib/services/driver-auth-partner';
import { Loader2, UserPlus, Key, Trash2, CheckCircle, XCircle, Users, Shield, AlertCircle } from 'lucide-react';

interface PartnerDriverAuthManagerProps {
  businessId: number;
}

export function PartnerDriverAuthManager({ businessId }: PartnerDriverAuthManagerProps) {
  const [driversWithoutAuth, setDriversWithoutAuth] = useState<any[]>([]);
  const [driverAuthAccounts, setDriverAuthAccounts] = useState<any[]>([]);
  const [driverStats, setDriverStats] = useState({
    totalDrivers: 0,
    driversWithAuth: 0,
    driversWithoutAuth: 0
  });
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
      const [driversResult, accountsResult, statsResult] = await Promise.all([
        DriverAuthPartnerService.getDriversWithoutAuth(businessId),
        DriverAuthPartnerService.getDriverAuthAccounts(businessId),
        DriverAuthPartnerService.getDriverStats(businessId)
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

      if (statsResult.error) {
        toast({
          title: "Erreur",
          description: statsResult.error,
          variant: "destructive"
        });
      }

      setDriversWithoutAuth(driversResult.drivers || []);
      setDriverAuthAccounts(accountsResult.accounts || []);
      setDriverStats({
        totalDrivers: statsResult.totalDrivers || 0,
        driversWithAuth: statsResult.driversWithAuth || 0,
        driversWithoutAuth: statsResult.driversWithoutAuth || 0
      });
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
    if (businessId) {
      loadData();
    }
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
        phone: driver.phone_number,
        password: password
      };

      const result = await DriverAuthPartnerService.createDriverAuthAccount(request);

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
  const deleteDriverAuth = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte auth ?')) {
      return;
    }

    try {
      const result = await DriverAuthPartnerService.deleteDriverAuthAccount(userId, businessId);

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
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Livreurs Totaux</p>
                <p className="text-2xl font-bold">{driverStats.totalDrivers}</p>
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
                <p className="text-2xl font-bold">{driverStats.driversWithAuth}</p>
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
                <p className="text-2xl font-bold">{driverStats.driversWithoutAuth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Livreurs sans compte auth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Livreurs sans compte de connexion
          </CardTitle>
          <CardDescription>
            Créez des comptes de connexion pour vos livreurs
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
                      {driver.email} • {driver.phone_number}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {driver.vehicle_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {driver.vehicle_plate}
                      </Badge>
                    </div>
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

      {/* Formulaire de création */}
      {showCreateForm && selectedDriver && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un compte pour {selectedDriver.name}</CardTitle>
            <CardDescription>
              Définissez un mot de passe sécurisé pour ce livreur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Définissez un mot de passe sécurisé"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Le livreur pourra se connecter avec son email et ce mot de passe
              </p>
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
          <CardTitle>Comptes de connexion existants</CardTitle>
          <CardDescription>
            Gérez les comptes de connexion de vos livreurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {driverAuthAccounts.length === 0 ? (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun compte de connexion trouvé pour vos livreurs
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {driverAuthAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{account.name}</h4>
                      <Badge variant="secondary">
                        {account.user_profiles?.user_roles?.name || 'Driver'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.email} • {account.phone_number}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {account.vehicle_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {account.vehicle_plate}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Créé le {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteDriverAuth(account.user_id)}
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