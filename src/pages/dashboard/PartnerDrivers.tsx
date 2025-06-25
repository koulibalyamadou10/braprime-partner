import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Motorcycle,
  Bike,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usePartnerDashboard } from '@/hooks/use-partner-dashboard';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const PartnerDrivers = () => {
  const { currentUser } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState<any>(null);

  // Formulaires
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_type: '',
    vehicle_plate: ''
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
  const { 
    business,
    drivers,
    driversLoading,
    driversError,
    addDriver,
    updateDriver,
    deleteDriver,
    isAuthenticated,
    currentUser: partnerCurrentUser
  } = usePartnerDashboard();

  // Vérifier l'authentification
  if (!isAuthenticated) {
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
  if (partnerCurrentUser?.role !== 'partner') {
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

    const result = await addDriver(addForm);
    
    if (result.success) {
      toast.success('Livreur ajouté avec succès');
      setIsAddDialogOpen(false);
      setAddForm({
        name: '',
        phone: '',
        email: '',
        vehicle_type: '',
        vehicle_plate: ''
      });
    } else {
      toast.error(result.error || 'Erreur lors de l\'ajout du livreur');
    }
  };

  const handleEditDriver = async () => {
    if (!editingDriver || !editForm.name || !editForm.phone) {
      toast.error('Le nom et le téléphone sont obligatoires');
      return;
    }

    const result = await updateDriver(editingDriver.id, editForm);
    
    if (result.success) {
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
      toast.error(result.error || 'Erreur lors de la mise à jour du livreur');
    }
  };

  const handleDeleteDriver = async () => {
    if (!deletingDriver) return;

    const result = await deleteDriver(deletingDriver.id);
    
    if (result.success) {
      toast.success('Livreur supprimé avec succès');
      setIsDeleteDialogOpen(false);
      setDeletingDriver(null);
    } else {
      toast.error(result.error || 'Erreur lors de la suppression du livreur');
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

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'motorcycle': return <Motorcycle className="h-4 w-4" />;
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

  if (driversLoading) {
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

  if (driversError) {
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
              <p className="text-red-500 mb-4">{driversError}</p>
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un Livreur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un Livreur</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau livreur à votre équipe de livraison.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={addForm.name}
                    onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nom et prénom du livreur"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    value={addForm.phone}
                    onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+224 123 456 789"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vehicle_type">Type de véhicule</Label>
                  <Select value={addForm.vehicle_type} onValueChange={(value) => setAddForm(prev => ({ ...prev, vehicle_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un véhicule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Voiture</SelectItem>
                      <SelectItem value="motorcycle">Moto</SelectItem>
                      <SelectItem value="bike">Vélo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vehicle_plate">Plaque d'immatriculation</Label>
                  <Input
                    id="vehicle_plate"
                    value={addForm.vehicle_plate}
                    onChange={(e) => setAddForm(prev => ({ ...prev, vehicle_plate: e.target.value }))}
                    placeholder="ABC 123"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddDriver}>
                  Ajouter
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

        {/* Dialog d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier le Livreur</DialogTitle>
              <DialogDescription>
                Modifiez les informations du livreur.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom complet *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom et prénom du livreur"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Téléphone *</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+224 123 456 789"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-vehicle_type">Type de véhicule</Label>
                <Select value={editForm.vehicle_type} onValueChange={(value) => setEditForm(prev => ({ ...prev, vehicle_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Voiture</SelectItem>
                    <SelectItem value="motorcycle">Moto</SelectItem>
                    <SelectItem value="bike">Vélo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-vehicle_plate">Plaque d'immatriculation</Label>
                <Input
                  id="edit-vehicle_plate"
                  value={editForm.vehicle_plate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, vehicle_plate: e.target.value }))}
                  placeholder="ABC 123"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={editForm.is_active}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="edit-is_active">Livreur actif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEditDriver}>
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
      </div>
    </DashboardLayout>
  );
};

export default PartnerDrivers; 