import { useState, useEffect } from 'react';
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  Search,
  XCircle,
  ClipboardList,
  MoreHorizontal,
  Table as TableIcon,
  X,
  Users,
  Phone,
  Mail,
  Filter,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
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
import { useCurrencyRole } from '@/contexts/UseRoleContext';
import Unauthorized from '@/components/Unauthorized';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { isInternalUser } from '@/hooks/use-internal-users';

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
  const { currencyRole, roles } = useCurrencyRole();

  if (!roles.includes("reservations") && !roles.includes("admin")) {
    return <Unauthorized />;
  }

  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // États pour les données utilisateur et business
  const [userData, setUserData] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);
  
  // État local pour les réservations (pour les mises à jour temps réel)
  const [localReservations, setLocalReservations] = useState<PartnerReservation[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  
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
  
  // State pour le temps réel
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [realtimeRetryCount, setRealtimeRetryCount] = useState(0);
  
  // Charger les données utilisateur et business
  const loadUserData = async () => {
    try {
      setIsLoadingBusiness(true);
      
      const {
        isInternal, 
        data, 
        user : userOrigin, 
        businessId: businessIdOrigin,
        businessData: businessDataOrigin
      } = await isInternalUser()    
      
      if (businessIdOrigin !== null) {
        setUserData(userOrigin);
        setBusiness(businessDataOrigin);
      } else {
        console.error('Aucun business associé à votre compte partenaire');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err);
    } finally {
      setIsLoadingBusiness(false);
    }
  };
  
  // Fonction pour jouer le son de notification
  const playNotificationSound = () => {
    try {
      console.log('🔊 Tentative de lecture du son de notification');
      const audio = new Audio('/son.wav');
      audio.volume = 0.7; // Volume à 70%
      
      // Gérer les événements audio
      audio.addEventListener('canplaythrough', () => {
        console.log('🔊 Son prêt à être joué');
      });
      
      audio.addEventListener('error', (e) => {
        console.error('🔊 Erreur audio:', e);
      });
      
      audio.play().then(() => {
        console.log('🔊 Son joué avec succès');
      }).catch(error => {
        console.warn('🔊 Impossible de jouer le son de notification:', error);
        // Essayer avec un son de fallback
        try {
          const fallbackAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT');
          fallbackAudio.volume = 0.3;
          fallbackAudio.play().catch(() => {
            console.warn('🔊 Impossible de jouer le son de fallback');
          });
        } catch (fallbackError) {
          console.warn('🔊 Erreur avec le son de fallback:', fallbackError);
        }
      });
    } catch (error) {
      console.warn('🔊 Erreur lors de la lecture du son:', error);
    }
  };
  
  // Filtrer les réservations (utiliser localReservations pour les mises à jour temps réel)
  const reservationsToUse = localReservations.length > 0 ? localReservations : reservations;
  const filteredReservations = reservationsToUse.filter((reservation) => {
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

  // Charger les données au montage
  useEffect(() => {
    loadUserData();
  }, []);

  // Synchroniser l'état local avec les données du hook
  useEffect(() => {
    if (reservations && reservations.length > 0) {
      setLocalReservations(reservations);
    }
  }, [reservations]);

  // Écouter les mises à jour en temps réel des réservations
  useEffect(() => {
    if (!currentUser?.id || !business?.id) {
      console.log('🔄 [PartnerReservations] Pas de business trouvé pour le partenaire');
      setRealtimeStatus('disconnected');
      return;
    }

    // Délai pour éviter les reconnexions trop rapides
    const connectionDelay = realtimeRetryCount > 0 ? Math.min(1000 * Math.pow(2, realtimeRetryCount), 10000) : 0;
    
    const setupRealtimeConnection = () => {
      console.log('🔄 [PartnerReservations] Configuration de l\'écoute temps réel pour les réservations du business:', business.id);
      console.log('🔄 [PartnerReservations] Filtre utilisé:', `business_id=eq.${business.id}`);
      console.log('🔄 [PartnerReservations] Tentative de connexion:', realtimeRetryCount + 1);

      setRealtimeStatus('connecting');

    // S'abonner aux mises à jour des réservations du business
    const reservationsSubscription = supabase
      .channel(`partner-reservations-${business.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reservations',
          filter: `business_id=eq.${business.id}`
        },
        (payload) => {
          console.log('🔄 [PartnerReservations] Nouvelle réservation reçue:', payload);
          console.log('🔄 [PartnerReservations] Détails de la nouvelle réservation:', payload.new);
          
          const newReservation = payload.new as any;
          
          // Transformer la nouvelle réservation pour correspondre à l'interface PartnerReservation
          const transformedReservation: PartnerReservation = {
            ...newReservation,
            customer_name: 'Nouveau client', // Sera mis à jour lors du rechargement
            customer_phone: 'Téléphone inconnu',
            customer_email: 'Email inconnu'
          };
          
          // Mettre à jour l'état local immédiatement
          setLocalReservations(prev => {
            const exists = prev.find(res => res.id === newReservation.id);
            if (exists) return prev;
            return [transformedReservation, ...prev];
          });
          
          // Enregistrer le temps de la dernière mise à jour
          setLastUpdateTime(new Date());
          
          toast.success('Nouvelle réservation reçue !');
          
          // Jouer le son de notification
          playNotificationSound();
          
          // Recharger les réservations pour avoir les données complètes
          setTimeout(() => {
            fetchPartnerReservations();
          }, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservations',
          filter: `business_id=eq.${business.id}`
        },
        (payload) => {
          console.log('🔄 [PartnerReservations] Réservation mise à jour:', payload);
          
          const updatedReservation = payload.new as any;
          const oldReservation = payload.old as any;
          
          // Mettre à jour l'état local immédiatement
          setLocalReservations(prev => 
            prev.map(res => 
              res.id === updatedReservation.id 
                ? { ...res, ...updatedReservation }
                : res
            )
          );
          
          // Enregistrer le temps de la dernière mise à jour
          setLastUpdateTime(new Date());
          
          // Log du changement de statut
          if (oldReservation.status !== updatedReservation.status) {
            console.log(`📅 [PartnerReservations] Statut de réservation changé: ${oldReservation.status} → ${updatedReservation.status}`);
            
            // Afficher une notification pour les changements de statut importants
            const statusLabels = {
              'pending': 'En attente',
              'confirmed': 'Confirmée',
              'cancelled': 'Annulée',
              'completed': 'Terminée',
              'no_show': 'Absent'
            };
            
            const oldLabel = statusLabels[oldReservation.status as keyof typeof statusLabels] || oldReservation.status || 'Inconnu';
            const newLabel = statusLabels[updatedReservation.status as keyof typeof statusLabels] || updatedReservation.status || 'Inconnu';
            
            console.log('📅 Changement de statut:', { oldStatus: oldReservation.status, newStatus: updatedReservation.status, oldLabel, newLabel });
            
            toast.info(`Réservation #${updatedReservation.id.slice(-8)}: ${oldLabel} → ${newLabel}`);
            
            // Jouer le son pour les changements de statut importants
            if (['confirmed', 'completed', 'cancelled'].includes(updatedReservation.status)) {
              playNotificationSound();
            }
          }
          
          // Recharger les réservations pour avoir les données complètes
          setTimeout(() => {
            fetchPartnerReservations();
          }, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'reservations',
          filter: `business_id=eq.${business.id}`
        },
        (payload) => {
          console.log('🔄 [PartnerReservations] Réservation supprimée:', payload);
          
          const deletedReservation = payload.old as any;
          
          // Mettre à jour l'état local immédiatement
          setLocalReservations(prev => 
            prev.filter(res => res.id !== deletedReservation.id)
          );
          
          // Enregistrer le temps de la dernière mise à jour
          setLastUpdateTime(new Date());
          
          toast.warning(`Réservation #${deletedReservation.id.slice(-8)} supprimée`);
          
          // Recharger les réservations pour synchroniser
          setTimeout(() => {
            fetchPartnerReservations();
          }, 1000);
        }
      )
      .subscribe((status) => {
        console.log('🔄 [PartnerReservations] Statut de l\'abonnement aux réservations:', status);
        console.log('🔄 [PartnerReservations] Canal:', `partner-reservations-${business.id}`);
        
        // Mettre à jour le statut de connexion temps réel
        if (status === 'SUBSCRIBED') {
          console.log('✅ [PartnerReservations] Connexion temps réel établie avec succès');
          setRealtimeStatus('connected');
          setRealtimeRetryCount(0); // Reset du compteur en cas de succès
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.log('❌ [PartnerReservations] Erreur de connexion temps réel:', status);
          setRealtimeStatus('disconnected');
          
          // Tentative de reconnexion avec backoff exponentiel
          if (realtimeRetryCount < 5) {
            console.log(`🔄 [PartnerReservations] Tentative de reconnexion dans ${connectionDelay}ms (tentative ${realtimeRetryCount + 1}/5)`);
            setTimeout(() => {
              setRealtimeRetryCount(prev => prev + 1);
            }, connectionDelay);
          } else {
            console.log('❌ [PartnerReservations] Nombre maximum de tentatives de reconnexion atteint');
          }
        } else {
          console.log('🔄 [PartnerReservations] Connexion en cours:', status);
          setRealtimeStatus('connecting');
        }
      });

      // Nettoyer l'abonnement au démontage
      return () => {
        console.log('🔄 [PartnerReservations] Nettoyage de l\'abonnement temps réel aux réservations');
        try {
          supabase.removeChannel(reservationsSubscription);
        } catch (error) {
          console.warn('⚠️ [PartnerReservations] Erreur lors du nettoyage du canal:', error);
        }
      };
    };

    // Démarrer la connexion avec délai si nécessaire
    if (connectionDelay > 0) {
      const timeoutId = setTimeout(setupRealtimeConnection, connectionDelay);
      return () => clearTimeout(timeoutId);
    } else {
      setupRealtimeConnection();
    }
  }, [currentUser?.id, business?.id, realtimeRetryCount]); // Ajouter realtimeRetryCount aux dépendances

  // Gestion d'erreurs granulaire - affichée en haut de page
  const ErrorCard = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <p className="text-sm text-red-700">
          Erreur lors du chargement des données: {error}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchPartnerReservations}
          className="ml-auto"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Réessayer
        </Button>
      </div>
    </div>
  );

  // Si en cours de chargement et pas de business, afficher un skeleton
  if (isLoadingBusiness && !business) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Réservations">
        <div className="space-y-6">
          {/* Header STATIQUE - toujours visible */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des Réservations</h2>
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
          
          {/* Skeleton pour les statistiques */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-8 mt-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
              </div>
            ))}
          </div>
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

  return (
    <DashboardLayout navItems={partnerNavItems} title="Réservations">
      <div className="space-y-6">
        {/* Affichage des erreurs seulement s'il y en a et que le chargement est terminé */}
        {error && !loading && !isLoadingBusiness && <ErrorCard />}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des Réservations</h2>
            <p className="text-muted-foreground">Gérez les réservations de votre établissement.</p>
            {hasActiveFilters && (
              <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Filtres actifs: {filteredReservations.length} sur {reservationsToUse.length} réservations
              </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Bouton de rechargement discret */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={fetchPartnerReservations}
              disabled={loading || isLoadingBusiness}
              className="h-8 w-8 p-0"
              title="Recharger les réservations"
            >
              <RefreshCw className={`h-4 w-4 ${loading || isLoadingBusiness ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* Bouton de test pour la connexion temps réel */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                console.log('🔍 [PartnerReservations] Test de connexion temps réel');
                console.log('🔍 Business ID:', business?.id);
                console.log('🔍 Statut temps réel:', realtimeStatus);
                console.log('🔍 Réservations actuelles:', reservationsToUse.length);
                console.log('🔍 Nombre de tentatives:', realtimeRetryCount);
                toast.info(`Statut: ${realtimeStatus}, Business: ${business?.id}, Réservations: ${reservationsToUse.length}, Tentatives: ${realtimeRetryCount}`);
              }}
              className="h-8 w-8 p-0"
              title="Tester la connexion temps réel"
            >
              <Wifi className="h-4 w-4" />
            </Button>
            
            {/* Bouton de reconnexion manuelle */}
            {realtimeStatus === 'disconnected' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  console.log('🔄 [PartnerReservations] Reconnexion manuelle demandée');
                  setRealtimeRetryCount(0);
                  setRealtimeStatus('connecting');
                }}
                className="h-8 w-8 p-0"
                title="Reconnecter manuellement"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            
            {/* Indicateur de connexion temps réel */}
            <div className="flex items-center gap-2">
              {realtimeStatus === 'connected' && (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">Temps réel</span>
                </div>
              )}
              {realtimeStatus === 'connecting' && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Connexion...</span>
                </div>
              )}
              {realtimeStatus === 'disconnected' && (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs">Hors ligne</span>
                </div>
              )}
              
              {/* Indicateur de dernière mise à jour */}
              {lastUpdateTime && realtimeStatus === 'connected' && (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">
                    Mis à jour {lastUpdateTime.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {hasActiveFilters ? 'Filtrées' : 'Total'}
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {loading || isLoadingBusiness ? (
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              ) : error ? (
                <div className="h-8 w-12 bg-red-100 rounded flex items-center justify-center">
                  <span className="text-red-500 text-xs">!</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{filteredStats.total}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters ? 'Réservations filtrées' : 'Réservations'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              {loading || isLoadingBusiness ? (
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              ) : error ? (
                <div className="h-8 w-12 bg-red-100 rounded flex items-center justify-center">
                  <span className="text-red-500 text-xs">!</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{filteredStats.pending}</div>
              )}
              <p className="text-xs text-muted-foreground">À confirmer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {loading || isLoadingBusiness ? (
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              ) : error ? (
                <div className="h-8 w-12 bg-red-100 rounded flex items-center justify-center">
                  <span className="text-red-500 text-xs">!</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{filteredStats.confirmed}</div>
              )}
              <p className="text-xs text-muted-foreground">Validées</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <Check className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {loading || isLoadingBusiness ? (
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              ) : error ? (
                <div className="h-8 w-12 bg-red-100 rounded flex items-center justify-center">
                  <span className="text-red-500 text-xs">!</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{filteredStats.completed}</div>
              )}
              <p className="text-xs text-muted-foreground">Aujourd'hui</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absents</CardTitle>
              <XCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {loading || isLoadingBusiness ? (
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              ) : error ? (
                <div className="h-8 w-12 bg-red-100 rounded flex items-center justify-center">
                  <span className="text-red-500 text-xs">!</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{filteredStats.no_show}</div>
              )}
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

        {/* Tableau des réservations */}
        <Card>
          <CardHeader>
            <CardTitle>Réservations ({filteredReservations.length})</CardTitle>
            <CardDescription>
              Liste des réservations avec toutes les informations
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
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Personnes</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations
                      .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
                      .map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{reservation.customer_name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {reservation.id.slice(0, 8)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {reservation.customer_phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {reservation.customer_phone}
                                </div>
                              )}
                              {reservation.customer_email && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {reservation.customer_email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {format(new Date(reservation.date), 'dd/MM/yyyy')}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {reservation.time}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{reservation.guests}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {reservation.table_number ? (
                              <Badge variant="outline">
                                Table {reservation.table_number}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">Non assignée</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(reservation.status)}>
                              {getStatusIcon(reservation.status)}
                              {getStatusLabel(reservation.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                                  {(reservation.status !== 'cancelled' && reservation.status !== 'completed' && reservation.status !== 'no_show') && (
                                    <DropdownMenuItem onClick={() => handleOpenAssignTable(reservation)}>
                                      <TableIcon className="mr-2 h-4 w-4" />
                                      {reservation.table_number ? 'Modifier la table' : 'Assigner une table'}
                                    </DropdownMenuItem>
                                  )}
                                  {reservation.status !== 'cancelled' && reservation.status !== 'completed' && reservation.status !== 'no_show' && (
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Annuler
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
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
                  {(selectedReservation.status !== 'cancelled' && selectedReservation.status !== 'completed' && selectedReservation.status !== 'no_show') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleOpenAssignTable(selectedReservation);
                      }}
                    >
                      <TableIcon className="mr-2 h-4 w-4" />
                      {selectedReservation.table_number ? 'Modifier la table' : 'Assigner une table'}
                    </Button>
                  )}
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