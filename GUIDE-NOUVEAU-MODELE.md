# Guide du Nouveau Modèle BraPrime

## Vue d'ensemble

Le modèle de données de BraPrime a été refactorisé pour être plus flexible et permettre à un partenaire d'offrir différents types de services (restaurant, pharmacie, supermarché, etc.) avec des dashboards qui s'adaptent selon le type de service.

## Architecture du Nouveau Modèle

### 1. Structure des Tables

#### `users` (Utilisateurs)
- **Rôles étendus** : `customer`, `partner`, `driver`, `admin`
- Un partenaire peut maintenant gérer plusieurs services

#### `service_types` (Types de Services)
```sql
- id: Identifiant unique
- name: Nom du type (Restaurant, Pharmacie, Supermarché, etc.)
- description: Description du type de service
- icon: Icône associée
- color: Couleur associée
- is_active: Statut actif/inactif
```

#### `services` (Services - remplace restaurants)
```sql
- id: Identifiant unique
- name: Nom du service
- description: Description du service
- service_type_id: Référence vers le type de service
- cover_image: Image de couverture
- logo: Logo du service
- rating: Note moyenne
- review_count: Nombre d'avis
- delivery_time: Temps de livraison
- delivery_fee: Frais de livraison
- address: Adresse
- phone: Téléphone
- opening_hours: Heures d'ouverture
- is_active: Statut actif/inactif
- partner_id: Référence vers le partenaire
```

#### `products` (Produits - remplace menu_items)
```sql
- id: Identifiant unique
- service_id: Référence vers le service
- name: Nom du produit
- description: Description du produit
- price: Prix
- image: Image du produit
- category_id: Référence vers la catégorie
- is_popular: Produit populaire
- is_available: Disponible
```

#### `categories` (Catégories de Produits)
- Catégories spécifiques aux produits (Médicaments, Plats principaux, etc.)
- Différentes selon le type de service

### 2. Relations

```
Partenaire (users)
    ↓ (1:N)
Services (services)
    ↓ (1:N)
Produits (products)
    ↓ (N:1)
Catégories (categories)

Types de Services (service_types)
    ↓ (1:N)
Services (services)
```

## Avantages du Nouveau Modèle

### 1. Flexibilité
- Un partenaire peut gérer plusieurs services
- Chaque service peut être d'un type différent
- Adaptation automatique selon le type de service

### 2. Scalabilité
- Ajout facile de nouveaux types de services
- Structure extensible pour de nouvelles fonctionnalités

### 3. Personnalisation
- Dashboards adaptés selon le type de service
- Interface utilisateur contextuelle

## Services et Hooks

### Services Principaux

#### `HomepageService`
- `getHomepageStats()`: Statistiques générales
- `getPopularServices()`: Services populaires
- `getFeaturedProducts()`: Produits en vedette
- `getServiceById()`: Service spécifique
- `getServiceTypes()`: Types de services
- `getProductCategories()`: Catégories de produits

#### `DashboardService`
- `getPartnerServices()`: Services d'un partenaire
- `getDashboardStats()`: Statistiques adaptées au type de service
- `getRecentOrders()`: Commandes récentes
- `getPartnerProducts()`: Produits du partenaire
- `createService()`: Créer un service
- `updateService()`: Mettre à jour un service
- `createProduct()`: Créer un produit
- `updateProduct()`: Mettre à jour un produit

### Hooks React Query

#### Hooks Homepage
- `useHomepageStats()`: Statistiques de la page d'accueil
- `usePopularServices()`: Services populaires
- `useFeaturedProducts()`: Produits en vedette
- `useServiceById()`: Service spécifique
- `useServiceTypes()`: Types de services
- `useProductCategories()`: Catégories de produits

#### Hooks Dashboard
- `usePartnerServices()`: Services du partenaire
- `useDashboardStats()`: Statistiques du dashboard
- `useRecentOrders()`: Commandes récentes
- `usePartnerProducts()`: Produits du partenaire
- `useAvailableServiceTypes()`: Types de services disponibles
- `useCreateService()`: Créer un service
- `useUpdateService()`: Mettre à jour un service
- `useCreateProduct()`: Créer un produit
- `useUpdateProduct()`: Mettre à jour un produit

## Adaptation du Dashboard

