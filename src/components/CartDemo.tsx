import React, { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShoppingCart, Plus, Minus, Trash2, Package, Truck, Loader2 } from 'lucide-react'

// Données de démonstration
const demoItems = [
  {
    id: 1,
    name: 'Pizza Margherita',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&h=200&fit=crop'
  },
  {
    id: 2,
    name: 'Burger Classique',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop'
  },
  {
    id: 3,
    name: 'Salade César',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200&h=200&fit=crop'
  }
]

export const CartDemo: React.FC = () => {
  const { currentUser } = useAuth()
  const { 
    cart, 
    loading, 
    error, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    updateDeliveryInfo,
    syncFromLocal 
  } = useCart()

  const [selectedItem, setSelectedItem] = useState(demoItems[0])
  const [quantity, setQuantity] = useState(1)
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [localCart, setLocalCart] = useState<any[]>([])

  // Formater la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Ajouter un article de démonstration
  const handleAddDemoItem = async () => {
    await addToCart({
      menu_item_id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: quantity,
      image: selectedItem.image
    }, 1, 'Restaurant Demo')
  }

  // Ajouter au panier local
  const handleAddToLocalCart = () => {
    const existingItem = localCart.find(item => item.id === selectedItem.id)
    if (existingItem) {
      setLocalCart(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setLocalCart(prev => [...prev, { ...selectedItem, quantity }])
    }
  }

  // Synchroniser depuis le panier local
  const handleSyncFromLocal = async () => {
    await syncFromLocal(localCart, 1, 'Restaurant Demo')
    setLocalCart([])
  }

  if (!currentUser) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Démonstration du Panier
          </CardTitle>
          <CardDescription>
            Connectez-vous pour tester le système de panier persistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Cette démonstration nécessite une connexion utilisateur.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Démonstration du Panier Persistant
          </CardTitle>
          <CardDescription>
            Testez le nouveau système de panier avec persistance en base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline">
              Utilisateur: {currentUser.name}
            </Badge>
            <Badge variant="outline">
              ID: {currentUser.id.substring(0, 8)}...
            </Badge>
            {loading && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Chargement...
              </Badge>
            )}
            {error && (
              <Badge variant="destructive">
                Erreur: {error}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panier Local (Démonstration) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Panier Local (Ancien système)
            </CardTitle>
            <CardDescription>
              Panier stocké en localStorage - sera synchronisé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélection d'article */}
            <div className="space-y-2">
              <Label>Article à ajouter</Label>
              <Select value={selectedItem.id.toString()} onValueChange={(value) => {
                const item = demoItems.find(item => item.id.toString() === value)
                if (item) setSelectedItem(item)
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {demoItems.map(item => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} - {formatCurrency(item.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantité</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddToLocalCart} className="flex-1">
                Ajouter au panier local
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSyncFromLocal}
                disabled={localCart.length === 0}
              >
                Synchroniser
              </Button>
            </div>

            {/* Articles du panier local */}
            {localCart.length > 0 && (
              <div className="space-y-2">
                <Label>Articles dans le panier local ({localCart.length})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {localCart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{item.name} x{item.quantity}</span>
                      <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium">
                  Total: {formatCurrency(localCart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panier Persistant (Nouveau système) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Panier Persistant (Nouveau système)
            </CardTitle>
            <CardDescription>
              Panier stocké en base de données - persiste entre les sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ajouter un article de démonstration */}
            <Button onClick={handleAddDemoItem} className="w-full">
              Ajouter un article de démonstration
            </Button>

            {/* Informations de livraison */}
            <div className="space-y-2">
              <Label>Méthode de livraison</Label>
              <Select value={deliveryMethod} onValueChange={(value: 'delivery' | 'pickup') => setDeliveryMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Livraison</SelectItem>
                  <SelectItem value="pickup">Retrait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="space-y-2">
                <Label>Adresse de livraison</Label>
                <Input
                  placeholder="Entrez votre adresse"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
            )}

            <Button 
              onClick={() => updateDeliveryInfo(deliveryMethod, deliveryAddress)}
              className="w-full"
              variant="outline"
            >
              Mettre à jour les informations de livraison
            </Button>

            {/* Articles du panier persistant */}
            {cart ? (
              <div className="space-y-2">
                <Label>Articles dans le panier persistant ({cart.item_count})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">{formatCurrency(cart.total)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Dernière mise à jour: {new Date(cart.updated_at).toLocaleString('fr-FR')}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Aucun article dans le panier persistant
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={clearCart} 
                variant="destructive" 
                className="flex-1"
                disabled={!cart || cart.items.length === 0}
              >
                Vider le panier
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations techniques */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Techniques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Avantages du nouveau système :</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Persistance entre les sessions</li>
                <li>• Synchronisation entre appareils</li>
                <li>• Sauvegarde automatique</li>
                <li>• Temps réel avec Supabase</li>
                <li>• Sécurité avec RLS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Fonctionnalités :</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Ajout/suppression d'articles</li>
                <li>• Mise à jour des quantités</li>
                <li>• Informations de livraison</li>
                <li>• Synchronisation depuis localStorage</li>
                <li>• Notifications en temps réel</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 