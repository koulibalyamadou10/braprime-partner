import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Package,
  User,
  Car,
  Zap,
  Bike,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Key,
  KeyRound,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerDriverAuthManager } from '@/components/dashboard/PartnerDriverAuthManager';
import { client } from '@/lib/wontant';
import { DriverAuthPartnerService } from '@/lib/services/driver-auth-partner';
import { DriverManagementService } from '@/lib/services/driver-management';
import { supabase } from '@/lib/supabase';

const PartnerDrivers = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState<any>(null);
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [resetPasswordDriver, setResetPasswordDriver] = useState<any>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // States locaux pour les données
  const [business, setBusiness] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulaires
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_type: '',
    vehicle_plate: '',
    createAuthAccount: false,
    password: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_type: '',
    vehicle_plate: '',
    is_active: true
  });

  // Fonctions directes pour gérer les données
  const loadBusinessData = async () => {
    try {
      if (!currentUser?.id) return;
      
      setIsLoading(true);
      
      // Récupérer le business du partenaire
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', currentUser.id)
        .single();
        
      if (businessError) {
        console.error('Erreur business:', businessError);
        setError('Erreur lors du chargement du business');
        return;
      }
      
      setBusiness(businessData);
      
      // Récupérer les drivers
      if (businessData?.id) {
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false });
          
        if (driversError) {
          console.error('Erreur drivers:', driversError);
          setError('Erreur lors du chargement des livreurs');
        } else {
          setDrivers(driversData || []);
        }
      }
    } catch (err) {
      console.error('Erreur générale:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Charger les données au montage
  useEffect(() => {
    if (currentUser?.id) {
      loadBusinessData();
    }
  }, [currentUser?.id]);

  // Fonction pour envoyer l'email de bienvenue avec timeout
  const sendWelcomeEmail = async (driverName: string, email: string, password: string, businessName: string) => {
    try {
      // Créer une promesse avec timeout de 10 secondes
      const emailPromise = client.sendMail({
        recipients: [email],
        template_name: 'send_mail_with_driver_credentials',
        server_name: 'default',
        params: {
          name: driverName,
          email: email,
          password: password,
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Email envoi trop long')), 10000)
      );

      const response = await Promise.race([emailPromise, timeoutPromise]);
      
      console.log('✅ Email de bienvenue envoyé avec succès !', response);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email :', error.message);
      return false;
    }
  };

  // Fonction pour générer un mot de passe aléatoire
  const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Fonction pour envoyer le nouveau mot de passe par email
  const sendPasswordResetEmail = async (driverName: string, email: string, newPassword: string, businessName: string) => {
    try {
      const emailPromise = client.sendMail({
        recipients: [email],
        template_name: 'driver_password_reset',
        server_name: 'default',
        params: {
          name: driverName,
          company: businessName || 'BraPrime',
          new_password: newPassword,
          email: email
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Email envoi trop long')), 10000)
      );

      const response = await Promise.race([emailPromise, timeoutPromise]);
      
      console.log('✅ Email de réinitialisation envoyé avec succès !', response);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email :', error.message);
      return false;
    }
  };

  // Fonction pour réinitialiser le mot de passe d'un livreur
  const handleResetPassword = async () => {
    if (!resetPasswordDriver?.email) {
      toast.error('Le livreur n\'a pas d\'email configuré');
      return;
    }

    setIsResettingPassword(true);

    try {
      // Générer un nouveau mot de passe
      const newPassword = generateRandomPassword();
      
      // Si le driver a déjà un user_id, réinitialiser le mot de passe
      if (resetPasswordDriver.user_id) {
        const resetResult = await DriverManagementService.resetDriverPassword(
          resetPasswordDriver.user_id,
          newPassword
        );

        if (!resetResult.error) {
          // Envoyer l'email avec le nouveau mot de passe
          const emailSent = await sendPasswordResetEmail(
            resetPasswordDriver.name,
            resetPasswordDriver.email,
            newPassword,
            business?.name || 'BraPrime'
          );

          if (emailSent) {
            toast.success('Mot de passe réinitialisé et envoyé par email avec succès');
          } else {
            toast.success('Mot de passe réinitialisé mais erreur lors de l\'envoi de l\'email');
          }
        } else {
          toast.error('Erreur lors de la réinitialisation du mot de passe');
          console.error('Erreur reset password:', resetResult.error);
        }
      } else {
        // Si le driver n'a pas de user_id, créer d'abord un compte d'authentification
        try {
          const authResult = await DriverAuthPartnerService.createDriverAuthAccount({
            driver_id: resetPasswordDriver.id,
            email: resetPasswordDriver.email,
            phone: resetPasswordDriver.phone,
            password: newPassword
          });

          if (authResult.success) {
            // Envoyer l'email avec le nouveau mot de passe
            const emailSent = await sendPasswordResetEmail(
              resetPasswordDriver.name,
              resetPasswordDriver.email,
              newPassword,
              business?.name || 'BraPrime'
            );

            if (emailSent) {
              toast.success('Compte créé et mot de passe envoyé par email avec succès');
            } else {
              toast.success('Compte créé mais erreur lors de l\'envoi de l\'email');
            }
          } else {
            toast.error('Erreur lors de la création du compte d\'authentification');
            console.error('Erreur création compte:', authResult.error);
          }
        } catch (error) {
          toast.error('Erreur lors de la création du compte d\'authentification');
          console.error('Erreur création compte:', error);
        }
      }
      
      setIsResetPasswordDialogOpen(false);
      setResetPasswordDriver(null);
    } catch (error) {
      console.error('Erreur générale:', error);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const openResetPasswordDialog = (driver: any) => {
    if (!driver.email) {
      toast.error('Ce livreur n\'a pas d\'email configuré');
      return;
    }
    setResetPasswordDriver(driver);
    setIsResetPasswordDialogOpen(true);
  };

  // Vérifier l'authentification
  if (!currentUser) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Livreurs">
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
  if (currentUser?.role !== 'partner') {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Livreurs">
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

  // Gestionnaires d'événements
  const handleAddDriver = async () => {
    if (!addForm.name || !addForm.phone) {
      toast.error('Le nom et le téléphone sont obligatoires');
      return;
    }

    if (addForm.createAuthAccount && !addForm.password) {
      toast.error('Le mot de passe est requis pour créer un compte de connexion');
      return;
    }

    if (!business?.id) {
      toast.error('Business non trouvé');
      return;
    }

    setIsAddingDriver(true);

    try {
      // Préparer les données du driver
      const driverData = {
        id: crypto.randomUUID(),
        name: addForm.name,
        phone: addForm.phone,
        email: addForm.email,
        vehicle_type: addForm.vehicle_type,
        vehicle_plate: addForm.vehicle_plate,
        business_id: business.id,
        is_active: true,
        rating: 0,
        total_deliveries: 0,
        total_earnings: 0,
        created_at: new Date().toISOString()
      };

      console.log('Données driver:', driverData);

      // Ajouter le driver directement avec Supabase
      const { data: newDriver, error: driverError } = await supabase
        .from('drivers')
        .insert([driverData])
        .select()
        .single();
        
      if (driverError) {
        console.error('Erreur ajout driver:', driverError);
        toast.error('Erreur lors de l\'ajout du livreur: ' + driverError.message);
        setIsAddingDriver(false);
        return;
      }
      
      console.log('Driver créé:', newDriver);
      
      // Mettre à jour la liste locale
      setDrivers(prev => [newDriver, ...prev]);
      
      console.log('Driver créé:', newDriver);
      
      // Si on doit créer un compte auth, le faire maintenant
      if (addForm.createAuthAccount && addForm.email && addForm.password) {
        try {
          const authResult = await DriverAuthPartnerService.createDriverAuthAccount({
            driver_id: newDriver.id,
            email: addForm.email,
            phone: addForm.phone,
            password: addForm.password
          });

          if (authResult.success) {
            toast.success('Livreur ajouté avec compte créé');
            
            // Envoyer l'email en arrière-plan (non-bloquant)
            const emailPromise = await client.sendMail({
              recipients: [addForm.email],
              template_name: 'send_mail_with_driver_credentials',
              server_name: 'default',
              params: {
                name: addForm.name,
                email: addForm.email,
                password: addForm.password,
              }
            });
           
              if (emailPromise.success) {
                toast.success('Email de bienvenue envoyé avec succès');
              } else {
                toast.error('Erreur lors de l\'envoi de l\'email de bienvenue');
              }
           
          } else {
            toast.error('Erreur lors de la création du compte de connexion');
            console.error('Erreur création compte auth:', authResult.error);
          }
        } catch (error) {
          toast.error('Erreur lors de la création du compte de connexion');
          console.error('Erreur création compte auth:', error);
        }
      } else {
        toast.success('Livreur ajouté avec succès');
      }

      // Afficher l'utilisateur connecté ici pour debuguer en recuperant depuis supabase
      const { data: user, error: userError } = await supabase.auth.getUser();
      console.log('Utilisateur connecté:', user);

      // Fermer la dialog et réinitialiser le formulaire immédiatement
      setIsAddDialogOpen(false);
      setAddForm({
        name: '',
        phone: '',
        email: '',
        vehicle_type: '',
        vehicle_plate: '',
        createAuthAccount: false,
        password: ''
      });
      
    } catch (error) {
      console.error('Erreur générale:', error);
      toast.error('Erreur lors de l\'ajout du livreur');
    } finally {
      setIsAddingDriver(false);
    }
  };

  const handleEditDriver = async () => {
    if (!editingDriver || !editForm.name || !editForm.phone) {
      toast.error('Le nom et le téléphone sont obligatoires');
      return;
    }

    try {
      const { data: updatedDriver, error } = await supabase
        .from('drivers')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          email: editForm.email,
          vehicle_type: editForm.vehicle_type,
          vehicle_plate: editForm.vehicle_plate,
          is_active: editForm.is_active
        })
        .eq('id', editingDriver.id)
        .select()
        .single();
        
      if (error) {
        console.error('Erreur mise à jour driver:', error);
        toast.error('Erreur lors de la mise à jour du livreur');
        return;
      }
      
      // Mettre à jour la liste locale
      setDrivers(prev => prev.map(d => d.id === editingDriver.id ? updatedDriver : d));
      
      toast.success('Livreur mis à jour avec succès');
      setIsEditDialogOpen(false);
      setEditingDriver(null);
      setEditForm({
        name: '',
        phone: '',
        email: '',
        vehicle_type: '',
        vehicle_plate: '',
        is_active: true
      });
    } catch (error) {
      console.error('Erreur générale:', error);
      toast.error('Erreur lors de la mise à jour du livreur');
    }
  };

  const handleDeleteDriver = async () => {
    if (!deletingDriver) return;

    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', deletingDriver.id);
        
      if (error) {
        console.error('Erreur suppression driver:', error);
        toast.error('Erreur lors de la suppression du livreur');
        return;
      }
      
      // Mettre à jour la liste locale
      setDrivers(prev => prev.filter(d => d.id !== deletingDriver.id));
      
      toast.success('Livreur supprimé avec succès');
      setIsDeleteDialogOpen(false);
      setDeletingDriver(null);
    } catch (error) {
      console.error('Erreur générale:', error);
      toast.error('Erreur lors de la suppression du livreur');
    }
  };

  const openEditDialog = (driver: any) => {
    setEditingDriver(driver);
    setEditForm({
      name: driver.name,
      phone: driver.phone,
      email: driver.email || '',
      vehicle_type: driver.vehicle_type || '',
      vehicle_plate: driver.vehicle_plate || '',
      is_active: driver.is_active
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (driver: any) => {
    setDeletingDriver(driver);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (driver: any) => {
    navigate(`/partner-dashboard/drivers/${driver.id}`);
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'motorcycle': return <Zap className="h-4 w-4" />;
      case 'bike': return <Bike className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  const getVehicleLabel = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car': return 'Voiture';
      case 'motorcycle': return 'Moto';
      case 'bike': return 'Vélo';
      default: return 'Véhicule';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Livreurs">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Gestion des Livreurs</h2>
              <p className="text-gray-500">Chargement...</p>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Gestion des Livreurs">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Gestion des Livreurs</h2>
              <p className="text-gray-500">Erreur lors du chargement</p>
            </div>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-500 mb-4">{error}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={partnerNavItems} title="Gestion des Livreurs">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des Livreurs</h2>
            <p className="text-gray-500">
              Gérez votre équipe de livreurs pour assurer la livraison de vos commandes.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => !isAddingDriver && setIsAddDialogOpen(open)}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un Livreur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un Livreur</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau livreur à votre équipe de livraison.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm">Nom complet *</Label>
                    <Input
                      id="name"
                      value={addForm.name}
                      onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom et prénom"
                      className="text-sm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-sm">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={addForm.phone}
                      onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+224 123 456 789"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vehicle_type" className="text-sm">Type de véhicule</Label>
                    <Select value={addForm.vehicle_type} onValueChange={(value) => setAddForm(prev => ({ ...prev, vehicle_type: value }))}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Voiture</SelectItem>
                        <SelectItem value="motorcycle">Moto</SelectItem>
                        <SelectItem value="bike">Vélo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vehicle_plate" className="text-sm">Plaque d'immatriculation</Label>
                    <Input
                      id="vehicle_plate"
                      value={addForm.vehicle_plate}
                      onChange={(e) => setAddForm(prev => ({ ...prev, vehicle_plate: e.target.value }))}
                      placeholder="ABC 123"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {/* Section création de compte auth */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="create-auth"
                      checked={addForm.createAuthAccount}
                      onCheckedChange={(checked) => setAddForm(prev => ({ 
                        ...prev, 
                        createAuthAccount: checked,
                        password: checked ? prev.password : ''
                      }))}
                    />
                    <Label htmlFor="create-auth" className="font-medium text-sm">
                      Créer un compte de connexion
                    </Label>
                  </div>
                  
                  {addForm.createAuthAccount && (
                    <div className="space-y-3 pl-4 border-l-2 border-blue-200 bg-blue-50/30 rounded-r-lg p-3">
                      <div className="grid gap-2">
                        <Label htmlFor="auth-email" className="text-sm">Email pour la connexion *</Label>
                        <Input
                          id="auth-email"
                          type="email"
                          value={addForm.email}
                          onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                          required={addForm.createAuthAccount}
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Le livreur utilisera cet email pour se connecter
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="auth-password" className="text-sm">Mot de passe *</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="auth-password"
                            type="password"
                            value={addForm.password}
                            onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Mot de passe sécurisé"
                            required={addForm.createAuthAccount}
                            className="text-sm flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPassword = generateRandomPassword();
                              setAddForm(prev => ({ ...prev, password: newPassword }));
                            }}
                            title="Générer un mot de passe sécurisé"
                            className="px-3"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Un email de bienvenue avec ces informations sera automatiquement envoyé au livreur
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)} 
                  size="sm"
                  disabled={isAddingDriver}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddDriver} 
                  size="sm"
                  disabled={isAddingDriver}
                >
                  {isAddingDriver ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter le livreur
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Livreurs</p>
                  <p className="text-2xl font-bold">{drivers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold">{drivers.filter(d => d.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Livraisons Totales</p>
                  <p className="text-2xl font-bold">
                    {drivers.reduce((sum, d) => sum + (d.total_deliveries || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                  <p className="text-2xl font-bold">
                    {drivers.length > 0 
                      ? (drivers.reduce((sum, d) => sum + (d.rating || 0), 0) / drivers.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Liste des Livreurs
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Comptes de Connexion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Liste des livreurs */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des Livreurs</CardTitle>
                <CardDescription>
                  Gérez votre équipe de livreurs et leurs informations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {drivers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Livreur</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Véhicule</TableHead>
                        <TableHead>Statistiques</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{driver.name}</p>
                                <p className="text-sm text-gray-500">ID: {driver.id.slice(0, 8)}...</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3 text-gray-500" />
                                <span className="text-sm">{driver.phone}</span>
                              </div>
                              {driver.email && (
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-3 w-3 text-gray-500" />
                                  <span className="text-sm">{driver.email}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {driver.vehicle_type ? (
                              <div className="flex items-center space-x-2">
                                {getVehicleIcon(driver.vehicle_type)}
                                <div>
                                  <p className="text-sm font-medium">{getVehicleLabel(driver.vehicle_type)}</p>
                                  {driver.vehicle_plate && (
                                    <p className="text-xs text-gray-500">{driver.vehicle_plate}</p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Non spécifié</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Package className="h-3 w-3 text-gray-500" />
                                <span className="text-sm">{driver.total_deliveries || 0} livraisons</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Star className="h-3 w-3 text-gray-500" />
                                <span className="text-sm">{driver.rating || 0} étoiles</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(driver.is_active)}
                              <Badge variant={driver.is_active ? "default" : "secondary"}>
                                {driver.is_active ? "Actif" : "Inactif"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(driver)}
                                title="Voir les détails"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(driver)}
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {driver.email && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openResetPasswordDialog(driver)}
                                  title="Réinitialiser le mot de passe"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <KeyRound className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(driver)}
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Aucun livreur ajouté</p>
                    <p className="text-sm text-gray-400">
                      Commencez par ajouter votre premier livreur pour assurer la livraison de vos commandes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <PartnerDriverAuthManager businessId={business?.id || 0} />
          </TabsContent>
        </Tabs>

        {/* Dialog d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le Livreur</DialogTitle>
              <DialogDescription>
                Modifiez les informations du livreur.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
                              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name" className="text-sm">Nom complet *</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom et prénom"
                      className="text-sm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-phone" className="text-sm">Téléphone *</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+224 123 456 789"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-email" className="text-sm">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-vehicle_type" className="text-sm">Type de véhicule</Label>
                    <Select value={editForm.vehicle_type} onValueChange={(value) => setEditForm(prev => ({ ...prev, vehicle_type: value }))}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Voiture</SelectItem>
                        <SelectItem value="motorcycle">Moto</SelectItem>
                        <SelectItem value="bike">Vélo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-vehicle_plate" className="text-sm">Plaque d'immatriculation</Label>
                    <Input
                      id="edit-vehicle_plate"
                      value={editForm.vehicle_plate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, vehicle_plate: e.target.value }))}
                      placeholder="ABC 123"
                      className="text-sm"
                    />
                  </div>
                </div>
                              <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                  <Switch
                    id="edit-is_active"
                    checked={editForm.is_active}
                    onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="edit-is_active" className="text-sm">Livreur actif</Label>
                </div>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} size="sm">
                Annuler
              </Button>
              <Button onClick={handleEditDriver} size="sm">
                Mettre à jour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de suppression */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le Livreur</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce livreur ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Livreur: <strong>{deletingDriver?.name}</strong>
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteDriver}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de réinitialisation de mot de passe */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {resetPasswordDriver?.user_id ? 'Réinitialiser le Mot de Passe' : 'Créer un Compte de Connexion'}
              </DialogTitle>
              <DialogDescription>
                {resetPasswordDriver?.user_id 
                  ? 'Êtes-vous sûr de vouloir réinitialiser le mot de passe de ce livreur ? Un nouveau mot de passe sera généré automatiquement et envoyé par email.'
                  : 'Ce livreur n\'a pas encore de compte de connexion. Voulez-vous créer un compte avec un mot de passe automatique ?'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  <strong>Livreur:</strong> {resetPasswordDriver?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {resetPasswordDriver?.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Statut:</strong> {resetPasswordDriver?.user_id ? 'Compte existant' : 'Aucun compte'}
                </p>
                <div className={`p-3 rounded-lg ${resetPasswordDriver?.user_id ? 'bg-blue-50' : 'bg-green-50'}`}>
                  <div className="flex items-start space-x-2">
                    <Mail className={`h-4 w-4 mt-0.5 ${resetPasswordDriver?.user_id ? 'text-blue-600' : 'text-green-600'}`} />
                    <div className={`text-xs ${resetPasswordDriver?.user_id ? 'text-blue-700' : 'text-green-700'}`}>
                      <p className="font-medium">Ce qui va se passer :</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Un nouveau mot de passe sera généré automatiquement</li>
                        {resetPasswordDriver?.user_id && <li>• L'ancien mot de passe sera invalidé</li>}
                        {!resetPasswordDriver?.user_id && <li>• Un compte de connexion sera créé</li>}
                        <li>• Le mot de passe sera envoyé par email au livreur</li>
                        <li>• Le livreur pourra se connecter avec ces identifiants</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsResetPasswordDialogOpen(false)}
                disabled={isResettingPassword}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleResetPassword}
                disabled={isResettingPassword}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {resetPasswordDriver?.user_id ? 'Réinitialisation...' : 'Création...'}
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    {resetPasswordDriver?.user_id ? 'Réinitialiser et Envoyer' : 'Créer et Envoyer'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDrivers; 