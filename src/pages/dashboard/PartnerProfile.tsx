import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout, { partnerNavItems } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../components/ui/use-toast';
import { X, Upload, Edit, Check, Loader2, MapPin, Search } from 'lucide-react';
import { usePartnerProfile } from '../../hooks/use-partner-profile';
import { Skeleton } from '../../components/ui/skeleton';

// Types pour Google Maps
declare global {
  interface Window {
    google: any;
  }
}

const PartnerProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const { 
    profile, 
    isLoading, 
    isUpdating, 
    isUploading, 
    error, 
    updateProfile, 
    uploadImage 
  } = usePartnerProfile();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    address: "",
    cuisine_type: "",
    opening_hours: "",
    delivery_fee: "",
    delivery_time: "",
  });

  // États pour la carte Google Maps
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialiser Google Maps
  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && window.google) {
        const defaultLocation = { lat: 9.5370, lng: -13.6785 }; // Conakry, Guinée
        
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 13,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        const markerInstance = new window.google.maps.Marker({
          position: defaultLocation,
          map: mapInstance,
          draggable: true,
          title: "Votre restaurant",
        });

        // Gérer le déplacement du marqueur
        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition();
          if (position) {
            reverseGeocode(position.lat(), position.lng());
          }
        });

        // Gérer le clic sur la carte
        mapInstance.addListener('click', (event: any) => {
          const position = event.latLng;
          markerInstance.setPosition(position);
          reverseGeocode(position.lat(), position.lng());
        });

        setMap(mapInstance);
        setMarker(markerInstance);

        // Initialiser SearchBox
        if (searchInputRef.current) {
          const searchBoxInstance = new window.google.maps.places.SearchBox(searchInputRef.current);
          setSearchBox(searchBoxInstance);

          // Gérer les résultats de recherche
          searchBoxInstance.addListener('places_changed', () => {
            const places = searchBoxInstance.getPlaces();
            if (places && places.length > 0) {
              const place = places[0];
              if (place.geometry && place.geometry.location) {
                const position = place.geometry.location;
                mapInstance.setCenter(position);
                mapInstance.setZoom(16);
                markerInstance.setPosition(position);
                setFormData(prev => ({ ...prev, address: place.formatted_address || "" }));
                setSearchQuery(place.formatted_address || "");
              }
            }
          });
        }
      }
    };

    // Charger Google Maps API
    const loadGoogleMapsAPI = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDIp_O6TQg33J4Z2M44Uj3SEJZfTq1EqZU&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    loadGoogleMapsAPI();
  }, []);

  // Initialiser les données du formulaire quand le profil est chargé
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        description: profile.description || "",
        address: profile.address || "",
        cuisine_type: profile.cuisine_type || "",
        opening_hours: profile.opening_hours || "",
        delivery_fee: profile.delivery_fee?.toString() || "",
        delivery_time: profile.delivery_time || "",
      });
      
      // Si on a une adresse, la rechercher sur la carte
      if (profile.address && map && searchBox) {
        setSearchQuery(profile.address);
        searchBox.set('query', profile.address);
        searchBox.trigger('places_changed');
      }
    }
  }, [profile, map, searchBox]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      description: formData.description,
      address: formData.address,
      cuisine_type: formData.cuisine_type,
      opening_hours: formData.opening_hours,
      delivery_fee: parseInt(formData.delivery_fee) || 0,
      delivery_time: formData.delivery_time,
    };

    const success = await updateProfile(updateData);
    if (success) {
      setIsEditing(false);
    }
  };

  // Fonction pour obtenir l'adresse à partir des coordonnées
  const reverseGeocode = (lat: number, lng: number) => {
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          setFormData(prev => ({ ...prev, address }));
          setSearchQuery(address);
        }
      });
    }
  };

  // Gérer la recherche d'adresse
  const handleAddressSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(query.length > 2);
    
    if (query.length > 2 && window.google && window.google.maps) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input: query, componentRestrictions: { country: 'gn' } }, // Restreindre à la Guinée
        (predictions, status) => {
          if (status === 'OK' && predictions) {
            setSuggestions(predictions.map(p => p.description));
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setSuggestions([]);
    }
  };

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setFormData(prev => ({ ...prev, address: suggestion }));
    setShowSuggestions(false);
    
    // Rechercher l'endroit et centrer la carte
    if (searchBox) {
      searchBox.set('query', suggestion);
      searchBox.trigger('places_changed');
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file, 'logo');
    }
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file, 'cover_image');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord partenaire">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96 md:col-span-2" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord partenaire">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Erreur</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Réessayer
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={partnerNavItems} title="Tableau de bord partenaire">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profil Restaurant</h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} disabled={isUpdating}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier le profil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Sauvegarder
              </Button>
            </div>
          )}
        </div>

        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={profile?.cover_image || "/placeholder-cover.jpg"} 
            alt="Couverture restaurant" 
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <div className="absolute bottom-4 right-4">
              <label htmlFor="cover-upload" className="cursor-pointer">
                <div className="bg-primary text-white p-2 rounded-full">
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </div>
                <input 
                  id="cover-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleCoverImageChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile?.logo || "/placeholder-restaurant.jpg"} alt="Logo restaurant" />
                  <AvatarFallback>{profile?.name?.substring(0, 2).toUpperCase() || "RT"}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label htmlFor="profile-upload" className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="bg-primary text-white p-2 rounded-full">
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </div>
                    <input 
                      id="profile-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleProfileImageChange}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
              <h3 className="text-xl font-semibold text-center">{profile?.name || "Nom du restaurant"}</h3>
              <p className="text-muted-foreground text-center">{profile?.cuisine_type || "Type de cuisine"} Cuisine</p>
              
              <div className="w-full mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Statut: {profile?.is_active ? "Actif" : "Inactif"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ouvert: {profile?.is_open ? "Oui" : "Non"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations Restaurant</CardTitle>
              <CardDescription>
                Gérez les informations de votre restaurant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Informations de base</TabsTrigger>
                  <TabsTrigger value="business">Détails commerciaux</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom du restaurant</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cuisine_type">Type de cuisine</Label>
                      <Select 
                        disabled={!isEditing}
                        value={formData.cuisine_type}
                        onValueChange={(value) => setFormData(prev => ({...prev, cuisine_type: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type de cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="International">International</SelectItem>
                          <SelectItem value="Italien">Italien</SelectItem>
                          <SelectItem value="Mexicain">Mexicain</SelectItem>
                          <SelectItem value="Asiatique">Asiatique</SelectItem>
                          <SelectItem value="Américain">Américain</SelectItem>
                          <SelectItem value="Méditerranéen">Méditerranéen</SelectItem>
                          <SelectItem value="Africain">Africain</SelectItem>
                          <SelectItem value="Guinéen">Guinéen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email"
                        value={formData.email} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Adresse</Label>
                      <div className="space-y-3">
                        {/* Barre de recherche avec suggestions */}
                        <div className="relative">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              ref={searchInputRef}
                              id="address-search"
                              placeholder="Rechercher une adresse..."
                              value={searchQuery}
                              onChange={(e) => handleAddressSearch(e.target.value)}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                          
                          {/* Suggestions d'adresse */}
                          {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => selectSuggestion(suggestion)}
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{suggestion}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Carte Google Maps */}
                        {isEditing && (
                          <div className="border rounded-lg overflow-hidden">
                            <div 
                              ref={mapRef} 
                              className="w-full h-64 bg-gray-100"
                              style={{ minHeight: '256px' }}
                            />
                            <div className="p-3 bg-gray-50 border-t">
                              <p className="text-xs text-gray-600 text-center">
                                Cliquez sur la carte ou déplacez le marqueur pour sélectionner votre adresse
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Champ d'adresse caché pour le formulaire */}
                        <Input 
                          id="address" 
                          name="address" 
                          value={formData.address} 
                          onChange={handleInputChange} 
                          disabled={!isEditing}
                          className="sr-only"
                        />
                        
                        {/* Affichage de l'adresse sélectionnée */}
                        {formData.address && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">Adresse sélectionnée :</p>
                                <p className="text-sm text-blue-700">{formData.address}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        rows={3}
                        value={formData.description} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="business" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="opening_hours">Heures d'ouverture</Label>
                      <Textarea 
                        id="opening_hours" 
                        name="opening_hours" 
                        value={formData.opening_hours} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery_time">Temps de livraison</Label>
                      <Input 
                        id="delivery_time" 
                        name="delivery_time" 
                        value={formData.delivery_time} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                        placeholder="ex: 30-45 min"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery_fee">Frais de livraison (FCFA)</Label>
                      <Input 
                        id="delivery_fee" 
                        name="delivery_fee" 
                        type="number"
                        value={formData.delivery_fee} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerProfile; 