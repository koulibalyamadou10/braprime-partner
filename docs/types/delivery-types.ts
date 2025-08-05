// Types pour le système de livraison mobile BraPrime
// À importer dans votre projet React Native

export type OrderStatus = 
  | 'pending'           // En attente de confirmation
  | 'confirmed'         // Confirmée par le commerce
  | 'preparing'         // En préparation
  | 'ready'             // Prête pour la livraison
  | 'out_for_delivery'  // En cours de livraison
  | 'delivered'         // Livrée
  | 'cancelled';        // Annulée

export type DeliveryType = 'asap' | 'scheduled';

export type BatchStatus = 
  | 'pending'      // En attente d'assignation
  | 'assigned'     // Assigné à un chauffeur
  | 'in_progress'  // En cours de livraison
  | 'completed'    // Terminé
  | 'cancelled';   // Annulé

export type BatchOrderStatus = 
  | 'pending'      // En attente
  | 'picked_up'    // Récupérée
  | 'delivered';   // Livrée

// Interfaces principales
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  landmark?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  order_number?: string;
  customer_name: string;
  customer_phone: string;
  customer_id: string;
  delivery_address: string;
  landmark?: string;
  delivery_instructions?: string;
  items: OrderItem[];
  total: number;
  delivery_fee: number;
  grand_total: number;
  status: OrderStatus;
  delivery_type: DeliveryType;
  payment_method?: string;
  created_at: string;
  preferred_delivery_time?: string;
  scheduled_delivery_window_start?: string;
  scheduled_delivery_window_end?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  business_id: number;
  business_name: string;
  business_address?: string;
  business_phone?: string;
  available_for_drivers: boolean;
}

export interface DeliveryBatch {
  id: string;
  business_id: number;
  business_name?: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  status: BatchStatus;
  created_at: string;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  total_orders: number;
  total_distance?: number;
  estimated_duration?: number;
  orders?: BatchOrder[];
}

export interface BatchOrder {
  id: string;
  batch_id: string;
  order_id: string;
  sequence_order: number;
  status: BatchOrderStatus;
  picked_up_at?: string;
  delivered_at?: string;
  order?: Order;
}

export interface AvailableDriver {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  is_active: boolean;
  is_verified: boolean;
  active_orders_count: number;
  current_location?: Location;
  rating?: number;
  last_location_update?: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle_type: string;
  vehicle_plate?: string;
  is_active: boolean;
  is_verified: boolean;
  current_location?: Location;
  last_location_update?: string;
  rating?: number;
  total_deliveries?: number;
  total_earnings?: number;
  created_at: string;
  updated_at: string;
}

export interface DriverDashboard {
  activeBatches: DeliveryBatch[];
  pendingOrders: Order[];
  todayStats: {
    completedOrders: number;
    totalEarnings: number;
    totalDistance: number;
    averageRating: number;
  };
  currentLocation: Location;
  isOnline: boolean;
}

export interface DriverStats {
  daily: {
    completed_orders: number;
    total_earnings: number;
    total_distance: number;
    average_delivery_time: number;
  };
  weekly: {
    completed_orders: number;
    total_earnings: number;
    total_distance: number;
    rating: number;
  };
  monthly: {
    completed_orders: number;
    total_earnings: number;
    total_distance: number;
    rating: number;
  };
}

export interface DeliveryNotification {
  id: string;
  type: 'new_batch' | 'order_update' | 'customer_message' | 'system_alert';
  title: string;
  body: string;
  data: {
    batch_id?: string;
    order_id?: string;
    action?: string;
    priority?: 'low' | 'medium' | 'high';
  };
  read: boolean;
  created_at: string;
}

export interface DeliverySettings {
  max_orders_per_batch: number;
  max_delivery_distance: number;
  max_delivery_time: number;
  batch_timeout: number;
  auto_reassign_timeout: number;
  base_delivery_fee: number;
  distance_fee_per_km: number;
  time_fee_per_minute: number;
}

export interface DriverPreferences {
  max_distance: number;
  preferred_areas: string[];
  vehicle_capacity: number;
  working_hours: {
    start: string;
    end: string;
  };
  notification_settings: {
    new_batches: boolean;
    order_updates: boolean;
    customer_messages: boolean;
    system_alerts: boolean;
  };
  auto_accept_batches: boolean;
  max_batch_size: number;
}

export interface DeliveryEvent {
  type: 'batch_assigned' | 'batch_started' | 'order_picked_up' | 'order_delivered' | 'batch_completed' | 'location_updated';
  driverId: string;
  batchId?: string;
  orderId?: string;
  data: any;
  timestamp: string;
}

export interface RouteWaypoint {
  order: Order;
  customer: CustomerProfile;
  coordinates: Location;
  status: BatchOrderStatus;
  sequence: number;
  estimated_arrival?: string;
}

