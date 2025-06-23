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

// Dummy data for hardware store
const MOCK_HARDWARE = {
  id: 1,
  name: "Bricotools",
  coverImage: "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  logo: "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  description: "Votre partenaire bricolage à Conakry. Nous proposons tous les outils et matériaux nécessaires pour vos projets DIY, avec livraison à domicile.",
  storeType: "Bricolage & Jardinage",
  rating: 4.8,
  reviewCount: 87,
  deliveryTime: "40-65 min",
  deliveryFee: "25,000 GNF",
  address: "Route Le Prince, Ratoma, Conakry",
  phone: "+224 628 12 34 56",
  openingHours: "08:00 - 19:00",
  categories: [
    { id: 1, name: "Populaires" },
    { id: 2, name: "Outillage" },
    { id: 3, name: "Matériaux" },
    { id: 4, name: "Électricité" },
    { id: 5, name: "Plomberie" },
    { id: 6, name: "Jardinage" }
  ],
  products: [
    {
      id: 1,
      name: "Kit d'outils essentiels",
      description: "Ensemble de 15 outils indispensables pour la maison et le bricolage",
      price: 180000,
      image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 2
    },
    {
      id: 2,
      name: "Perceuse sans fil",
      description: "Perceuse-visseuse 18V avec 2 batteries, chargeur et mallette",
      price: 250000,
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 2
    },
    {
      id: 3,
      name: "Sac de ciment",
      description: "Ciment multi-usage 25kg, résistant à l'humidité",
      price: 55000,
      image: "https://images.unsplash.com/photo-1518463892881-d587bf2c296a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 3
    },
    {
      id: 4,
      name: "Kit d'électricité",
      description: "Ensemble complet pour petites installations électriques",
      price: 85000,
      image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 4
    },
    {
      id: 5,
      name: "Sécateur de jardin",
      description: "Sécateur professionnel avec lames en acier trempé",
      price: 45000,
      image: "https://images.unsplash.com/photo-1585540082751-a7353339ec1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 6
    },
    {
      id: 6,
      name: "Robinet mitigeur",
      description: "Mitigeur chromé pour lavabo, installation facile",
      price: 125000,
      image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 5
    },
    {
      id: 7,
      name: "Peinture murale 10L",
      description: "Peinture acrylique intérieure, blanc mat, haute qualité",
      price: 95000,
      image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 3
    },
    {
      id: 8,
      name: "Meuleuse d'angle",
      description: "Meuleuse 850W, diamètre 125mm, avec disques et poignée anti-vibration",
      price: 175000,
      image: "https://images.unsplash.com/photo-1572981779307-38e9dd7e6490?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 2
    }
  ]
};

const HardwarePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // In a real app, we would fetch the store data based on the ID
  const hardware = MOCK_HARDWARE;
  
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
      hardware.id,
      hardware.name
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
          src={hardware.coverImage} 
          alt={hardware.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={hardware.logo} 
              alt={`${hardware.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{hardware.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{hardware.storeType}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{hardware.rating}</span>
                <span className="text-xs ml-1">({hardware.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{hardware.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Store Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{hardware.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{hardware.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{hardware.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {hardware.openingHours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {hardware.deliveryFee}</span>
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
        <Tabs defaultValue={hardware.categories[0].id.toString()} className="w-full">
          <div className="border-b">
            <div className="flex overflow-x-auto hide-scrollbar pb-2">
              <TabsList className="bg-transparent h-auto p-0 rounded-none">
                {hardware.categories.map(category => (
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
          
          {hardware.categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hardware.products
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

export default HardwarePage; 