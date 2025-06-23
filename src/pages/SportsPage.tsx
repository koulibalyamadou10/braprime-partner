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

// Mock data for sports store
const MOCK_SPORTS_STORE = {
  id: 1,
  name: "Sports Elite",
  coverImage: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  logo: "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  description: "Votre destination pour tous les équipements sportifs de qualité. Trouvez tout ce dont vous avez besoin pour exceller dans votre sport préféré.",
  storeType: "Magasin de sport",
  rating: 4.7,
  reviewCount: 189,
  deliveryTime: "30-45 min",
  deliveryFee: "12,000 GNF",
  address: "Boulevard du Commerce, Kaloum, Conakry",
  phone: "+224 625 45 67 89",
  openingHours: "09:00 - 20:00",
  categories: [
    { id: 1, name: "Populaires" },
    { id: 2, name: "Football" },
    { id: 3, name: "Basketball" },
    { id: 4, name: "Fitness" },
    { id: 5, name: "Running" },
    { id: 6, name: "Natation" }
  ],
  products: [
    {
      id: 1,
      name: "Ballon de football officiel",
      description: "Ballon de football professionnel taille 5, cousu main avec matériaux résistants",
      price: 85000,
      image: "https://images.unsplash.com/photo-1614632537190-23e4146777db?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 2
    },
    {
      id: 2,
      name: "Maillot équipe nationale",
      description: "Maillot officiel de l'équipe nationale de Guinée, tissu respirant et séchage rapide",
      price: 95000,
      image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 2
    },
    {
      id: 3,
      name: "Ballon de basketball",
      description: "Ballon de basketball taille 7 pour intérieur et extérieur avec excellente adhérence",
      price: 75000,
      image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 3
    },
    {
      id: 4,
      name: "Haltères 5kg (paire)",
      description: "Paire d'haltères en fonte avec revêtement antidérapant pour entraînement à domicile",
      price: 65000,
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 4
    },
    {
      id: 5,
      name: "Chaussures de running",
      description: "Chaussures de course légères avec amorti supérieur et soutien de la voûte plantaire",
      price: 250000,
      image: "https://images.unsplash.com/photo-1539185441755-769473a23570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: true,
      categoryId: 5
    },
    {
      id: 6,
      name: "Crampons professionnels",
      description: "Crampons de football en cuir véritable avec semelle légère et résistante",
      price: 175000,
      image: "https://images.unsplash.com/photo-1511886929837-354d54d1a90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 2
    },
    {
      id: 7,
      name: "Tapis de yoga premium",
      description: "Tapis de yoga antidérapant éco-responsable avec bonne adhérence et amortissement",
      price: 120000,
      image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 4
    },
    {
      id: 8,
      name: "Lunettes de natation",
      description: "Lunettes de natation antibuée avec protection UV et joint en silicone confortable",
      price: 45000,
      image: "https://images.unsplash.com/photo-1599231091043-fd1bee3f94d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 6
    },
    {
      id: 9,
      name: "Maillot de bain compétition",
      description: "Maillot de bain professionnel hydrofuge pour la compétition et l'entraînement intensif",
      price: 85000,
      image: "https://images.unsplash.com/photo-1616677417139-2f66faf6f9d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 6
    },
    {
      id: 10,
      name: "Montre GPS running",
      description: "Montre connectée avec GPS intégré, suivi de performance et mesure de la fréquence cardiaque",
      price: 350000,
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      popular: false,
      categoryId: 5
    }
  ]
};

const SportsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // In a real app, we would fetch the store data based on the ID
  const store = MOCK_SPORTS_STORE;
  
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

export default SportsPage; 