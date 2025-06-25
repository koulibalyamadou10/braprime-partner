# Guide d'Utilisation du Système de Panier Persistant

## 🚀 Utilisation Rapide

### 1. Installation

Exécutez le script SQL pour créer les tables :
```bash
# Dans votre base de données Supabase
psql -h your-project.supabase.co -U postgres -d postgres -f scripts/add-cart-table.sql
```

### 2. Utilisation dans vos Composants

#### Hook useCart
```typescript
import { useCart } from '@/hooks/use-cart';

const MyComponent = () => {
  const { 
    cart,           // Panier actuel
    loading,        // État de chargement
    error,          // Erreur éventuelle
    addToCart,      // Ajouter un article
    removeFromCart, // Supprimer un article
    updateQuantity, // Modifier la quantité
    clearCart,      // Vider le panier
    refreshCart     // Recharger le panier
  } = useCart();

  // Exemple d'ajout au panier
  const handleAddItem = async () => {
    await addToCart({
      menu_item_id: 1,
      name: "Poulet Yassa",
      price: 25000,
      quantity: 1,
      image: "url-image"
    }, businessId, businessName);
  };
};
```

#### Composant AddToCartButton
```typescript
import { AddToCartButton } from '@/components/AddToCartButton';

// Variant par défaut
<AddToCartButton
  item={menuItem}
  businessId={restaurant.id}
  businessName={restaurant.name}
/>

// Variant compact
<AddToCartButton
  item={menuItem}
  businessId={restaurant.id}
  businessName={restaurant.name}
  variant="compact"
/>

// Variant icône
<AddToCartButton
  item={menuItem}
  businessId={restaurant.id}
  businessName={restaurant.name}
  variant="icon"
/>
```

#### Composant FloatingCart
```typescript
import { FloatingCart } from '@/components/FloatingCart';

// Barre en bas
<FloatingCart variant="bottom" />

// Coin de l'écran
<FloatingCart variant="corner" />
```

### 3. Fonctionnalités Avancées

#### Synchronisation avec localStorage
```typescript
// Le hook gère automatiquement la synchronisation
// Si un utilisateur ajoute des articles sans être connecté,
// ils sont stockés en localStorage puis synchronisés à la connexion

const { syncFromLocal } = useCart();

// Synchronisation manuelle si nécessaire
const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
if (localCart.length > 0) {
  await syncFromLocal(localCart, businessId, businessName);
  localStorage.removeItem('cart');
}
```

#### Gestion des erreurs
```typescript
const { error, refreshCart } = useCart();

if (error) {
  return (
    <div className="error-message">
      <p>Erreur: {error}</p>
      <button onClick={refreshCart}>Réessayer</button>
    </div>
  );
}
```

#### État de chargement
```typescript
const { loading } = useCart();

if (loading) {
  return <div>Chargement du panier...</div>;
}
```

### 4. Structure des Données

#### Panier (Cart)
```typescript
interface Cart {
  id: string;
  user_id: string;
  business_id: number;
  business_name: string;
  total: number;
  item_count: number;
  created_at: string;
  updated_at: string;
  items: CartItem[];
}
```

#### Article du Panier (CartItem)
```typescript
interface CartItem {
  id: string;
  cart_id: string;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  special_instructions?: string;
  created_at: string;
}
```

### 5. Exemples d'Intégration

#### Page de Restaurant
```typescript
const RestaurantPage = () => {
  const { cart, addToCart } = useCart();
  
  return (
    <div>
      {/* Liste des articles */}
      {menuItems.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.price} GNF</p>
          <AddToCartButton
            item={item}
            businessId={restaurant.id}
            businessName={restaurant.name}
          />
        </div>
      ))}
      
      {/* Panier flottant */}
      <FloatingCart variant="bottom" />
    </div>
  );
};
```

#### Page de Panier
```typescript
const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  
  if (!cart || cart.items.length === 0) {
    return <div>Votre panier est vide</div>;
  }
  
  return (
    <div>
      {cart.items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>Quantité: {item.quantity}</p>
          <p>Prix: {item.price * item.quantity} GNF</p>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
            +
          </button>
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
            -
          </button>
          <button onClick={() => removeFromCart(item.id)}>
            Supprimer
          </button>
        </div>
      ))}
      
      <div>
        <h3>Total: {cart.total} GNF</h3>
        <button onClick={clearCart}>Vider le panier</button>
      </div>
    </div>
  );
};
```

### 6. Migration depuis l'Ancien Système

Si vous utilisez l'ancien système avec OrderContext :

1. **Remplacer les imports** :
```typescript
// Ancien
import { useOrder } from '@/contexts/OrderContext';

// Nouveau
import { useCart } from '@/hooks/use-cart';
```

2. **Adapter les méthodes** :
```typescript
// Ancien
const { addToCart, cart, getCartTotal } = useOrder();

// Nouveau
const { addToCart, cart } = useCart();
// cart.total remplace getCartTotal()
```

3. **Mettre à jour les types** :
```typescript
// Ancien
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// Nouveau
interface CartItem {
  id: string;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  special_instructions?: string;
}
```

### 7. Tests

Exécutez le script de test pour vérifier l'installation :
```bash
psql -h your-project.supabase.co -U postgres -d postgres -f scripts/test-cart-integration.sql
```

### 8. Avantages du Nouveau Système

✅ **Persistance** : Les paniers sont sauvegardés en base de données
✅ **Sécurité** : RLS (Row Level Security) par utilisateur
✅ **Performance** : Index optimisés pour les requêtes
✅ **Synchronisation** : Compatible avec localStorage
✅ **Réactivité** : Mise à jour automatique des totaux
✅ **Ergonomie** : Composants prêts à l'emploi
✅ **TypeScript** : Types complets et sécurité de type

### 9. Support

Pour toute question ou problème :
1. Vérifiez les logs de la console
2. Consultez le guide complet : `GUIDE-CART-PERSISTANT.md`
3. Exécutez le script de test pour diagnostiquer

---

**Le système de panier est maintenant prêt à être utilisé dans votre application !** 🎉 