export interface OptimizedRoute {
  waypoints: RouteWaypoint[];
  total_distance: number;
  estimated_duration: number;
  polyline?: string; // Encoded polyline for map display
}

// Types pour les requêtes API
export interface CreateBatchRequest {
  business_id: number;
  order_ids: string[];
}

export interface AssignDriverRequest {
  batch_id: string;
  driver_id: string;
}

export interface UpdateOrderStatusRequest {
  order_id: string;
  status: OrderStatus;
  driver_id?: string;
}

export interface UpdateBatchOrderStatusRequest {
  batch_order_id: string;
  status: BatchOrderStatus;
}

export interface UpdateDriverLocationRequest {
  driver_id: string;
  location: Location;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface BatchResponse extends ApiResponse<DeliveryBatch> {}
export interface OrdersResponse extends ApiResponse<Order[]> {}
export interface DriversResponse extends ApiResponse<AvailableDriver[]> {}
export interface StatsResponse extends ApiResponse<DriverStats> {}

// Types pour les hooks React Native
export interface UseDriverBatchesReturn {
  batches: DeliveryBatch[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseLocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
}

export interface UseNotificationsReturn {
  notifications: DeliveryNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

// Types pour les composants UI
export interface BatchCardProps {
  batch: DeliveryBatch;
  onPress: (batch: DeliveryBatch) => void;
  onAccept?: (batchId: string) => void;
  onReject?: (batchId: string) => void;
}

export interface OrderCardProps {
  order: Order;
  batchOrder?: BatchOrder;
  onPress: (order: Order) => void;
  onStatusUpdate?: (orderId: string, status: BatchOrderStatus) => void;
}

export interface DriverStatsCardProps {
  stats: DriverStats;
  period: 'daily' | 'weekly' | 'monthly';
}

// Types pour les services
export interface DeliveryService {
  getDriverBatches: (driverId: string) => Promise<DeliveryBatch[]>;
  acceptBatch: (batchId: string) => Promise<boolean>;
  rejectBatch: (batchId: string) => Promise<boolean>;
  startBatch: (batchId: string) => Promise<boolean>;
  markOrderPickedUp: (batchOrderId: string) => Promise<boolean>;
  markOrderDelivered: (batchOrderId: string, orderId: string) => Promise<boolean>;
  completeBatch: (batchId: string) => Promise<boolean>;
  updateDriverLocation: (driverId: string, location: Location) => Promise<boolean>;
}

export interface NotificationService {
  getNotifications: (driverId: string) => Promise<DeliveryNotification[]>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: (driverId: string) => Promise<boolean>;
  subscribeToNotifications: (driverId: string) => void;
  unsubscribeFromNotifications: () => void;
}

export interface LocationService {
  getCurrentLocation: () => Promise<Location>;
  startLocationTracking: (driverId: string) => void;
  stopLocationTracking: () => void;
  requestLocationPermission: () => Promise<boolean>;
}

// Types pour les erreurs
export interface DeliveryError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export type DeliveryErrorType = 
  | 'location_permission_denied'
  | 'network_error'
  | 'batch_not_found'
  | 'order_not_found'
  | 'driver_not_found'
  | 'invalid_status_transition'
  | 'batch_already_assigned'
  | 'driver_offline'
  | 'location_unavailable';

// Types pour les constantes
export const DELIVERY_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  out_for_delivery: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée'
};

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  pending: 'En attente',
  assigned: 'Assigné',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

export const BATCH_ORDER_STATUS_LABELS: Record<BatchOrderStatus, string> = {
  pending: 'En attente',
  picked_up: 'Récupérée',
  delivered: 'Livrée'
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  asap: 'Rapide',
  scheduled: 'Programmée'
};

// Types pour les thèmes et styles
export interface DeliveryTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

// Types pour les configurations
export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  maps: {
    apiKey: string;
    defaultRegion: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    };
  };
  notifications: {
    onesignalAppId: string;
  };
  delivery: DeliverySettings;
}

// Types pour les utilitaires
export interface DistanceCalculation {
  from: Location;
  to: Location;
  distance: number; // en kilomètres
  duration: number; // en minutes
}

export interface TimeEstimation {
  pickupTime: number; // minutes
  deliveryTime: number; // minutes
  totalTime: number; // minutes
}

// Types pour les analytics
export interface DeliveryAnalytics {
  driverId: string;
  date: string;
  metrics: {
    totalDeliveries: number;
    totalEarnings: number;
    totalDistance: number;
    averageDeliveryTime: number;
    customerRating: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
  };
}

// Types pour les rapports
export interface DeliveryReport {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  analytics: DeliveryAnalytics[];
  summary: {
    totalDeliveries: number;
    totalEarnings: number;
    totalDistance: number;
    averageRating: number;
    onTimePercentage: number;
  };
} 