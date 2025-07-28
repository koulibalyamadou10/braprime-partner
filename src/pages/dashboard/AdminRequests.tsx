import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRequests } from '@/hooks/use-admin-requests';
import { useEmailService } from '@/hooks/use-email-service';
import { AdminAccountCreationService } from '@/lib/services/admin-account-creation';
import { Request, RequestFilters } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    AlertCircle,
    Building2,
    Check,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    RefreshCw,
    Trash2,
    Truck,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminRequests = () => {
  const [filters, setFilters] = useState<RequestFilters>({});
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'review'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { sendRequestApproval, sendRequestRejection, sendAdminNotification } = useEmailService();

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
      pending: { 
        label: 'En attente', 
        variant: 'secondary' as const, 
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
      },
      approved: { 
        label: 'Approuvée', 
        variant: 'default' as const, 
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
      },
      rejected: { 
        label: 'Rejetée', 
        variant: 'destructive' as const, 
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
      },
      under_review: { 
        label: 'En révision', 
        variant: 'outline' as const, 
        icon: AlertCircle,
        className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: AlertCircle,
      className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
    };

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Obtenir l'icône du type
  const getTypeIcon = (type: string) => {
    return type === 'partner' ? <Building2 className="h-4 w-4" /> : <Truck className="h-4 w-4" />;
  };

  // Gérer le changement de filtre
  const handleFilterChange = (key: keyof RequestFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Gérer l'action sur une demande
  const handleAction = async () => {
    if (!selectedRequest || !currentUser) return;

    const newStatus = actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'under_review';

    try {
      // Si c'est une approbation, générer un mot de passe et créer le compte
      if (actionType === 'approve') {
        // Générer un mot de passe automatiquement
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Créer le compte utilisateur
        const accountResult = await AdminAccountCreationService.createUserAccount({
          email: selectedRequest.user_email,
          password: password,
          name: selectedRequest.user_name,
          role: selectedRequest.type as 'partner' | 'driver',
          phone_number: selectedRequest.user_phone,
          requestId: selectedRequest.id
        });

        if (!accountResult.success) {
          toast.error(accountResult.error || 'Erreur lors de la création du compte');
          return;
        }
      }

      // Mettre à jour le statut de la demande
      await updateStatus(selectedRequest.id, newStatus, adminNotes);

      // Envoyer les emails appropriés
      if (actionType === 'approve') {
        await sendRequestApproval({
          request_id: selectedRequest.id,
          request_type: selectedRequest.type,
          user_name: selectedRequest.user_name,
          user_email: selectedRequest.user_email,
          user_phone: selectedRequest.user_phone,
          business_name: selectedRequest.business_name,
          selected_plan_name: selectedRequest.business_type || 'Plan Standard',
          selected_plan_price: 0,
          login_email: selectedRequest.user_email,
          login_password: 'MotDePasse123!', // Le mot de passe sera envoyé par email
          dashboard_url: `${window.location.origin}/${selectedRequest.type}-dashboard`,
          approved_at: new Date().toISOString(),
          approved_by: currentUser.email || 'admin@bradelivery.com'
        });
      } else if (actionType === 'reject') {
        await sendRequestRejection(selectedRequest, {
          reason: adminNotes || 'Votre demande ne répond pas aux critères requis.',
          admin_notes: adminNotes,
          rejected_by: currentUser.email || 'admin@bradelivery.com'
        });
      }

      await sendAdminNotification(selectedRequest);

      setIsActionDialogOpen(false);
      setAdminNotes('');
      setSelectedRequest(null);
      toast.success(`Demande ${actionType === 'approve' ? 'approuvée et compte créé' : actionType === 'reject' ? 'rejetée' : 'mise en révision'} avec succès. Emails envoyés.`);
    } catch (error) {
      console.error('Erreur lors de l\'action sur la demande:', error);
      toast.error('Erreur lors de l\'action sur la demande');
    }
  };

  // Gérer la suppression
  const handleDelete = (request: Request) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      deleteRequest(request.id);
    }
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="Administration">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Demandes</h1>
            <p className="text-muted-foreground">
              Gérez les demandes de partenariat et de chauffeur
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Statistiques */}
        {!statsLoading && stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filters.type || 'all'} onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="partner">Partenaires</SelectItem>
                    <SelectItem value="driver">Chauffeurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvées</SelectItem>
                    <SelectItem value="rejected">Rejetées</SelectItem>
                    <SelectItem value="under_review">En révision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Recherche</label>
                <Input
                  placeholder="Nom, email, commerce..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des demandes */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes</CardTitle>
            <CardDescription>
              {isLoading ? 'Chargement...' : `${requests.length} demande(s) trouvée(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Commerce</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.user_name}</div>
                          <div className="text-sm text-muted-foreground">{request.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(request.type)}
                          <span className="capitalize">{request.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.business_name || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(request.created_at)}
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
                                className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setActionType('reject');
                                  setIsActionDialogOpen(true);
                                }}
                                className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {request.status === 'under_review' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setActionType('approve');
                                  setIsActionDialogOpen(true);
                                }}
                                className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setActionType('reject');
                                  setIsActionDialogOpen(true);
                                }}
                                className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-500 text-green-600 bg-green-50"
                              disabled
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {request.status === 'rejected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-600 bg-red-50"
                              disabled
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(request)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de visualisation */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la demande</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nom</label>
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
                  {selectedRequest.business_name && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Commerce</label>
                        <p className="text-sm">{selectedRequest.business_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type de commerce</label>
                        <p className="text-sm">{selectedRequest.business_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Adresse</label>
                        <p className="text-sm">{selectedRequest.business_address}</p>
                      </div>
                    </>
                  )}
                </div>
                {selectedRequest.notes && (
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <p className="text-sm">{selectedRequest.notes}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Date de soumission</label>
                  <p className="text-sm">{formatDate(selectedRequest.created_at)}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fermer
              </Button>
              {selectedRequest?.status === 'pending' && (
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setActionType('approve');
                    setIsActionDialogOpen(true);
                  }}
                >
                  Approuver
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog d'action */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approuver la demande' : 
                 actionType === 'reject' ? 'Rejeter la demande' : 'Mettre en révision'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve' ? 
                  'Cette action approuvera la demande et créera automatiquement un compte utilisateur avec un mot de passe généré. Les identifiants seront envoyés par email.' :
                 actionType === 'reject' ? 'Cette action rejettera définitivement la demande.' :
                 'Cette action mettra la demande en révision pour plus d\'informations.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {actionType === 'approve' && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Création automatique du compte :</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Un mot de passe sécurisé sera généré automatiquement</li>
                        <li>• Le compte sera créé avec le rôle "{selectedRequest?.type === 'partner' ? 'Partenaire' : 'Chauffeur'}"</li>
                        <li>• Les identifiants seront envoyés par email à {selectedRequest?.user_email}</li>
                        <li>• L'utilisateur pourra se connecter immédiatement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Notes (optionnel)</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ajoutez des notes pour cette action..."
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
                className={
                  actionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : actionType === 'reject' 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Traitement...
                  </>
                ) : (
                  actionType === 'approve' ? 'Approuver et créer le compte' :
                  actionType === 'reject' ? 'Rejeter' : 'Mettre en révision'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminRequests; 