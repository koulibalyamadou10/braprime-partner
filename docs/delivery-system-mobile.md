# Documentation Système de Livraison - Application Mobile Chauffeur

## 📋 Vue d'ensemble

Cette documentation explique le système de livraison par batch et l'assignation de chauffeurs implémenté dans BraPrime. Le système permet aux partenaires (commerces) de grouper plusieurs commandes prêtes en lots de livraison et d'assigner des chauffeurs pour optimiser les livraisons.

## 🚚 Guide Rapide pour le Chauffeur

### 🎯 **Comment ça marche ?**

En tant que chauffeur, vous avez accès à **deux listes principales** dans l'application mobile :

#### **1. 📋 Mes Livraisons Assignées**
- **Contenu** : Commandes déjà assignées à votre compte
- **Actions** : Marquer comme récupérée, livrée, appeler client, navigation
- **Statuts** : `out_for_delivery` (en route), `picked_up` (récupérée)

#### **2. 🎯 Livraisons Disponibles**
- **Contenu** : Commandes que vous pouvez accepter
- **Filtres** : Distance, frais de livraison, type (ASAP/Programmée)
- **Actions** : Accepter la livraison

### 🔄 **Workflow Simple**

```
1. 📱 Ouvrir l'app → Voir les livraisons disponibles
2. ✅ Accepter une livraison → Elle passe dans "Mes Livraisons"
3. 🚗 Aller au restaurant → Marquer comme "Récupérée"
4. 📦 Livrer au client → Marquer comme "Livrée"
5. 💰 Gagner de l'argent → Paiement automatique
```

### 💰 **Comment gagner de l'argent ?**

- **Frais de base** : 1000 GNF par commande
- **Bonus distance** : 200 GNF par kilomètre
- **Bonus temps** : 50 GNF par minute de livraison
- **Bonus batch** : 1000 GNF si plus de 3 commandes groupées

### ⚡ **Types de Livraison**

| Type | Description | Délai | Priorité |
|------|-------------|-------|----------|
| **ASAP** | Livraison rapide | 15-45 min | 🔴 Haute |
| **Programmée** | Heure précise | Définie | 🟡 Moyenne |
| **Batch** | Groupe de commandes | Variable | 🟢 Optimisée |

### 📱 **Fonctionnalités Principales**

- **🔔 Notifications** : Nouvelles commandes, mises à jour
- **🗺️ Navigation** : GPS intégré vers le client
- **📞 Communication** : Appel direct au client
- **💰 Suivi gains** : Statistiques en temps réel
- **📊 Historique** : Toutes vos livraisons

### 🛡️ **Règles Importantes**

- **Limite** : Maximum 3 commandes actives simultanément
- **Distance** : Maximum 20km par livraison
- **Temps** : Maximum 2h par livraison
- **Disponibilité** : Rester connecté pour recevoir des commandes

### 🚨 **En cas de problème**

- **Client injoignable** : Marquer comme "Problème" → Support contacté
- **Adresse incorrecte** : Appeler le support
- **Paiement refusé** : Ne pas livrer, contacter le support
- **Accident/Véhicule** : Appeler immédiatement le support

---

## 🏗️ Architecture du Système

### Tables de Base de Données

#### 1. Table `delivery_batches`
```sql
CREATE TABLE delivery_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id INTEGER REFERENCES businesses(id),
  driver_id UUID REFERENCES drivers(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_orders INTEGER DEFAULT 0,
  total_distance DECIMAL(10,2),
  estimated_duration INTEGER -- en minutes
);
```

#### 2. Table `delivery_batch_orders`
```sql
CREATE TABLE delivery_batch_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES delivery_batches(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sequence_order INTEGER, -- ordre de livraison dans le batch
  status TEXT DEFAULT 'pending', -- 'pending', 'picked_up', 'delivered'
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(batch_id, order_id)
);
```

### Statuts des Commandes
```typescript
type OrderStatus = 
  | 'pending'           // En attente de confirmation
  | 'confirmed'         // Confirmée par le commerce
  | 'preparing'         // En préparation
  | 'ready'             // Prête pour la livraison
  | 'out_for_delivery'  // En cours de livraison
  | 'delivered'         // Livrée
  | 'cancelled';        // Annulée
```

### Types de Livraison
```typescript
type DeliveryType = 'asap' | 'scheduled';

interface DeliveryInfo {
  delivery_type: DeliveryType;
  preferred_delivery_time?: string;        // Pour les livraisons programmées
  scheduled_delivery_window_start?: string;
  scheduled_delivery_window_end?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
}
```

## 🔄 Systèmes de Livraison

### Vue d'ensemble des Types de Livraison

BraPrime supporte 4 types de livraison principaux :

1. **Livraison Unitaire** : Une seule commande par chauffeur
2. **Livraison en Groupe (Batch)** : Plusieurs commandes groupées
3. **Livraison ASAP** : Livraison rapide immédiate
4. **Livraison Programmée** : Livraison à une heure précise

### 1. Livraison Unitaire

#### Caractéristiques
- Une seule commande par chauffeur
- Assignation directe
- Suivi individuel
- Idéal pour les commandes urgentes ou isolées

#### Workflow
```typescript
// 1. Commande prête → Assignation directe
const assignSingleOrder = async (orderId: string, driverId: string) => {
  // Mettre à jour le statut
  await supabase
    .from('orders')
    .update({ 
      status: 'out_for_delivery',
      driver_id: driverId,
      assigned_at: new Date().toISOString()
    })
    .eq('id', orderId);
};

// 2. Création du batch
const createBatch = async (orderIds: string[]) => {
  // Créer le batch
  const { data: batch } = await supabase
    .from('delivery_batches')
    .insert({ 
      business_id: businessId,
      status: 'pending',
      total_orders: orderIds.length,
      batch_type: 'scheduled'
    })
    .select()
    .single();

  // Associer les commandes
  const batchOrders = orderIds.map((orderId, index) => ({
    batch_id: batch.id,
    order_id: orderId,
    sequence_order: index + 1
  }));

  await supabase
    .from('delivery_batch_orders')
    .insert(batchOrders);
};
```

