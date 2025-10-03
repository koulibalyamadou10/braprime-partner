import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { X, Upload, Edit, Check, Loader2, MapPin, Search, Navigation } from 'lucide-react';
import { usePartnerProfile } from '../../hooks/use-partner-profile';
import { Skeleton } from '../../components/ui/skeleton';
import Unauthorized from '@/components/Unauthorized';
import { useCurrencyRole } from '@/contexts/UseRoleContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MAPS_CONFIG, getGoogleMapsApiUrl, handleGoogleMapsError, createFallbackAddress } from '@/lib/config/maps';

// Types pour Google Maps
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        places: {
          SearchBox: any;
          AutocompleteService: any;
        };
        Geocoder: any;
        MapTypeId: any;
        LatLng: any;
        event: {
          clearInstanceListeners: (instance: any) => void;
        };
      };
    };
  }
}

const PartnerProfile = () => {
  const { currencyRole, roles } = useCurrencyRole();

  if (!roles.includes("admin")) {
    return <Unauthorized />;
  }

  // État pour suivre le chargement de l'API
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiLoadError, setApiLoadError] = useState<string | null>(null);

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
    latitude: "",
    longitude: "",
    cuisine_type: "",
    opening_hours: "",
    delivery_fee: "",
    delivery_time: "",
  });

  // États pour la carte Google Maps
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchBox, setSearchBox] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fonction pour charger Google Maps API
  const loadGoogleMapsAPI = () => {
    if (!window.google) {
      // Vérifier si le script est déjà en cours de chargement
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return;
      }

      setIsApiLoading(true);
      setApiLoadError(null);

      const script = document.createElement('script');
      script.src = getGoogleMapsApiUrl();
      script.async = true;
      script.defer = true;
      
      // Ajouter un timeout pour éviter les blocages
      const timeoutId = setTimeout(() => {
        console.warn('Google Maps API prend trop de temps à charger');
        setIsApiLoading(false);
        setApiLoadError('timeout');
        // Afficher un message d'erreur à l'utilisateur
        toast({
          title: "Chargement de la carte",
          description: "La carte prend plus de temps que prévu. Veuillez patienter ou rafraîchir la page.",
          variant: "default"
        });
      }, 8000); // Réduit à 8 secondes

      script.onload = () => {
        clearTimeout(timeoutId);
        setIsApiLoading(false);
        setApiLoadError(null);
        // Initialiser la carte après le chargement
        if (mapRef.current && window.google) {
          initMap();
        }
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        setIsApiLoading(false);
        setApiLoadError('network');
        console.error('Erreur lors du chargement de Google Maps API');
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger la carte Google Maps. Veuillez rafraîchir la page.",
          variant: "destructive"
        });
      };

      document.head.appendChild(script);
    } else {
      // Si l'API est déjà chargée, initialiser directement
      if (mapRef.current) {
        initMap();
      }
    }
  };

  // Fonction pour initialiser la carte
  const initMap = () => {
    if (mapRef.current && window.google) {
      // Nettoyer les instances existantes avant d'en créer de nouvelles
      if (map) {
        try {
          window.google.maps.event.clearInstanceListeners(map);
        } catch (error) {
          console.warn('Erreur lors du nettoyage de la carte existante:', error);
        }
      }
      if (marker) {
        try {
          window.google.maps.event.clearInstanceListeners(marker);
        } catch (error) {
          console.warn('Erreur lors du nettoyage du marqueur existant:', error);
        }
      }
      if (searchBox) {
        try {
          window.google.maps.event.clearInstanceListeners(searchBox);
        } catch (error) {
          console.warn('Erreur lors du nettoyage de la recherche existante:', error);
        }
      }

      const defaultLocation = MAPS_CONFIG.DEFAULT_LOCATION;
      
      // Configuration optimisée de la carte
      const mapOptions = {
        center: defaultLocation,
        zoom: MAPS_CONFIG.MAP_OPTIONS.zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: MAPS_CONFIG.MAP_OPTIONS.mapTypeControl,
        streetViewControl: MAPS_CONFIG.MAP_OPTIONS.streetViewControl,
        fullscreenControl: MAPS_CONFIG.MAP_OPTIONS.fullscreenControl,
        disableDefaultUI: MAPS_CONFIG.MAP_OPTIONS.disableDefaultUI,
        gestureHandling: MAPS_CONFIG.MAP_OPTIONS.gestureHandling,
        tilt: MAPS_CONFIG.MAP_OPTIONS.tilt,
        heading: MAPS_CONFIG.MAP_OPTIONS.heading,
        backgroundColor: MAPS_CONFIG.MAP_OPTIONS.backgroundColor,
        maxZoom: MAPS_CONFIG.MAP_OPTIONS.maxZoom,
        minZoom: MAPS_CONFIG.MAP_OPTIONS.minZoom
      };

      const mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);

      // Créer le marqueur avec des options optimisées
      const markerInstance = new window.google.maps.Marker({
        position: defaultLocation,
        map: mapInstance,
        draggable: MAPS_CONFIG.MARKER_OPTIONS.draggable,
        title: MAPS_CONFIG.MARKER_OPTIONS.title,
        optimized: MAPS_CONFIG.MARKER_OPTIONS.optimized,
        zIndex: MAPS_CONFIG.MARKER_OPTIONS.zIndex
      });

      // Gérer le déplacement du marqueur avec debounce
      let dragTimeout: NodeJS.Timeout;
      markerInstance.addListener('dragend', () => {
        clearTimeout(dragTimeout);
        dragTimeout = setTimeout(() => {
          const position = markerInstance.getPosition();
          if (position) {
            reverseGeocode(position.lat(), position.lng());
          }
        }, 300); // Délai de 300ms pour éviter les appels répétés
      });

      // Gérer le clic sur la carte avec debounce
      let clickTimeout: NodeJS.Timeout;
      mapInstance.addListener('click', (event: any) => {
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          const position = event.latLng;
          markerInstance.setPosition(position);
          reverseGeocode(position.lat(), position.lng());
        }, 100);
      });

      // Initialiser SearchBox de manière asynchrone
      setTimeout(() => {
        if (searchInputRef.current) {
          const searchBoxInstance = new window.google.maps.places.SearchBox(searchInputRef.current);
          setSearchBox(searchBoxInstance);

          // Gérer les résultats de recherche
          searchBoxInstance.addListener('places_changed', () => {
            try {
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
            } catch (error) {
              console.error('Erreur lors de la recherche de lieu:', error);
              toast({
                title: "Erreur de recherche",
                description: "Impossible de rechercher le lieu. Saisissez l'adresse manuellement.",
                variant: "destructive"
              });
            }
          });
        }
      }, 100);

      // Mettre à jour les états
      setMap(mapInstance);
      setMarker(markerInstance);
    }
  };

  // Initialiser Google Maps
  useEffect(() => {
    // Charger l'API seulement quand l'utilisateur passe en mode édition
    if (isEditing) {
      loadGoogleMapsAPI();
    }

    // Cleanup function
    return () => {
      // Nettoyer les listeners de manière sécurisée
      try {
        if (map && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(map);
        }
      } catch (error) {
        console.warn('Erreur lors du nettoyage de la carte:', error);
      }

      try {
        if (marker && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(marker);
        }
      } catch (error) {
        console.warn('Erreur lors du nettoyage du marqueur:', error);
      }

      try {
        if (searchBox && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(searchBox);
        }
      } catch (error) {
        console.warn('Erreur lors du nettoyage de la recherche:', error);
      }
    };
  }, [isEditing]); // Suppression des dépendances problématiques

  // Initialiser les données du formulaire quand le profil est chargé
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        description: profile.description || "",
        address: profile.address || "",
        latitude: profile.latitude?.toString() || "",
        longitude: profile.longitude?.toString() || "",
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
  }, [profile?.id, map, searchBox]); // Utiliser profile.id pour éviter les re-renders inutiles

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Si les coordonnées sont modifiées manuellement, mettre à jour la carte
    if ((name === 'latitude' || name === 'longitude') && map && marker) {
      const lat = name === 'latitude' ? parseFloat(value) : parseFloat(formData.latitude);
      const lng = name === 'longitude' ? parseFloat(value) : parseFloat(formData.longitude);
      
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        const newPosition = { lat, lng };
        map.setCenter(newPosition);
        map.setZoom(16);
        marker.setPosition(newPosition);
      }
    }
  }, [formData.latitude, formData.longitude, map, marker]);

  const handleSave = useCallback(async () => {
    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      description: formData.description,
      address: formData.address,
      latitude: parseFloat(formData.latitude) || null,
      longitude: parseFloat(formData.longitude) || null,
      cuisine_type: formData.cuisine_type,
      opening_hours: formData.opening_hours,
      delivery_fee: parseInt(formData.delivery_fee) || 0,
      delivery_time: formData.delivery_time,
    };

    const success = await updateProfile(updateData);
    if (success) {
      // Attendre un peu avant de changer l'état pour éviter les conflits de DOM
      setTimeout(() => {
        setIsEditing(false);
      }, 100);
    }
  }, [formData, updateProfile]);

  // Fonction pour obtenir l'adresse à partir des coordonnées (mémorisée)
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (window.google && window.google.maps) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const address = results[0].formatted_address;
            setFormData(prev => ({ 
              ...prev, 
              address,
              latitude: lat.toString(),
              longitude: lng.toString()
            }));
            setSearchQuery(address);
          } else if (status === 'OVER_QUERY_LIMIT' || status === 'REQUEST_DENIED') {
            // Si la facturation n'est pas activée, utiliser une adresse par défaut
            console.warn('Service de géocodage non disponible:', status);
            const defaultAddress = createFallbackAddress(lat, lng);
            setFormData(prev => ({ 
              ...prev, 
              address: defaultAddress,
              latitude: lat.toString(),
              longitude: lng.toString()
            }));
            setSearchQuery(defaultAddress);
            
            toast({
              title: "Géocodage limité",
              description: handleGoogleMapsError(status),
              variant: "default"
            });
          }
        });
      } catch (error) {
        console.error('Erreur lors du géocodage:', error);
        // En cas d'erreur, utiliser les coordonnées
        const fallbackAddress = createFallbackAddress(lat, lng);
        setFormData(prev => ({ 
          ...prev, 
          address: fallbackAddress,
          latitude: lat.toString(),
          longitude: lng.toString()
        }));
        setSearchQuery(fallbackAddress);
      }
    }
  }, [toast]);

  // Fonction pour géolocaliser l'utilisateur (mémorisée)
  const handleGeolocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Centrer la carte sur la position de l'utilisateur
          if (map && marker) {
            const userLocation = { lat: latitude, lng: longitude };
            map.setCenter(userLocation);
            map.setZoom(16);
            marker.setPosition(userLocation);
            
            // Mettre à jour les coordonnées dans le formulaire
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString()
            }));
            
            // Obtenir l'adresse correspondante
            reverseGeocode(latitude, longitude);
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          toast({
            title: "Erreur de géolocalisation",
            description: "Impossible de récupérer votre position. Vérifiez que vous avez autorisé l'accès à votre localisation.",
            variant: "destructive"
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
        variant: "destructive"
      });
    }
  }, [map, marker, reverseGeocode, toast]);

  // Gérer la recherche d'adresse (mémorisée)
  const handleAddressSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setShowSuggestions(query.length > 2);
    
    if (query.length > 2 && window.google && window.google.maps) {
      try {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          { input: query, componentRestrictions: { country: 'gn' } }, // Restreindre à la Guinée
          (predictions, status) => {
            if (status === 'OK' && predictions) {
              setSuggestions(predictions.map(p => p.description));
            } else if (status === 'OVER_QUERY_LIMIT' || status === 'REQUEST_DENIED') {
              console.warn('Service de recherche d\'adresse non disponible:', status);
              setSuggestions([]);
              toast({
                title: "Recherche limitée",
                description: handleGoogleMapsError(status),
                variant: "default"
              });
            } else {
              setSuggestions([]);
            }
          }
        );
      } catch (error) {
        console.error('Erreur lors de la recherche d\'adresse:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, [toast]);

  // Sélectionner une suggestion (mémorisée)
  const selectSuggestion = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setFormData(prev => ({ ...prev, address: suggestion }));
    setShowSuggestions(false);
    
    // Rechercher l'endroit et centrer la carte
    if (searchBox) {
      searchBox.set('query', suggestion);
      searchBox.trigger('places_changed');
    }
  }, [searchBox]);

  const handleProfileImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadImage(file, 'logo');
      } catch (error) {
        console.error('Erreur lors de l\'upload de l\'image:', error);
        toast({
          title: "Erreur d'upload",
          description: "Impossible d'uploader l'image. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    }
  }, [uploadImage, toast]);

  const handleCoverImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadImage(file, 'cover_image');
      } catch (error) {
        console.error('Erreur lors de l\'upload de l\'image:', error);
        toast({
          title: "Erreur d'upload",
          description: "Impossible d'uploader l'image. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    }
  }, [uploadImage, toast]);

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

  // Protection contre les erreurs si le profil n'est pas chargé
  if (!profile) {
    return (
      <DashboardLayout navItems={partnerNavItems} title="Tableau de bord partenaire">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil du restaurant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun profil trouvé</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
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
              <Button 
                variant="outline" 
                onClick={() => {
                  // Attendre un peu avant de changer l'état pour éviter les conflits de DOM
                  setTimeout(() => {
                    setIsEditing(false);
                  }, 100);
                }} 
                disabled={isUpdating}
              >
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
                        {/* Barre de recherche avec suggestions et bouton de géolocalisation */}
                        <div className="relative">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
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
                            
                            {/* Bouton de géolocalisation */}
                            <Button
                              type="button"
                              onClick={handleGeolocation}
                              disabled={!isEditing}
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                              title="Me localiser"
                            >
                              <Navigation className="h-4 w-4" />
                            </Button>
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
                              style={{ 
                                minHeight: '256px',
                                position: 'relative'
                              }}
                            >
                              {/* Indicateur de chargement de la carte avec optimisations */}
                              {!map && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                  <div className="text-center space-y-3">
                                    {isApiLoading ? (
                                      <>
                                        <div className="relative">
                                          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                                          <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Chargement de la carte...</p>
                                          <p className="text-xs text-gray-500 mt-1">Cela peut prendre quelques secondes</p>
                                        </div>
                                      </>
                                    ) : apiLoadError ? (
                                      <>
                                        <div className="text-red-500 mb-2">
                                          <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-red-700">
                                            {apiLoadError === 'timeout' ? 'Chargement trop long' : 'Erreur de chargement'}
                                          </p>
                                          <p className="text-xs text-red-500 mt-1">
                                            {apiLoadError === 'timeout' 
                                              ? 'La carte prend trop de temps à charger' 
                                              : 'Problème de connexion réseau'
                                            }
                                          </p>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setApiLoadError(null);
                                            setIsApiLoading(false);
                                            loadGoogleMapsAPI();
                                          }}
                                          className="text-xs"
                                        >
                                          Réessayer
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <div className="relative">
                                          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                                          <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Initialisation de la carte...</p>
                                          <p className="text-xs text-gray-500 mt-1">Préparation de l\'interface</p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
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
                                {(formData.latitude && formData.longitude) && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Coordonnées: {formData.latitude}, {formData.longitude}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="latitude" 
                          name="latitude" 
                          type="number"
                          step="any"
                          value={formData.latitude} 
                          onChange={handleInputChange} 
                          disabled={!isEditing}
                          placeholder="ex: 9.6412"
                          className="flex-1"
                        />
                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleGeolocation}
                            title="Utiliser ma position actuelle"
                          >
                            <Navigation className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="longitude" 
                          name="longitude" 
                          type="number"
                          step="any"
                          value={formData.longitude} 
                          onChange={handleInputChange} 
                          disabled={!isEditing}
                          placeholder="ex: -13.5784"
                          className="flex-1"
                        />
                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleGeolocation}
                            title="Utiliser ma position actuelle"
                          >
                            <Navigation className="h-4 w-4" />
                          </Button>
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
    </ErrorBoundary>
  );
};

export default PartnerProfile; 