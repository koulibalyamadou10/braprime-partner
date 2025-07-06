import React, { useState } from 'react';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import { useDriverManagement } from '@/hooks/use-driver-management';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Truck, 
  Star,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Package,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  Plus,
  User,
  Car,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const AdminDrivers = () => {
  const {
    drivers,
    driversTotal,
    driversPage,
    driversSearch,
    availableBusinesses,
    loading,
    error,
    handleDriversSearch,
    handleDriversPageChange,
    refreshData
  } = useAdminDashboard();

  const {
    createDriver,
    loading: createLoading
  } = useDriverManagement();

  const [searchTerm, setSearchTerm] = useState(driversSearch);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // État du formulaire de création
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    driver_type: 'independent' as 'independent' | 'service',
    business_id: '',
    vehicle_type: '',
    vehicle_plate: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleDriversSearch(searchTerm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('L\'email est requis');
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error('Le numéro de téléphone est requis');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.driver_type === 'service' && !formData.business_id) {
      toast.error('Veuillez sélectionner un service/commerce');
      return false;
    }

    return true;
  };

  const handleCreateDriver = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const success = await createDriver({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        driver_type: formData.driver_type,
        business_id: formData.driver_type === 'service' ? parseInt(formData.business_id) : undefined,
        vehicle_type: formData.vehicle_type || undefined,
        vehicle_plate: formData.vehicle_plate || undefined
      });

      if (success) {
        setIsCreateModalOpen(false);
        resetForm();
        refreshData(); // Recharger la liste des livreurs
      }
    } catch (err) {
      toast.error('Erreur lors de la création du livreur');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      driver_type: 'independent',
      business_id: '',
      vehicle_type: '',
      vehicle_plate: ''
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M GNF`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };

  const getStatusBadge = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Inactif
        </Badge>
      );
    }
    
    if (!isVerified) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          En attente
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Vérifié
      </Badge>
    );
  };

  const totalPages = Math.ceil(driversTotal / 10);

  if (loading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Gestion des Livreurs">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Gestion des Livreurs">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Gestion des Livreurs">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des Livreurs</h2>
            <p className="text-muted-foreground">
              Gérez tous les livreurs de la plateforme - {driversTotal} livreurs au total
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="icon" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* Modal de création */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un livreur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau livreur</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau compte livreur avec toutes les informations nécessaires.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Informations personnelles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informations personnelles</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Nom complet du livreur"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+224 123 456 789"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="livreur@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Au moins 6 caractères"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Type de livreur */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Type de livreur</h3>
                    
                    <div className="space-y-2">
                      <Label>Type de livreur *</Label>
                      <Select
                        value={formData.driver_type}
                        onValueChange={(value) => handleSelectChange('driver_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="independent">
                            <div className="flex items-center">
                              <Truck className="mr-2 h-4 w-4" />
                              Livreur indépendant
                            </div>
                          </SelectItem>
                          <SelectItem value="service">
                            <div className="flex items-center">
                              <Building className="mr-2 h-4 w-4" />
                              Livreur de service
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.driver_type === 'service' && (
                      <div className="space-y-2">
                        <Label>Service/Commerce *</Label>
                        <Select
                          value={formData.business_id}
                          onValueChange={(value) => handleSelectChange('business_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un service" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBusinesses.length === 0 ? (
                              <SelectItem value="no-business" disabled>
                                Aucun commerce disponible
                              </SelectItem>
                            ) : (
                              availableBusinesses.map((business) => (
                                <SelectItem key={business.id} value={business.id.toString()}>
                                  {business.name} ({business.business_type})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Informations véhicule */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informations véhicule</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle_type">Type de véhicule</Label>
                        <div className="relative">
                          <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="vehicle_type"
                            name="vehicle_type"
                            type="text"
                            placeholder="Moto, Voiture, etc."
                            value={formData.vehicle_type}
                            onChange={handleInputChange}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicle_plate">Plaque d'immatriculation</Label>
                        <Input
                          id="vehicle_plate"
                          name="vehicle_plate"
                          type="text"
                          placeholder="ABC-123-DE"
                          value={formData.vehicle_plate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreateDriver}
                    disabled={createLoading}
                  >
                    {createLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Créer le livreur
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Livreurs</p>
                  <p className="text-2xl font-bold">{driversTotal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Livreurs Actifs</p>
                  <p className="text-2xl font-bold">
                    {drivers.filter(d => d.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Livraisons Moyennes</p>
                  <p className="text-2xl font-bold">
                    {drivers.length > 0 
                      ? Math.round(drivers.reduce((sum, d) => sum + (d.total_deliveries || 0), 0) / drivers.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Gains Moyens</p>
                  <p className="text-2xl font-bold">
                    {drivers.length > 0 
                      ? formatCurrency(Math.round(drivers.reduce((sum, d) => sum + (d.total_earnings || 0), 0) / drivers.length))
                      : '0 GNF'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche et filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Rechercher des livreurs</CardTitle>
            <CardDescription>
              Trouvez rapidement un livreur par nom ou téléphone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  handleDriversSearch('');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Liste des livreurs */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Livreurs</CardTitle>
            <CardDescription>
              {drivers.length} livreurs affichés sur {driversTotal} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Livreur</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Commerce</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Gains</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={driver.avatar_url} />
                            <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-gray-500">ID: {driver.id.slice(-8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {driver.phone}
                          </div>
                          {driver.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-1" />
                              {driver.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {driver.business_name ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            {driver.business_name}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Indépendant</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(driver.is_active, driver.is_verified)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Star className="h-4 w-4 mr-1 text-yellow-600" />
                            {driver.rating.toFixed(1)} / 5.0
                          </div>
                          <div className="flex items-center text-sm">
                            <Package className="h-4 w-4 mr-1 text-blue-600" />
                            {driver.total_deliveries} livraisons
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 text-purple-600" />
                            {driver.active_sessions} sessions actives
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(driver.total_earnings)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {driver.documents_count} documents
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {driver.vehicle_type && (
                            <div className="text-sm">
                              {driver.vehicle_type}
                            </div>
                          )}
                          {driver.vehicle_plate && (
                            <div className="text-xs text-gray-500">
                              {driver.vehicle_plate}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(driver.created_at), 'dd/MM/yyyy', { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handleDriversPageChange(driversPage - 1)}
                        className={driversPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handleDriversPageChange(page)}
                            isActive={page === driversPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handleDriversPageChange(totalPages)}
                            isActive={totalPages === driversPage}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handleDriversPageChange(driversPage + 1)}
                        className={driversPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDrivers; 