##### B. Batch de Commandes ASAP
```typescript
// Création d'un batch pour les commandes ASAP
const createASAPBatch = async (orderIds: string[]) => {
  // Vérifier que toutes les commandes sont ASAP
  const orders = await getOrdersByIds(orderIds);
  const allASAP = orders.every(order => order.delivery_type === 'asap');
  
  if (!allASAP) {
    throw new Error('Toutes les commandes doivent être ASAP');
  }

  // Créer le batch avec assignation immédiate
  const { data: batch } = await supabase
    .from('delivery_batches')
    .insert({ 
      business_id: businessId,
      status: 'assigned',
      total_orders: orderIds.length,
      batch_type: 'asap',
      assigned_at: new Date().toISOString()
    })
    .select()
    .single();

  // Associer les commandes et les marquer comme en livraison
  const batchOrders = orderIds.map((orderId, index) => ({
    batch_id: batch.id,
    order_id: orderId,
    sequence_order: index + 1
  }));

  await supabase
    .from('delivery_batch_orders')
    .insert(batchOrders);

  // Mettre à jour le statut des commandes
  for (const orderId of orderIds) {
    await updateOrderStatus(orderId, 'out_for_delivery');
  }
};
```

#### Gestion des Batchs
```typescript
// Accepter un batch
const acceptBatch = async (batchId: string, driverId: string) => {
  await supabase
    .from('delivery_batches')
    .update({ 
      status: 'assigned',
      driver_id: driverId,
      assigned_at: new Date().toISOString()
    })
    .eq('id', batchId);
};

// Démarrer un batch
const startBatch = async (batchId: string) => {
  await supabase
    .from('delivery_batches')
    .update({ 
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', batchId);
};

// Terminer un batch
const completeBatch = async (batchId: string) => {
  // Vérifier que toutes les commandes sont livrées
  const { data: batchOrders } = await supabase
    .from('delivery_batch_orders')
    .select('status')
    .eq('batch_id', batchId);

  const allDelivered = batchOrders?.every(order => order.status === 'delivered');

  if (allDelivered) {
    await supabase
      .from('delivery_batches')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId);
  }
};
```

### 3. Livraison ASAP (As Soon As Possible)

#### Caractéristiques
- Livraison immédiate
- Priorité haute
- Assignation automatique
- Délai de livraison : 15-45 minutes

#### Workflow ASAP
```typescript
// 1. Commande ASAP créée
const handleASAPOrder = async (order: Order) => {
  // Marquer comme prête immédiatement
  await updateOrderStatus(order.id, 'ready');
  
  // Rechercher un chauffeur disponible
  const availableDriver = await findAvailableDriver(order.delivery_address);
  
  if (availableDriver) {
    // Assigner immédiatement
    await assignDriverToOrder(order.id, availableDriver.id);
  } else {
    // Mettre en file d'attente
    await addToASAPQueue(order.id);
  }
};

// 2. Recherche de chauffeur disponible
const findAvailableDriver = async (deliveryAddress: string) => {
  const { data: drivers } = await supabase
    .from('drivers')
    .select('*')
    .eq('is_active', true)
    .eq('is_online', true)
    .lt('active_orders_count', 3) // Max 3 commandes actives
    .order('rating', { ascending: false });

  // Filtrer par proximité et disponibilité
  return drivers?.find(driver => 
    calculateDistance(driver.current_location, deliveryAddress) < 10 // 10km max
  );
};

// 3. Assignation immédiate
const assignDriverToOrder = async (orderId: string, driverId: string) => {
  await supabase
    .from('orders')
    .update({ 
      status: 'out_for_delivery',
      driver_id: driverId,
      assigned_at: new Date().toISOString(),
      estimated_delivery_time: calculateEstimatedTime(orderId, driverId)
    })
    .eq('id', orderId);
};
```

### 4. Livraison Programmée

#### Caractéristiques
- Livraison à une heure précise
- Fenêtre de livraison définie
- Planification à l'avance
- Optimisation des itinéraires

#### Workflow Programmée
```typescript
// 1. Commande programmée créée
const handleScheduledOrder = async (order: Order) => {
  // Vérifier la disponibilité de la fenêtre
  const isSlotAvailable = await checkDeliverySlot(
    order.scheduled_delivery_window_start,
    order.scheduled_delivery_window_end,
    order.delivery_address
  );

  if (isSlotAvailable) {
    // Confirmer la commande
    await updateOrderStatus(order.id, 'confirmed');
    
    // Ajouter à la planification
    await addToScheduledDelivery(order);
  } else {
    // Proposer d'autres créneaux
    await suggestAlternativeSlots(order);
  }
};

// 2. Vérification de disponibilité
const checkDeliverySlot = async (
  startTime: string, 
  endTime: string, 
  address: string
) => {
  const { data: existingOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('delivery_type', 'scheduled')
    .eq('status', 'confirmed')
    .gte('scheduled_delivery_window_start', startTime)
    .lte('scheduled_delivery_window_end', endTime);

  // Vérifier la capacité de livraison dans la zone
  const maxOrdersPerSlot = 5;
  return (existingOrders?.length || 0) < maxOrdersPerSlot;
};

// 3. Planification des livraisons
const planScheduledDeliveries = async (date: string) => {
  // Récupérer toutes les commandes programmées pour la date
  const { data: scheduledOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('delivery_type', 'scheduled')
    .eq('status', 'confirmed')
    .gte('scheduled_delivery_window_start', `${date}T00:00:00`)
    .lte('scheduled_delivery_window_end', `${date}T23:59:59`)
    .order('scheduled_delivery_window_start');

  // Grouper par fenêtres horaires
  const timeSlots = groupOrdersByTimeSlot(scheduledOrders);
  
  // Créer des batchs optimisés
  for (const slot of timeSlots) {
    if (slot.orders.length > 1) {
      await createScheduledBatch(slot.orders.map(o => o.id));
    } else {
      // Livraison unitaire
      await prepareSingleDelivery(slot.orders[0]);
    }
  }
};
```

