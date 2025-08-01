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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
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
import { AdminBusinessRequestsService, BusinessRequest, BusinessRequestFilters } from '@/lib/services/admin-business-requests';
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
    UserPlus,
    XCircle,
    Loader2,
    Search,
    EyeOff,
    Copy
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AccountCredentials {
  email: string;
  password: string;
  businessName: string;
  dashboardUrl: string;
}

const AdminRequests = () => {
  const [filters, setFilters] = useState<BusinessRequestFilters>({});
  const [selectedRequest, setSelectedRequest] = useState<BusinessRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'create_account'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [isCreateAccountLoading, setIsCreateAccountLoading] = useState<number | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [accountCredentials, setAccountCredentials] = useState<AccountCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { sendRequestApproval, sendRequestRejection, sendAdminNotification } = useEmailService();

  const {
    requests,
    stats,
    isLoading,
    statsLoading,
    isApproving,
    isRejecting,
    approveRequest,
    rejectRequest,
    refetch,
    createUserAccount
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

  // Gérer le changement de filtre
  const handleFilterChange = (key: keyof BusinessRequestFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Gérer l'action sur une demande
  const handleAction = async () => {
    if (!selectedRequest || !currentUser) {
      console.error('Données manquantes:', { selectedRequest: !!selectedRequest, currentUser: !!currentUser });
      return;
    }

    try {
      if (actionType === 'approve') {
        // Approuver seulement (sans créer de compte)
        await approveRequest(selectedRequest.id, adminNotes);
        
        toast.success('Demande approuvée avec succès. Le partenaire peut maintenant créer son compte.');
      } else if (actionType === 'reject') {
        // Rejeter la demande
        await rejectRequest(selectedRequest.id, adminNotes);
        
        toast.success('Demande rejetée avec succès.');
      } else if (actionType === 'create_account') {
        // Créer le compte utilisateur pour un business approuvé
        setIsCreateAccountLoading(selectedRequest?.id || null);
        const result = await createUserAccount(selectedRequest?.id || 0);
        
        if (result.success && result.credentials) {
          setAccountCredentials({
            email: result.credentials.email,
            password: result.credentials.password,
            businessName: result.credentials.businessName,
            dashboardUrl: `${window.location.origin}/partner-dashboard`
          });
          setShowCredentialsModal(true);
          toast.success('Compte utilisateur créé avec succès');
        } else {
          toast.error(result.error || 'Erreur lors de la création du compte');
        }
      }

      setIsActionDialogOpen(false);
      setAdminNotes('');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Erreur lors de l\'action sur la demande:', error);
      toast.error('Erreur lors de l\'action sur la demande');
    } finally {
      setIsActionLoading(null);
      setIsCreateAccountLoading(null);
    }
  };

  // Gérer la suppression
  const handleDelete = (request: BusinessRequest) => {
    if (confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) {
      rejectRequest(request.id, 'Demande supprimée par l\'administrateur');
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copié dans le presse-papiers`);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Administration">
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Administration">
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Demandes</h1>
          <p className="text-muted-foreground">
            Gérez toutes les demandes de partenariat (en attente, approuvées, rejetées)
          </p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les demandes</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvées</SelectItem>
                    <SelectItem value="rejected">Rejetées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Nom, email, téléphone..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des demandes */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filters.status === 'approved' ? 'Demandes approuvées' :
               filters.status === 'rejected' ? 'Demandes rejetées' :
               filters.status === 'pending' ? 'Demandes en attente' :
               'Toutes les demandes'}
            </CardTitle>
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
                    <TableHead>Propriétaire</TableHead>
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
                          <div className="font-medium">{request.owner_name}</div>
                          <div className="text-sm text-muted-foreground">{request.owner_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span className="capitalize">partenaire</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.name || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.request_status)}
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
                          {request.request_status === 'pending' && (
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
                          {request.request_status === 'approved' && !request.owner_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActionType('create_account');
                                setIsActionDialogOpen(true);
                              }}
                              className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                          {request.request_status === 'approved' && (
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
                          )}
                          {request.request_status === 'rejected' && (
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
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(request)}
                            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
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

        {/* Dialog d'action */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approuver la demande' : 
                 actionType === 'reject' ? 'Rejeter la demande' :
                 'Créer le compte utilisateur'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve' ? 
                  'Cette action approuvera la demande. Le partenaire devra ensuite créer son compte séparément.' :
                 actionType === 'reject' ? 'Cette action rejettera définitivement la demande.' :
                 'Cette action créera automatiquement un compte utilisateur avec un mot de passe généré. Les identifiants seront envoyés par email.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                disabled={isApproving || isRejecting || isActionLoading === selectedRequest?.id || isCreateAccountLoading === selectedRequest?.id}
                className={
                  actionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              >
                {isApproving || isRejecting || isActionLoading === selectedRequest?.id || isCreateAccountLoading === selectedRequest?.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Traitement...
                  </>
                ) : (
                  actionType === 'approve' ? 'Approuver' :
                  actionType === 'reject' ? 'Rejeter' :
                  'Créer le compte'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal des identifiants de connexion */}
        <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Identifiants de connexion créés</DialogTitle>
              <DialogDescription>
                Les identifiants ont été envoyés par email. Voici un récapitulatif :
              </DialogDescription>
            </DialogHeader>
            
            {accountCredentials && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du commerce</label>
                  <div className="flex items-center space-x-2">
                    <Input value={accountCredentials.businessName} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(accountCredentials.businessName, 'Nom du commerce')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email de connexion</label>
                  <div className="flex items-center space-x-2">
                    <Input value={accountCredentials.email} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(accountCredentials.email, 'Email')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mot de passe</label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        value={accountCredentials.password} 
                        readOnly 
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(accountCredentials.password, 'Mot de passe')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Note :</strong> Ces identifiants ont été envoyés par email au partenaire. 
                    Ils peuvent se connecter immédiatement avec ces informations.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCredentialsModal(false)}>
                Fermer
              </Button>
              <Button onClick={() => {
                if (accountCredentials) {
                  window.open(accountCredentials.dashboardUrl, '_blank');
                }
                setShowCredentialsModal(false);
              }}>
                Ouvrir le dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminRequests; 