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
  Loader2,
  Send
} from 'lucide-react';
import { usePartnerDashboard } from '@/hooks/use-partner-dashboard';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerDriverAuthManager } from '@/components/dashboard/PartnerDriverAuthManager';
import { supabase } from '@/lib/supabase';
import { KCreateDriverAuthRequest, KDriverAuthPartnerService } from '@/lib/kservices/k-driver-auth-partner';
import { KBusinessService } from '@/lib/kservices/k-business';
import { DRIVER_TYPE_INDEPENDENT } from '@/lib/kservices/k-constant';
import { DriverCredentials } from '@/components/mails/DriverCredentials';
import { renderToStaticMarkup } from 'react-dom/server';
import { client } from '@/lib/kservices/k-wontan';



const PartnerDrivers = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState<any>(null);
  const [drivers, setDrivers] = useState<KCreateDriverAuthRequest[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const driverAuthService = new KDriverAuthPartnerService();

  // Nouveaux états pour le loading et la confirmation d'envoi
  const [isCreatingDriver, setIsCreatingDriver] = useState(false);
  const [showPasswordSendDialog, setShowPasswordSendDialog] = useState(false);
  const [createdDriver, setCreatedDriver] = useState<any>(null);

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

  // Utiliser le hook pour les données
  // const { 
    // business,
    // isDriversLoading,
    // driversError,
    // isBusinessLoading,
    // addDriver,
    // updateDriver,
    // deleteDriver,
    // isAuthenticated,
    // currentUser: partnerCurrentUser
  // } = usePartnerDashboard();

  useEffect(() => {
    async function getUser() {
      const { data: user, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      } else {
        console.log('Utilisateur connecté:', user);
      }
    }

    async function getDrivers() {
      const business = await getBusiness();
      setBusiness(business);
      console.log('business pro getdrivers', business);
      if (business === null) {
        toast.error('Business non trouvé. Veuillez réessayer.');
        return;
      }

      const drivers = await driverAuthService.getDrivers(business.id);
      if ( drivers.length > 0 ) {
        return drivers;
      }
      else {
        return [];
      }
    }

    async function getBusiness() {
      const business = await KBusinessService.getBusiness(currentUser!.id);
      return business;
    }

    async function loadDrivers() {
      const drivers = await getDrivers();
      setDrivers(drivers);
    }

    getUser() // appeler la fonction getUser
    loadDrivers() // appeler la fonction getDrivers
  }, []);


  // Gestionnaires d'événements
  const handleAddDriver = async () => {
    try {
      if (!addForm.name || !addForm.phone) {
        toast.error('Le nom et le téléphone sont obligatoires');
        console.log('Le nom et le téléphone sont obligatoires');
        return;
      }

      
      if (addForm.createAuthAccount && !addForm.password) {
        toast.error('Le mot de passe est requis pour créer un compte de connexion');
        console.log('Le mot de passe est requis pour créer un compte de connexion');
        return;
      }

      setIsCreatingDriver(true);
      console.log('business pro handleAddDriver', business);
      const driverAuthResult = await driverAuthService.createDriverAuthAccount({
        email: addForm.email,
        password: addForm.password,
        business_id: business.id,
        name: addForm.name,
        phone_number: addForm.phone,
        type: DRIVER_TYPE_INDEPENDENT,
        vehicle_type: addForm.vehicle_type,
        vehicle_plate: addForm.vehicle_plate
      });
      console.log('driverAuthResult', driverAuthResult);

      if (driverAuthResult) {
        // faire disparaitre le formaulaire dajout
        setIsAddDialogOpen(false);
        setIsCreatingDriver(false);
        setCreatedDriver(driverAuthResult);
        
        // Si un compte auth a été créé, montrer le popup de confirmation
        if (addForm.createAuthAccount) {
          setShowPasswordSendDialog(true);
        } else {
          toast.success('Livreur créé avec succès');
          setIsAddDialogOpen(false);
          resetAddForm();
        }
        
        // Recharger la liste des livreurs
        const updatedDrivers = await driverAuthService.getDrivers(business.id);
        setDrivers(updatedDrivers || []);
      }
      else {
        setIsCreatingDriver(false);
        toast.error('Erreur lors de la création du livreur');
      }
    
      
    } catch (error) {
      setIsCreatingDriver(false);
      console.log(error);
      toast.error(error.message);
    }
  };

  // Fonction pour réinitialiser le formulaire d'ajout
  const resetAddForm = () => {
    setAddForm({
      name: '',
      phone: '',
      email: '',
      vehicle_type: '',
      vehicle_plate: '',
      createAuthAccount: false,
      password: ''
    });
  };

  // Fonction pour envoyer le mot de passe par email
  const handleSendPasswordByEmail = async () => {
    try {
      const templateContent = renderToStaticMarkup(
          DriverCredentials({
        email: createdDriver.email,
        password: createdDriver.password,
        driverName: createdDriver.name,
        businessName: business.name
      }));

      const result = await client.sendMailWithTemplate({
        recipients: [createdDriver.email],
        subject: "Vos identifiants de connexion",
        template_content: templateContent,
      })

      console.log('result', result);

      toast.success('Mot de passe envoyé par email avec succès');
      setShowPasswordSendDialog(false);
      setIsAddDialogOpen(false);
      resetAddForm();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi par email');
    }
  };

  // Fonction pour envoyer le mot de passe par SMS
  const handleSendPasswordBySMS = async () => {
    try {
      // TODO: Implémenter l'envoi par SMS
      toast.success('Mot de passe envoyé par SMS avec succès');
      setShowPasswordSendDialog(false);
      setIsAddDialogOpen(false);
      resetAddForm();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi par SMS');
    }
  };

  const handleEditDriver = async () => {
    if (!editingDriver || !editForm.name || !editForm.phone) {
      toast.error('Le nom et le téléphone sont obligatoires');
      return;
    }

    const result = await driverAuthService.updateDriver(editingDriver.id, editForm);
    
    if (result) {
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
    } else {
      toast.error('Erreur lors de la mise à jour du livreur');
    }
  };

  const handleDeleteDriver = async () => {
    if (!deletingDriver) return;

    const result = await driverAuthService.deleteDriver(deletingDriver.id);
    
    if (result) {
      toast.success('Livreur supprimé avec succès');
      setIsDeleteDialogOpen(false);
      setDeletingDriver(null);
    } else {
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center gap-2"
                disabled={business === null}
              >
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
                        <Input
                          id="auth-password"
                          type="password"
                          value={addForm.password}
                          onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Mot de passe sécurisé"
                          required={addForm.createAuthAccount}
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Communiquez ce mot de passe de manière sécurisée au livreur
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} size="sm">
                  Annuler
                </Button>
                <button 
                  onClick={handleAddDriver}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                  disabled={isCreatingDriver}
                >
                                     {isCreatingDriver ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   ) : (
                     <Plus className="mr-2 h-4 w-4" />
                   )}
                  {isCreatingDriver ? 'Création...' : 'Ajouter le livreur'}
                </button>
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
                    0
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
                    0
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
                                <span className="text-sm">{driver.phone_number}</span>
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
                                <span className="text-sm">0 livraisons</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Star className="h-3 w-3 text-gray-500" />
                                <span className="text-sm">0 étoiles</span>
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
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(driver)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(driver)}
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

        {/* Dialog de confirmation d'envoi du mot de passe */}
        <Dialog open={showPasswordSendDialog} onOpenChange={setShowPasswordSendDialog}>
          <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Mot de passe créé avec succès</DialogTitle>
              <DialogDescription>
                Le compte de connexion pour le livreur <strong>{createdDriver?.name}</strong> a été créé.
                Veuillez partager le mot de passe avec le livreur.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="password-for-driver" className="text-sm">Mot de passe pour le livreur</Label>
                <Input
                  id="password-for-driver"
                  type="password"
                  value={createdDriver?.password}
                  readOnly
                  className="text-sm"
                />
                <p className="text-xs text-gray-500">
                  Veuillez copier ce mot de passe et le partager de manière sécurisée au livreur.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleSendPasswordByEmail} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer par Email
                </Button>
                <Button variant="outline" onClick={handleSendPasswordBySMS} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer par SMS
                </Button>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button onClick={() => setShowPasswordSendDialog(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDrivers; 