### 5. Optimisation des Itinéraires

#### Algorithme de Routage
```typescript
// Calcul d'itinéraire optimisé pour un batch
const calculateOptimizedRoute = async (batchId: string) => {
  const { data: batchOrders } = await supabase
    .from('delivery_batch_orders')
    .select(`
      *,
      orders (
        *,
        customer_profiles (
          address,
          landmark
        )
      )
    `)
    .eq('batch_id', batchId)
    .order('sequence_order');

  // Coordonnées du restaurant
  const restaurantLocation = await getBusinessLocation(batch.business_id);
  
  // Coordonnées des clients
  const customerLocations = await Promise.all(
    batchOrders.map(async (batchOrder) => {
      const address = batchOrder.orders.customer_profiles.address;
      return {
        orderId: batchOrder.order_id,
        coordinates: await geocodeAddress(address),
        customer: batchOrder.orders.customer_profiles
      };
    })
  );

  // Algorithme du plus proche voisin
  const optimizedRoute = nearestNeighborAlgorithm(
    restaurantLocation,
    customerLocations
  );

  // Mettre à jour l'ordre de séquence
  for (let i = 0; i < optimizedRoute.length; i++) {
    await supabase
      .from('delivery_batch_orders')
      .update({ sequence_order: i + 1 })
      .eq('order_id', optimizedRoute[i].orderId);
  }

  return optimizedRoute;
};

// Algorithme du plus proche voisin
const nearestNeighborAlgorithm = (
  start: Location,
  destinations: Array<{ orderId: string; coordinates: Location }>
) => {
  const route = [];
  let current = start;
  const unvisited = [...destinations];

  while (unvisited.length > 0) {
    // Trouver le plus proche
    let nearestIndex = 0;
    let minDistance = calculateDistance(current, unvisited[0].coordinates);

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(current, unvisited[i].coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    // Ajouter au parcours
    route.push(unvisited[nearestIndex]);
    current = unvisited[nearestIndex].coordinates;
    unvisited.splice(nearestIndex, 1);
  }

  return route;
};
```

### 6. Gestion des Statuts et Transitions

#### Machine à États
```typescript
// Définition des transitions autorisées
const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: []
};

// Validation des transitions
const validateStatusTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean => {
  return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

// Mise à jour sécurisée du statut
const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  driverId?: string
) => {
  // Récupérer le statut actuel
  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();

  if (!order) {
    throw new Error('Commande non trouvée');
  }

  // Valider la transition
  if (!validateStatusTransition(order.status, newStatus)) {
    throw new Error(`Transition invalide: ${order.status} → ${newStatus}`);
  }

  // Mettre à jour le statut
  const updateData: any = { 
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  if (driverId) {
    updateData.driver_id = driverId;
  }

  if (newStatus === 'out_for_delivery') {
    updateData.assigned_at = new Date().toISOString();
  } else if (newStatus === 'delivered') {
    updateData.actual_delivery_time = new Date().toISOString();
  }

  await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  // Notifier les parties concernées
  await notifyStatusChange(orderId, newStatus);
};
```

### 2. Assignation de Chauffeur

#### Interface Chauffeur Disponible
```typescript
interface AvailableDriver {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  is_active: boolean;
  is_verified: boolean;
  active_orders_count: number;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
}
```

#### Logique de Sélection
```typescript
const getAvailableDrivers = async (businessId: string) => {
  const { drivers } = await DriverService.getBusinessDrivers(businessId);
  
  return drivers.filter(driver => 
    driver.is_active && 
    driver.is_verified && 
    (driver.active_orders_count || 0) < 5 // Limite de 5 commandes actives
  );
};
```

### 3. Gestion des Batchs (Côté Chauffeur Mobile)

#### Récupération des Batchs Assignés
```typescript
const getDriverBatches = async (driverId: string) => {
  const { data: batches } = await supabase
    .from('delivery_batches')
    .select(`
      *,
      delivery_batch_orders (
        *,
        orders (
          *,
          customer_profiles (
            name,
            phone,
            address
          )
        )
      )
    `)
    .eq('driver_id', driverId)
    .in('status', ['assigned', 'in_progress'])
    .order('created_at', { ascending: false });
    
  return batches;
};
```

#### Démarrer un Batch
```typescript
const startBatch = async (batchId: string) => {
  await supabase
    .from('delivery_batches')
    .update({ 
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', batchId);
};
```

#### Marquer une Commande comme Récupérée
```typescript
const markOrderPickedUp = async (batchOrderId: string) => {
  await supabase
    .from('delivery_batch_orders')
    .update({ 
      status: 'picked_up',
      picked_up_at: new Date().toISOString()
    })
    .eq('id', batchOrderId);
};
```

#### Marquer une Commande comme Livrée
```typescript
const markOrderDelivered = async (batchOrderId: string, orderId: string) => {
  // 1. Marquer la commande du batch comme livrée
  await supabase
    .from('delivery_batch_orders')
    .update({ 
      status: 'delivered',
      delivered_at: new Date().toISOString()
    })
    .eq('id', batchOrderId);

  // 2. Mettre à jour le statut de la commande principale
  await supabase
    .from('orders')
    .update({ 
      status: 'delivered',
      actual_delivery_time: new Date().toISOString()
    })
    .eq('id', orderId);
};
```

#### Terminer un Batch
```typescript
const completeBatch = async (batchId: string) => {
  // Vérifier que toutes les commandes sont livrées
  const { data: batchOrders } = await supabase
    .from('delivery_batch_orders')
    .select('status')
    .eq('batch_id', batchId);

  const allDelivered = batchOrders?.every(order => order.status === 'delivered');

  if (allDelivered) {
    await supabase
      .from('delivery_batches')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId);
  }
};
```

## 📱 Interface Mobile Chauffeur

### Écrans Principaux

