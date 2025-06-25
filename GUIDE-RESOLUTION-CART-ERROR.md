# Guide de Résolution - Erreur PGRST204 Cart System

## Problème
```
{code: "PGRST204", details: null, hint: null,…}
code: "PGRST204"
message: "Could not find the 'item_count' column of 'cart' in the schema cache"
```

## Cause
L'erreur PGRST204 indique que le code essaie d'accéder à une colonne `item_count` qui n'existe pas dans la table `cart`. Cette colonne est calculée par une fonction SQL et disponible via la vue `cart_details`.

## Solutions Appliquées

### 1. Correction du Service Cart (`src/lib/services/cart.ts`)
- **Problème** : Le service utilisait la table `cart` directement
- **Solution** : Utilisation de la vue `cart_details` qui contient les colonnes calculées
- **Changement** : 
  ```typescript
  // Avant
  .from('cart')
  
  // Après  
  .from('cart_details')
  ```

### 2. Correction des Types (`src/lib/types/index.ts`)
- **Problème** : L'interface `Cart` incluait `total` et `item_count` comme propriétés obligatoires
- **Solution** : Ces propriétés sont maintenant optionnelles et calculées
- **Changement** :
  ```typescript
  export interface Cart {
    // ... autres propriétés
    total?: number;        // Calculé par calculate_cart_total()
    item_count?: number;   // Calculé par get_cart_item_count()
  }
  ```

### 3. Correction de la Méthode createCart
- **Problème** : Tentative d'insertion de colonnes inexistantes (`total`, `item_count`)
- **Solution** : Suppression de ces colonnes de l'insertion
- **Changement** :
  ```typescript
  // Avant
  .insert({
    user_id: userId,
    business_id: businessId,
    business_name: businessName,
    total: 0,           // ❌ N'existe pas
    item_count: 0       // ❌ N'existe pas
  })
  
  // Après
  .insert({
    user_id: userId,
    business_id: businessId,
    business_name: businessName
  })
  ```

## Vérification de la Base de Données

### 1. Exécuter le Script de Création
Assurez-vous que le script `scripts/add-cart-table.sql` a été exécuté dans Supabase :

```sql
-- Exécuter dans l'éditeur SQL de Supabase
-- Voir le fichier scripts/add-cart-table.sql
```

### 2. Vérifier les Tables et Vues
```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('cart', 'cart_items') 
AND table_schema = 'public';

-- Vérifier que la vue existe
SELECT table_name FROM information_schema.views 
WHERE table_name = 'cart_details' 
AND table_schema = 'public';
```

### 3. Tester les Fonctions
```sql
-- Tester les fonctions de calcul
SELECT calculate_cart_total('test-uuid');
SELECT get_cart_item_count('test-uuid');
```

## Script de Test
Utilisez le script `scripts/test-cart-system.sql` pour vérifier que tout fonctionne :

```bash
# Exécuter dans l'éditeur SQL de Supabase
# Voir le fichier scripts/test-cart-system.sql
```

## Structure Correcte

### Table `cart`
```sql
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    business_name VARCHAR(200),
    delivery_method VARCHAR(20) DEFAULT 'delivery',
    delivery_address TEXT,
    delivery_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### Vue `cart_details`
```sql
CREATE OR REPLACE VIEW cart_details AS
SELECT 
    c.id as cart_id,
    c.user_id,
    c.business_id,
    c.business_name,
    c.delivery_method,
    c.delivery_address,
    c.delivery_instructions,
    c.created_at,
    c.updated_at,
    calculate_cart_total(c.id) as total,           -- ✅ Calculé
    get_cart_item_count(c.id) as item_count,       -- ✅ Calculé
    json_agg(...) as items
FROM cart c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
GROUP BY ...;
```

## Points Clés

1. **Ne jamais insérer** `total` ou `item_count` dans la table `cart`
2. **Utiliser la vue** `cart_details` pour récupérer ces valeurs calculées
3. **Les fonctions** `calculate_cart_total()` et `get_cart_item_count()` calculent ces valeurs
4. **Les types TypeScript** doivent refléter que ces propriétés sont optionnelles

## Test de Fonctionnement

Après les corrections, testez le système :

1. Connectez-vous à l'application
2. Ajoutez un article au panier
3. Vérifiez que le panier se charge sans erreur
4. Vérifiez que le total et le nombre d'articles s'affichent correctement

## Support

Si le problème persiste :
1. Vérifiez les logs de la console du navigateur
2. Vérifiez les logs de Supabase
3. Exécutez le script de test pour diagnostiquer
4. Vérifiez que toutes les migrations SQL ont été appliquées 