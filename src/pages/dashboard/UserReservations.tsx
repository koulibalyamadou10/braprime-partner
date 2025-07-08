import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Phone, Star, X, Check, AlertCircle, Search, Plus, ArrowLeft, User, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRestaurantsReservations } from '@/hooks/use-restaurants-reservations';
import { useReservations } from '@/hooks/use-reservations';
import { Business } from '@/lib/services/business';
import { Reservation } from '@/lib/services/reservations';

// Helper functions
const getStatusBadge = (status: Reservation['status']) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><Check className="mr-1 h-3 w-3" /> Confirmée</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="mr-1 h-3 w-3" /> En attente</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><X className="mr-1 h-3 w-3" /> Annulée</Badge>;
    case 'completed':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Check className="mr-1 h-3 w-3" /> Terminée</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
  }
};

const getTimeUntilReservation = (date: string, time: string) => {
  const reservationDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  const diffInMs = reservationDateTime.getTime() - now.getTime();
  
  if (diffInMs <= 0) return null;
  
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays > 0) {
    return `${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInHours > 0) {
    return `${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  }
};

const getTimeOptions = (openingHours: string) => {
  const times = [];
  const [openHour, closeHour] = openingHours.split('-');
  
  if (!openHour || !closeHour) {
    return ['12:00', '13:00', '14:00', '19:00', '20:00', '21:00'];
  }
  
  const [openHours, openMinutes] = openHour.split(':').map(Number);
  const [closeHours, closeMinutes] = closeHour.split(':').map(Number);
  
  let startDate = new Date();
  startDate.setHours(openHours, openMinutes, 0, 0);
  
  let endDate = new Date();
  endDate.setHours(closeHours, closeMinutes, 0, 0);
  
  const lastReservation = new Date(endDate);
  lastReservation.setHours(endDate.getHours() - 1);
  
  let current = new Date(startDate);
  
  while (current <= lastReservation) {
    times.push(format(current, 'HH:mm'));
    current.setMinutes(current.getMinutes() + 30);
  }
  
  return times.length > 0 ? times : ['12:00', '13:00', '14:00', '19:00', '20:00', '21:00'];
};