#### 1. Dashboard Principal
```typescript
interface DriverDashboard {
  activeBatches: DeliveryBatch[];
  pendingOrders: Order[];
  todayStats: {
    completedOrders: number;
    totalEarnings: number;
    totalDistance: number;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}
```

#### 2. Liste des Batchs Actifs
```typescript
interface ActiveBatch {
  id: string;
  business_name: string;
  total_orders: number;
  completed_orders: number;
  status: 'assigned' | 'in_progress';
  orders: BatchOrder[];
  estimated_duration: number;
  total_distance: number;
}
```

#### 3. Détails d'un Batch
```typescript
interface BatchDetails {
  batch: ActiveBatch;
  route: {
    waypoints: Array<{
      order: Order;
      customer: CustomerProfile;
      coordinates: { lat: number; lng: number };
      status: 'pending' | 'picked_up' | 'delivered';
    }>;
    total_distance: number;
    estimated_duration: number;
  };
}
```

## 🚚 Gestion des Livraisons - Interface Chauffeur

### Vue d'ensemble des Deux Listes

L'application mobile chauffeur doit afficher **deux listes distinctes** :

1. **📋 Livraisons Assignées** : Commandes déjà assignées au chauffeur
2. **🎯 Livraisons Disponibles** : Commandes que le chauffeur peut s'assigner

### 1. 📋 Livraisons Assignées

#### Interface des Livraisons Assignées
```typescript
interface AssignedDelivery {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  landmark?: string;
  business_name: string;
  business_address: string;
  total_amount: number;
  delivery_fee: number;
  status: 'assigned' | 'picked_up' | 'delivered';
  created_at: string;
  estimated_delivery: string;
  items: OrderItem[];
  delivery_instructions?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
```

#### Récupération des Livraisons Assignées
```typescript
const getAssignedDeliveries = async (driverId: string) => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      delivery_address,
      total,
      delivery_fee,
      status,
      created_at,
      estimated_delivery,
      items,
      delivery_instructions,
      pickup_coordinates,
      delivery_coordinates,
      businesses!inner(
        name,
        address
      ),
      user_profiles!inner(
        name,
        phone_number
      )
    `)
    .eq('driver_id', driverId)
    .in('status', ['out_for_delivery', 'picked_up'])
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('Erreur lors de la récupération des livraisons assignées');
  }

  return orders?.map(order => ({
    id: order.id,
    order_number: order.order_number,
    customer_name: order.user_profiles.name,
    customer_phone: order.user_profiles.phone_number,
    delivery_address: order.delivery_address,
    business_name: order.businesses.name,
    business_address: order.businesses.address,
    total_amount: order.total,
    delivery_fee: order.delivery_fee,
    status: order.status,
    created_at: order.created_at,
    estimated_delivery: order.estimated_delivery,
    items: order.items,
    delivery_instructions: order.delivery_instructions,
    coordinates: order.delivery_coordinates
  })) || [];
};
```

#### Actions sur les Livraisons Assignées
```typescript
// Marquer comme récupérée
const markAsPickedUp = async (orderId: string) => {
  await supabase
    .from('orders')
    .update({ 
      status: 'picked_up',
      actual_pickup_time: new Date().toISOString()
    })
    .eq('id', orderId);
};

// Marquer comme livrée
const markAsDelivered = async (orderId: string) => {
  await supabase
    .from('orders')
    .update({ 
      status: 'delivered',
      actual_delivery_time: new Date().toISOString()
    })
    .eq('id', orderId);
};

// Appeler le client
const callCustomer = async (phoneNumber: string) => {
  // Intégration avec l'API d'appel
  Linking.openURL(`tel:${phoneNumber}`);
};

