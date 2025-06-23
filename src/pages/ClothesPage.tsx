import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useOrder } from '@/contexts/OrderContext';
import { 
  Clock, Star, Phone, MapPin, ChevronLeft, 
  ChevronRight, Info, Heart, Share, ShoppingBag
} from 'lucide-react';

// Mock data for clothing store
const MOCK_CLOTHING_STORE = {
  id: 1,
  name: "Fashion Express",
  coverImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  logo: "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  description: "Votre boutique de mode préférée à Conakry, proposant les dernières tendances vestimentaires pour hommes et femmes avec livraison rapide à domicile.",
  storeType: "Mode & Vêtements",
  rating: 4.8,
  reviewCount: 325,
  deliveryTime: "30-45 min",
  deliveryFee: "15,000 GNF",
  address: "Quartier Almamya, Kaloum, Conakry",
  phone: "+224 622 33 44 55",
  openingHours: "09:00 - 20:00",
  categories: [
    { id: 1, name: "Populaires" },
    { id: 2, name: "Femmes" },
    { id: 3, name: "Hommes" },
    { id: 4, name: "Enfants" },
    { id: 5, name: "Accessoires" },
    { id: 6, name: "Chaussures" }
  ],
  products: [
    {
      id: 1,
      name: "Robe d'été imprimée",
      description: "Robe légère à imprimé floral, coupe évasée et manches courtes, idéale pour la saison chaude",
      price: 175000,
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 2
    },
    {
      id: 2,
      name: "Chemise en lin pour homme",
      description: "Chemise col mao en lin naturel, coupe décontractée, parfaite pour le climat tropical",
      price: 120000,
      image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 3
    },
    {
      id: 3,
      name: "Ensemble enfant été",
      description: "Ensemble t-shirt et short en coton bio pour enfant, confortable et coloré",
      price: 85000,
      image: "https://images.unsplash.com/photo-1621452773781-0453c1f1e4e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 4
    },
    {
      id: 4,
      name: "Sac à main tendance",
      description: "Sac à main en simili cuir avec bandoulière ajustable, multiple poches et finitions soignées",
      price: 145000,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 5
    },
    {
      id: 5,
      name: "Sandales en cuir",
      description: "Sandales en cuir véritable avec semelle confortable et brides ajustables",
      price: 95000,
      image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 6
    },
    {
      id: 6,
      name: "Blouse en coton",
      description: "Blouse légère en coton brodé, col V et manches 3/4 avec détails ajourés",
      price: 110000,
      image: "https://images.unsplash.com/photo-1623119461571-620a7c249aab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 2
    },
    {
      id: 7,
      name: "Pantalon chino",
      description: "Pantalon chino coupe slim en coton stretch, style décontracté-chic",
      price: 135000,
      image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 3
    },
    {
      id: 8,
      name: "Robe de fête enfant",
      description: "Robe de cérémonie pour fille avec jupe en tulle et détails pailletés",
      price: 115000,
      image: "https://images.unsplash.com/photo-1603539279777-94486de4293b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 4
    },
    {
      id: 9,
      name: "Lunettes de soleil",
      description: "Lunettes de soleil polarisées avec monture légère et protection UV400",
      price: 65000,
      image: "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 5
    },
    {
      id: 10,
      name: "Baskets urbaines",
      description: "Baskets tendance en textile respirant avec semelle amortissante",
      price: 125000,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 6
    }
  ]
};

const ClothesPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // In a real app, we would fetch the store data based on the ID
  const store = MOCK_CLOTHING_STORE;
  
  const handleAddToCart = (item: {
    id: number;
    name: string;
    price: number;
    image?: string;
  }) => {
    addToCart(
      { 
        id: item.id, 
        name: item.name, 
        price: item.price,
        quantity: 1,
        image: item.image
      },
      store.id,
      store.name
    );
    
    toast({
      title: "Ajouté au panier",
      description: "Cet article a été ajouté à votre panier",
    });
  };
  
  const getItemQuantity = (itemId: number) => {
    const item = cart.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };
  
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  
  return (
    <Layout>
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden">
        <img 
          src={store.coverImage} 
          alt={store.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={store.logo} 
              alt={`${store.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{store.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{store.storeType}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{store.rating}</span>
                <span className="text-xs ml-1">({store.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{store.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Store Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{store.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{store.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{store.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {store.openingHours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {store.deliveryFee}</span>
            </div>
          </div>
          <div className="flex mt-6 space-x-4">
            <Button variant="outline" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Favoris
            </Button>
            <Button variant="outline" className="flex items-center">
              <Share className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>
        
        {/* Products */}
        <Tabs defaultValue={store.categories[0].id.toString()} className="w-full">
          <div className="border-b">
            <div className="flex overflow-x-auto hide-scrollbar pb-2">
              <TabsList className="bg-transparent h-auto p-0 rounded-none">
                {store.categories.map(category => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id.toString()}
                    className="py-2 px-4 rounded-md data-[state=active]:bg-guinea-red data-[state=active]:text-white data-[state=active]:shadow"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
          
          {store.categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {store.products
                  .filter(product => 
                    category.id === 1 
                      ? product.popular 
                      : product.categoryId === category.id
                  )
                  .map(product => (
                    <div key={product.id} className="flex bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="flex-1 p-4">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          {product.popular && (
                            <Badge className="bg-guinea-red/90">Populaire</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-medium">{(product.price).toLocaleString()} GNF</span>
                          <div className="flex items-center">
                            {getItemQuantity(product.id) > 0 ? (
                              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                <button 
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700" 
                                  onClick={() => {
                                    // Code for decreasing quantity would go here
                                  }}
                                >
                                  -
                                </button>
                                <span className="px-3 py-1">{getItemQuantity(product.id)}</span>
                                <button 
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  onClick={() => handleAddToCart(product)}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <Button 
                                onClick={() => handleAddToCart(product)}
                                className="bg-guinea-red hover:bg-guinea-red/90"
                                size="sm"
                              >
                                Ajouter
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {product.image && (
                        <div className="hidden md:block w-32 h-32 p-2">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Shopping Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 right-4 z-10">
          <Button 
            className="bg-guinea-red hover:bg-guinea-red/90 rounded-full w-14 h-14 flex items-center justify-center relative shadow-lg"
            onClick={() => {
              // Navigate to cart or open cart modal
            }}
          >
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-white text-guinea-red text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default ClothesPage; 