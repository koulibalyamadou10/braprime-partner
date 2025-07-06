import { useState } from 'react';
import DashboardLayout, { partnerNavItems } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  Search,
  XCircle,
  ClipboardList,
  MoreHorizontal,
  Table,
  X
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { ReservationSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { usePartnerReservations, PartnerReservation } from '@/hooks/use-partner-reservations';
import { AssignTableDialog } from '@/components/AssignTableDialog';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Helper function to get status color
const getStatusColor = (status: PartnerReservation['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'completed':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'no_show':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: PartnerReservation['status']) => {
  switch (status) {
    case 'confirmed':
      return <Check className="mr-1 h-3 w-3" />;
    case 'pending':
      return <Clock className="mr-1 h-3 w-3" />;
    case 'cancelled':
      return <XCircle className="mr-1 h-3 w-3" />;
    case 'completed':
      return <Check className="mr-1 h-3 w-3" />;
    case 'no_show':
      return <XCircle className="mr-1 h-3 w-3" />;
    default:
      return null;
  }
};

const getStatusLabel = (status: PartnerReservation['status']) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmée';
    case 'pending':
      return 'En attente';
    case 'cancelled':
      return 'Annulée';
    case 'completed':
      return 'Terminée';
    case 'no_show':
      return 'Absent';
    default:
      return status;
  }
};