// Ouvrir la navigation
const openNavigation = async (address: string) => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  await Linking.openURL(url);
};
```

### 2. 🎯 Livraisons Disponibles

#### Interface des Livraisons Disponibles
```typescript
interface AvailableDelivery {
  id: string;
  order_number: string;
  customer_name: string;
  delivery_address: string;
  business_name: string;
  business_address: string;
  total_amount: number;
  delivery_fee: number;
  distance_km: number;
  estimated_time_minutes: number;
  delivery_type: 'asap' | 'scheduled';
  preferred_delivery_time?: string;
  created_at: string;
  expires_at: string;
  urgency_level: 'low' | 'medium' | 'high';
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
```

#### Récupération des Livraisons Disponibles
```typescript
const getAvailableDeliveries = async (driverLocation: Location) => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      delivery_address,
      total,
      delivery_fee,
      delivery_type,
      preferred_delivery_time,
      created_at,
      available_for_drivers,
      delivery_coordinates,
      businesses!inner(
        name,
        address
      ),
      user_profiles!inner(
        name
      )
    `)
    .eq('available_for_drivers', true)
    .is('driver_id', null)
    .in('status', ['ready'])
    .order('delivery_type', { ascending: false }) // ASAP en premier
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('Erreur lors de la récupération des livraisons disponibles');
  }

  // Calculer la distance et le temps estimé pour chaque commande
  const availableDeliveries = await Promise.all(
    (orders || []).map(async (order) => {
      const distance = calculateDistance(driverLocation, order.delivery_coordinates);
      const estimatedTime = calculateEstimatedTime(distance);
      
      return {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.user_profiles.name,
        delivery_address: order.delivery_address,
        business_name: order.businesses.name,
        business_address: order.businesses.address,
        total_amount: order.total,
        delivery_fee: order.delivery_fee,
        distance_km: distance,
        estimated_time_minutes: estimatedTime,
        delivery_type: order.delivery_type,
        preferred_delivery_time: order.preferred_delivery_time,
        created_at: order.created_at,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        urgency_level: getUrgencyLevel(order.delivery_type, order.created_at),
        coordinates: order.delivery_coordinates
      };
    })
  );

  return availableDeliveries;
};
```

#### S'assigner une Livraison
```typescript
const assignDeliveryToSelf = async (orderId: string, driverId: string) => {
  try {
    // Vérifier que le chauffeur n'a pas trop de commandes actives
    const { data: activeOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('driver_id', driverId)
      .in('status', ['out_for_delivery', 'picked_up']);

    if ((activeOrders?.length || 0) >= 3) {
      throw new Error('Vous avez déjà 3 livraisons en cours');
    }

    // Vérifier que la commande est toujours disponible
    const { data: order } = await supabase
      .from('orders')
      .select('status, driver_id')
      .eq('id', orderId)
      .single();

    if (!order || order.driver_id || order.status !== 'ready') {
      throw new Error('Cette livraison n\'est plus disponible');
    }

    // S'assigner la commande
    const { error } = await supabase
      .from('orders')
      .update({ 
        driver_id: driverId,
        status: 'out_for_delivery',
        assigned_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      throw new Error('Erreur lors de l\'assignation');
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur assignation:', error);
    return { success: false, error: error.message };
  }
};
```

### 3. 🎨 Interface Utilisateur Mobile

#### Écran Principal avec Onglets
```typescript
const DriverDeliveriesScreen = () => {
  const [activeTab, setActiveTab] = useState<'assigned' | 'available'>('assigned');
  const [assignedDeliveries, setAssignedDeliveries] = useState<AssignedDelivery[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<AvailableDelivery[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.container}>
      {/* En-tête avec onglets */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
          onPress={() => setActiveTab('assigned')}
        >
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
            Mes Livraisons ({assignedDeliveries.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Disponibles ({availableDeliveries.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu des onglets */}
      {activeTab === 'assigned' ? (
        <AssignedDeliveriesList 
          deliveries={assignedDeliveries}
          onRefresh={loadAssignedDeliveries}
        />
      ) : (
        <AvailableDeliveriesList 
          deliveries={availableDeliveries}
          onRefresh={loadAvailableDeliveries}
          onAssign={assignDeliveryToSelf}
        />
      )}
    </View>
  );
};
```

#### Liste des Livraisons Assignées
```typescript
const AssignedDeliveriesList = ({ deliveries, onRefresh }) => {
  return (
    <FlatList
      data={deliveries}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AssignedDeliveryCard delivery={item} />
      )}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aucune livraison assignée
          </Text>
          <Text style={styles.emptySubtext}>
            Les nouvelles commandes apparaîtront ici
          </Text>
        </View>
      }
    />
  );
};

const AssignedDeliveryCard = ({ delivery }) => {
  return (
    <View style={styles.deliveryCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>#{delivery.order_number}</Text>
        <View style={[styles.statusBadge, styles[delivery.status]]}>
          <Text style={styles.statusText}>
            {delivery.status === 'out_for_delivery' ? 'En route' : 'Récupérée'}
          </Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{delivery.customer_name}</Text>
        <Text style={styles.deliveryAddress}>{delivery.delivery_address}</Text>
        {delivery.landmark && (
          <Text style={styles.landmark}>📍 {delivery.landmark}</Text>
        )}
      </View>

      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{delivery.business_name}</Text>
        <Text style={styles.businessAddress}>{delivery.business_address}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => callCustomer(delivery.customer_phone)}
        >
          <Icon name="phone" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Appeler</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => openNavigation(delivery.delivery_address)}
        >
          <Icon name="navigation" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Navigation</Text>
        </TouchableOpacity>

        {delivery.status === 'out_for_delivery' ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => markAsPickedUp(delivery.id)}
          >
            <Icon name="check" size={20} color="white" />
            <Text style={[styles.actionText, styles.primaryText]}>Récupérée</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => markAsDelivered(delivery.id)}
          >
            <Icon name="check-circle" size={20} color="white" />
            <Text style={[styles.actionText, styles.primaryText]}>Livrée</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
```

#### Liste des Livraisons Disponibles
```typescript
const AvailableDeliveriesList = ({ deliveries, onRefresh, onAssign }) => {
  return (
    <FlatList
      data={deliveries}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AvailableDeliveryCard 
          delivery={item} 
          onAssign={() => onAssign(item.id)}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aucune livraison disponible
          </Text>
          <Text style={styles.emptySubtext}>
            Revenez plus tard pour de nouvelles commandes
          </Text>
        </View>
      }
    />
  );
};

const AvailableDeliveryCard = ({ delivery, onAssign }) => {
  return (
    <View style={styles.availableCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>#{delivery.order_number}</Text>
        <View style={[styles.urgencyBadge, styles[delivery.urgency_level]]}>
          <Text style={styles.urgencyText}>
            {delivery.urgency_level === 'high' ? 'URGENT' : 
             delivery.urgency_level === 'medium' ? 'MOYEN' : 'NORMAL'}
          </Text>
        </View>
      </View>

      <View style={styles.deliveryInfo}>
        <Text style={styles.customerName}>{delivery.customer_name}</Text>
        <Text style={styles.deliveryAddress}>{delivery.delivery_address}</Text>
        <Text style={styles.businessName}>{delivery.business_name}</Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Icon name="map-pin" size={16} color="#666" />
          <Text style={styles.metricText}>{delivery.distance_km} km</Text>
        </View>
        <View style={styles.metric}>
          <Icon name="clock" size={16} color="#666" />
          <Text style={styles.metricText}>{delivery.estimated_time_minutes} min</Text>
        </View>
        <View style={styles.metric}>
          <Icon name="dollar-sign" size={16} color="#666" />
          <Text style={styles.metricText}>{delivery.delivery_fee} GNF</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.assignButton}
        onPress={onAssign}
      >
        <Text style={styles.assignButtonText}>Accepter cette livraison</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 4. 🔄 Actualisation en Temps Réel

#### Polling et Notifications
```typescript
const useRealTimeUpdates = (driverId: string) => {
  const [assignedDeliveries, setAssignedDeliveries] = useState([]);
  const [availableDeliveries, setAvailableDeliveries] = useState([]);

  // Polling toutes les 30 secondes
  useEffect(() => {
    const loadData = async () => {
      const [assigned, available] = await Promise.all([
        getAssignedDeliveries(driverId),
        getAvailableDeliveries(currentLocation)
      ]);
      
      setAssignedDeliveries(assigned);
      setAvailableDeliveries(available);
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [driverId, currentLocation]);

  // Notifications push pour nouvelles commandes
  useEffect(() => {
    const subscription = supabase
      .channel('driver_orders')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `driver_id=eq.${driverId}`
      }, (payload) => {
        // Nouvelle commande assignée
        loadAssignedDeliveries();
        showNotification('Nouvelle livraison assignée !');
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [driverId]);

  return { assignedDeliveries, availableDeliveries };
};
```

### 5. 📊 Filtres et Tri

#### Filtres pour les Livraisons Disponibles
```typescript
const AvailableDeliveriesFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    maxDistance: 20, // km
    minDeliveryFee: 0,
    deliveryType: 'all', // 'all', 'asap', 'scheduled'
    urgencyLevel: 'all' // 'all', 'high', 'medium', 'low'
  });

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>Filtres</Text>
      
      <View style={styles.filterRow}>
        <Text>Distance max: {filters.maxDistance} km</Text>
        <Slider
          value={filters.maxDistance}
          onValueChange={(value) => applyFilters({ ...filters, maxDistance: value })}
          minimumValue={1}
          maximumValue={50}
        />
      </View>

      <View style={styles.filterRow}>
        <Text>Frais min: {filters.minDeliveryFee} GNF</Text>
        <Slider
          value={filters.minDeliveryFee}
          onValueChange={(value) => applyFilters({ ...filters, minDeliveryFee: value })}
          minimumValue={0}
          maximumValue={5000}
        />
      </View>

      <View style={styles.filterButtons}>
        <TouchableOpacity 
          style={[styles.filterButton, filters.deliveryType === 'all' && styles.activeFilter]}
          onPress={() => applyFilters({ ...filters, deliveryType: 'all' })}
        >
          <Text>Toutes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filters.deliveryType === 'asap' && styles.activeFilter]}
          onPress={() => applyFilters({ ...filters, deliveryType: 'asap' })}
        >
          <Text>ASAP</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filters.deliveryType === 'scheduled' && styles.activeFilter]}
          onPress={() => applyFilters({ ...filters, deliveryType: 'scheduled' })}
        >
          <Text>Programmées</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

