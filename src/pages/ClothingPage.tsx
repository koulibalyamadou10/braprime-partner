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

// Dummy data for clothing store
const MOCK_CLOTHING = {
  id: 1,
  name: "Mode Élégance",
  coverImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  logo: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  description: "Votre boutique de vêtements et accessoires à Conakry. Nous proposons les dernières tendances avec livraison rapide à domicile.",
  storeType: "Mode & Vêtements",
  rating: 4.8,
  reviewCount: 112,
  deliveryTime: "25-45 min",
  deliveryFee: "15,000 GNF",
  address: "Avenue de la République, Kaloum, Conakry",
  phone: "+224 621 34 56 78",
  openingHours: "10:00 - 21:00",
  categories: [
    { id: 1, name: "Populaires" },
    { id: 2, name: "Hommes" },
    { id: 3, name: "Femmes" },
    { id: 4, name: "Enfants" },
    { id: 5, name: "Accessoires" },
    { id: 6, name: "Chaussures" }
  ],
  products: [
    {
      id: 1,
      name: "Chemise homme",
      description: "Chemise à manches longues en coton, coupe slim fit, couleur bleu ciel",
      price: 85000,
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 2
    },
    {
      id: 2,
      name: "Robe été femme",
      description: "Robe légère à imprimé floral, idéale pour la saison chaude",
      price: 95000,
      image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 3
    },
    {
      id: 3,
      name: "Ensemble enfant",
      description: "Ensemble t-shirt et pantalon pour garçon, 100% coton, confortable",
      price: 75000,
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 4
    },
    {
      id: 4,
      name: "Sac à main",
      description: "Sac à main en cuir synthétique, design élégant, compartiments multiples",
      price: 120000,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 5
    },
    {
      id: 5,
      name: "Baskets tendance",
      description: "Chaussures de sport légères et confortables, style urbain",
      price: 145000,
      image: "https://images.unsplash.com/photo-1549298916-f52d724204b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 6
    },
    {
      id: 6,
      name: "Pantalon homme",
      description: "Pantalon chino en coton, coupe régulière, couleur beige",
      price: 78000,
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 2
    },
    {
      id: 7,
      name: "Jupe midi",
      description: "Jupe plissée mi-longue, tissu fluide, taille élastique",
      price: 68000,
      image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 3
    },
    {
      id: 8,
      name: "Ceinture cuir",
      description: "Ceinture en cuir véritable, boucle en métal, ajustable",
      price: 45000,
      image: "https://images.unsplash.com/photo-1553704571-c32d20af9018?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 5
    }
  ]
};

const ClothingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // In a real app, we would fetch the store data based on the ID
  const clothingStore = MOCK_CLOTHING;
  
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
      clothingStore.id,
      clothingStore.name
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
          src={clothingStore.coverImage} 
          alt={clothingStore.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={clothingStore.logo} 
              alt={`${clothingStore.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{clothingStore.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{clothingStore.storeType}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{clothingStore.rating}</span>
                <span className="text-xs ml-1">({clothingStore.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{clothingStore.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Store Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{clothingStore.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{clothingStore.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{clothingStore.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {clothingStore.openingHours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {clothingStore.deliveryFee}</span>
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
        <Tabs defaultValue={clothingStore.categories[0].id.toString()} className="w-full">
          <div className="border-b">
            <div className="flex overflow-x-auto hide-scrollbar pb-2">
              <TabsList className="bg-transparent h-auto p-0 rounded-none">
                {clothingStore.categories.map(category => (
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
          
          {clothingStore.categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clothingStore.products
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

export default ClothingPage; 