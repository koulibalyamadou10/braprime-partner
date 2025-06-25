// ============================================================================
// CONFIGURATION CENTRALISÉE DE L'APPLICATION BRAPRIME
// ============================================================================

import type { AppConfig, BusinessType, OrderStatus, PaymentMethod } from '@/lib/types';

// ============================================================================
// CONFIGURATION GÉNÉRALE
// ============================================================================

export const APP_CONFIG: AppConfig = {
  name: 'BraPrime',
  version: '1.0.0',
  environment: (import.meta.env.MODE as 'development' | 'staging' | 'production') || 'development',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  paymentGateway: import.meta.env.VITE_PAYMENT_GATEWAY || 'stripe',
  maxDeliveryDistance: 50, // km
  defaultDeliveryFee: 5000, // GNF
  taxRate: 0.18, // 18% TVA Guinée
  currency: 'GNF',
  timezone: 'Africa/Conakry'
};

// ============================================================================
// CONFIGURATION DES COULEURS (THÈME GUINÉE)
// ============================================================================

export const COLORS = {
  // Couleurs nationales de la Guinée
  guinea: {
    red: '#CE1126',
    yellow: '#FCD116',
    green: '#009460'
  },
  // Couleurs de l'application
  primary: '#CE1126',
  secondary: '#FCD116',
  accent: '#009460',
  // Couleurs neutres
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  },
  // Couleurs sémantiques
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6'
};

// ============================================================================
// CONFIGURATION DES TYPES DE COMMERCE
// ============================================================================

export const BUSINESS_TYPES: Record<BusinessType, {
  name: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
}> = {
  restaurant: {
    name: 'Restaurants',
    icon: 'Utensils',
    color: 'bg-guinea-red',
    description: 'Découvrez les meilleurs restaurants de Guinée',
    features: ['Livraison rapide', 'Menus variés', 'Qualité garantie']
  },
  cafe: {
    name: 'Cafés',
    icon: 'Coffee',
    color: 'bg-guinea-yellow',
    description: 'Cafés et pâtisseries de qualité',
    features: ['Café frais', 'Pâtisseries', 'Ambiance conviviale']
  },
  market: {
    name: 'Marchés',
    icon: 'ShoppingBasket',
    color: 'bg-guinea-green',
    description: 'Produits frais des marchés locaux',
    features: ['Produits frais', 'Prix compétitifs', 'Produits locaux']
  },
  supermarket: {
    name: 'Supermarchés',
    icon: 'ShoppingCart',
    color: 'bg-blue-500',
    description: 'Supermarchés et hypermarchés',
    features: ['Large sélection', 'Produits importés', 'Qualité premium']
  },
  pharmacy: {
    name: 'Pharmacies',
    icon: 'Pill',
    color: 'bg-green-500',
    description: 'Médicaments et produits de santé',
    features: ['Médicaments', 'Produits de santé', 'Conseils pharmaceutiques']
  },
  electronics: {
    name: 'Électronique',
    icon: 'Tv',
    color: 'bg-indigo-500',
    description: 'Équipements électroniques et informatiques',
    features: ['Équipements neufs', 'Garantie', 'Service technique']
  },
  beauty: {
    name: 'Beauté',
    icon: 'Sparkles',
    color: 'bg-pink-400',
    description: 'Produits de beauté et cosmétiques',
    features: ['Cosmétiques', 'Soins', 'Parfums']
  },
  hairdressing: {
    name: 'Coiffure',
    icon: 'Scissors',
    color: 'bg-slate-500',
    description: 'Salons de coiffure et instituts de beauté',
    features: ['Coiffures', 'Soins', 'Rendez-vous']
  },
  hardware: {
    name: 'Bricolage',
    icon: 'Hammer',
    color: 'bg-zinc-600',
    description: 'Outils et matériaux de construction',
    features: ['Outils', 'Matériaux', 'Conseils']
  },
  bookstore: {
    name: 'Librairies',
    icon: 'BookOpen',
    color: 'bg-amber-500',
    description: 'Livres et fournitures scolaires',
    features: ['Livres', 'Fournitures', 'Cadeaux']
  },
  document_service: {
    name: 'Services de Documents',
    icon: 'FileText',
    color: 'bg-sky-500',
    description: 'Services administratifs et documents',
    features: ['Photocopies', 'Impression', 'Services administratifs']
  }
};

// ============================================================================
// CONFIGURATION DES STATUTS DE COMMANDE
// ============================================================================