### Actions Disponibles

#### 1. Accepter/Refuser un Batch
```typescript
const acceptBatch = async (batchId: string) => {
  await supabase
    .from('delivery_batches')
    .update({ 
      status: 'assigned',
      assigned_at: new Date().toISOString()
    })
    .eq('id', batchId);
};

const rejectBatch = async (batchId: string) => {
  await supabase
    .from('delivery_batches')
    .update({ status: 'cancelled' })
    .eq('id', batchId);
};
```

#### 2. Navigation et Suivi
```typescript
const updateDriverLocation = async (driverId: string, location: Location) => {
  await supabase
    .from('drivers')
    .update({ 
      current_location: location,
      last_location_update: new Date().toISOString()
    })
    .eq('id', driverId);
};

const getOptimizedRoute = async (waypoints: Location[]) => {
  // Intégration avec Google Maps Directions API
  // ou autre service de calcul d'itinéraire
};
```

## 🔔 Notifications et Communication

### Notifications Push
```typescript
interface DeliveryNotification {
  type: 'new_batch' | 'order_update' | 'customer_message';
  title: string;
  body: string;
  data: {
    batch_id?: string;
    order_id?: string;
    action?: string;
  };
}
```

### Communication Client
```typescript
const notifyCustomer = async (orderId: string, message: string) => {
  // Envoyer une notification au client
  // SMS, push notification, etc.
};

const updateDeliveryStatus = async (orderId: string, status: string) => {
  // Mettre à jour le statut et notifier le client
  await updateOrderStatus(orderId, status);
  
  // Notification automatique selon le statut
  switch (status) {
    case 'picked_up':
      await notifyCustomer(orderId, 'Votre commande a été récupérée et est en route !');
      break;
    case 'delivered':
      await notifyCustomer(orderId, 'Votre commande a été livrée. Bon appétit !');
      break;
  }
};
```

## 📊 Métriques et Analytics

### Statistiques Chauffeur
```typescript
interface DriverStats {
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
```

### Calcul des Gains
```typescript
const calculateEarnings = (orders: Order[]) => {
  return orders.reduce((total, order) => {
    const baseFee = 1000; // GNF
    const distanceFee = order.distance_km * 200; // 200 GNF/km
    const timeFee = order.delivery_time_minutes * 50; // 50 GNF/min
    
    return total + baseFee + distanceFee + timeFee;
  }, 0);
};
```

## 🛡️ Sécurité et Validation

### Vérifications de Sécurité
```typescript
const validateBatchAccess = async (driverId: string, batchId: string) => {
  const { data: batch } = await supabase
    .from('delivery_batches')
    .select('driver_id, status')
    .eq('id', batchId)
    .single();

  return batch?.driver_id === driverId && 
         ['assigned', 'in_progress'].includes(batch.status);
};

const validateOrderAccess = async (driverId: string, orderId: string) => {
  const { data: batchOrder } = await supabase
    .from('delivery_batch_orders')
    .select(`
      delivery_batches!inner(driver_id, status)
    `)
    .eq('order_id', orderId)
    .single();

  return batchOrder?.delivery_batches?.driver_id === driverId;
};
```

### Gestion des Erreurs
```typescript
const handleDeliveryError = async (orderId: string, error: string) => {
  // Enregistrer l'erreur
  await supabase
    .from('delivery_errors')
    .insert({
      order_id: orderId,
      error_type: error,
      timestamp: new Date().toISOString()
    });

  // Notifier le support
  await notifySupport({
    order_id: orderId,
    error: error,
    driver_id: currentDriverId
  });
};
```

## 🔧 Configuration et Paramètres

