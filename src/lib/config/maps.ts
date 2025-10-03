// Configuration des cartes et services de géolocalisation
export const MAPS_CONFIG = {
  // Clé API Google Maps (même que le projet client)
  GOOGLE_MAPS_API_KEY: 'AIzaSyDIp_O6TQg33J4Z2M44Uj3SEJZfTq1EqZU',
  
  // Configuration par défaut
  DEFAULT_LOCATION: {
    lat: 9.5370, // Conakry, Guinée
    lng: -13.6785
  },
  
  // Options de la carte
  MAP_OPTIONS: {
    zoom: 13,
    mapTypeId: 'roadmap',
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    disableDefaultUI: false,
    gestureHandling: 'cooperative',
    tilt: 0,
    heading: 0,
    backgroundColor: '#f5f5f5',
    maxZoom: 18,
    minZoom: 8
  },
  
  // Options du marqueur
  MARKER_OPTIONS: {
    draggable: true,
    title: "Votre restaurant",
    optimized: true,
    zIndex: 1000
  }
};

// Fonction pour obtenir la clé API
export const getGoogleMapsApiKey = (): string => {
  return MAPS_CONFIG.GOOGLE_MAPS_API_KEY;
};

// Fonction pour vérifier si la clé API est configurée
export const isGoogleMapsApiKeyConfigured = (): boolean => {
  return MAPS_CONFIG.GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';
};

// Fonction pour construire l'URL de l'API Google Maps
export const getGoogleMapsApiUrl = (): string => {
  const apiKey = getGoogleMapsApiKey();
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
};

// Fonction pour gérer les erreurs de l'API Google Maps
export const handleGoogleMapsError = (status: string, error?: any): string => {
  switch (status) {
    case 'OVER_QUERY_LIMIT':
      return 'Quota de requêtes dépassé. Veuillez réessayer plus tard.';
    case 'REQUEST_DENIED':
      return 'Accès refusé. Vérifiez la configuration de la clé API.';
    case 'INVALID_REQUEST':
      return 'Requête invalide. Vérifiez les paramètres.';
    case 'UNKNOWN_ERROR':
      return 'Erreur inconnue. Veuillez réessayer.';
    case 'ZERO_RESULTS':
      return 'Aucun résultat trouvé pour cette recherche.';
    default:
      return `Erreur: ${status}`;
  }
};

// Fonction pour créer une adresse de fallback avec les coordonnées
export const createFallbackAddress = (lat: number, lng: number): string => {
  return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
};
