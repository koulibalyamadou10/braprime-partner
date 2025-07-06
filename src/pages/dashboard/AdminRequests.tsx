import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Car,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAdminRequests } from '@/hooks/use-admin-requests';
import { Request, RequestFilters } from '@/lib/types';
import { toast } from 'sonner';

const AdminRequests = () => {
  const [filters, setFilters] = useState<RequestFilters>({});
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'review'>('approve');
  const [adminNotes, setAdminNotes] = useState('');

  const {
    requests,
    stats,
    isLoading,
    statsLoading,
    isUpdating,
    updateStatus,
    deleteRequest,
    refetch
  } = useAdminRequests(filters);

  // Formater la date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Approuvée', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejetée', variant: 'destructive' as const, icon: XCircle },
      under_review: { label: 'En révision', variant: 'outline' as const, icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: AlertCircle 
    };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Obtenir l'icône du type
  const getTypeIcon = (type: string) => {
    return type === 'partner' ? Building2 : Truck;
  };

  // Gérer les filtres
  const handleFilterChange = (key: keyof RequestFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  // Gérer l'action sur une demande
  const handleAction = () => {
    if (!selectedRequest) return;

    const statusMap = {
      approve: 'approved' as const,
      reject: 'rejected' as const,
      review: 'under_review' as const
    };

    updateStatus(selectedRequest.id, statusMap[actionType], adminNotes);
    setIsActionDialogOpen(false);
    setAdminNotes('');
    setSelectedRequest(null);
  };

  // Supprimer une demande
  const handleDelete = (request: Request) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la demande de ${request.user_name} ?`)) {
      deleteRequest(request.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Demandes</h1>
            <p className="text-muted-foreground">Gérez les demandes de partenaires et chauffeurs</p>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Demandes</h1>
          <p className="text-muted-foreground">Gérez les demandes de partenaires et chauffeurs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-sm text-gray-500">Total demandes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                <p className="text-sm text-gray-500">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.partner_requests || 0}</p>
                <p className="text-sm text-gray-500">Partenaires</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.driver_requests || 0}</p>
                <p className="text-sm text-gray-500">Chauffeurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Recherche</label>
              <Input
                placeholder="Nom, email, commerce..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={filters.type || ''} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  <SelectItem value="partner">Partenaires</SelectItem>
                  <SelectItem value="driver">Chauffeurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvées</SelectItem>
                  <SelectItem value="rejected">Rejetées</SelectItem>
                  <SelectItem value="under_review">En révision</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date de début</label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes ({requests.length})</CardTitle>
          <CardDescription>
            Liste de toutes les demandes de partenaires et chauffeurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Demandeur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const TypeIcon = getTypeIcon(request.type);
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{request.user_name}</p>
                          <p className="text-sm text-gray-500">{request.user_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <span className="capitalize">{request.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {request.type === 'partner' ? (
                          <div>
                            <p className="font-medium">{request.business_name}</p>
                            <p className="text-gray-500">{request.business_type}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">{request.vehicle_type}</p>
                            <p className="text-gray-500">{request.vehicle_plate}</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(request.created_at)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActionType('approve');
                                setIsActionDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActionType('reject');
                                setIsActionDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(request)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {requests.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune demande trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Demandeur</label>
                  <p className="text-sm">{selectedRequest.user_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm">{selectedRequest.user_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <p className="text-sm">{selectedRequest.user_phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm capitalize">{selectedRequest.type}</p>
                </div>
              </div>

              {selectedRequest.type === 'partner' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Informations commerce</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Nom du commerce</p>
                      <p className="text-sm">{selectedRequest.business_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Type de commerce</p>
                      <p className="text-sm">{selectedRequest.business_type}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium">Adresse</p>
                      <p className="text-sm">{selectedRequest.business_address}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.type === 'driver' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Informations véhicule</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Type de véhicule</p>
                      <p className="text-sm">{selectedRequest.vehicle_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Plaque d'immatriculation</p>
                      <p className="text-sm">{selectedRequest.vehicle_plate}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium">Notes du demandeur</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div>
                  <label className="text-sm font-medium">Notes admin</label>
                  <p className="text-sm bg-blue-50 p-2 rounded">{selectedRequest.admin_notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date de création</label>
                  <p className="text-sm">{formatDate(selectedRequest.created_at)}</p>
                </div>
                {selectedRequest.reviewed_at && (
                  <div>
                    <label className="text-sm font-medium">Date de révision</label>
                    <p className="text-sm">{formatDate(selectedRequest.reviewed_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'action */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approuver' : actionType === 'reject' ? 'Rejeter' : 'Mettre en révision'} la demande
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Cette action approuvera la demande et créera le profil correspondant.'
                : actionType === 'reject'
                ? 'Cette action rejettera définitivement la demande.'
                : 'Cette action mettra la demande en révision pour examen ultérieur.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes admin (optionnel)</label>
              <Textarea
                placeholder="Ajoutez des notes sur cette décision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAction}
              disabled={isUpdating}
              variant={actionType === 'approve' ? 'default' : actionType === 'reject' ? 'destructive' : 'outline'}
            >
              {isUpdating ? 'Traitement...' : 
                actionType === 'approve' ? 'Approuver' : 
                actionType === 'reject' ? 'Rejeter' : 'Mettre en révision'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequests; 