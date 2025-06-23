
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
  ChevronRight, Info, Heart, Share, ShoppingBag, Gift
} from 'lucide-react';

// Dummy data for gift services
const MOCK_GIFT = {
  id: 1,
  name: "Cadeaux & Surprises Conakry",
  coverImage: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  logo: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  description: "Service de livraison de cadeaux personnalisés à Conakry. Parfait pour les anniversaires, célébrations et occasions spéciales. Surprenez vos proches avec des cadeaux uniques livrés à domicile.",
  serviceType: "Service de Cadeaux",
  rating: 4.9,
  reviewCount: 98,
  deliveryTime: "Selon occasion",
  deliveryFee: "25,000 GNF",
  address: "Rue KA-022, Quartier Camayenne, Dixinn, Conakry",
  phone: "+224 623 45 67 89",
  openingHours: "09:00 - 19:00",
  categories: [
    { id: 1, name: "Populaires" },
    { id: 2, name: "Anniversaires" },
    { id: 3, name: "Fleurs" },
    { id: 4, name: "Ballons & Décorations" },
    { id: 5, name: "Chocolats & Gourmandises" },
    { id: 6, name: "Personnalisés" }
  ],
  giftItems: [
    {
      id: 1,
      name: "Bouquet de Roses",
      description: "Magnifique bouquet de roses rouges et blanches",
      price: 150000,
      image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 3
    },
    {
      id: 2,
      name: "Gâteau d'Anniversaire",
      description: "Gâteau personnalisé avec inscription, saveur au choix",
      price: 120000,
      image: "https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 2
    },
    {
      id: 3,
      name: "Ballons Hélium",
      description: "Ensemble de 10 ballons à l'hélium, couleurs assorties",
      price: 75000,
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 4
    },
    {
      id: 4,
      name: "Coffret Chocolats",
      description: "Assortiment de chocolats fins dans un coffret élégant",
      price: 95000,
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 5
    },
    {
      id: 5,
      name: "Cadre Photo Personnalisé",
      description: "Cadre photo gravé avec message personnel",
      price: 65000,
      image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 6
    },
    {
      id: 6,
      name: "Kit Anniversaire Complet",
      description: "Ensemble comprenant gâteau, ballons, et décorations",
      price: 250000,
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 2
    }
  ]
};

const GiftPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // In a real app, we would fetch the gift service data based on the ID
  const giftService = MOCK_GIFT;
  
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
      giftService.id,
      giftService.name
    );
    
    toast({
      title: "Ajouté au panier",
      description: "Ce cadeau a été ajouté à votre panier",
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
          src={giftService.coverImage} 
          alt={giftService.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={giftService.logo} 
              alt={`${giftService.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{giftService.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{giftService.serviceType}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{giftService.rating}</span>
                <span className="text-xs ml-1">({giftService.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{giftService.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gift Service Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{giftService.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{giftService.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{giftService.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {giftService.openingHours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {giftService.deliveryFee}</span>
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
        
        {/* Gift Items */}
        <Tabs defaultValue={giftService.categories[0].id.toString()} className="w-full">
          <div className="border-b">
            <div className="flex overflow-x-auto hide-scrollbar pb-2">
              <TabsList className="bg-transparent h-auto p-0 rounded-none">
                {giftService.categories.map(category => (
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
          
          {giftService.categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {giftService.giftItems
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
                                        giftService.id,
                                        giftService.name
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
                                Sélectionner
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

export default GiftPage;