export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  color: string;
  icon: string;
  description: string;
}> = {
  pending: {
    label: 'En attente',
    color: 'text-yellow-600',
    icon: 'Clock',
    description: 'Votre commande est en attente de confirmation'
  },
  confirmed: {
    label: 'Confirmée',
    color: 'text-blue-600',
    icon: 'CheckCircle',
    description: 'Votre commande a été confirmée'
  },
  preparing: {
    label: 'En préparation',
    color: 'text-orange-600',
    icon: 'ChefHat',
    description: 'Votre commande est en cours de préparation'
  },
  ready: {
    label: 'Prête',
    color: 'text-green-600',
    icon: 'Package',
    description: 'Votre commande est prête pour la livraison'
  },
  picked_up: {
    label: 'En livraison',
    color: 'text-purple-600',
    icon: 'Truck',
    description: 'Votre commande est en cours de livraison'
  },
  delivered: {
    label: 'Livrée',
    color: 'text-green-700',
    icon: 'Home',
    description: 'Votre commande a été livrée'
  },
  cancelled: {
    label: 'Annulée',
    color: 'text-red-600',
    icon: 'XCircle',
    description: 'Votre commande a été annulée'
  }
};

// ============================================================================
// CONFIGURATION DES MÉTHODES DE PAIEMENT
// ============================================================================

export const PAYMENT_METHODS: Record<PaymentMethod, {
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
}> = {
  cash: {
    name: 'Espèces',
    icon: 'Banknote',
    description: 'Paiement en espèces à la livraison',
    isAvailable: true
  },
  card: {
    name: 'Carte bancaire',
    icon: 'CreditCard',
    description: 'Paiement par carte bancaire',
    isAvailable: false // À implémenter
  },
  mobile_money: {
    name: 'Mobile Money',
    icon: 'Smartphone',
    description: 'Paiement par Mobile Money (Orange Money, MTN Money)',
    isAvailable: false // À implémenter
  },
  bank_transfer: {
    name: 'Virement bancaire',
    icon: 'Building2',
    description: 'Virement bancaire',
    isAvailable: false // À implémenter
  }
};

// ============================================================================
// CONFIGURATION DE LA LIVRAISON
// ============================================================================

export const DELIVERY_CONFIG = {
  // Zones de livraison (Conakry et environs)
  zones: [
    { name: 'Kaloum', deliveryFee: 3000, deliveryTime: '15-25 min' },
    { name: 'Dixinn', deliveryFee: 4000, deliveryTime: '20-30 min' },
    { name: 'Ratoma', deliveryFee: 5000, deliveryTime: '25-35 min' },
    { name: 'Matam', deliveryFee: 6000, deliveryTime: '30-40 min' },
    { name: 'Matoto', deliveryFee: 7000, deliveryTime: '35-45 min' },
    { name: 'Coyah', deliveryFee: 10000, deliveryTime: '45-60 min' },
    { name: 'Dubréka', deliveryFee: 12000, deliveryTime: '50-70 min' }
  ],
  // Frais de livraison par défaut
  defaultFee: 5000,
  // Temps de livraison par défaut
  defaultTime: '30-45 min',
  // Distance maximale de livraison (km)
  maxDistance: 50,
  // Frais de livraison gratuite à partir de
  freeDeliveryThreshold: 50000
};

// ============================================================================
// CONFIGURATION DES NOTIFICATIONS
// ============================================================================

export const NOTIFICATION_CONFIG = {
  // Types de notifications
  types: {
    order_status: {
      title: 'Mise à jour de commande',
      icon: 'Package',
      color: 'text-blue-600'
    },
    delivery_update: {
      title: 'Mise à jour de livraison',
      icon: 'Truck',
      color: 'text-green-600'
    },
    promotion: {
      title: 'Offre spéciale',
      icon: 'Gift',
      color: 'text-purple-600'
    },
    system: {
      title: 'Notification système',
      icon: 'Bell',
      color: 'text-gray-600'
    },
    payment: {
      title: 'Paiement',
      icon: 'CreditCard',
      color: 'text-orange-600'
    }
  },
  // Durée d'affichage des notifications (ms)
  displayDuration: 5000,
  // Nombre maximum de notifications affichées
  maxDisplayed: 5
};

// ============================================================================
// CONFIGURATION DE LA PAGINATION
// ============================================================================

export const PAGINATION_CONFIG = {
  // Nombre d'éléments par page par défaut
  defaultLimit: 12,
  // Limites disponibles
  limits: [6, 12, 24, 48],
  // Nombre maximum d'éléments par page
  maxLimit: 100
};

// ============================================================================
// CONFIGURATION DE LA RECHERCHE
// ============================================================================

