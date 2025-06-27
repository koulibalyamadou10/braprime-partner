# Guide de Résolution - Problème des Commandes des Livreurs

## Problème Identifié
La page de détails des livreurs affiche "Aucune commande en cours" même quand il y a des commandes assignées aux livreurs.

## Erreur Spécifique
```
Erreur récupération commande actuelle: 
Object
code: "42703"
message: "column orders.customer_name does not exist"
```

## Causes Possibles
1. **Colonnes manquantes dans la table orders** - Les colonnes `customer_name`, `customer_phone`, etc. n'existent pas
2. **Aucune commande assignée aux livreurs** - Les commandes n'ont pas de `driver_id`
3. **Permissions RLS incorrectes** - Les partenaires ne peuvent pas voir les commandes de leurs livreurs
4. **Utilisateur non connecté ou mauvais rôle** - Problème d'authentification

## Solution Étape par Étape

### Étape 1: Vérifier la Structure de la Table Orders
Exécutez le script de diagnostic de structure :

```sql
-- Copiez et exécutez dans l'éditeur SQL de Supabase
-- scripts/check-orders-structure.sql
```

Ce script va :
- Vérifier toutes les colonnes de la table orders
- Identifier les colonnes manquantes
- Vérifier les colonnes alternatives existantes

### Étape 2: Corriger la Structure de la Table Orders
Si des colonnes manquent, exécutez le script de correction :

```sql
-- Copiez et exécutez dans l'éditeur SQL de Supabase
-- scripts/fix-orders-table-structure.sql
```

Ce script va :
- Ajouter toutes les colonnes manquantes (`customer_name`, `customer_phone`, `customer_email`, `delivery_address`, `driver_id`, `driver_rating`, `driver_comment`, `delivered_at`)
- Migrer les données existantes si des colonnes alternatives existent
- Ajouter des données de test pour les colonnes vides

### Étape 3: Corriger les Permissions RLS
Exécutez le script de correction des permissions :

```sql
-- Copiez et exécutez dans l'éditeur SQL de Supabase
-- scripts/fix-orders-rls-for-drivers.sql
```

Ce script va :
- Ajouter les politiques RLS nécessaires
- Permettre aux partenaires de voir les commandes de leurs livreurs
- Créer des index pour les performances

### Étape 4: Ajouter des Données de Test
Si aucune commande n'est assignée aux livreurs, exécutez :

```sql
-- Copiez et exécutez dans l'éditeur SQL de Supabase
-- scripts/add-complete-test-data.sql
```

Ce script va :
- Ajouter des livreurs de test
- Créer des commandes assignées aux livreurs
- Ajouter des avis et notes
- Créer des commandes en cours de livraison

### Étape 5: Vérifier les Résultats
Après avoir exécuté les scripts, vérifiez que :

1. **La structure de la table est correcte** :
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('customer_name', 'customer_phone', 'driver_id', 'driver_rating')
ORDER BY column_name;
```

2. **Les commandes ont des livreurs assignés** :
```sql
SELECT COUNT(*) as total_orders, 
       COUNT(CASE WHEN driver_id IS NOT NULL THEN 1 END) as orders_with_driver
FROM orders;
```

3. **Les permissions RLS fonctionnent** :
```sql
SELECT COUNT(*) as accessible_orders
FROM orders o
WHERE o.driver_id IN (
    SELECT d.id 
    FROM drivers d 
    JOIN businesses b ON d.business_id = b.id 
    WHERE b.owner_id = auth.uid()
);
```

### Étape 6: Tester l'Application
1. Redémarrez le serveur de développement
2. Connectez-vous en tant que partenaire
3. Allez sur la page des livreurs
4. Cliquez sur "Voir détails" d'un livreur
5. Vérifiez que les commandes s'affichent

## Scripts Disponibles

### Diagnostic
- `scripts/check-orders-structure.sql` - Vérifier la structure de la table orders
- `scripts/diagnose-driver-orders-issue.sql` - Diagnostic complet
- `scripts/check-drivers-orders.sql` - Vérification rapide

### Correction Structure
- `scripts/fix-orders-table-structure.sql` - Corriger la structure de la table orders
- `scripts/fix-orders-rls-for-drivers.sql` - Corriger les permissions RLS

### Données de Test
- `scripts/add-complete-test-data.sql` - Données complètes
- `scripts/test-driver-orders.sql` - Commandes de test simples

## Colonnes Requises par le Code

Le code `DriverDetailsService` attend ces colonnes dans la table `orders` :

- `id` - Identifiant de la commande
- `customer_name` - Nom du client
- `customer_phone` - Téléphone du client
- `customer_email` - Email du client
- `delivery_address` - Adresse de livraison
- `business_id` - ID du business
- `driver_id` - ID du livreur assigné
- `status` - Statut de la commande
- `total` - Montant total
- `grand_total` - Montant total avec frais
- `created_at` - Date de création
- `delivered_at` - Date de livraison
- `driver_rating` - Note du livreur
- `driver_comment` - Commentaire sur le livreur

## Vérification du Code

Le code de la page `DriverDetails.tsx` et du service `DriverDetailsService` est correct. Le problème vient de la structure de la base de données.

### Points de Vérification dans le Code

1. **Service** (`src/lib/services/driver-details.ts`) :
   - La méthode `getDriverOrders` fait la bonne requête
   - Les erreurs sont bien gérées et loggées

2. **Page** (`src/pages/dashboard/DriverDetails.tsx`) :
   - Les données sont bien chargées dans `loadDriverData`
   - Les erreurs sont affichées correctement
   - L'état de chargement est géré

## Messages d'Erreur Courants

### "column orders.customer_name does not exist"
- **Cause** : La colonne `customer_name` n'existe pas dans la table orders
- **Solution** : Exécuter `scripts/fix-orders-table-structure.sql`

### "Aucune commande en cours"
- **Cause** : Aucune commande avec `driver_id` ou permissions RLS
- **Solution** : Exécuter les scripts de correction et de données de test

### "Erreur lors du chargement des données"
- **Cause** : Problème de permissions ou de structure de base
- **Solution** : Vérifier les logs et exécuter le diagnostic

### "Livreur non trouvé"
- **Cause** : Le livreur n'existe pas ou n'appartient pas au partenaire
- **Solution** : Vérifier les données des livreurs

## Ordre d'Exécution Recommandé

1. **Diagnostic** : `scripts/check-orders-structure.sql`
2. **Correction Structure** : `scripts/fix-orders-table-structure.sql`
3. **Correction Permissions** : `scripts/fix-orders-rls-for-drivers.sql`
4. **Données de Test** : `scripts/add-complete-test-data.sql`
5. **Test** : Redémarrer le serveur et tester

## Support

Si le problème persiste après avoir suivi ce guide :

1. Vérifiez les logs de la console du navigateur
2. Vérifiez les logs de Supabase
3. Exécutez le script de diagnostic complet
4. Partagez les résultats du diagnostic

## Notes Importantes

- Assurez-vous d'être connecté en tant que partenaire
- Vérifiez que vous avez des businesses associées à votre compte
- Les scripts utilisent `auth.uid()` donc doivent être exécutés par l'utilisateur connecté
- Redémarrez toujours le serveur après les modifications de base de données
- La structure de la table orders peut varier selon votre installation 