### Paramètres de Livraison
```typescript
interface DeliverySettings {
  max_orders_per_batch: number;        // 5 par défaut
  max_delivery_distance: number;       // 20km par défaut
  max_delivery_time: number;           // 120 minutes par défaut
  batch_timeout: number;               // 30 minutes pour accepter
  auto_reassign_timeout: number;       // 15 minutes si non accepté
}
```

### Préférences Chauffeur
```typescript
interface DriverPreferences {
  max_distance: number;                // Distance maximale acceptée
  preferred_areas: string[];           // Zones préférées
  vehicle_capacity: number;            // Capacité du véhicule
  working_hours: {
    start: string;                     // "08:00"
    end: string;                       // "20:00"
  };
  notification_settings: {
    new_batches: boolean;
    order_updates: boolean;
    customer_messages: boolean;
  };
}
```

## 📝 Exemples d'Implémentation

### Hook React Native pour les Batchs
```typescript
const useDriverBatches = (driverId: string) => {
  const [batches, setBatches] = useState<DeliveryBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const driverBatches = await getDriverBatches(driverId);
      setBatches(driverBatches);
    } catch (error) {
      console.error('Erreur chargement batchs:', error);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchBatches();
    
    // Polling toutes les 30 secondes
    const interval = setInterval(fetchBatches, 30000);
    return () => clearInterval(interval);
  }, [fetchBatches]);

  return { batches, loading, refetch: fetchBatches };
};
```

### Service de Géolocalisation
```typescript
class LocationService {
  static async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  static startLocationTracking(driverId: string) {
    return Geolocation.watchPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        await updateDriverLocation(driverId, location);
      },
      (error) => console.error('Erreur tracking:', error),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );
  }
}
```

## 🚀 Déploiement et Maintenance

### Variables d'Environnement
```bash
# Base de données
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Services externes
GOOGLE_MAPS_API_KEY=your_google_maps_key
ONESIGNAL_APP_ID=your_onesignal_app_id

# Configuration
MAX_ORDERS_PER_BATCH=5
BATCH_TIMEOUT_MINUTES=30
AUTO_REASSIGN_TIMEOUT_MINUTES=15
```

### Monitoring et Logs
```typescript
const logDeliveryEvent = async (event: DeliveryEvent) => {
  await supabase
    .from('delivery_logs')
    .insert({
      event_type: event.type,
      driver_id: event.driverId,
      batch_id: event.batchId,
      order_id: event.orderId,
      data: event.data,
      timestamp: new Date().toISOString()
    });
};
```

## 📊 Résumé Complet du Système de Livraison

### Vue d'ensemble des 4 Types de Livraison

| Type | Description | Délai | Assignation | Optimisation |
|------|-------------|-------|-------------|--------------|
| **Unitaire** | 1 commande par chauffeur | 15-60 min | Directe | Aucune |
| **ASAP** | Livraison immédiate | 15-45 min | Automatique | Proximité |
| **Programmée** | Heure précise | Définie | Planifiée | Fenêtres |
| **Batch** | Groupe de commandes | Variable | Intelligente | Itinéraire |

### Comparaison Détaillée

#### 1. Livraison Unitaire
- **Avantages** : Simple, rapide, flexible
- **Inconvénients** : Coût élevé, inefficace
- **Cas d'usage** : Commandes urgentes, zones isolées
- **Workflow** : Commande → Assignation → Livraison

#### 2. Livraison ASAP
- **Avantages** : Rapidité, satisfaction client
- **Inconvénients** : Coût élevé, stress chauffeur
- **Cas d'usage** : Commandes urgentes, clients premium
- **Workflow** : Commande → Recherche chauffeur → Assignation immédiate

#### 3. Livraison Programmée
- **Avantages** : Planification, optimisation, coût réduit
- **Inconvénients** : Complexité, rigidité
- **Cas d'usage** : Commandes planifiées, événements
- **Workflow** : Commande → Vérification créneau → Planification → Livraison

#### 4. Livraison en Batch
- **Avantages** : Efficacité maximale, coût réduit, optimisation
- **Inconvénients** : Complexité, coordination
- **Cas d'usage** : Zones denses, heures de pointe
- **Workflow** : Groupement → Optimisation → Assignation → Livraison séquentielle

### Algorithmes et Optimisations

#### 1. Algorithme de Routage
```typescript
// Types d'algorithmes utilisés
const ROUTING_ALGORITHMS = {
  NEAREST_NEIGHBOR: 'nearest_neighbor',    // Plus proche voisin
  GENETIC: 'genetic',                      // Algorithme génétique
  ANT_COLONY: 'ant_colony',                // Colonie de fourmis
  CLARKE_WRIGHT: 'clarke_wright'           // Économies Clarke-Wright
};
```

#### 2. Optimisation des Coûts
```typescript
// Calcul des coûts de livraison
const calculateDeliveryCost = (order: Order, driver: Driver) => {
  const baseCost = 1000; // GNF de base
  const distanceCost = order.distance_km * 200; // 200 GNF/km
  const timeCost = order.estimated_time * 50; // 50 GNF/min
  const urgencyCost = order.delivery_type === 'asap' ? 500 : 0;
  
  return baseCost + distanceCost + timeCost + urgencyCost;
};
```

#### 3. Optimisation des Gains Chauffeur
```typescript
// Calcul des gains pour le chauffeur
const calculateDriverEarnings = (batch: DeliveryBatch) => {
  const baseEarning = 1500; // GNF de base par commande
  const distanceBonus = batch.total_distance * 100; // 100 GNF/km
  const timeBonus = batch.estimated_duration * 25; // 25 GNF/min
  const batchBonus = batch.total_orders > 3 ? 1000 : 0; // Bonus batch
  
  return (baseEarning * batch.total_orders) + distanceBonus + timeBonus + batchBonus;
};
```

### Métriques de Performance

