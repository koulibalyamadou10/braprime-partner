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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRequests } from '@/hooks/use-admin-requests';
import { useAdminDriverRequests } from '@/hooks/use-admin-driver-requests';
import { useEmailService } from '@/hooks/use-email-service';
import { BusinessRequest, BusinessRequestFilters } from '@/lib/services/admin-business-requests';
import { AdminDriverRequestsService, DriverRequest } from '@/lib/services/admin-driver-requests';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    Building2,
    Car,
    Check,
    CheckCircle,
    Clock,
    Copy,
    Eye,
    EyeOff,
    FileText,
    Loader2,
    Search,
    Truck,
    UserPlus,
    Users,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AccountCredentials {
  email: string;
  password: string;
  businessName: string;
  dashboardUrl: string;
}



const AdminRequests = () => {
  const [activeTab, setActiveTab] = useState<'partners' | 'drivers'>('partners');
  
  // États pour les demandes de partenaires
  const [partnerFilters, setPartnerFilters] = useState<BusinessRequestFilters>({});
  const [selectedPartnerRequest, setSelectedPartnerRequest] = useState<BusinessRequest | null>(null);
  const [isPartnerViewDialogOpen, setIsPartnerViewDialogOpen] = useState(false);
  const [isPartnerActionDialogOpen, setIsPartnerActionDialogOpen] = useState(false);
  const [partnerActionType, setPartnerActionType] = useState<'approve' | 'reject' | 'create_account'>('approve');
  const [partnerAdminNotes, setPartnerAdminNotes] = useState('');
  const [isPartnerActionLoading, setIsPartnerActionLoading] = useState<number | null>(null);
  const [isPartnerCreateAccountLoading, setIsPartnerCreateAccountLoading] = useState<number | null>(null);
  const [showPartnerCredentialsModal, setShowPartnerCredentialsModal] = useState(false);
  const [partnerAccountCredentials, setPartnerAccountCredentials] = useState<AccountCredentials | null>(null);
  const [showPartnerPassword, setShowPartnerPassword] = useState(false);

  // États pour les demandes de chauffeurs
  const [driverFilters, setDriverFilters] = useState({ status: '', search: '' });
  const [selectedDriverRequest, setSelectedDriverRequest] = useState<DriverRequest | null>(null);
  const [isDriverViewDialogOpen, setIsDriverViewDialogOpen] = useState(false);
  const [isDriverActionDialogOpen, setIsDriverActionDialogOpen] = useState(false);
  const [driverActionType, setDriverActionType] = useState<'approve' | 'reject'>('approve');
  const [driverAdminNotes, setDriverAdminNotes] = useState('');
  const [isDriverActionLoading, setIsDriverActionLoading] = useState<number | null>(null);
  const [showDriverCredentialsModal, setShowDriverCredentialsModal] = useState(false);
  const [driverAccountCredentials, setDriverAccountCredentials] = useState<AccountCredentials | null>(null);
  const [showDriverPassword, setShowDriverPassword] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { sendRequestApproval, sendRequestRejection, sendAdminNotification } = useEmailService();

  // Hook pour les demandes de partenaires
  const {
    requests: partnerRequests,
    stats: partnerStats,
    isLoading: partnerLoading,
    statsLoading: partnerStatsLoading,
    isApproving: partnerApproving,
    isRejecting: partnerRejecting,
    approveRequest: approvePartnerRequest,
    rejectRequest: rejectPartnerRequest,
    refetch: refetchPartners,
    createUserAccount: createPartnerAccount
  } = useAdminRequests(partnerFilters);

  // Hook pour les demandes de chauffeurs
  const {
    requests: driverRequests,
    stats: driverStats,
    isLoading: driverLoading,
    statsLoading: driverStatsLoading,
    isApproving: driverApproving,
    isRejecting: driverRejecting,
    approveRequest: approveDriverRequest,
    rejectRequest: rejectDriverRequest,
    createDriverAccount,
    refetch: refetchDrivers
  } = useAdminDriverRequests(driverFilters);

  // Formater la date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      approved: { label: 'Approuvée', variant: 'default' as const },
      rejected: { label: 'Rejetée', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Gestionnaires pour les partenaires
  const handlePartnerFilterChange = (key: keyof BusinessRequestFilters, value: string) => {
    setPartnerFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePartnerAction = async () => {
    if (!selectedPartnerRequest) return;

    setIsPartnerActionLoading(selectedPartnerRequest.id);
    try {
      if (partnerActionType === 'approve') {
        await approvePartnerRequest(selectedPartnerRequest.id);
        toast.success('Demande approuvée avec succès');
      } else if (partnerActionType === 'reject') {
        await rejectPartnerRequest(selectedPartnerRequest.id, partnerAdminNotes);
        toast.success('Demande rejetée avec succès');
      }
      setIsPartnerActionDialogOpen(false);
      refetchPartners();
    } catch (error) {
      toast.error('Erreur lors de l\'action');
    } finally {
      setIsPartnerActionLoading(null);
    }
  };

  const handlePartnerCreateAccount = async (request: BusinessRequest) => {
    setIsPartnerCreateAccountLoading(request.id);
    try {
      const result = await createPartnerAccount(request.id);
      if (result.success && result.credentials) {
        setPartnerAccountCredentials({
          email: result.credentials.email,
          password: result.credentials.password,
          businessName: request.name || 'Commerce',
          dashboardUrl: `${window.location.origin}/partner-dashboard`
        });
        setShowPartnerCredentialsModal(true);
        toast.success('Compte créé avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de la création du compte');
    } finally {
      setIsPartnerCreateAccountLoading(null);
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

  // Gestionnaires pour les chauffeurs
  const handleDriverFilterChange = (key: string, value: string) => {
    setDriverFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDriverAction = async () => {
    if (!selectedDriverRequest) return;

    setIsDriverActionLoading(selectedDriverRequest.id);
    try {
      if (driverActionType === 'approve') {
        const result = await AdminDriverRequestsService.approveDriverRequest(
          selectedDriverRequest.id, 
          driverAdminNotes 
        );
        if (result.success) {
          toast.success('Demande approuvée avec succès');
          setIsDriverActionDialogOpen(false);
          refetchDrivers();
        } else {
          toast.error(result.error || 'Erreur lors de l\'approbation');
        }
      } else if (driverActionType === 'reject') {
        const result = await AdminDriverRequestsService.rejectDriverRequest(
          selectedDriverRequest.id, 
          driverAdminNotes 
        );
        if (result.success) {
          toast.success('Demande rejetée avec succès');
          setIsDriverActionDialogOpen(false);
          refetchDrivers();
        } else {
          toast.error(result.error || 'Erreur lors du rejet');
        }
      }
    } catch (error) {
      toast.error('Erreur lors de l\'action');
    } finally {
      setIsDriverActionLoading(null);
    }
  };

  const handleDriverCreateAccount = async (request: DriverRequest) => {
    try {
      const result = await AdminDriverRequestsService.createDriverAccount(request.id);
      if (result.success && result.credentials) {
        setDriverAccountCredentials({
          email: result.credentials.email,
          password: result.credentials.password,
          businessName: result.credentials.driverName,
          dashboardUrl: result.credentials.dashboardUrl
        });
        setShowDriverCredentialsModal(true);
        toast.success('Compte créé avec succès');
        refetchDrivers();
      } else {
        toast.error(result.error || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      toast.error('Erreur lors de la création du compte');
    }
  };

  if (partnerLoading && activeTab === 'partners') {
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
            Gérez toutes les demandes de partenariat et de chauffeurs
          </p>
        </div>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'partners' | 'drivers')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Demandes Partenaires
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Demandes Chauffeurs
            </TabsTrigger>
          </TabsList>

          {/* Onglet Demandes Partenaires */}
          <TabsContent value="partners" className="space-y-6">
            {/* Statistiques Partenaires */}
            {!partnerStatsLoading && partnerStats && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{partnerStats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">En attente</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{partnerStats.pending}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{partnerStats.approved}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{partnerStats.rejected}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filtres Partenaires */}
            <Card>
              <CardHeader>
                <CardTitle>Filtres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Statut</label>
                    <Select value={partnerFilters.status || 'all'} onValueChange={(value) => handlePartnerFilterChange('status', value === 'all' ? '' : value)}>
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
                        value={partnerFilters.search || ''}
                        onChange={(e) => handlePartnerFilterChange('search', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tableau des demandes partenaires */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {partnerFilters.status === 'approved' ? 'Demandes approuvées' :
                   partnerFilters.status === 'rejected' ? 'Demandes rejetées' :
                   partnerFilters.status === 'pending' ? 'Demandes en attente' :
                   'Toutes les demandes'}
                </CardTitle>
                <CardDescription>
                  {partnerLoading ? 'Chargement...' : `${partnerRequests.length} demande(s) trouvée(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {partnerLoading ? (
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
                      {partnerRequests.map((request) => (
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
                                  setSelectedPartnerRequest(request);
                                  setIsPartnerViewDialogOpen(true);
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
                                      setSelectedPartnerRequest(request);
                                      setPartnerActionType('approve');
                                      setIsPartnerActionDialogOpen(true);
                                    }}
                                    className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPartnerRequest(request);
                                      setPartnerActionType('reject');
                                      setIsPartnerActionDialogOpen(true);
                                    }}
                                    className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePartnerCreateAccount(request)}
                                    disabled={isPartnerCreateAccountLoading === request.id}
                                  >
                                    {isPartnerCreateAccountLoading === request.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <UserPlus className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Demandes Chauffeurs */}
          <TabsContent value="drivers" className="space-y-6">
            {/* Statistiques Chauffeurs */}
            {!driverStatsLoading && driverStats && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{driverStats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">En attente</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{driverStats.pending}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{driverStats.approved}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{driverStats.rejected}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filtres Chauffeurs */}
            <Card>
              <CardHeader>
                <CardTitle>Filtres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Statut</label>
                    <Select value={driverFilters.status || 'all'} onValueChange={(value) => handleDriverFilterChange('status', value === 'all' ? '' : value)}>
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
                        value={driverFilters.search || ''}
                        onChange={(e) => handleDriverFilterChange('search', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tableau des demandes chauffeurs */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {driverFilters.status === 'approved' ? 'Demandes approuvées' :
                   driverFilters.status === 'rejected' ? 'Demandes rejetées' :
                   driverFilters.status === 'pending' ? 'Demandes en attente' :
                   'Toutes les demandes'}
                </CardTitle>
                <CardDescription>
                  {driverLoading ? 'Chargement...' : `${driverRequests.length} demande(s) trouvée(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {driverLoading ? (
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
                        <TableHead>Chauffeur</TableHead>
                        <TableHead>Véhicule</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {driverRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <Truck className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">Aucune demande de chauffeur trouvée</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        driverRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{request.name}</div>
                                <div className="text-sm text-muted-foreground">{request.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                <span>{request.vehicle_type}</span>
                                {request.vehicle_plate && (
                                  <Badge variant="outline">{request.vehicle_plate}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {request.driver_type === 'independent' ? (
                                  <Users className="h-4 w-4" />
                                ) : (
                                  <Building2 className="h-4 w-4" />
                                )}
                                <span className="capitalize">
                                  {request.driver_type === 'independent' ? 'Indépendant' : 'Service'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(request.request_status)}
                            </TableCell>
                            <TableCell>
                              {formatDate(request.application_date)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDriverRequest(request);
                                    setIsDriverViewDialogOpen(true);
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
                                        setSelectedDriverRequest(request);
                                        setDriverActionType('approve');
                                        setIsDriverActionDialogOpen(true);
                                      }}
                                      className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                                                      <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDriverRequest(request);
                                      setDriverActionType('reject');
                                      setIsDriverActionDialogOpen(true);
                                    }}
                                    className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDriverCreateAccount(request)}
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs pour les partenaires */}
        <Dialog open={isPartnerViewDialogOpen} onOpenChange={setIsPartnerViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la demande de partenaire</DialogTitle>
            </DialogHeader>
            {selectedPartnerRequest && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Informations du demandeur</h3>
                  <p><strong>Nom:</strong> {selectedPartnerRequest.owner_name}</p>
                  <p><strong>Email:</strong> {selectedPartnerRequest.owner_email}</p>
                  <p><strong>Téléphone:</strong> {selectedPartnerRequest.owner_phone || '-'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Informations du commerce</h3>
                  <p><strong>Nom du commerce:</strong> {selectedPartnerRequest.name || '-'}</p>
                  <p><strong>Type:</strong> {selectedPartnerRequest.business_type || '-'}</p>
                  <p><strong>Adresse:</strong> {selectedPartnerRequest.address || '-'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Statut de la demande</h3>
                  <p>{getStatusBadge(selectedPartnerRequest.request_status)}</p>
                  <p><strong>Notes:</strong> {selectedPartnerRequest.request_notes || '-'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Notes de l'administrateur</h3>
                  <p><strong>Notes:</strong> {selectedPartnerRequest.admin_notes || '-'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Date de la demande</h3>
                  <p>{formatDate(selectedPartnerRequest.created_at)}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPartnerViewDialogOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPartnerActionDialogOpen} onOpenChange={setIsPartnerActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {partnerActionType === 'approve' ? 'Approuver la demande' : 
                 partnerActionType === 'reject' ? 'Rejeter la demande' :
                 'Créer le compte utilisateur'}
              </DialogTitle>
              <DialogDescription>
                {partnerActionType === 'approve' ? 
                  'Cette action approuvera la demande. Le partenaire devra ensuite créer son compte séparément.' :
                 partnerActionType === 'reject' ? 'Cette action rejettera définitivement la demande.' :
                 'Cette action créera automatiquement un compte utilisateur avec un mot de passe généré. Les identifiants seront envoyés par email.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Notes (optionnel)</label>
                <Textarea
                  value={partnerAdminNotes}
                  onChange={(e) => setPartnerAdminNotes(e.target.value)}
                  placeholder="Ajoutez des notes pour cette action..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPartnerActionDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handlePartnerAction}
                disabled={partnerApproving || partnerRejecting || isPartnerActionLoading === selectedPartnerRequest?.id || isPartnerCreateAccountLoading === selectedPartnerRequest?.id}
                className={
                  partnerActionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : partnerActionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              >
                {partnerApproving || partnerRejecting || isPartnerActionLoading === selectedPartnerRequest?.id || isPartnerCreateAccountLoading === selectedPartnerRequest?.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Traitement...
                  </>
                ) : (
                  partnerActionType === 'approve' ? 'Approuver' :
                  partnerActionType === 'reject' ? 'Rejeter' :
                  'Créer le compte'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPartnerCredentialsModal} onOpenChange={setShowPartnerCredentialsModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Identifiants de connexion créés</DialogTitle>
              <DialogDescription>
                Les identifiants ont été envoyés par email. Voici un récapitulatif :
              </DialogDescription>
            </DialogHeader>
            
            {partnerAccountCredentials && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du commerce</label>
                  <div className="flex items-center space-x-2">
                    <Input value={partnerAccountCredentials.businessName} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(partnerAccountCredentials.businessName, 'Nom du commerce')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email de connexion</label>
                  <div className="flex items-center space-x-2">
                    <Input value={partnerAccountCredentials.email} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(partnerAccountCredentials.email, 'Email')}
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
                        type={showPartnerPassword ? 'text' : 'password'} 
                        value={partnerAccountCredentials.password} 
                        readOnly 
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPartnerPassword(!showPartnerPassword)}
                      >
                        {showPartnerPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(partnerAccountCredentials.password, 'Mot de passe')}
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
              <Button variant="outline" onClick={() => setShowPartnerCredentialsModal(false)}>
                Fermer
              </Button>
              <Button onClick={() => {
                if (partnerAccountCredentials) {
                  window.open(partnerAccountCredentials.dashboardUrl, '_blank');
                }
                setShowPartnerCredentialsModal(false);
              }}>
                Ouvrir le dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogs pour les chauffeurs */}
        <Dialog open={isDriverViewDialogOpen} onOpenChange={setIsDriverViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la demande de chauffeur</DialogTitle>
            </DialogHeader>
            {selectedDriverRequest && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Informations du chauffeur</h3>
                  <p><strong>Nom:</strong> {selectedDriverRequest.name}</p>
                  <p><strong>Email:</strong> {selectedDriverRequest.email}</p>
                  <p><strong>Téléphone:</strong> {selectedDriverRequest.phone || '-'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Informations du véhicule</h3>
                  <p><strong>Type:</strong> {selectedDriverRequest.vehicle_type}</p>
                  <p><strong>Plaque:</strong> {selectedDriverRequest.vehicle_plate || '-'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Type de chauffeur</h3>
                  <p><strong>Type:</strong> {selectedDriverRequest.driver_type === 'independent' ? 'Indépendant' : 'Service'}</p>
                  <p><strong>Expérience:</strong> {selectedDriverRequest.experience_years || 0} année(s)</p>
                  <p><strong>Disponibilité:</strong> {selectedDriverRequest.availability_hours || '-'}</p>
                  <p><strong>Zones préférées:</strong> {selectedDriverRequest.preferred_zones?.join(', ') || '-'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <p><strong>Notes:</strong> {selectedDriverRequest.notes || '-'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Statut de la demande</h3>
                  <p>{getStatusBadge(selectedDriverRequest.request_status)}</p>
                  <p><strong>Notes de l'administrateur:</strong> {selectedDriverRequest.request_notes || '-'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Date de la demande</h3>
                  <p>{formatDate(selectedDriverRequest.application_date)}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDriverViewDialogOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDriverActionDialogOpen} onOpenChange={setIsDriverActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {driverActionType === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
              </DialogTitle>
              <DialogDescription>
                {driverActionType === 'approve' ? 
                  'Cette action approuvera la demande. Le chauffeur pourra commencer à travailler.' :
                 'Cette action rejettera définitivement la demande.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Notes (optionnel)</label>
                <Textarea
                  value={driverAdminNotes}
                  onChange={(e) => setDriverAdminNotes(e.target.value)}
                  placeholder="Ajoutez des notes pour cette action..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDriverActionDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleDriverAction}
                disabled={isDriverActionLoading === selectedDriverRequest?.id}
                className={
                  driverActionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {isDriverActionLoading === selectedDriverRequest?.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Traitement...
                  </>
                ) : (
                  driverActionType === 'approve' ? 'Approuver' : 'Rejeter'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDriverCredentialsModal} onOpenChange={setShowDriverCredentialsModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Identifiants de connexion créés</DialogTitle>
              <DialogDescription>
                Les identifiants ont été envoyés par email. Voici un récapitulatif :
              </DialogDescription>
            </DialogHeader>
            
            {driverAccountCredentials && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du chauffeur</label>
                  <div className="flex items-center space-x-2">
                    <Input value={driverAccountCredentials.businessName} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(driverAccountCredentials.businessName, 'Nom du chauffeur')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email de connexion</label>
                  <div className="flex items-center space-x-2">
                    <Input value={driverAccountCredentials.email} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(driverAccountCredentials.email, 'Email')}
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
                        type={showDriverPassword ? 'text' : 'password'} 
                        value={driverAccountCredentials.password} 
                        readOnly 
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowDriverPassword(!showDriverPassword)}
                      >
                        {showDriverPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(driverAccountCredentials.password, 'Mot de passe')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Note :</strong> Ces identifiants ont été envoyés par email au chauffeur. 
                    Ils peuvent se connecter immédiatement avec ces informations.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDriverCredentialsModal(false)}>
                Fermer
              </Button>
              <Button onClick={() => {
                if (driverAccountCredentials) {
                  window.open(driverAccountCredentials.dashboardUrl, '_blank');
                }
                setShowDriverCredentialsModal(false);
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