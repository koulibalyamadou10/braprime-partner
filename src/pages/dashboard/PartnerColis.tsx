import Unauthorized from '@/components/Unauthorized';
import { ColisRestrictionNotice } from '@/components/dashboard/ColisRestrictionNotice';
import { useCurrencyRole } from '@/contexts/UseRoleContext';
import { isInternalUser } from '@/hooks/use-internal-users';
import { Colis, ColisStatus, CreateColisData, usePartnerColis } from '@/hooks/use-partner-colis';
import { UserWithBusiness } from '@/lib/kservices/k-helpers';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    Eye,
    Loader2,
    MapPin,
    Package,
    Phone,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Truck,
    User,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import DashboardLayout, { partnerNavItems } from '../../components/dashboard/DashboardLayout';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/use-toast';

// Interface pour le business
interface Business {
  id: number;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  owner_id: string;
}

const PartnerColis = () => {
  const { currencyRole, roles } = useCurrencyRole();

  if (!roles.includes("admin")) {
    return <Unauthorized />;
  }

  const { toast } = useToast();
  
  // États pour les données utilisateur et business
  const [userData, setUserData] = useState<UserWithBusiness | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // États pour les colis
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedColis, setSelectedColis] = useState<Colis | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // États pour le formulaire de création
  const [formData, setFormData] = useState<CreateColisData>({
    service_name: '',
    service_price: 0,
    package_weight: '',
    package_dimensions: '',
    package_description: '',
    is_fragile: false,
    is_urgent: false,
    pickup_address: '',
    pickup_instructions: '',
    delivery_address: '',
    delivery_instructions: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    preferred_time: '',
    contact_method: 'phone',
    pickup_time: '',
    drop_time: '',
    pickup_date: '',
    drop_date: '',
  });

  // Utiliser le hook personnalisé pour les colis
  const {
    colis,
    isLoading: isLoadingColis,
    error: colisError,
    isCreating,
    isUpdating,
    isDeleting,
    createColis,
    updateColis,
    deleteColis,
    updateColisStatus,
    loadColis
  } = usePartnerColis(business?.id || null);

  // Charger les données utilisateur et business
  const loadUserData = async () => {
    try {
      setIsLoadingUser(true);
      setUserError(null);
      
      const {
        isInternal, 
        data, 
        user : userOrigin, 
        businessId: businessIdOrigin,
        businessData: businessDataOrigin
      } = await isInternalUser()    
      
      if (businessIdOrigin !== null) {
        setUserData(userOrigin as UserWithBusiness);
        setBusiness(businessDataOrigin as Business);
      } else {
        setUserError('Aucun business associé à votre compte partenaire');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err);
      setUserError('Erreur lors du chargement des données utilisateur');
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadUserData();
  }, []);

  // Vérifier si le business est de type "package" pour accéder aux colis
  const isPackageBusiness = business?.business_type_id === 64; // ID du type "packages" dans la base

  // Afficher un message si le business n'est pas de type "package"
  if (!isLoadingUser && business && !isPackageBusiness) {
    return (
      <DashboardLayout navItems={partnerNavItems} businessTypeId={business?.business_type_id}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Colis</h1>
              <p className="text-muted-foreground">
                Gérez vos services de livraison de colis
              </p>
            </div>
          </div>
          
          <ColisRestrictionNotice businessType={business.business_type} />
        </div>
      </DashboardLayout>
    );
  }

  // Filtrer les colis
  const filteredColis = colis.filter(colis => {
    const matchesSearch = 
      (colis.tracking_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      colis.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colis.customer_phone.includes(searchTerm) ||
      (colis.package_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      colis.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || colis.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: colis.length,
    pending: colis.filter(c => c.status === 'pending').length,
    confirmed: colis.filter(c => c.status === 'confirmed').length,
    picked_up: colis.filter(c => c.status === 'picked_up').length,
    in_transit: colis.filter(c => c.status === 'in_transit').length,
    delivered: colis.filter(c => c.status === 'delivered').length,
    cancelled: colis.filter(c => c.status === 'cancelled').length
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusColor = (status: ColisStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status: ColisStatus) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'picked_up': return 'Récupéré';
      case 'in_transit': return 'En transit';
      case 'delivered': return 'Livré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: ColisStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'picked_up': return <Package className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (colis: Colis) => {
    setSelectedColis(colis);
    setIsDetailsOpen(true);
  };

  const handleCreateColis = () => {
    setIsCreateOpen(true);
  };

  const handleSubmitCreateColis = async () => {
    if (!formData.service_name || !formData.customer_name || !formData.customer_phone || !formData.pickup_address || !formData.delivery_address) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const success = await createColis(formData);
    if (success) {
      setIsCreateOpen(false);
      // Réinitialiser le formulaire
      setFormData({
        service_name: '',
        service_price: 0,
        package_weight: '',
        package_dimensions: '',
        package_description: '',
        is_fragile: false,
        is_urgent: false,
        pickup_address: '',
        pickup_instructions: '',
        delivery_address: '',
        delivery_instructions: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        preferred_time: '',
        contact_method: 'phone',
        pickup_time: '',
        drop_time: '',
        pickup_date: '',
        drop_date: '',
      });
    }
  };

  const handleUpdateColisStatus = async (colisId: string, status: ColisStatus) => {
    await updateColisStatus(colisId, status);
  };

  const handleDeleteColis = async (colisId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce colis ?')) {
      await deleteColis(colisId);
    }
  };

  const handleExportData = () => {
    // Export CSV avec les vraies données
    const csvContent = [
      ['Numéro de suivi', 'Service', 'Client', 'Téléphone', 'Description', 'Statut', 'Date de création'],
      ...filteredColis.map(c => [
        c.tracking_number || c.id.slice(0, 8),
        c.service_name,
        c.customer_name,
        c.customer_phone,
        c.package_description || '',
        getStatusText(c.status),
        new Date(c.created_at).toLocaleDateString('fr-FR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `colis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export réussi",
      description: "Les données ont été exportées en CSV",
    });
  };

  // Vérifier si l'utilisateur est authentifié et si le business est chargé
  if (!business && isLoadingUser) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord partenaire" businessTypeId={business?.business_type_id}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Gestion des Colis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord partenaire" businessTypeId={business?.business_type_id}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Aucun Business Trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Aucun business n'est associé à votre compte partenaire.
            </p>
            <Button onClick={loadUserData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (userError) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord partenaire" businessTypeId={business?.business_type_id}>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Gestion des Colis</h2>
              <p className="text-gray-500">Erreur lors du chargement des données.</p>
            </div>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-500 mb-4">{userError}</p>
              <Button onClick={loadUserData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={partnerNavItems} title="Tableau de bord partenaire">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion des Colis</h2>
            <p className="text-muted-foreground">
              Gérez et suivez tous vos colis de livraison pour {business.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData} disabled={filteredColis.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={handleCreateColis}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau colis
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Colis</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmés</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Récupérés</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.picked_up}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En transit</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.in_transit}</p>
                </div>
                <Truck className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Livrés</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par numéro de suivi, expéditeur, destinataire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="picked_up">Récupéré</SelectItem>
                  <SelectItem value="in_transit">En transit</SelectItem>
                  <SelectItem value="delivered">Livré</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table des colis */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Colis</CardTitle>
            <CardDescription>
              {filteredColis.length} colis trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro de suivi</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColis.map((colis) => (
                    <TableRow key={colis.id}>
                      <TableCell className="font-medium">
                        {colis.tracking_number || colis.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{colis.service_name}</p>
                          <p className="text-sm text-muted-foreground">{colis.service_price.toLocaleString()} FCFA</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{colis.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{colis.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{colis.package_description || 'Aucune description'}</p>
                          <p className="text-sm text-muted-foreground">
                            {colis.package_weight} • {colis.package_dimensions || 'Dimensions non spécifiées'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(colis.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(colis.status)}
                            {getStatusText(colis.status)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {new Date(colis.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(colis.created_at).toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(colis)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteColis(colis.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Dialog de détails */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails du Colis</DialogTitle>
              <DialogDescription>
                Informations complètes du colis {selectedColis?.tracking_number}
              </DialogDescription>
            </DialogHeader>
            
            {selectedColis && (
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations Client</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{selectedColis.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedColis.customer_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{selectedColis.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Contact: {selectedColis.contact_method}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Adresses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="font-medium text-sm text-gray-600">Point de collecte:</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedColis.pickup_address}</span>
                        </div>
                        {selectedColis.pickup_instructions && (
                          <p className="text-xs text-gray-500 mt-1">📝 {selectedColis.pickup_instructions}</p>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-600">Adresse de livraison:</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedColis.delivery_address}</span>
                        </div>
                        {selectedColis.delivery_instructions && (
                          <p className="text-xs text-gray-500 mt-1">📝 {selectedColis.delivery_instructions}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Détails du colis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Détails du Colis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                        <p className="font-medium">{selectedColis.service_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Prix du service</Label>
                        <p className="font-medium">{selectedColis.service_price.toLocaleString()} FCFA</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Poids</Label>
                        <p className="font-medium">{selectedColis.package_weight}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Dimensions</Label>
                        <p className="font-medium">{selectedColis.package_dimensions || 'Non spécifiées'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fragile</Label>
                        <p className="font-medium">{selectedColis.is_fragile ? 'Oui' : 'Non'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Urgent</Label>
                        <p className="font-medium">{selectedColis.is_urgent ? 'Oui' : 'Non'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                        <p className="font-medium">{selectedColis.package_description || 'Aucune description'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Statut actuel</Label>
                        <Badge className={getStatusColor(selectedColis.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(selectedColis.status)}
                            {getStatusText(selectedColis.status)}
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informations de livraison */}
                {(selectedColis.driver_name || selectedColis.estimated_delivery_time) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations de Livraison</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedColis.driver_name && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Chauffeur assigné: {selectedColis.driver_name}</span>
                        </div>
                      )}
                      {selectedColis.estimated_delivery_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Livraison prévue: {new Date(selectedColis.estimated_delivery_time).toLocaleString('fr-FR')}</span>
                        </div>
                      )}
                      {selectedColis.actual_delivery_time && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Livré le: {new Date(selectedColis.actual_delivery_time).toLocaleString('fr-FR')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Informations supplémentaires */}
                {(selectedColis.pickup_time || selectedColis.drop_time || selectedColis.preferred_time) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Horaires et Préférences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedColis.preferred_time && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heure préférée:</span>
                          <span className="font-medium">{selectedColis.preferred_time}</span>
                        </div>
                      )}
                      {selectedColis.pickup_time && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heure de collecte:</span>
                          <span className="font-medium">{selectedColis.pickup_time}</span>
                        </div>
                      )}
                      {selectedColis.drop_time && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heure de livraison:</span>
                          <span className="font-medium">{selectedColis.drop_time}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de création */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouveau Colis</DialogTitle>
              <DialogDescription>
                Créer un nouveau colis pour la livraison
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_name">Nom du service *</Label>
                  <Input 
                    id="service_name" 
                    placeholder="ex: Livraison express" 
                    value={formData.service_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_price">Prix du service (FCFA) *</Label>
                  <Input 
                    id="service_price" 
                    type="number" 
                    placeholder="0" 
                    value={formData.service_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_price: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Nom du client *</Label>
                  <Input 
                    id="customer_name" 
                    placeholder="Nom complet" 
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Téléphone client *</Label>
                  <Input 
                    id="customer_phone" 
                    placeholder="+224..." 
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_email">Email client</Label>
                <Input 
                  id="customer_email" 
                  type="email" 
                  placeholder="email@example.com" 
                  value={formData.customer_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pickup_address">Adresse de collecte *</Label>
                <Textarea 
                  id="pickup_address" 
                  placeholder="Adresse complète de collecte" 
                  value={formData.pickup_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickup_address: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_address">Adresse de livraison *</Label>
                <Textarea 
                  id="delivery_address" 
                  placeholder="Adresse complète de livraison" 
                  value={formData.delivery_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package_description">Description du colis</Label>
                <Textarea 
                  id="package_description" 
                  placeholder="Décrivez le contenu du colis" 
                  value={formData.package_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, package_description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package_weight">Poids</Label>
                  <Input 
                    id="package_weight" 
                    placeholder="ex: 2kg" 
                    value={formData.package_weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, package_weight: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package_dimensions">Dimensions</Label>
                  <Input 
                    id="package_dimensions" 
                    placeholder="LxHxP cm" 
                    value={formData.package_dimensions}
                    onChange={(e) => setFormData(prev => ({ ...prev, package_dimensions: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup_instructions">Instructions de collecte</Label>
                  <Textarea 
                    id="pickup_instructions" 
                    placeholder="Instructions spéciales pour la collecte" 
                    value={formData.pickup_instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickup_instructions: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_instructions">Instructions de livraison</Label>
                  <Textarea 
                    id="delivery_instructions" 
                    placeholder="Instructions spéciales pour la livraison" 
                    value={formData.delivery_instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_instructions: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_method">Méthode de contact</Label>
                  <Select 
                    value={formData.contact_method} 
                    onValueChange={(value: 'phone' | 'email' | 'both') => setFormData(prev => ({ ...prev, contact_method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Téléphone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="both">Téléphone et Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_time">Heure préférée</Label>
                  <Input 
                    id="preferred_time" 
                    placeholder="ex: 14h-16h" 
                    value={formData.preferred_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmitCreateColis} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer le colis'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PartnerColis;
