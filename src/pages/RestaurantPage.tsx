
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

const MOCK_RESTAURANT = {
  id: 1,
  name: "Le Petit Baoulé",
  coverImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  logo: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  description: "Découvrez les saveurs authentiques de la cuisine guinéenne traditionnelle au Petit Baoulé. Nos plats sont préparés avec des ingrédients frais et locaux par nos chefs expérimentés.",
  cuisineType: "Cuisine Guinéenne",
  rating: 4.8,
  reviewCount: 124,
  deliveryTime: "25-35 min",
  deliveryFee: "15,000 GNF",
  address: "Rue KA-003, Quartier Almamya, Kaloum, Conakry",
  phone: "+224 621 23 45 67",
  openingHours: "10:00 - 22:00",
  categories: [
    { id: 1, name: "Populaires" },
    { id: 2, name: "Entrées" },
    { id: 3, name: "Plats Principaux" },
    { id: 4, name: "Accompagnements" },
    { id: 5, name: "Boissons" },
    { id: 6, name: "Desserts" }
  ],
  menuItems: [
    {
      id: 1,
      name: "Poulet Yassa",
      description: "Poulet mariné avec oignons, citron et épices, servi avec du riz",
      price: 60000,
      image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 3
    },
    {
      id: 2,
      name: "Sauce Arachide",
      description: "Ragoût traditionnel à base de pâte d'arachide avec viande et légumes",
      price: 55000,
      image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 3
    },
    {
      id: 3,
      name: "Salade d'Avocat",
      description: "Avocat frais avec tomates, oignons et vinaigrette",
      price: 25000,
      image: "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 2
    },
    {
      id: 4,
      name: "Alloco",
      description: "Bananes plantains frites servies avec une sauce épicée",
      price: 20000,
      image: "https://images.unsplash.com/photo-1599955085847-adb6d06de96b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 4
    },
    {
      id: 5,
      name: "Jus de Gingembre",
      description: "Boisson rafraîchissante à base de gingembre frais",
      price: 15000,
      image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 5
    },
    {
      id: 6,
      name: "Riz au Gras",
      description: "Riz cuit avec tomates, oignons et épices",
      price: 30000,
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 4
    }
  ]
};

const RestaurantPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // In a real app, we would fetch the restaurant data based on the ID
  const restaurant = MOCK_RESTAURANT;
  
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
      restaurant.id,
      restaurant.name
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
          src={restaurant.coverImage} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={restaurant.logo} 
              alt={`${restaurant.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{restaurant.cuisineType}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{restaurant.rating}</span>
                <span className="text-xs ml-1">({restaurant.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{restaurant.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Restaurant Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{restaurant.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{restaurant.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{restaurant.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {restaurant.openingHours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {restaurant.deliveryFee}</span>
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
        
        {/* Menu */}
        <Tabs defaultValue={restaurant.categories[0].id.toString()} className="w-full">
          <div className="border-b">
            <div className="flex overflow-x-auto hide-scrollbar pb-2">
              <TabsList className="bg-transparent h-auto p-0 rounded-none">
                {restaurant.categories.map(category => (
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
          
          {restaurant.categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {restaurant.menuItems
                  .filter(item => item.categoryId === category.id)
                  .map(item => (
                    <div key={item.id} className="flex bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="flex-1 p-4">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          {item.popular && (
                            <Badge className="bg-guinea-red/90">Populaire</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-medium">{(item.price).toLocaleString()} GNF</span>
                          <div className="flex items-center">
                            {getItemQuantity(item.id) > 0 ? (
                              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                <button 
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700" 
                                  onClick={() => {
                                    const currentQty = getItemQuantity(item.id);
                                    if (currentQty === 1) {
                                      // Remove from cart
                                    } else {
                                      // Decrease quantity
                                      addToCart(
                                        {
                                          id: item.id,
                                          name: item.name,
                                          price: item.price,
                                          quantity: -1,
                                          image: item.image
                                        },
                                        restaurant.id,
                                        restaurant.name
                                      );
                                    }
                                  }}
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <span className="px-3">{getItemQuantity(item.id)}</span>
                                <button 
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  onClick={() => handleAddToCart(item)}
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleAddToCart(item)}
                                className="bg-guinea-green hover:bg-guinea-green/90"
                              >
                                Ajouter
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:block w-28 h-auto">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 z-50">
          <div className="container mx-auto">
            <Button 
              className="w-full py-6 bg-guinea-red hover:bg-guinea-red/90 text-white flex items-center justify-center gap-2"
              asChild
            >
              <a href="/cart">
                <ShoppingBag className="h-5 w-5" />
                <span className="mr-2">Voir le panier ({getTotalItems()})</span>
                <div className="h-6 w-px bg-white/30 mx-2"></div>
                <span>Total: {getCartTotal().toLocaleString()} GNF</span>
              </a>
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RestaurantPage;