const UserReservations = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { 
    restaurants, 
    filteredRestaurants, 
    isLoading: restaurantsLoading, 
    error: restaurantsError, 
    filterRestaurants 
  } = useRestaurantsReservations();
  
  const {
    reservations,
    isLoading: reservationsLoading,
    error: reservationsError,
    createReservation,
    cancelReservation
  } = useReservations();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Booking state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New reservation state
  const [selectedRestaurant, setSelectedRestaurant] = useState<Business | null>(null);
  const [reservationDate, setReservationDate] = useState<Date | undefined>(new Date());
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [notes, setNotes] = useState('');
  
  // Cancellation state
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);
  
  // Handle restaurant selection
  const handleSelectRestaurant = (restaurant: Business) => {
    setSelectedRestaurant(restaurant);
    const defaultHour = '19:00';
    setReservationTime(defaultHour);
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterRestaurants(query);
  };
  
  // Handle reservation creation
  const handleCreateReservation = async () => {
    if (!selectedRestaurant || !reservationDate || !reservationTime || !partySize) {
      toast({
        title: "Information incomplète",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }
    
    const result = await createReservation({
      business_id: selectedRestaurant.id,
      business_name: selectedRestaurant.name,
      date: format(reservationDate, 'yyyy-MM-dd'),
      time: reservationTime,
      guests: parseInt(partySize, 10),
      special_requests: notes
    });
    
    if (result.success) {
      setSelectedRestaurant(null);
      setReservationDate(new Date());
      setReservationTime('');
      setPartySize('2');
      setNotes('');
      setBookingOpen(false);
      
      toast({
        title: "Réservation créée",
        description: "Votre demande de réservation a été soumise avec succès.",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Erreur lors de la création de la réservation",
        variant: "destructive",
      });
    }
  };
  
  // Handle reservation cancellation
  const handleCancelReservation = async () => {
    if (!reservationToCancel) return;
    
    const result = await cancelReservation(reservationToCancel);
    
    if (result.success) {
      setConfirmCancelOpen(false);
      setReservationToCancel(null);
      
      toast({
        title: "Réservation annulée",
        description: "Votre réservation a été annulée avec succès.",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Erreur lors de l'annulation",
        variant: "destructive",
      });
    }
  };
  
  // Filter reservations by status and date
  const upcomingReservations = reservations.filter(res => {
    const reservationDateTime = new Date(`${res.date}T${res.time}`);
    const now = new Date();
    
    // Réservations à venir : seulement en attente ET date/heure dans le futur
    return res.status === 'pending' && reservationDateTime > now;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
  
  const pastReservations = reservations.filter(res => {
    const reservationDateTime = new Date(`${res.date}T${res.time}`);
    const now = new Date();
    
    // Historique : terminées, annulées, confirmées, ou réservations en attente passées
    return res.status === 'completed' || 
           res.status === 'cancelled' ||
           res.status === 'confirmed' ||
           (res.status === 'pending' && reservationDateTime <= now);
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });
  
  return (
    <DashboardLayout navItems={userNavItems} title="Réservations">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Réservations</h2>
            <p className="text-muted-foreground">Gérez vos réservations et planifiez de nouvelles visites.</p>
          </div>
          <Button onClick={() => setBookingOpen(true)} className="mt-4 md:mt-0 bg-guinea-red hover:bg-guinea-red/90">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle réservation
          </Button>
        </div>

        {reservationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Chargement de vos réservations...</span>
          </div>
        ) : reservationsError ? (
          <div className="flex items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <span className="ml-2 text-red-500">Erreur: {reservationsError}</span>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">À venir ({upcomingReservations.length})</TabsTrigger>
              <TabsTrigger value="past">Historique ({pastReservations.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingReservations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-center text-lg font-medium">Vous n'avez pas de réservations à venir</p>
                    <p className="text-center text-sm text-gray-500 mt-1 mb-4">
                        Réservez une table dans un restaurant.
                    </p>
                    <Button onClick={() => setBookingOpen(true)}>
                      Faire une réservation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Statistiques des réservations à venir */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {upcomingReservations.length}
                        </div>
                        <div className="text-sm text-gray-500">Réservations en attente</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Liste des réservations à venir */}
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingReservations.map(reservation => (
                      <Card key={reservation.id} className="overflow-hidden">
                        <div className="h-36 bg-gray-100 relative">
                          <img 
                              src={reservation.business_logo || reservation.business_cover_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(reservation.business_name)}&background=0D8ABC&color=fff`}
                              alt={reservation.business_name}
                            className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reservation.business_name)}&background=0D8ABC&color=fff`;
                              }}
                          />
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(reservation.status)}
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle>{reservation.business_name}</CardTitle>
                          <CardDescription>
                              {reservation.business_cuisine_type || 'Restaurant'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 pb-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                              <span>{format(new Date(reservation.date), 'dd MMMM yyyy', { locale: fr })}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{reservation.time}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <User className="mr-2 h-4 w-4 text-gray-500" />
                              <span>{reservation.guests} {reservation.guests > 1 ? 'personnes' : 'personne'}</span>
                            </div>
                            {reservation.business_address && (
                              <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                                <span className="text-gray-600">{reservation.business_address}</span>
                          </div>
                            )}
                            {getTimeUntilReservation(reservation.date, reservation.time) && (
                              <div className="flex items-center text-sm">
                                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                                <span className="text-blue-600 font-medium">
                                  Dans {getTimeUntilReservation(reservation.date, reservation.time)}
                                </span>
                              </div>
                            )}
                            {reservation.special_requests && (
                            <div className="text-sm bg-gray-50 p-2 rounded-md">
                              <p className="font-medium mb-1">Notes:</p>
                                <p className="text-gray-600">{reservation.special_requests}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          {reservation.status !== 'cancelled' && (
                            <Button 
                              variant="outline" 
                              className="w-full text-red-600 hover:text-red-700"
                              onClick={() => {
                                setReservationToCancel(reservation.id);
                                setConfirmCancelOpen(true);
                              }}
                            >
                              Annuler
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              {pastReservations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-center text-lg font-medium">Aucun historique de réservation</p>
                    <p className="text-center text-sm text-gray-500 mt-1">
                      Vos réservations passées apparaîtront ici.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Statistiques de l'historique */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {pastReservations.filter(r => r.status === 'completed').length}
                          </div>
                          <div className="text-sm text-gray-500">Terminées</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {pastReservations.filter(r => r.status === 'confirmed').length}
                          </div>
                          <div className="text-sm text-gray-500">Confirmées</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {pastReservations.filter(r => r.status === 'cancelled').length}
                          </div>
                          <div className="text-sm text-gray-500">Annulées</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {pastReservations.filter(r => r.status === 'pending').length}
                          </div>
                          <div className="text-sm text-gray-500">En attente (passées)</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Liste des réservations passées */}
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {pastReservations.map(reservation => (
                      <Card key={reservation.id} className="overflow-hidden">
                        <div className="h-36 bg-gray-100 relative">
                          <img 
                              src={reservation.business_logo || reservation.business_cover_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(reservation.business_name)}&background=0D8ABC&color=fff`}
                              alt={reservation.business_name}
                            className={`w-full h-full object-cover ${
                              reservation.status === 'cancelled' ? 'opacity-50' : 'opacity-70'
                            }`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reservation.business_name)}&background=0D8ABC&color=fff`;
                              }}
                          />
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(reservation.status)}
                          </div>
                          {reservation.status === 'cancelled' && (
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                              <X className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className={reservation.status === 'cancelled' ? 'line-through text-gray-500' : ''}>
                              {reservation.business_name}
                            </CardTitle>
                          <CardDescription>
                              {reservation.business_cuisine_type || 'Restaurant'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                              <span>{format(new Date(reservation.date), 'dd MMMM yyyy', { locale: fr })}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{reservation.time}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <User className="mr-2 h-4 w-4 text-gray-500" />
                              <span>{reservation.guests} {reservation.guests > 1 ? 'personnes' : 'personne'}</span>
                            </div>
                            {reservation.business_address && (
                              <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                                <span className="text-gray-600">{reservation.business_address}</span>
                          </div>
                            )}
                            {reservation.special_requests && (
                            <div className="text-sm bg-gray-50 p-2 rounded-md">
                              <p className="font-medium mb-1">Notes:</p>
                                <p className="text-gray-600">{reservation.special_requests}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* New Reservation Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle réservation</DialogTitle>
            <DialogDescription>
              Réservez dans un restaurant à Conakry.
            </DialogDescription>
          </DialogHeader>
          
          {!selectedRestaurant ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Rechercher un restaurant..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {restaurantsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Chargement des restaurants...</span>
                </div>
              ) : restaurantsError ? (
                <div className="flex items-center justify-center py-8">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <span className="ml-2 text-red-500">Erreur: {restaurantsError}</span>
                </div>
              ) : filteredRestaurants.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">
                    {searchQuery ? 'Aucun restaurant trouvé pour votre recherche.' : 'Aucun restaurant disponible.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-1">
                    {filteredRestaurants.map(restaurant => (
                    <Card 
                        key={restaurant.id} 
                      className="cursor-pointer hover:border-guinea-red/50 transition-colors"
                        onClick={() => handleSelectRestaurant(restaurant)}
                    >
                      <div className="flex h-full">
                        <div className="w-1/3 bg-gray-100 min-h-[80px]">
                          <img 
                              src={restaurant.cover_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurant.name)}&background=0D8ABC&color=fff`} 
                              alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-2/3 p-3">
                            <h3 className="font-semibold text-sm md:text-base">{restaurant.name}</h3>
                            <p className="text-xs md:text-sm text-gray-500">Restaurant</p>
                          <div className="flex items-center mt-1 text-xs md:text-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span>{restaurant.rating}</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-600 flex items-start">
                            <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{restaurant.address}</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-600 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                              <span className="line-clamp-1">{restaurant.opening_hours || 'Horaires non disponibles'}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto mr-2"
                  onClick={() => setSelectedRestaurant(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold text-lg">{selectedRestaurant.name}</h3>
              </div>
              
              <div className="grid gap-4 grid-cols-1">
                <div>
                  <div className="bg-gray-100 h-32 md:h-40 rounded-md overflow-hidden">
                    <img 
                      src={selectedRestaurant.cover_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedRestaurant.name)}&background=0D8ABC&color=fff`} 
                      alt={selectedRestaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                      <span className="text-sm">{selectedRestaurant.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedRestaurant.phone || 'Téléphone non disponible'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">Ouvert: {selectedRestaurant.opening_hours || 'Horaires non disponibles'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-700">{selectedRestaurant.description || 'Aucune description disponible.'}</p>
                  </div>
                  
                  {selectedRestaurant.cuisine_type && (
                  <div className="mt-3">
                      <Badge variant="outline" className="bg-gray-50">
                        {selectedRestaurant.cuisine_type}
                        </Badge>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left h-10"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {reservationDate ? (
                            format(reservationDate, 'PPP', { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={reservationDate}
                          onSelect={setReservationDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm">Heure</Label>
                    <Select value={reservationTime} onValueChange={setReservationTime}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Choisir une heure" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTimeOptions(selectedRestaurant.opening_hours || '12:00-22:00').map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="partySize" className="text-sm">Nombre de personnes</Label>
                    <Select value={partySize} onValueChange={setPartySize}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Nombre de personnes" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num > 1 ? 'personnes' : 'personne'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm">Notes spéciales</Label>
                    <textarea
                      id="notes"
                      placeholder="Instructions ou demandes spéciales..."
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setBookingOpen(false)} className="w-full sm:w-auto">Annuler</Button>
            {selectedRestaurant && (
              <Button 
                onClick={handleCreateReservation}
                disabled={!reservationDate || !reservationTime || !partySize}
                className="bg-guinea-red hover:bg-guinea-red/90 w-full sm:w-auto"
              >
                Réserver
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Cancellation Dialog */}
      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent className="w-[95vw] max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer l'annulation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center py-2">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-sm text-gray-600">
              Le restaurant sera informé de l'annulation de votre réservation.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setConfirmCancelOpen(false)} className="w-full sm:w-auto">
              Retour
            </Button>
            <Button variant="destructive" onClick={handleCancelReservation} className="w-full sm:w-auto">
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserReservations; 