export const SEARCH_CONFIG = {
  // Délai de recherche (ms)
  debounceDelay: 300,
  // Nombre minimum de caractères pour déclencher la recherche
  minQueryLength: 2,
  // Nombre maximum de résultats affichés
  maxResults: 50,
  // Historique de recherche (nombre d'éléments)
  historyLimit: 10
};

// ============================================================================
// CONFIGURATION DES RATINGS ET AVIS
// ============================================================================

export const RATING_CONFIG = {
  // Échelle de notation
  scale: 5,
  // Seuil minimum pour un avis vérifié
  verifiedThreshold: 3,
  // Nombre minimum d'avis pour afficher la note
  minReviews: 1
};

// ============================================================================
// CONFIGURATION DES RÉSERVATIONS
// ============================================================================

export const RESERVATION_CONFIG = {
  // Créneaux horaires disponibles
  timeSlots: [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ],
  // Durée d'une réservation (minutes)
  duration: 90,
  // Délai minimum pour une réservation (heures)
  minAdvanceNotice: 2,
  // Délai maximum pour une réservation (jours)
  maxAdvanceNotice: 30,
  // Nombre maximum de personnes par réservation
  maxGuests: 20
};

// ============================================================================
// CONFIGURATION DES MESSAGES D'ERREUR
// ============================================================================

export const ERROR_MESSAGES = {
  // Erreurs d'authentification
  auth: {
    invalidCredentials: 'Email ou mot de passe incorrect',
    userNotFound: 'Utilisateur non trouvé',
    emailAlreadyExists: 'Cet email est déjà utilisé',
    weakPassword: 'Le mot de passe doit contenir au moins 6 caractères',
    networkError: 'Erreur de connexion. Veuillez réessayer.'
  },
  // Erreurs de commande
  order: {
    emptyCart: 'Votre panier est vide',
    restaurantClosed: 'Ce restaurant est fermé',
    deliveryUnavailable: 'Livraison non disponible dans cette zone',
    paymentFailed: 'Le paiement a échoué',
    orderCancelled: 'Impossible d\'annuler cette commande'
  },
  // Erreurs générales
  general: {
    networkError: 'Erreur de connexion',
    serverError: 'Erreur du serveur',
    validationError: 'Données invalides',
    permissionDenied: 'Accès refusé',
    notFound: 'Ressource non trouvée'
  }
};

// ============================================================================
// CONFIGURATION DES MESSAGES DE SUCCÈS
// ============================================================================

export const SUCCESS_MESSAGES = {
  // Messages d'authentification
  auth: {
    loginSuccess: 'Connexion réussie',
    signupSuccess: 'Inscription réussie',
    logoutSuccess: 'Déconnexion réussie',
    profileUpdated: 'Profil mis à jour'
  },
  // Messages de commande
  order: {
    orderPlaced: 'Commande passée avec succès',
    orderCancelled: 'Commande annulée',
    paymentSuccess: 'Paiement effectué avec succès'
  },
  // Messages généraux
  general: {
    saved: 'Enregistré avec succès',
    deleted: 'Supprimé avec succès',
    updated: 'Mis à jour avec succès'
  }
};

// ============================================================================
// CONFIGURATION DES VALIDATIONS
// ============================================================================

export const VALIDATION_RULES = {
  // Règles pour les noms
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/
  },
  // Règles pour les emails
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  // Règles pour les mots de passe
  password: {
    minLength: 6,
    maxLength: 128
  },
  // Règles pour les numéros de téléphone
  phone: {
    pattern: /^(\+224|224)?[0-9]{9}$/
  },
  // Règles pour les prix
  price: {
    min: 0,
    max: 1000000
  }
};

// ============================================================================
// CONFIGURATION DES FONCTIONS UTILITAIRES
// ============================================================================

export const UTILS_CONFIG = {
  // Formatage des prix
  currency: {
    code: 'GNF',
    symbol: '₣',
    locale: 'fr-GN'
  },
  // Formatage des dates
  date: {
    locale: 'fr-FR',
    timezone: 'Africa/Conakry'
  },
  // Formatage des numéros de téléphone
  phone: {
    format: '+224 XX XX XX XX'
  }
};

// ============================================================================
// EXPORT DE LA CONFIGURATION
// ============================================================================

export default {
  APP_CONFIG,
  COLORS,
  BUSINESS_TYPES,
  ORDER_STATUS_CONFIG,
  PAYMENT_METHODS,
  DELIVERY_CONFIG,
  NOTIFICATION_CONFIG,
  PAGINATION_CONFIG,
  SEARCH_CONFIG,
  RATING_CONFIG,
  RESERVATION_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  UTILS_CONFIG
}; 