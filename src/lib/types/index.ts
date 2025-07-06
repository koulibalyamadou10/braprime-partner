// ============================================================================
// TYPES PRINCIPAUX DE L'APPLICATION BRAPRIME
// ============================================================================

// ============================================================================
// TYPES D'AUTHENTIFICATION
// ============================================================================

export type UserRole = 'customer' | 'partner' | 'admin' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone_number?: string;
  address?: string;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

// ============================================================================
// TYPES DE COMMERCE
// ============================================================================

export interface Business {
  id: number;
  name: string;
  description: string;
  businessType: BusinessType;
  coverImage: string;
  logo: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  address: string;
  phone: string;
  openingHours: string;
  isActive: boolean;
  cuisineType?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Interface pour les types de business dans la base de données
export interface BusinessTypeDB {
  id: number;
  name: string;
  icon: string;
  color: string;
  description?: string;
  features?: any[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type BusinessType = 
  | 'restaurant' 
  | 'cafe' 
  | 'market' 
  | 'supermarket' 
  | 'pharmacy' 
  | 'electronics' 
  | 'beauty' 
  | 'hairdressing' 
  | 'hardware' 
  | 'bookstore' 
  | 'document_service';

export interface Restaurant extends Business {
  businessType: 'restaurant';
  cuisineType: string;
}

export interface Cafe extends Business {
  businessType: 'cafe';
  cuisineType: string;
}

export interface Market extends Business {
  businessType: 'market';
}

export interface Supermarket extends Business {
  businessType: 'supermarket';
}

export interface Pharmacy extends Business {
  businessType: 'pharmacy';
}

export interface ElectronicsStore extends Business {
  businessType: 'electronics';
}

// ============================================================================
// TYPES DE MENU ET ARTICLES
// ============================================================================

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: number;
  businessId: number;
  isPopular: boolean;
  isAvailable: boolean;
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  preparationTime?: number;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  businessId: number;
  isActive: boolean;
}

// ============================================================================
// TYPES DE COMMANDES
// ============================================================================

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'picked_up' 
  | 'delivered' 
  | 'cancelled';

export type DeliveryMethod = 'delivery' | 'pickup';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  businessId: number;
  businessName: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverLocation?: {
    lat: number;
    lng: number;
  };
  customerRating?: number;
  customerReview?: string;
}

// ============================================================================
// TYPES DE PANIER PERSISTANT
// ============================================================================

// Article du panier en base de données
export interface CartItem {
  id: string;
  cart_id: string;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

// Panier complet avec articles
export interface Cart {
  id: string;
  user_id: string;
  business_id: number;
  business_name: string;
  delivery_method?: string;
  delivery_address?: string;
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
  items: CartItem[];
  total?: number;
  item_count?: number;
}

// Article pour l'ajout au panier
export interface AddToCartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  special_instructions?: string;
}

// Article du localStorage (ancien format)
export interface LocalCartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// ============================================================================
// TYPES DE RÉSERVATIONS
// ============================================================================

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  userId: string;
  businessId: number;
  businessName: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  specialRequests?: string;
  tableNumber?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TYPES DE LIVRAISON
// ============================================================================

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  business_id: number;
  is_active: boolean;
  current_location?: {
    lat: number;
    lng: number;
  };
  current_order_id?: string;
  rating: number;
  total_deliveries: number;
  vehicle_type?: 'car' | 'motorcycle' | 'bike';
  vehicle_plate?: string;
  total_earnings: number;
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AddDriverData {
  name: string;
  phone: string;
  email?: string;
  vehicle_type?: 'car' | 'motorcycle' | 'bike';
  vehicle_plate?: string;
}

export interface UpdateDriverData {
  name?: string;
  phone?: string;
  email?: string;
  vehicle_type?: 'car' | 'motorcycle' | 'bike';
  vehicle_plate?: string;
  is_active?: boolean;
}

export interface DeliveryTracking {
  orderId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverLocation: {
    lat: number;
    lng: number;
  };
  estimatedDelivery: string;
  currentStatus: OrderStatus;
  statusHistory: DeliveryStatusUpdate[];
}

export interface DeliveryStatusUpdate {
  status: OrderStatus;
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
  description?: string;
}

// ============================================================================
// TYPES DE CATÉGORIES
// ============================================================================

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  link: string;
  description?: string;
  isActive: boolean;
  image?: string;
}

// ============================================================================
// TYPES D'AVIS
// ============================================================================

export interface Review {
  id: string;
  userId: string;
  userName: string;
  businessId: number;
  orderId?: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
  isVerified: boolean;
}

// ============================================================================
// TYPES DE NOTIFICATIONS
// ============================================================================

export type NotificationType = 
  | 'order_status' 
  | 'delivery_update' 
  | 'promotion' 
  | 'system' 
  | 'payment';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

// ============================================================================
// TYPES DE PAIEMENT
// ============================================================================

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TYPES DE DASHBOARD
// ============================================================================

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  activeUsers: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderAnalytics {
  status: OrderStatus;
  count: number;
  percentage: number;
}

// ============================================================================
// TYPES DE RECHERCHE
// ============================================================================

export interface SearchFilters {
  query?: string;
  category?: string;
  businessType?: BusinessType;
  minRating?: number;
  maxPrice?: number;
  deliveryMethod?: DeliveryMethod;
  isOpen?: boolean;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

export interface SearchResult {
  businesses: Business[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// TYPES D'ADRESSES
// ============================================================================

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ============================================================================
// TYPES DE CONFIGURATION
// ============================================================================

export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  googleMapsApiKey?: string;
  paymentGateway?: string;
  maxDeliveryDistance: number;
  defaultDeliveryFee: number;
  taxRate: number;
  currency: string;
  timezone: string;
}

// ============================================================================
// TYPES D'ERREURS
// ============================================================================

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ============================================================================
// TYPES DE FORMULAIRES
// ============================================================================

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  acceptTerms: boolean;
}

export interface CheckoutForm {
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: PaymentMethod;
  specialRequests?: string;
}

// ============================================================================
// TYPES DE PAGINATION
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// TYPES D'ÉVÉNEMENTS
// ============================================================================

export interface AppEvent {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// ============================================================================
// TYPES DE THÈME
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// ============================================================================
// TYPES POUR LES DEMANDES
// ============================================================================

export interface Request {
  id: string;
  type: 'partner' | 'driver';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  business_name?: string;
  business_type?: string;
  business_address?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  documents?: RequestDocument[];
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface RequestDocument {
  id: string;
  type: string;
  name: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  under_review: number;
  partner_requests: number;
  driver_requests: number;
}

export interface RequestFilters {
  type?: 'partner' | 'driver';
  status?: 'pending' | 'approved' | 'rejected' | 'under_review';
  date_from?: string;
  date_to?: string;
  search?: string;
} 