const PartnerReservations = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Utiliser le hook personnalisé
  const {
    reservations,
    loading,
    error,
    fetchPartnerReservations,
    updateReservationStatus,
    assignTable,
    getReservationStats
  } = usePartnerReservations();
  
  // State pour les filtres et la recherche
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilterType, setDateFilterType] = useState<'none' | 'today' | 'week' | 'custom'>('none');
  
  // State pour la réservation sélectionnée
  const [selectedReservation, setSelectedReservation] = useState<PartnerReservation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // State pour l'assignation de table
  const [isAssignTableOpen, setIsAssignTableOpen] = useState(false);
  const [reservationForTable, setReservationForTable] = useState<PartnerReservation | null>(null);
  
  // Filtrer les réservations
  const filteredReservations = reservations.filter((reservation) => {
    // Filtre par date
    if (dateFilterType === 'today') {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      if (reservation.date !== todayStr) return false;
    } else if (dateFilterType === 'week') {
      const today = new Date();
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);
      const reservationDate = new Date(reservation.date);
      if (reservationDate < today || reservationDate > endOfWeek) return false;
    } else if (dateFilterType === 'custom' && selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      if (reservation.date !== selectedDateStr) return false;
    }
    
    // Filtre par statut
    if (selectedStatus !== "all" && reservation.status !== selectedStatus) {
      return false;
    }
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        reservation.customer_name?.toLowerCase().includes(query) ||
        reservation.customer_phone?.includes(query) ||
        reservation.customer_email?.toLowerCase().includes(query) ||
        reservation.special_requests?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Debug: Afficher les informations de débogage
  console.log('Debug PartnerReservations:', {
    totalReservations: reservations.length,
    filteredReservations: filteredReservations.length,
    selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'none',
    selectedStatus,
    searchQuery,
    reservations: reservations.map(r => ({
      id: r.id,
      date: r.date,
      status: r.status,
      customer_name: r.customer_name
    }))
  });

  // Gérer le changement de date
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setDateFilterType(date ? 'custom' : 'none');
  };

  // Gérer le filtre "Aujourd'hui"
  const handleTodayFilter = () => {
    setSelectedDate(undefined);
    setDateFilterType('today');
  };

  // Gérer le filtre "Cette semaine"
  const handleWeekFilter = () => {
    setSelectedDate(undefined);
    setDateFilterType('week');
  };

  // Gérer le changement de statut
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  // Gérer la recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Voir les détails d'une réservation
  const handleViewReservation = (reservation: PartnerReservation) => {
    setSelectedReservation(reservation);
    setIsDetailsOpen(true);
  };

  // Mettre à jour le statut d'une réservation
  const handleUpdateStatus = async (reservationId: string, newStatus: PartnerReservation['status']) => {
    const result = await updateReservationStatus(reservationId, newStatus);
    
    if (result.success) {
      toast({
        title: "Statut mis à jour",
        description: `La réservation a été ${getStatusLabel(newStatus).toLowerCase()}.`,
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  // Assigner une table
  const handleAssignTable = async (reservationId: string, tableNumber: number) => {
    const result = await assignTable(reservationId, tableNumber);
    
    if (result.success) {
      toast({
        title: "Table assignée",
        description: `La table ${tableNumber} a été assignée à cette réservation.`,
      });
      // Rafraîchir les réservations
      fetchPartnerReservations();
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible d'assigner la table",
        variant: "destructive",
      });
    }
  };

  // Ouvrir le dialogue d'assignation de table
  const handleOpenAssignTable = (reservation: PartnerReservation) => {
    setReservationForTable(reservation);
    setIsAssignTableOpen(true);
  };

  // Fermer le dialogue d'assignation de table
  const handleCloseAssignTable = () => {
    setIsAssignTableOpen(false);
    setReservationForTable(null);
  };

  // Afficher l'état de chargement
  if (loading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Réservations">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des Réservations</h2>
            <p className="text-muted-foreground">Gérez les réservations de votre établissement.</p>
          </div>
          <ReservationSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  // Afficher l'erreur
  if (error) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Réservations">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des Réservations</h2>
            <p className="text-muted-foreground">Gérez les réservations de votre établissement.</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchPartnerReservations}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getReservationStats();

  // Calculer les statistiques des réservations filtrées
  const filteredStats = {
    total: filteredReservations.length,
    confirmed: filteredReservations.filter(res => res.status === 'confirmed').length,
    pending: filteredReservations.filter(res => res.status === 'pending').length,
    completed: filteredReservations.filter(res => res.status === 'completed').length,
    cancelled: filteredReservations.filter(res => res.status === 'cancelled').length,
    no_show: filteredReservations.filter(res => res.status === 'no_show').length,
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = dateFilterType !== 'none' || selectedStatus !== 'all' || searchQuery;

  // Obtenir le texte du filtre de date actif
  const getDateFilterText = () => {
    switch (dateFilterType) {
      case 'today':
        return 'Aujourd\'hui';
      case 'week':
        return 'Cette semaine';
      case 'custom':
        return selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '';
      default:
        return '';
    }
  };

  return (
    <DashboardLayout navItems={partnerNavItems} title="Réservations">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Réservations</h2>
          <p className="text-muted-foreground">Gérez les réservations de votre établissement.</p>
          {hasActiveFilters && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Filtres actifs: {filteredReservations.length} sur {reservations.length} réservations
              </Badge>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {hasActiveFilters ? 'Filtrées' : 'Total'}
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters ? 'Réservations filtrées' : 'Réservations'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStats.pending}</div>
              <p className="text-xs text-muted-foreground">À confirmer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStats.confirmed}</div>
              <p className="text-xs text-muted-foreground">Validées</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStats.completed}</div>
              <p className="text-xs text-muted-foreground">Aujourd'hui</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absents</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStats.no_show}</div>
              <p className="text-xs text-muted-foreground">No-show</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres et Recherche</CardTitle>
            <CardDescription>
              Filtrez et recherchez dans vos réservations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Rechercher par nom, téléphone, email..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="status">Statut</Label>
                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="confirmed">Confirmée</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                    <SelectItem value="no_show">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:w-48">
                <Label>Date</Label>
                <div className="space-y-2">
                  {/* Options rapides */}
                  <div className="flex gap-1">
                    <Button
                      variant={dateFilterType === 'today' ? "default" : "outline"}
                      size="sm"
                      onClick={handleTodayFilter}
                      className="text-xs px-2"
                    >
                      Aujourd'hui
                    </Button>
                    <Button
                      variant={dateFilterType === 'week' ? "default" : "outline"}
                      size="sm"
                      onClick={handleWeekFilter}
                      className="text-xs px-2"
                    >
                      Cette semaine
                    </Button>
                  </div>
                  
                  {/* Sélecteur de date */}
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          size={"sm"}
                          className={cn(
                            "w-[200px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "dd/MM/yyyy")
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateChange}
                          initialFocus
                          locale={fr}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        />
                      </PopoverContent>
                    </Popover>
                    {selectedDate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(undefined)}
                        className="px-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedDate(undefined);
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                >
                  Effacer tous les filtres
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des réservations */}
        <Card>
          <CardHeader>
            <CardTitle>Réservations ({filteredReservations.length})</CardTitle>
            <CardDescription>
              Liste des réservations filtrées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune réservation</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? `Aucune réservation ne correspond à vos critères de filtrage.`
                    : 'Aucune réservation pour le moment.'}
                </p>
                {hasActiveFilters && (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Filtres actifs :</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedDate && (
                        <li>Date : {format(selectedDate, 'dd/MM/yyyy')}</li>
                      )}
                      {selectedStatus !== 'all' && (
                        <li>Statut : {getStatusLabel(selectedStatus as any)}</li>
                      )}
                      {searchQuery && (
                        <li>Recherche : "{searchQuery}"</li>
                      )}
                    </ul>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedDate(undefined);
                        setSelectedStatus('all');
                        setSearchQuery('');
                      }}
                      className="mt-4"
                    >
                      Effacer tous les filtres
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservations.map((reservation) => (
                  <div key={reservation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{reservation.customer_name}</h4>
                          <Badge className={getStatusColor(reservation.status)}>
                            {getStatusIcon(reservation.status)}
                            {getStatusLabel(reservation.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>📅 {format(new Date(reservation.date), 'dd/MM/yyyy')} à {reservation.time}</p>
                          <p>👥 {reservation.guests} personnes</p>
                          {reservation.table_number && (
                            <p>🪑 Table {reservation.table_number}</p>
                          )}
                          {reservation.customer_phone && (
                            <p>📞 {reservation.customer_phone}</p>
                          )}
                          {reservation.special_requests && (
                            <p>💬 {reservation.special_requests}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReservation(reservation)}
                        >
                          Détails
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {reservation.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}>
                                <Check className="mr-2 h-4 w-4" />
                                Confirmer
                              </DropdownMenuItem>
                            )}
                            {reservation.status === 'confirmed' && (
                              <>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'completed')}>
                                  <Check className="mr-2 h-4 w-4" />
                                  Marquer comme terminée
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'no_show')}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Marquer comme absent
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleOpenAssignTable(reservation)}>
                              <Table className="mr-2 h-4 w-4" />
                              {reservation.table_number ? 'Modifier la table' : 'Assigner une table'}
                            </DropdownMenuItem>
                            {reservation.status !== 'cancelled' && reservation.status !== 'completed' && reservation.status !== 'no_show' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Annuler
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de détails */}
        {selectedReservation && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Détails de la réservation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client</Label>
                    <p className="font-medium">{selectedReservation.customer_name}</p>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Badge className={getStatusColor(selectedReservation.status)}>
                      {getStatusIcon(selectedReservation.status)}
                      {getStatusLabel(selectedReservation.status)}
                    </Badge>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <p>{format(new Date(selectedReservation.date), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <Label>Heure</Label>
                    <p>{selectedReservation.time}</p>
                  </div>
                  <div>
                    <Label>Nombre de personnes</Label>
                    <p>{selectedReservation.guests}</p>
                  </div>
                  <div>
                    <Label>Table</Label>
                    <p>{selectedReservation.table_number || 'Non assignée'}</p>
                  </div>
                </div>
                {selectedReservation.customer_phone && (
                  <div>
                    <Label>Téléphone</Label>
                    <p>{selectedReservation.customer_phone}</p>
                  </div>
                )}
                {selectedReservation.customer_email && (
                  <div>
                    <Label>Email</Label>
                    <p>{selectedReservation.customer_email}</p>
                  </div>
                )}
                {selectedReservation.special_requests && (
                  <div>
                    <Label>Demandes spéciales</Label>
                    <p className="text-sm text-muted-foreground">{selectedReservation.special_requests}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  {selectedReservation.status === 'pending' && (
                    <Button onClick={() => handleUpdateStatus(selectedReservation.id, 'confirmed')}>
                      Confirmer
                    </Button>
                  )}
                  {selectedReservation.status === 'confirmed' && (
                    <>
                      <Button onClick={() => handleUpdateStatus(selectedReservation.id, 'completed')}>
                        Marquer comme terminée
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleUpdateStatus(selectedReservation.id, 'no_show')}
                      >
                        Marquer comme absent
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleOpenAssignTable(selectedReservation);
                    }}
                  >
                    <Table className="mr-2 h-4 w-4" />
                    {selectedReservation.table_number ? 'Modifier la table' : 'Assigner une table'}
                  </Button>
                  {selectedReservation.status !== 'cancelled' && selectedReservation.status !== 'completed' && selectedReservation.status !== 'no_show' && (
                    <Button variant="destructive" onClick={() => handleUpdateStatus(selectedReservation.id, 'cancelled')}>
                      Annuler
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Dialogue d'assignation de table */}
      <AssignTableDialog
        isOpen={isAssignTableOpen}
        onClose={handleCloseAssignTable}
        reservation={reservationForTable}
        onTableAssigned={handleAssignTable}
      />
    </DashboardLayout>
  );
};

export default PartnerReservations; 