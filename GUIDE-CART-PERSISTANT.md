# Guide d'utilisation du Panier Persistant - BraPrime

## 📋 Vue d'ensemble

Ce guide explique comment utiliser le nouveau système de panier persistant qui remplace l'ancien système basé sur localStorage. Le nouveau système offre une persistance en base de données avec synchronisation en temps réel.

## 🚀 Installation et Configuration

### 1. Exécuter le script SQL

Exécutez le script `scripts/add-cart-table.sql` dans l'éditeur SQL de Supabase :

```sql
-- Exécuter le script complet
-- Ce script crée :
-- - Table cart (paniers utilisateur)
-- - Table cart_items (articles du panier)
-- - Index pour les performances
-- - Politiques RLS pour la sécurité
-- - Fonctions utilitaires
-- - Vue cart_details
```

### 2. Vérifier la configuration

Assurez-vous que les types TypeScript sont à jour dans `src/lib/supabase.ts` :

```typescript
// Les types cart et cart_items doivent être présents
cart: {
  Row: { /* ... */ }
  Insert: { /* ... */ }
  Update: { /* ... */ }
}
cart_items: {
  Row: { /* ... */ }
  Insert: { /* ... */ }
  Update: { /* ... */ }
}
```

## 🛠️ Utilisation du Hook useCart

### Import et initialisation

```typescript
import { useCart } from '@/hooks/use-cart'

function MonComposant() {
  const { 
    cart, 
    loading, 
    error, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart()
  
  // Utilisation...
}
```

### Fonctions disponibles

#### `addToCart(itemData, businessId?, businessName?)`
Ajoute un article au panier persistant.

```typescript
await addToCart({
  menu_item_id: 123,
  name: 'Pizza Margherita',
  price: 15000,
  quantity: 2,
  image: 'https://example.com/pizza.jpg'
}, 1, 'Restaurant Demo')
```

#### `removeFromCart(itemId)`
Supprime un article du panier.

```typescript
await removeFromCart('item-uuid-here')
```

#### `updateQuantity(itemId, quantity)`
Met à jour la quantité d'un article.

```typescript
await updateQuantity('item-uuid-here', 3)
```

#### `clearCart()`
Vide complètement le panier.

```typescript
await clearCart()
```

#### `updateDeliveryInfo(deliveryMethod, address?, instructions?)`
Met à jour les informations de livraison.

```typescript
await updateDeliveryInfo('delivery', '123 Rue de la Paix', 'Code: 1234')
```

#### `syncFromLocal(localCart, businessId?, businessName?)`
Synchronise depuis un panier localStorage.

```typescript
const localCart = [
  { id: 1, name: 'Pizza', price: 15000, quantity: 2 }
]
await syncFromLocal(localCart, 1, 'Restaurant Demo')
```

## 🔄 Migration depuis l'ancien système

### 1. Remplacer OrderContext par useCart

**Avant (OrderContext) :**
```typescript
import { useOrder } from '@/contexts/OrderContext'

const { cart, addToCart, removeFromCart } = useOrder()
```

**Après (useCart) :**
```typescript
import { useCart } from '@/hooks/use-cart'

const { cart, addToCart, removeFromCart } = useCart()
```

### 2. Adapter les types

**Avant :**
```typescript
interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}
```

**Après :**
```typescript
interface CartItem {
  id: string // UUID au lieu de number
  menu_item_id?: number
  name: string
  price: number
  quantity: number
  image?: string
  special_instructions?: string
}
```

### 3. Synchroniser les données existantes

```typescript
// Dans votre composant de migration
useEffect(() => {
  if (currentUser && localCart.length > 0) {
    syncFromLocal(localCart, businessId, businessName)
  }
}, [currentUser])
```

## 📊 Structure de la base de données

### Table `cart`
```sql
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    business_id INTEGER REFERENCES businesses(id),
    business_name VARCHAR(200),
    items JSONB NOT NULL DEFAULT '[]',
    delivery_method VARCHAR(20) DEFAULT 'delivery',
    delivery_address TEXT,
    delivery_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### Table `cart_items`
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES cart(id),
    menu_item_id INTEGER REFERENCES menu_items(id),
    name VARCHAR(200) NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    image VARCHAR(500),
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Sécurité (RLS)

Le système utilise Row Level Security (RLS) pour garantir que :

- Chaque utilisateur ne peut voir que son propre panier
- Chaque utilisateur ne peut modifier que son propre panier
- Les articles du panier sont liés au panier de l'utilisateur

## ⚡ Fonctionnalités avancées

### Temps réel
Le panier se met à jour automatiquement grâce aux subscriptions Supabase :

```typescript
// Automatiquement géré par le hook useCart
const subscription = CartService.subscribeToCartChanges(userId, (updatedCart) => {
  // Le panier se met à jour automatiquement
})
```

### Fonctions utilitaires
```sql
-- Calculer le total du panier
SELECT calculate_cart_total('cart-uuid-here');

-- Obtenir le nombre d'articles
SELECT get_cart_item_count('cart-uuid-here');

-- Vider le panier d'un utilisateur
SELECT clear_user_cart('user-uuid-here');
```

### Vue `cart_details`
```sql
-- Récupérer le panier avec tous les détails
SELECT * FROM cart_details WHERE user_id = 'user-uuid-here';
```

## 🧪 Tests et Démonstration

Utilisez le composant `CartDemo` pour tester le système :

```typescript
import { CartDemo } from '@/components/CartDemo'

function TestPage() {
  return <CartDemo />
}
```

## 🚨 Gestion des erreurs

Le hook `useCart` gère automatiquement les erreurs et affiche des notifications :

```typescript
const { error, loading } = useCart()

if (error) {
  // L'erreur est automatiquement affichée via toast
  console.error('Erreur du panier:', error)
}

if (loading) {
  // Afficher un indicateur de chargement
  return <LoadingSpinner />
}
```

## 📱 Intégration avec les composants existants

### AddToCartButton
```typescript
import { useCart } from '@/hooks/use-cart'

export const AddToCartButton = ({ item, businessId, businessName }) => {
  const { addToCart } = useCart()
  
  const handleAdd = async () => {
    await addToCart({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image
    }, businessId, businessName)
  }
  
  return <Button onClick={handleAdd}>Ajouter au panier</Button>
}
```

### FloatingCart
```typescript
import { useCart } from '@/hooks/use-cart'

export const FloatingCart = () => {
  const { cart, loading } = useCart()
  
  if (loading || !cart || cart.item_count === 0) {
    return null
  }
  
  return (
    <div>
      <span>{cart.item_count} articles</span>
      <span>{formatCurrency(cart.total)}</span>
    </div>
  )
}
```

## 🔄 Migration progressive

Pour une migration en douceur :

1. **Phase 1** : Implémenter le nouveau système en parallèle
2. **Phase 2** : Migrer les composants un par un
3. **Phase 3** : Synchroniser les données existantes
4. **Phase 4** : Supprimer l'ancien système

## 📞 Support

Pour toute question ou problème :

1. Vérifiez les logs de la console
2. Consultez les erreurs Supabase
3. Testez avec le composant `CartDemo`
4. Vérifiez la configuration RLS

---

**Note** : Ce système remplace complètement l'ancien système localStorage et offre une expérience utilisateur améliorée avec persistance et synchronisation en temps réel. 