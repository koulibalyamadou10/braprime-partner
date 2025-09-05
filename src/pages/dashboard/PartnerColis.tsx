import React, { useState, useEffect } from 'react';
import DashboardLayout, { partnerNavItems } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import Unauthorized from '@/components/Unauthorized';
import { useCurrencyRole } from '@/contexts/UseRoleContext';

// Types pour les colis
export type ColisStatus = 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface Colis {
  id: string;
  tracking_number: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  description: string;
  weight: number;
  dimensions: string;
  value: number;
  status: ColisStatus;
  created_at: string;
  updated_at: string;
  business_id: string;
  driver_id?: string;
  driver_name?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  notes?: string;
}

const PartnerColis = () => {
  const { currencyRole, roles } = useCurrencyRole();

  if (!roles.includes("admin")) {
    return <Unauthorized />;
  }

  const { toast } = useToast();
  const [colis, setColis] = useState<Colis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedColis, setSelectedColis] = useState<Colis | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Données de test pour le développement
  const mockColis: Colis[] = [
    {
      id: '1',
      tracking_number: 'BRP001234567',
      sender_name: 'Mamadou Diallo',
      sender_phone: '+224625123456',
      sender_address: 'Hamdallaye, Conakry',
      recipient_name: 'Fatoumata Bah',
      recipient_phone: '+224625654321',
      recipient_address: 'Kipé, Conakry',
      description: 'Documents importants',
      weight: 0.5,
      dimensions: '30x20x5 cm',
      value: 50000,
      status: 'pending',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      business_id: '1',
      estimated_delivery: '2024-01-16T14:00:00Z'
    },
    {
      id: '2',
      tracking_number: 'BRP001234568',
      sender_name: 'Alpha Barry',
      sender_phone: '+224625789012',
      sender_address: 'Dixinn, Conakry',
      recipient_name: 'Aissatou Camara',
      recipient_phone: '+224625345678',
      recipient_address: 'Kaloum, Conakry',
      description: 'Colis fragile - Électronique',
      weight: 2.0,
      dimensions: '40x30x15 cm',
      value: 250000,
      status: 'in_transit',
      created_at: '2024-01-14T08:15:00Z',
      updated_at: '2024-01-15T11:45:00Z',
      business_id: '1',
      driver_id: 'driver_1',
      driver_name: 'Ibrahima Traoré',
      estimated_delivery: '2024-01-15T16:00:00Z'
    },
    {
      id: '3',
      tracking_number: 'BRP001234569',
      sender_name: 'Mariama Keita',
      sender_phone: '+224625456789',
      sender_address: 'Ratoma, Conakry',
      recipient_name: 'Sékou Touré',
      recipient_phone: '+224625567890',
      recipient_address: 'Matam, Conakry',
      description: 'Vêtements et accessoires',
      weight: 1.5,
      dimensions: '50x40x20 cm',
      value: 150000,
      status: 'delivered',
      created_at: '2024-01-13T14:20:00Z',
      updated_at: '2024-01-14T15:30:00Z',
      business_id: '1',
      driver_id: 'driver_2',
      driver_name: 'Mohamed Diallo',
      estimated_delivery: '2024-01-14T17:00:00Z',
      actual_delivery: '2024-01-14T15:30:00Z'
    }
  ];

  // Charger les données (simulation)
  useEffect(() => {
    const loadColis = async () => {
      setIsLoading(true);
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setColis(mockColis);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les colis",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadColis();
  }, [toast]);

  // Filtrer les colis
  const filteredColis = colis.filter(colis => {
    const matchesSearch = 
      colis.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colis.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colis.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colis.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || colis.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: colis.length,
    pending: colis.filter(c => c.status === 'pending').length,
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

  const handleExportData = () => {
    // Simulation d'export CSV
    const csvContent = [
      ['Numéro de suivi', 'Expéditeur', 'Destinataire', 'Description', 'Statut', 'Date de création'],
      ...filteredColis.map(c => [
        c.tracking_number,
        c.sender_name,
        c.recipient_name,
        c.description,
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

  if (isLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord partenaire">
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

  return (
    <DashboardLayout navItems={partnerNavItems} title="Tableau de bord partenaire">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion des Colis</h2>
            <p className="text-muted-foreground">
              Gérez et suivez tous vos colis de livraison
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData}>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    <TableHead>Expéditeur</TableHead>
                    <TableHead>Destinataire</TableHead>
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
                        {colis.tracking_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{colis.sender_name}</p>
                          <p className="text-sm text-muted-foreground">{colis.sender_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{colis.recipient_name}</p>
                          <p className="text-sm text-muted-foreground">{colis.recipient_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{colis.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {colis.weight}kg • {colis.dimensions}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(colis)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                      <CardTitle className="text-lg">Informations Expéditeur</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{selectedColis.sender_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedColis.sender_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{selectedColis.sender_address}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations Destinataire</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{selectedColis.recipient_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedColis.recipient_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{selectedColis.recipient_address}</span>
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
                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                        <p className="font-medium">{selectedColis.description}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Poids</Label>
                        <p className="font-medium">{selectedColis.weight} kg</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Dimensions</Label>
                        <p className="font-medium">{selectedColis.dimensions}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Valeur déclarée</Label>
                        <p className="font-medium">{selectedColis.value.toLocaleString()} FCFA</p>
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
                {(selectedColis.driver_name || selectedColis.estimated_delivery) && (
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
                      {selectedColis.estimated_delivery && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Livraison prévue: {new Date(selectedColis.estimated_delivery).toLocaleString('fr-FR')}</span>
                        </div>
                      )}
                      {selectedColis.actual_delivery && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Livré le: {new Date(selectedColis.actual_delivery).toLocaleString('fr-FR')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {selectedColis.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedColis.notes}</p>
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
                  <Label htmlFor="sender_name">Nom de l'expéditeur</Label>
                  <Input id="sender_name" placeholder="Nom complet" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender_phone">Téléphone expéditeur</Label>
                  <Input id="sender_phone" placeholder="+224..." />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sender_address">Adresse expéditeur</Label>
                <Textarea id="sender_address" placeholder="Adresse complète" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Nom du destinataire</Label>
                  <Input id="recipient_name" placeholder="Nom complet" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_phone">Téléphone destinataire</Label>
                  <Input id="recipient_phone" placeholder="+224..." />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient_address">Adresse destinataire</Label>
                <Textarea id="recipient_address" placeholder="Adresse complète" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description du colis</Label>
                <Textarea id="description" placeholder="Décrivez le contenu du colis" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <Input id="weight" type="number" step="0.1" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input id="dimensions" placeholder="LxHxP cm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valeur (FCFA)</Label>
                  <Input id="value" type="number" placeholder="0" />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Colis créé",
                  description: "Le nouveau colis a été créé avec succès",
                });
                setIsCreateOpen(false);
              }}>
                Créer le colis
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PartnerColis;