### 1. Filtrage par Type de Service
```typescript
// Récupérer les statistiques pour un type de service spécifique
const { data: stats } = useDashboardStats(serviceTypeId);

// Récupérer tous les services d'un partenaire
const { data: services } = usePartnerServices();
```

### 2. Interface Contextuelle
- **Restaurant** : Focus sur les commandes, réservations, menu
- **Pharmacie** : Focus sur les médicaments, prescriptions, livraison urgente
- **Supermarché** : Focus sur les produits frais, stock, commandes groupées
- **Café** : Focus sur les boissons, pâtisseries, ambiance

### 3. Métriques Adaptées
- **Restaurant** : Temps de préparation, réservations, popularité des plats
- **Pharmacie** : Livraison urgente, prescriptions, stock de médicaments
- **Supermarché** : Gestion des stocks, produits frais, commandes volumineuses
- **Café** : Boissons populaires, ambiance, événements

## Migration des Données

### 1. Exécution du Nouveau Schéma
```sql
-- Exécuter le fichier supabase-schema-fixed.sql dans Supabase
-- Cela va :
-- 1. Supprimer les anciennes tables
-- 2. Créer les nouvelles tables
-- 3. Insérer les données de base
-- 4. Configurer les politiques RLS
```

### 2. Données de Base Incluses
- **Types de Services** : Restaurant, Pharmacie, Supermarché, Café, etc.
- **Catégories de Produits** : Adaptées à chaque type de service
- **Services d'Exemple** : Avec produits associés
- **Politiques de Sécurité** : RLS configuré pour tous les rôles

## Utilisation Pratique

### 1. Créer un Nouveau Service
```typescript
const createService = useCreateService();

const newService = {
  name: "Ma Pharmacie",
  description: "Pharmacie de quartier",
  service_type_id: 2, // ID du type "Pharmacie"
  cover_image: "url_image",
  delivery_time: "20-30 min",
  delivery_fee: 15000,
  address: "123 Rue de la Santé",
  phone: "+224 123 45 67 89",
  opening_hours: "24h/24, 7j/7"
};

createService.mutate(newService);
```

### 2. Ajouter des Produits
```typescript
const createProduct = useCreateProduct();

const newProduct = {
  service_id: 1,
  name: "Paracétamol 500mg",
  description: "Boîte de 20 comprimés",
  price: 10000,
  category_id: 7, // ID de la catégorie "Médicaments"
  is_popular: true
};

createProduct.mutate(newProduct);
```

### 3. Dashboard Adaptatif
```typescript
// Le dashboard s'adapte automatiquement selon le type de service
const { data: services } = usePartnerServices();
const { data: stats } = useDashboardStats();

// Afficher des métriques spécifiques selon le type
services?.forEach(service => {
  if (service.service_types.name === 'Restaurant') {
    // Afficher métriques restaurant
  } else if (service.service_types.name === 'Pharmacie') {
    // Afficher métriques pharmacie
  }
});
```

## Avantages pour les Partenaires

### 1. Gestion Multi-Services
- Un partenaire peut gérer un restaurant ET une pharmacie
- Interface unifiée pour tous les services
- Statistiques consolidées et par service

### 2. Flexibilité Opérationnelle
- Ajout facile de nouveaux types de services
- Adaptation automatique de l'interface
- Métriques pertinentes selon le contexte

### 3. Expérience Utilisateur Améliorée
- Interface contextuelle selon le type de service
- Workflows adaptés aux besoins spécifiques
- Dashboard personnalisé

## Prochaines Étapes

### 1. Mise à Jour des Composants
- Adapter les composants existants au nouveau modèle
- Créer des composants spécifiques par type de service
- Mettre à jour les pages pour utiliser les nouveaux hooks

### 2. Tests et Validation
- Tester la création de différents types de services
- Valider les dashboards adaptatifs
- Vérifier les performances avec le nouveau modèle

### 3. Documentation Utilisateur
- Guide pour les partenaires
- Documentation technique détaillée
- Exemples d'utilisation

## Conclusion

Le nouveau modèle de BraPrime offre une flexibilité maximale tout en maintenant une structure cohérente et évolutive. Il permet aux partenaires de diversifier leurs activités tout en bénéficiant d'une interface adaptée à chaque type de service. 