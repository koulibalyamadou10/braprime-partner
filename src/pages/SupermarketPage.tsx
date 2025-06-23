
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

// Dummy data for supermarkets
const MOCK_SUPERMARKET = {
  id: 4,
  name: "Supermarché Kalima",
  coverImage: "https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  logo: "https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  description: "Découvrez une large gamme de produits alimentaires locaux et importés au Supermarché Kalima. Nous offrons des produits frais, des aliments de base et des articles ménagers essentiels.",
  marketType: "Supermarché Local",
  rating: 4.2,
  reviewCount: 65,
  deliveryTime: "40-55 min",
  deliveryFee: "30,000 GNF",
  address: "Avenue de la République, Quartier Matoto, Conakry",
  phone: "+224 622 33 44 55",
  openingHours: "08:00 - 20:00",
  categories: [
    { id: 1, name: "Populaires" },
    { id: 2, name: "Fruits & Légumes" },
    { id: 3, name: "Viandes & Poissons" },
    { id: 4, name: "Produits Laitiers" },
    { id: 5, name: "Boissons" },
    { id: 6, name: "Produits Ménagers" }
  ],
  products: [
    {
      id: 1,
      name: "Bananes Plantains",
      description: "Bananes plantains fraîches, locales, vendues au kilo",
      price: 15000,
      image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 2
    },
    {
      id: 2,
      name: "Riz Local Premium",
      description: "Riz local de haute qualité, sac de 5kg",
      price: 75000,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 1
    },
    {
      id: 3,
      name: "Poulet Entier",
      description: "Poulet entier frais, élevé localement",
      price: 90000,
      image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 3
    },
    {
      id: 4,
      name: "Lait Frais",
      description: "Lait frais local, bouteille de 1L",
      price: 25000,
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 4
    },
    {
      id: 5,
      name: "Jus d'Orange",
      description: "Jus d'orange frais, bouteille de 1L",
      price: 20000,
      image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 5
    },
    {
      id: 6,
      name: "Savon en Poudre",
      description: "Lessive en poudre, paquet de 1kg",
      price: 18000,
      image: "https://images.unsplash.com/photo-1585090163434-35af682c928d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 6
    }
  ]
};

const SupermarketPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // In a real app, we would fetch the supermarket data based on the ID
  const supermarket = MOCK_SUPERMARKET;
  
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
      supermarket.id,
      supermarket.name
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
          src={supermarket.coverImage} 
          alt={supermarket.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={supermarket.logo} 
              alt={`${supermarket.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{supermarket.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{supermarket.marketType}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{supermarket.rating}</span>
                <span className="text-xs ml-1">({supermarket.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{supermarket.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Supermarket Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{supermarket.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{supermarket.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{supermarket.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {supermarket.openingHours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {supermarket.deliveryFee}</span>
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
        <Tabs defaultValue={supermarket.categories[0].id.toString()} className="w-full">
          <div className="border-b">
            <div className="flex overflow-x-auto hide-scrollbar pb-2">
              <TabsList className="bg-transparent h-auto p-0 rounded-none">
                {supermarket.categories.map(category => (
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
          
          {supermarket.categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {supermarket.products
                  .filter(product => product.categoryId === category.id)
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
                                    const currentQty = getItemQuantity(product.id);
                                    if (currentQty === 1) {
                                      // Remove from cart
                                    } else {
                                      // Decrease quantity
                                      addToCart(
                                        {
                                          id: product.id,
                                          name: product.name,
                                          price: product.price,
                                          quantity: -1,
                                          image: product.image
                                        },
                                        supermarket.id,
                                        supermarket.name
                                      );
                                    }
                                  }}
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <span className="px-3">{getItemQuantity(product.id)}</span>
                                <button 
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  onClick={() => handleAddToCart(product)}
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleAddToCart(product)}
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
                          src={product.image} 
                          alt={product.name}
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

export default SupermarketPage;
