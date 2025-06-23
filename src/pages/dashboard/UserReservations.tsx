import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout, { userNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, addHours, isBefore, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Phone, Star, X, Check, AlertCircle, Search, Filter, Plus, ArrowLeft, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Types for reservations
type ReservationType = 'restaurant' | 'cafe' | 'salon' | 'other';
type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

interface Establishment {
  id: string;
  name: string;
  type: ReservationType;
  image: string;
  address: string;
  phone: string;
  description: string;
  rating: number;
  openingHours: {
    open: string;
    close: string;
  };
  features: string[];
}

interface Reservation {
  id: string;
  establishmentId: string;
  establishmentName: string;
  establishmentType: ReservationType;
  establishmentImage: string;
  date: Date;
  time: string;
  partySize: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: Date;
}

// Mock establishments data for Guinea
const mockEstablishments: Establishment[] = [
  {
    id: 'est-1',
    name: 'Le Petit Conakry',
    type: 'restaurant',
    image: 'https://ui-avatars.com/api/?name=Le+Petit+Conakry&background=0D8ABC&color=fff',
    address: '15 Rue du Port, Kaloum, Conakry',
    phone: '+224 621 12 34 56',
    description: 'Restaurant traditionnel guinéen offrant des plats typiques comme le poulet yassa et le riz sauce arachide.',
    rating: 4.8,
    openingHours: {
      open: '10:00',
      close: '22:00',
    },
    features: ['Terrasse', 'Wi-Fi gratuit', 'Climatisation', 'Plats végétariens']
  },
  {
    id: 'est-2',
    name: 'Café Nimba',
    type: 'cafe',
    image: 'https://ui-avatars.com/api/?name=Café+Nimba&background=D4A017&color=fff',
    address: '45 Avenue de la République, Dixinn, Conakry',
    phone: '+224 622 23 45 67',
    description: 'Café moderne servant des cafés de spécialité, pâtisseries et petit-déjeuners dans un cadre contemporain.',
    rating: 4.5,
    openingHours: {
      open: '07:00',
      close: '20:00',
    },
    features: ['Wi-Fi gratuit', 'Prises électriques', 'Pâtisseries maison', 'Café de spécialité']
  },
  {
    id: 'est-3',
    name: 'Salon Belle Guinée',
    type: 'salon',
    image: 'https://ui-avatars.com/api/?name=Belle+Guinée&background=C24641&color=fff',
    address: '78 Rue des Palmiers, Ratoma, Conakry',
    phone: '+224 623 34 56 78',
    description: 'Salon de beauté moderne proposant coiffure, maquillage, manucure et soins esthétiques.',
    rating: 4.7,
    openingHours: {
      open: '09:00',
      close: '19:00',
    },
    features: ['Coiffure', 'Maquillage', 'Manucure', 'Pédicure', 'Soins du visage']
  },
  {
    id: 'est-4',
    name: 'Le Manguier Restaurant',
    type: 'restaurant',
    image: 'https://ui-avatars.com/api/?name=Le+Manguier&background=2E8B57&color=fff',
    address: '33 Boulevard du Commerce, Matam, Conakry',
    phone: '+224 624 45 67 89',
    description: 'Restaurant proposant une cuisine fusion guinéenne et internationale dans un cadre élégant.',
    rating: 4.6,
    openingHours: {
      open: '11:30',
      close: '23:00',
    },
    features: ['Climatisation', 'Parking', 'Plats végétariens', 'Bar']
  },
  {
    id: 'est-5',
    name: 'Conakry Spa & Wellness',
    type: 'salon',
    image: 'https://ui-avatars.com/api/?name=Conakry+Spa&background=64A8D1&color=fff',
    address: '12 Rue du Bien-Être, Ratoma, Conakry',
    phone: '+224 625 56 78 90',
    description: 'Centre de spa et bien-être proposant massages, soins du corps et rituels relaxants.',
    rating: 4.9,
    openingHours: {
      open: '10:00',
      close: '20:00',
    },
    features: ['Massages', 'Soins du corps', 'Hammam', 'Sauna', 'Aromathérapie']
  },
  {
    id: 'est-6',
    name: 'Baobab Café Culturel',
    type: 'cafe',
    image: 'https://ui-avatars.com/api/?name=Baobab+Café&background=8B6914&color=fff',
    address: '67 Avenue Cheick Anta Diop, Dixinn, Conakry',
    phone: '+224 626 67 89 01',
    description: "Café culturel proposant boissons artisanales, pâtisseries locales et espace d'exposition d'art guinéen.",
    rating: 4.4,
    openingHours: {
      open: '08:00',
      close: '21:00',
    },
    features: ['Expositions d\'art', 'Wi-Fi gratuit', 'Événements culturels', 'Produits locaux']
  }
];

// Mock user reservations
const mockUserReservations: Reservation[] = [
  {
    id: 'res-1',
    establishmentId: 'est-1',
    establishmentName: 'Le Petit Conakry',
    establishmentType: 'restaurant',
    establishmentImage: 'https://ui-avatars.com/api/?name=Le+Petit+Conakry&background=0D8ABC&color=fff',
    date: new Date(2023, 6, 25),
    time: '19:30',
    partySize: 4,
    status: 'confirmed',
    notes: 'Table en terrasse si possible',
    createdAt: new Date(2023, 6, 20)
  },
  {
    id: 'res-2',
    establishmentId: 'est-3',
    establishmentName: 'Salon Belle Guinée',
    establishmentType: 'salon',
    establishmentImage: 'https://ui-avatars.com/api/?name=Belle+Guinée&background=C24641&color=fff',
    date: new Date(2023, 6, 28),
    time: '14:00',
    partySize: 1,
    status: 'pending',
    notes: 'Coiffure et manucure',
    createdAt: new Date(2023, 6, 21)
  },
  {
    id: 'res-3',
    establishmentId: 'est-2',
    establishmentName: 'Café Nimba',
    establishmentType: 'cafe',
    establishmentImage: 'https://ui-avatars.com/api/?name=Café+Nimba&background=D4A017&color=fff',
    date: new Date(2023, 6, 22),
    time: '10:00',
    partySize: 2,
    status: 'completed',
    createdAt: new Date(2023, 6, 19)
  },
  {
    id: 'res-4',
    establishmentId: 'est-4',
    establishmentName: 'Le Manguier Restaurant',
    establishmentType: 'restaurant',
    establishmentImage: 'https://ui-avatars.com/api/?name=Le+Manguier&background=2E8B57&color=fff',
    date: new Date(2023, 6, 18),
    time: '20:00',
    partySize: 6,
    status: 'cancelled',
    notes: 'Annulation pour cause de maladie',
    createdAt: new Date(2023, 6, 15)
  }
];

// Helper functions
const getEstablishmentTypeLabel = (type: ReservationType): string => {
  switch (type) {
    case 'restaurant':
      return 'Restaurant';
    case 'cafe':
      return 'Café';
    case 'salon':
      return 'Salon de beauté';
    default:
      return 'Autre';
  }
};

const getStatusBadge = (status: ReservationStatus) => {
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

const getTimeOptions = (openHour: string, closeHour: string) => {
  const times = [];
  const [openHours, openMinutes] = openHour.split(':').map(Number);
  const [closeHours, closeMinutes] = closeHour.split(':').map(Number);
  
  let startDate = new Date();
  startDate.setHours(openHours, openMinutes, 0, 0);
  
  let endDate = new Date();
  endDate.setHours(closeHours, closeMinutes, 0, 0);
  
  // Add a buffer before closing (usually 1-2 hours)
  const lastReservation = new Date(endDate);
  lastReservation.setHours(endDate.getHours() - 1);
  
  // Generate time slots in 30 minute increments
  let current = new Date(startDate);
  
  while (current <= lastReservation) {
    times.push(format(current, 'HH:mm'));
    current.setMinutes(current.getMinutes() + 30);
  }
  
  return times;
};

const UserReservations = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reservations, setReservations] = useState<Reservation[]>(mockUserReservations);
  const [establishments, setEstablishments] = useState<Establishment[]>(mockEstablishments);
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>(mockEstablishments);
  
  // Booking state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // New reservation state
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [reservationDate, setReservationDate] = useState<Date | undefined>(new Date());
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [notes, setNotes] = useState('');
  
  // Cancellation state
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);
  
  // Filter establishments
  const handleFilterEstablishments = () => {
    let filtered = [...establishments];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(est => 
        est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(est => est.type === filterType);
    }
    
    setFilteredEstablishments(filtered);
  };
  
  // Handle establishment selection
  const handleSelectEstablishment = (establishment: Establishment) => {
    setSelectedEstablishment(establishment);
    // Default time to a reasonable hour
    const defaultHour = '19:00';
    setReservationTime(defaultHour);
  };
  
  // Handle reservation creation
  const handleCreateReservation = () => {
    if (!selectedEstablishment || !reservationDate || !reservationTime || !partySize) {
      toast({
        title: "Information incomplète",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new reservation
    const newReservation: Reservation = {
      id: `res-${Math.floor(Math.random() * 10000)}`,
      establishmentId: selectedEstablishment.id,
      establishmentName: selectedEstablishment.name,
      establishmentType: selectedEstablishment.type,
      establishmentImage: selectedEstablishment.image,
      date: reservationDate,
      time: reservationTime,
      partySize: parseInt(partySize, 10),
      status: 'pending',
      notes: notes,
      createdAt: new Date()
    };
    
    // Add the new reservation to the list
    setReservations([newReservation, ...reservations]);
    
    // Reset form
    setSelectedEstablishment(null);
    setReservationDate(new Date());
    setReservationTime('');
    setPartySize('2');
    setNotes('');
    
    // Close dialog
    setBookingOpen(false);
    
    // Show success message
    toast({
      title: "Réservation créée",
      description: "Votre demande de réservation a été soumise avec succès.",
    });
  };
  
  // Handle reservation cancellation
  const handleCancelReservation = () => {
    if (!reservationToCancel) return;
    
    // Update reservation status
    const updatedReservations = reservations.map(res => 
      res.id === reservationToCancel ? { ...res, status: 'cancelled' } : res
    );
    
    setReservations(updatedReservations);
    setConfirmCancelOpen(false);
    setReservationToCancel(null);
    
    toast({
      title: "Réservation annulée",
      description: "Votre réservation a été annulée avec succès.",
    });
  };
  
  // Filter reservations by status
  const upcomingReservations = reservations.filter(res => 
    (res.status === 'confirmed' || res.status === 'pending') && 
    (new Date(`${format(res.date, 'yyyy-MM-dd')}T${res.time}`) > new Date())
  );
  
  const pastReservations = reservations.filter(res => 
    res.status === 'completed' || 
    res.status === 'cancelled' ||
    (new Date(`${format(res.date, 'yyyy-MM-dd')}T${res.time}`) <= new Date())
  );
  
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
                    Réservez une table dans un restaurant ou un rendez-vous dans un salon de beauté.
                  </p>
                  <Button onClick={() => setBookingOpen(true)}>
                    Faire une réservation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {upcomingReservations.map(reservation => (
                  <Card key={reservation.id} className="overflow-hidden">
                    <div className="h-36 bg-gray-100 relative">
                      <img 
                        src={reservation.establishmentImage} 
                        alt={reservation.establishmentName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(reservation.status)}
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{reservation.establishmentName}</CardTitle>
                      <CardDescription>
                        {getEstablishmentTypeLabel(reservation.establishmentType)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{format(reservation.date, 'dd MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{reservation.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{reservation.partySize} {reservation.partySize > 1 ? 'personnes' : 'personne'}</span>
                      </div>
                      {reservation.notes && (
                        <div className="text-sm bg-gray-50 p-2 rounded-md">
                          <p className="font-medium mb-1">Notes:</p>
                          <p className="text-gray-600">{reservation.notes}</p>
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
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {pastReservations.map(reservation => (
                  <Card key={reservation.id} className="overflow-hidden">
                    <div className="h-36 bg-gray-100 relative">
                      <img 
                        src={reservation.establishmentImage} 
                        alt={reservation.establishmentName}
                        className="w-full h-full object-cover opacity-70"
                      />
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(reservation.status)}
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{reservation.establishmentName}</CardTitle>
                      <CardDescription>
                        {getEstablishmentTypeLabel(reservation.establishmentType)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{format(reservation.date, 'dd MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{reservation.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{reservation.partySize} {reservation.partySize > 1 ? 'personnes' : 'personne'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* New Reservation Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Nouvelle réservation</DialogTitle>
            <DialogDescription>
              Réservez dans un restaurant, café ou salon de beauté à Conakry.
            </DialogDescription>
          </DialogHeader>
          
          {!selectedEstablishment ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Rechercher un établissement..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleFilterEstablishments();
                      }}
                    />
                  </div>
                </div>
                <Select
                  value={filterType}
                  onValueChange={(value) => {
                    setFilterType(value);
                    handleFilterEstablishments();
                  }}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filtrer par type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="restaurant">Restaurants</SelectItem>
                    <SelectItem value="cafe">Cafés</SelectItem>
                    <SelectItem value="salon">Salons de beauté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {filteredEstablishments.map(establishment => (
                  <Card 
                    key={establishment.id} 
                    className="cursor-pointer hover:border-guinea-red/50 transition-colors"
                    onClick={() => handleSelectEstablishment(establishment)}
                  >
                    <div className="flex h-full">
                      <div className="w-1/3 bg-gray-100">
                        <img 
                          src={establishment.image} 
                          alt={establishment.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-2/3 p-4">
                        <h3 className="font-semibold">{establishment.name}</h3>
                        <p className="text-sm text-gray-500">{getEstablishmentTypeLabel(establishment.type)}</p>
                        <div className="flex items-center mt-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span>{establishment.rating}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 flex items-start">
                          <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          <span>{establishment.address}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{establishment.openingHours.open} - {establishment.openingHours.close}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto mr-2"
                  onClick={() => setSelectedEstablishment(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold text-lg">{selectedEstablishment.name}</h3>
              </div>
              
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div>
                  <div className="bg-gray-100 h-40 rounded-md overflow-hidden">
                    <img 
                      src={selectedEstablishment.image} 
                      alt={selectedEstablishment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                      <span>{selectedEstablishment.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{selectedEstablishment.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Ouvert de {selectedEstablishment.openingHours.open} à {selectedEstablishment.openingHours.close}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">{selectedEstablishment.description}</p>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedEstablishment.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {reservationDate ? (
                            format(reservationDate, 'PPP', { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
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
                    <Label htmlFor="time">Heure</Label>
                    <Select value={reservationTime} onValueChange={setReservationTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une heure" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTimeOptions(
                          selectedEstablishment.openingHours.open, 
                          selectedEstablishment.openingHours.close
                        ).map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="partySize">Nombre de personnes</Label>
                    <Select value={partySize} onValueChange={setPartySize}>
                      <SelectTrigger>
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
                    <Label htmlFor="notes">Notes spéciales</Label>
                    <textarea
                      id="notes"
                      placeholder="Instructions ou demandes spéciales..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>Annuler</Button>
            {selectedEstablishment && (
              <Button 
                onClick={handleCreateReservation}
                disabled={!reservationDate || !reservationTime || !partySize}
                className="bg-guinea-red hover:bg-guinea-red/90"
              >
                Réserver
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Cancellation Dialog */}
      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer l'annulation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center py-2">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-sm text-gray-600">
              L'établissement sera informé de l'annulation de votre réservation.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancelOpen(false)}>
              Retour
            </Button>
            <Button variant="destructive" onClick={handleCancelReservation}>
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserReservations; 