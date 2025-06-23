import { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, Phone, Users, UtensilsCrossed, Coffee, Building, Hotel } from 'lucide-react';

// Mock data for establishments that accept reservations
const MOCK_ESTABLISHMENTS = {
  restaurants: [
    {
      id: 1,
      name: "Le Petit Baoulé",
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine: "Cuisine Guinéenne",
      address: "Rue KA-003, Quartier Almamya, Kaloum, Conakry",
      rating: 4.8,
      availableTimes: ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "21:00"],
      maxPartySize: 10
    },
    {
      id: 2,
      name: "Saveurs de Guinée",
      image: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine: "Cuisine Fusion",
      address: "Boulevard du Commerce, Quartier Camayenne, Dixinn, Conakry",
      rating: 4.5,
      availableTimes: ["11:30", "12:30", "13:30", "18:30", "19:30", "20:30"],
      maxPartySize: 8
    },
    {
      id: 3,
      name: "L'Atlantique",
      image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine: "Fruits de Mer",
      address: "Rue de la Plage, Quartier Landréah, Conakry",
      rating: 4.7,
      availableTimes: ["12:00", "13:00", "19:00", "20:00", "21:00"],
      maxPartySize: 6
    }
  ],
  cafes: [
    {
      id: 1,
      name: "Café Nimba",
      image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine: "Café et Pâtisseries",
      address: "Avenue de la République, Kaloum, Conakry",
      rating: 4.6,
      availableTimes: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      maxPartySize: 4
    },
    {
      id: 2,
      name: "Fouta Coffee House",
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine: "Café Artisanal",
      address: "Rue des Ministères, Quartier Minière, Conakry",
      rating: 4.4,
      availableTimes: ["07:30", "08:30", "09:30", "10:30", "14:30", "15:30", "16:30"],
      maxPartySize: 6
    }
  ],
  lounges: [
    {
      id: 1,
      name: "Lounge Baobab",
      image: "https://images.unsplash.com/photo-1597075687490-8eea8c19377a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine: "Cocktails et Tapas",
      address: "Avenue de la Marina, Kaloum, Conakry",
      rating: 4.9,
      availableTimes: ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"],
      maxPartySize: 8
    },
    {
      id: 2,
      name: "Sky Lounge Conakry",
      image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine: "Bar à Cocktails",
      address: "Tour Emeraude, 15ème étage, Quartier Almamya, Conakry",
      rating: 4.7,
      availableTimes: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
      maxPartySize: 12
    }
  ],
  hotels: [
    {
      id: 1,
      name: "Hôtel Kakimbo",
      image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine: "Restaurant Gastronomique",
      address: "Route de l'Aéroport, Quartier Gbéssia, Conakry",
      rating: 4.8,
      availableTimes: ["12:00", "13:00", "14:00", "19:00", "20:00", "21:00"],
      maxPartySize: 10
    },
    {
      id: 2,
      name: "Grand Hôtel de Conakry",
      image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      cuisine: "Cuisine Internationale",
      address: "Boulevard du Commerce, Quartier Camayenne, Conakry",
      rating: 4.6,
      availableTimes: ["07:00", "08:00", "12:30", "13:30", "19:30", "20:30"],
      maxPartySize: 8
    }
  ]
};

const ReservationPage = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEstablishment, setSelectedEstablishment] = useState<any>(null);
  const [category, setCategory] = useState("restaurants");
  const [guestCount, setGuestCount] = useState("2");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const handleSelectEstablishment = (establishment: any) => {
    setSelectedEstablishment(establishment);
    setSelectedTime(null); // Reset time when establishment changes
  };

  const handleReservation = () => {
    if (!date || !selectedTime || !selectedEstablishment || !name || !phone) {
      toast({
        title: "Information manquante",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // In a real app, we would send the reservation to a backend
    toast({
      title: "Réservation confirmée!",
      description: `Votre réservation à ${selectedEstablishment.name} pour ${guestCount} personnes le ${format(date, 'dd/MM/yyyy')} à ${selectedTime} a été confirmée.`,
    });

    // Reset form
    setSelectedEstablishment(null);
    setSelectedTime(null);
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "restaurants":
        return <UtensilsCrossed className="w-5 h-5" />;
      case "cafes":
        return <Coffee className="w-5 h-5" />;
      case "lounges":
        return <Building className="w-5 h-5" />;
      case "hotels":
        return <Hotel className="w-5 h-5" />;
      default:
        return <UtensilsCrossed className="w-5 h-5" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservations</h1>
          <p className="text-gray-600">Réservez votre place dans les meilleurs établissements de Conakry</p>
        </div>

        <Tabs defaultValue="restaurants" className="w-full" onValueChange={(value) => setCategory(value)}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="restaurants" className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              <span className="hidden sm:inline">Restaurants</span>
            </TabsTrigger>
            <TabsTrigger value="cafes" className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              <span className="hidden sm:inline">Cafés</span>
            </TabsTrigger>
            <TabsTrigger value="lounges" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Lounges</span>
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              <span className="hidden sm:inline">Hôtels</span>
            </TabsTrigger>
          </TabsList>

          {Object.entries(MOCK_ESTABLISHMENTS).map(([key, establishments]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {establishments.map((establishment) => (
                  <Card 
                    key={establishment.id} 
                    className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${selectedEstablishment?.id === establishment.id ? 'ring-2 ring-guinea-red' : ''}`}
                    onClick={() => handleSelectEstablishment(establishment)}
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={establishment.image} 
                        alt={establishment.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{establishment.name}</CardTitle>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span> {establishment.rating}
                        </Badge>
                      </div>
                      <CardDescription>{establishment.cuisine}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{establishment.address}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {selectedEstablishment && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Réservez chez {selectedEstablishment.name}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Détails de la réservation</CardTitle>
                  <CardDescription>Sélectionnez une date et une heure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal mt-1"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "dd MMMM yyyy") : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => 
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="time">Heure</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                        {selectedEstablishment.availableTimes.map((time: string) => (
                          <Button
                            key={time}
                            type="button"
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className="h-10"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="guests">Nombre de personnes</Label>
                      <Select value={guestCount} onValueChange={setGuestCount}>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Nombre de personnes" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: selectedEstablishment.maxPartySize }, (_, i) => i + 1).map(
                            (num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? "personne" : "personnes"}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vos informations</CardTitle>
                  <CardDescription>Saisissez vos coordonnées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1"
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1"
                        placeholder="Ex: +224 621 23 45 67"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1"
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes spéciales</Label>
                      <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1"
                        placeholder="Allergies, occasions spéciales, préférences..."
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleReservation} className="w-full" size="lg">
                    Confirmer la réservation
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReservationPage; 