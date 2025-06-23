
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
  ChevronRight, Info, Heart, Share, ShoppingBag, Package
} from 'lucide-react';

// Dummy data for package delivery services
const MOCK_PACKAGE = {
  id: 1,
  name: "Express Colis Conakry",
  coverImage: "https://images.unsplash.com/photo-1574492543172-fb8a3e6c99a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  logo: "https://images.unsplash.com/photo-1574492543172-fb8a3e6c99a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  description: "Service de livraison de colis express à Conakry et ses environs. Nous livrons vos colis avec rapidité et sécurité, à des prix compétitifs.",
  serviceType: "Livraison de Colis",
  rating: 4.7,
  reviewCount: 112,
  deliveryTime: "60-120 min",
  deliveryFee: "Selon poids et distance",
  address: "Rue KA-010, Quartier Almamya, Kaloum, Conakry",
  phone: "+224 628 56 78 90",
  openingHours: "08:00 - 18:00",
  categories: [
    { id: 1, name: "Populaires" },
    { id: 2, name: "Livraison Standard" },
    { id: 3, name: "Livraison Express" },
    { id: 4, name: "Livraison Spéciale" },
    { id: 5, name: "Services Additionnels" }
  ],
  services: [
    {
      id: 1,
      name: "Colis Léger (- 5kg)",
      description: "Livraison d'un colis de moins de 5kg dans Conakry",
      price: 50000,
      image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 2
    },
    {
      id: 2,
      name: "Colis Moyen (5-10kg)",
      description: "Livraison d'un colis entre 5 et 10kg dans Conakry",
      price: 75000,
      image: "https://images.unsplash.com/photo-1585218356057-dc0833388e2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 2
    },
    {
      id: 3,
      name: "Express Urgent (- 5kg)",
      description: "Livraison express dans les 2h pour colis léger",
      price: 100000,
      image: "https://images.unsplash.com/photo-1607923662751-3acfc424408b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 3
    },
    {
      id: 4,
      name: "Objets Fragiles",
      description: "Service spécial pour objets fragiles avec protection",
      price: 120000,
      image: "https://images.unsplash.com/photo-1487738026867-5c474462b8db?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 4
    },
    {
      id: 5,
      name: "Emballage Premium",
      description: "Service d'emballage de qualité supérieure",
      price: 25000,
      image: "https://images.unsplash.com/photo-1605818245167-1a24c9fd01dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 5
    },
    {
      id: 6,
      name: "Assurance Colis",
      description: "Assurance pour la valeur déclarée du colis",
      price: 15000,
      image: "https://images.unsplash.com/photo-1621844166200-3aaebd9c98dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 5
    }
  ]
};

const PackagePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // In a real app, we would fetch the package service data based on the ID
  const packageService = MOCK_PACKAGE;
  
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
      packageService.id,
      packageService.name
    );
    
    toast({
      title: "Ajouté au panier",
      description: "Ce service a été ajouté à votre panier",
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
          src={packageService.coverImage} 
          alt={packageService.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={packageService.logo} 
              alt={`${packageService.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{packageService.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{packageService.serviceType}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{packageService.rating}</span>
                <span className="text-xs ml-1">({packageService.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{packageService.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Package Service Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{packageService.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{packageService.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{packageService.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {packageService.openingHours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {packageService.deliveryFee}</span>
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
        
        {/* Services */}
        <Tabs defaultValue={packageService.categories[0].id.toString()} className="w-full">
          <div className="border-b">
            <div className="flex overflow-x-auto hide-scrollbar pb-2">
              <TabsList className="bg-transparent h-auto p-0 rounded-none">
                {packageService.categories.map(category => (
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
          
          {packageService.categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packageService.services
                  .filter(service => service.categoryId === category.id)
                  .map(service => (
                    <div key={service.id} className="flex bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="flex-1 p-4">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          {service.popular && (
                            <Badge className="bg-guinea-red/90">Populaire</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1 mb-2 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-medium">{(service.price).toLocaleString()} GNF</span>
                          <div className="flex items-center">
                            {getItemQuantity(service.id) > 0 ? (
                              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                <button 
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700" 
                                  onClick={() => {
                                    const currentQty = getItemQuantity(service.id);
                                    if (currentQty === 1) {
                                      // Remove from cart
                                    } else {
                                      // Decrease quantity
                                      addToCart(
                                        {
                                          id: service.id,
                                          name: service.name,
                                          price: service.price,
                                          quantity: -1,
                                          image: service.image
                                        },
                                        packageService.id,
                                        packageService.name
                                      );
                                    }
                                  }}
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <span className="px-3">{getItemQuantity(service.id)}</span>
                                <button 
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  onClick={() => handleAddToCart(service)}
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleAddToCart(service)}
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
                          src={service.image} 
                          alt={service.name}
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

export default PackagePage;
