# Modification du Schéma : Plusieurs Commandes par Chauffeur

## Vue d'ensemble

Ce dossier contient les scripts SQL pour modifier le schéma de la base de données afin de permettre à un chauffeur d'avoir plusieurs commandes en cours simultanément.

## Problème initial

Dans le schéma original, un chauffeur était limité à une seule commande à la fois à cause de :
- La colonne `current_order_id` dans la table `drivers`
- L'absence de contrainte de clé étrangère sur `orders.driver_id`

## Solution

### Scripts disponibles

1. **`allow-multiple-orders-per-driver.sql`** - Script principal de modification
2. **`test-multiple-orders-per-driver.sql`** - Script de test et validation
3. **`README-multiple-orders.md`** - Cette documentation

### Modifications apportées

#### 1. Suppression de la limitation
- ✅ Suppression de `current_order_id` de la table `drivers`
- ✅ Ajout d'une contrainte de clé étrangère sur `orders.driver_id`

#### 2. Optimisation des performances
- ✅ Index sur `orders.driver_id`
- ✅ Index sur `orders.status`
- ✅ Index composite sur `orders(driver_id, status)`

#### 3. Nouvelles fonctionnalités

##### Vue `driver_active_orders`
```sql
-- Obtenir toutes les commandes actives par chauffeur
SELECT * FROM public.driver_active_orders;
```

##### Fonction `assign_order_to_driver(order_id, driver_id)`
```sql
-- Assigner une commande à un chauffeur
SELECT public.assign_order_to_driver('order-uuid', 'driver-uuid');
```

##### Fonction `unassign_order_from_driver(order_id)`
```sql
-- Libérer une commande d'un chauffeur
SELECT public.unassign_order_from_driver('order-uuid');
```

##### Fonction `get_driver_active_orders(driver_id)`
```sql
-- Obtenir les commandes actives d'un chauffeur spécifique
SELECT * FROM public.get_driver_active_orders('driver-uuid');
```

##### Fonction `get_driver_stats(driver_id)`
```sql
-- Obtenir les statistiques d'un chauffeur
SELECT * FROM public.get_driver_stats('driver-uuid');
```

#### 4. Sécurité et intégrité
- ✅ Politiques RLS pour les chauffeurs et partenaires
- ✅ Trigger pour mettre à jour automatiquement les statistiques
- ✅ Validation des données dans les fonctions

## Instructions d'utilisation

### 1. Exécution du script principal

```bash
# Dans Supabase SQL Editor ou via psql
\i scripts/allow-multiple-orders-per-driver.sql
```

### 2. Validation des modifications

```bash
# Exécuter le script de test
\i scripts/test-multiple-orders-per-driver.sql
```

### 3. Vérification manuelle

```sql
-- Vérifier que la colonne a été supprimée
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'drivers' AND column_name = 'current_order_id';

-- Vérifier la contrainte de clé étrangère
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'orders' AND constraint_type = 'FOREIGN KEY';

-- Tester la vue
SELECT COUNT(*) FROM public.driver_active_orders;
```

## Exemples d'utilisation

### Assigner plusieurs commandes à un chauffeur

```sql
-- Assigner la première commande
SELECT public.assign_order_to_driver('order-1-uuid', 'driver-uuid');

-- Assigner la deuxième commande (maintenant possible!)
SELECT public.assign_order_to_driver('order-2-uuid', 'driver-uuid');

-- Vérifier les commandes actives
SELECT * FROM public.get_driver_active_orders('driver-uuid');
```

### Gérer les commandes d'un chauffeur

```sql
-- Voir toutes les commandes actives
SELECT * FROM public.driver_active_orders 
WHERE driver_id = 'driver-uuid';

-- Libérer une commande spécifique
SELECT public.unassign_order_from_driver('order-uuid');

-- Obtenir les statistiques
SELECT * FROM public.get_driver_stats('driver-uuid');
```

### Requêtes utiles

```sql
-- Chauffeurs avec le plus de commandes actives
SELECT driver_name, active_orders_count 
FROM public.driver_active_orders 
ORDER BY active_orders_count DESC;

-- Commandes non assignées
SELECT * FROM public.orders 
WHERE driver_id IS NULL 
AND status IN ('confirmed', 'preparing', 'ready');

-- Statistiques globales des chauffeurs
SELECT 
    COUNT(*) as total_drivers,
    AVG(active_orders_count) as avg_active_orders,
    MAX(active_orders_count) as max_active_orders
FROM public.driver_active_orders;
```

## Impact sur l'application

### Avantages
- ✅ Un chauffeur peut gérer plusieurs commandes simultanément
- ✅ Meilleure utilisation des ressources de livraison
- ✅ Réduction des temps d'attente pour les clients
- ✅ Flexibilité accrue dans la gestion des commandes

### Considérations
- ⚠️ Interface utilisateur à adapter pour afficher plusieurs commandes
- ⚠️ Logique de routage à optimiser pour les livraisons multiples
- ⚠️ Notifications à adapter pour les chauffeurs avec plusieurs commandes

## Rollback (si nécessaire)

Si vous devez revenir à l'ancien schéma :

```sql
-- Supprimer les nouvelles fonctionnalités
DROP VIEW IF EXISTS public.driver_active_orders;
DROP FUNCTION IF EXISTS public.get_driver_active_orders(uuid);
DROP FUNCTION IF EXISTS public.assign_order_to_driver(uuid, uuid);
DROP FUNCTION IF EXISTS public.unassign_order_from_driver(uuid);
DROP FUNCTION IF EXISTS public.get_driver_stats(uuid);
DROP FUNCTION IF EXISTS public.update_driver_stats_after_delivery();

-- Supprimer les index
DROP INDEX IF EXISTS idx_orders_driver_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_driver_status;

-- Supprimer la contrainte
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;

-- Remettre la colonne (si nécessaire)
ALTER TABLE public.drivers ADD COLUMN current_order_id uuid;
```

## Support

Pour toute question ou problème :
1. Vérifiez les logs d'exécution des scripts
2. Exécutez le script de test pour identifier les problèmes
3. Consultez la documentation Supabase pour les erreurs spécifiques

---

**Note** : Ces modifications sont irréversibles une fois appliquées. Assurez-vous de faire une sauvegarde de votre base de données avant l'exécution. 