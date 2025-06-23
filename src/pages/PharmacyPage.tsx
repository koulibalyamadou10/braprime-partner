import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useOrder } from '@/contexts/OrderContext';
import { useRestaurantById, useMenuCategories } from '@/hooks/use-homepage';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, Star, Phone, MapPin, ChevronLeft, 
  ChevronRight, Info, Heart, Share, ShoppingBag
} from 'lucide-react';

// Composant de chargement pour la page de la pharmacie
const PharmacyPageSkeleton = () => {
  return (
    <Layout>
      {/* Back button */}
      <div className="container mx-auto px-4 pt-4">
        <Skeleton className="h-4 w-32 mb-2" />
      </div>
      
      {/* Cover Image Skeleton */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <Skeleton className="w-20 h-20 rounded-xl mr-4" />
          <div className="text-white">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      
      {/* Info Skeleton */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
        
        {/* Products Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <Skeleton className="h-32 w-full mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const PharmacyPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // Utiliser les données dynamiques
  const { data: pharmacy, isLoading, error } = useRestaurantById(id || '1');
  const { data: categories } = useMenuCategories();

  // Données de fallback
  const fallbackPharmacy = {
    id: 1,
    name: "Pharmacie Centrale",
    cover_image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    description: "Pharmacie offrant une large gamme de médicaments, produits de santé et conseils pharmaceutiques professionnels avec service de livraison rapide.",
    cuisine_type: "Pharmacie & Santé",
    rating: 4.8,
    review_count: 132,
    delivery_time: "20-35 min",
    delivery_fee: 15000,
    address: "Avenue de la République, Kaloum, Conakry",
    phone: "+224 622 45 67 89",
    opening_hours: "24h/24, 7j/7",
    menu_items: [
      {
        id: 1,
        name: "Paracétamol 500mg",
        description: "Boîte de 20 comprimés pour le soulagement de la douleur et de la fièvre",
        price: 10000,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        is_popular: true,
        category_id: 2
      },
      {
        id: 2,
        name: "Gel hydroalcoolique",
        description: "Flacon de 250ml pour désinfection des mains",
        price: 15000,
        image: "https://images.unsplash.com/photo-1584483720412-ce931f4aefa8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        is_popular: true,
        category_id: 3
      }
    ]
  };

  // Utiliser les données dynamiques ou les données de fallback
  const displayPharmacy = pharmacy || fallbackPharmacy;
  const displayCategories = categories || [
    { id: 1, name: "Populaires" },
    { id: 2, name: "Médicaments" },
    { id: 3, name: "Soins personnels" },
    { id: 4, name: "Vitamines" },
    { id: 5, name: "Bébé & Enfant" },
    { id: 6, name: "Équipement médical" }
  ];

  // Formater les montants
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k GNF`;
    }
    return `${amount} GNF`;
  };
  
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
      displayPharmacy.id,
      displayPharmacy.name
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

  if (isLoading) {
    return <PharmacyPageSkeleton />;
  }

  if (error) {
    console.error('Erreur lors du chargement de la pharmacie:', error);
  }
  
  return (
    <Layout>
      {/* Back button */}
      <div className="container mx-auto px-4 pt-4">
        <Link to="/pharmacies" className="flex items-center text-guinea-red hover:underline mb-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour aux pharmacies
        </Link>
      </div>
      
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden">
        <img 
          src={displayPharmacy.cover_image} 
          alt={displayPharmacy.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={displayPharmacy.logo || displayPharmacy.cover_image} 
              alt={`${displayPharmacy.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{displayPharmacy.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{displayPharmacy.cuisine_type}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{displayPharmacy.rating}</span>
                <span className="text-xs ml-1">({displayPharmacy.review_count})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{displayPharmacy.delivery_time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pharmacy Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{displayPharmacy.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{displayPharmacy.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{displayPharmacy.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {displayPharmacy.opening_hours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {formatCurrency(displayPharmacy.delivery_fee)}</span>
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Produits</h2>
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-guinea-red" />
              <span className="font-medium">{getTotalItems()} articles</span>
              <span className="text-gray-500">•</span>
              <span className="font-bold text-guinea-red">{formatCurrency(getCartTotal())}</span>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6">
              <TabsTrigger value="all">Tous</TabsTrigger>
              {displayCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id.toString()}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayPharmacy.menu_items?.map((item) => (
                  <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-32 relative">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {item.is_popular && (
                        <Badge className="absolute top-2 right-2 bg-guinea-red/90">
                          Populaire
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-guinea-red">{formatCurrency(item.price)}</span>
                        <div className="flex items-center space-x-2">
                          {getItemQuantity(item.id) > 0 && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  // Logique pour diminuer la quantité
                                }}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <span className="font-medium">{getItemQuantity(item.id)}</span>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            className="bg-guinea-red hover:bg-guinea-red/90 text-white"
                            onClick={() => handleAddToCart(item)}
                          >
                            {getItemQuantity(item.id) > 0 ? <ChevronRight className="h-4 w-4" /> : 'Ajouter'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {displayCategories.map((category) => (
              <TabsContent key={category.id} value={category.id.toString()} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayPharmacy.menu_items
                    ?.filter(item => item.category_id === category.id)
                    .map((item) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 relative">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {item.is_popular && (
                            <Badge className="absolute top-2 right-2 bg-guinea-red/90">
                              Populaire
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-guinea-red">{formatCurrency(item.price)}</span>
                            <div className="flex items-center space-x-2">
                              {getItemQuantity(item.id) > 0 && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      // Logique pour diminuer la quantité
                                    }}
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </Button>
                                  <span className="font-medium">{getItemQuantity(item.id)}</span>
                                </>
                              )}
                              <Button 
                                size="sm" 
                                className="bg-guinea-red hover:bg-guinea-red/90 text-white"
                                onClick={() => handleAddToCart(item)}
                              >
                                {getItemQuantity(item.id) > 0 ? <ChevronRight className="h-4 w-4" /> : 'Ajouter'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PharmacyPage; 