#### 1. KPIs Principaux
```typescript
interface DeliveryKPIs {
  // Temps de livraison
  averageDeliveryTime: number;        // Minutes
  onTimeDeliveryRate: number;         // Pourcentage
  lateDeliveryRate: number;           // Pourcentage
  
  // Efficacité
  ordersPerDriver: number;            // Moyenne
  distancePerOrder: number;           // Kilomètres
  costPerOrder: number;               // GNF
  
  // Satisfaction
  customerRating: number;             // 1-5 étoiles
  driverRating: number;               // 1-5 étoiles
  complaintRate: number;              // Pourcentage
}
```

#### 2. Métriques par Type de Livraison
```typescript
const DELIVERY_METRICS = {
  unitaire: {
    avgTime: 35,        // minutes
    avgCost: 2500,      // GNF
    avgDistance: 8.5,   // km
    satisfaction: 4.2   // /5
  },
  asap: {
    avgTime: 28,        // minutes
    avgCost: 3200,      // GNF
    avgDistance: 7.2,   // km
    satisfaction: 4.5   // /5
  },
  scheduled: {
    avgTime: 45,        // minutes
    avgCost: 1800,      // GNF
    avgDistance: 9.1,   // km
    satisfaction: 4.3   // /5
  },
  batch: {
    avgTime: 52,        // minutes
    avgCost: 1400,      // GNF
    avgDistance: 6.8,   // km
    satisfaction: 4.1   // /5
  }
};
```

### Gestion des Erreurs et Exceptions

#### 1. Types d'Erreurs
```typescript
enum DeliveryErrorType {
  DRIVER_UNAVAILABLE = 'driver_unavailable',
  LOCATION_UNREACHABLE = 'location_unreachable',
  TIME_SLOT_UNAVAILABLE = 'time_slot_unavailable',
  PAYMENT_FAILED = 'payment_failed',
  CUSTOMER_UNREACHABLE = 'customer_unreachable',
  WEATHER_DELAY = 'weather_delay',
  TRAFFIC_DELAY = 'traffic_delay',
  VEHICLE_BREAKDOWN = 'vehicle_breakdown'
}
```

#### 2. Gestion des Exceptions
```typescript
const handleDeliveryException = async (
  orderId: string,
  errorType: DeliveryErrorType,
  driverId?: string
) => {
  // Enregistrer l'erreur
  await logDeliveryError(orderId, errorType);
  
  // Actions selon le type d'erreur
  switch (errorType) {
    case DeliveryErrorType.DRIVER_UNAVAILABLE:
      await reassignOrder(orderId);
      break;
    case DeliveryErrorType.CUSTOMER_UNREACHABLE:
      await notifyCustomer(orderId, 'Tentative de contact échouée');
      await rescheduleDelivery(orderId);
      break;
    case DeliveryErrorType.WEATHER_DELAY:
      await delayDelivery(orderId, 30); // 30 minutes
      break;
    default:
      await escalateToSupport(orderId, errorType);
  }
};
```

### Intégrations et Services Externes

#### 1. Services de Cartographie
```typescript
interface MapService {
  geocode: (address: string) => Promise<Location>;
  reverseGeocode: (location: Location) => Promise<string>;
  calculateRoute: (waypoints: Location[]) => Promise<Route>;
  calculateDistance: (from: Location, to: Location) => number;
  calculateETA: (route: Route, traffic: boolean) => number;
}
```

#### 2. Services de Notification
```typescript
interface NotificationService {
  sendSMS: (phone: string, message: string) => Promise<boolean>;
  sendPushNotification: (userId: string, notification: Notification) => Promise<boolean>;
  sendEmail: (email: string, subject: string, body: string) => Promise<boolean>;
  sendInAppNotification: (userId: string, notification: Notification) => Promise<boolean>;
}
```

#### 3. Services de Paiement
```typescript
interface PaymentService {
  processPayment: (orderId: string, amount: number) => Promise<PaymentResult>;
  refundPayment: (orderId: string, amount: number) => Promise<boolean>;
  calculateFees: (amount: number, method: PaymentMethod) => number;
}
```

### Sécurité et Conformité

#### 1. Validation des Données
```typescript
const validateDeliveryData = (data: any) => {
  const schema = {
    orderId: 'string|required',
    driverId: 'string|required',
    location: 'object|required',
    timestamp: 'string|required'
  };
  
  return validateSchema(data, schema);
};
```

#### 2. Audit Trail
```typescript
const logDeliveryEvent = async (event: DeliveryEvent) => {
  await supabase
    .from('delivery_audit_log')
    .insert({
      event_type: event.type,
      order_id: event.orderId,
      driver_id: event.driverId,
      data: event.data,
      timestamp: new Date().toISOString(),
      ip_address: event.ipAddress,
      user_agent: event.userAgent
    });
};
```

### Configuration et Déploiement

#### 1. Variables d'Environnement
```bash
# Configuration de base
DELIVERY_MAX_DISTANCE=20
DELIVERY_MAX_TIME=120
BATCH_MAX_ORDERS=5
ASAP_TIMEOUT=30

# Services externes
GOOGLE_MAPS_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
STRIPE_SECRET_KEY=your_key

# Notifications
ONESIGNAL_APP_ID=your_app_id
FIREBASE_SERVER_KEY=your_key
```

#### 2. Monitoring et Alertes
```typescript
const setupDeliveryMonitoring = () => {
  // Surveiller les livraisons en retard
  setInterval(async () => {
    const lateDeliveries = await getLateDeliveries();
    if (lateDeliveries.length > 0) {
      await sendLateDeliveryAlert(lateDeliveries);
    }
  }, 60000); // Vérifier toutes les minutes
  
  // Surveiller les chauffeurs inactifs
  setInterval(async () => {
    const inactiveDrivers = await getInactiveDrivers();
    if (inactiveDrivers.length > 0) {
      await sendInactiveDriverAlert(inactiveDrivers);
    }
  }, 300000); // Vérifier toutes les 5 minutes
};
```

---

## 📞 Support et Contact

Pour toute question sur cette documentation ou l'implémentation du système de livraison, contactez l'équipe de développement BraPrime.

**Version:** 2.0  
**Dernière mise à jour:** Décembre 2024  
**Auteur:** Équipe BraPrime 