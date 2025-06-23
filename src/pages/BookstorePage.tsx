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

// Dummy data for bookstores - this would come from an API in a real app
const bookstores = [
  {
    id: "1",
    name: "Librairie Harmattan",
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    description: "La plus grande librairie de Conakry avec une vaste collection de livres, manuels scolaires, et fournitures. Services de livraison rapide pour toute la ville.",
    storeType: "Librairie & Papeterie",
    rating: 4.7,
    reviewCount: 95,
    deliveryTime: "30-45 min",
    deliveryFee: "20,000 GNF",
    address: "Avenue de la République, Kaloum, Conakry",
    phone: "+224 628 90 12 34",
    openingHours: "08:00 - 19:00",
    categories: [
      { id: 1, name: "Populaires" },
      { id: 2, name: "Littérature" },
      { id: 3, name: "Académique" },
      { id: 4, name: "Jeunesse" },
      { id: 5, name: "Professionnel" },
      { id: 6, name: "Livres numériques" }
    ],
    products: [
      {
        id: 1,
        name: "Les Misérables",
        description: "Roman classique de Victor Hugo qui raconte l'histoire de Jean Valjean",
        price: 85000,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 2
      },
      {
        id: 2,
        name: "Manuel de Mathématiques - Terminale",
        description: "Manuel scolaire adapté au programme guinéen pour les élèves en classe de Terminale",
        price: 65000,
        image: "https://images.unsplash.com/photo-1603468620905-8de7d86b781e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 3
      },
      {
        id: 3,
        name: "Le Petit Prince",
        description: "Chef-d'œuvre d'Antoine de Saint-Exupéry, adapté pour tous les âges",
        price: 40000,
        image: "https://images.unsplash.com/photo-1467951591042-f388365db261?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 4
      },
      {
        id: 4,
        name: "Management des organisations",
        description: "Guide pratique pour les gestionnaires et étudiants en management",
        price: 95000,
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: false,
        categoryId: 5
      },
      {
        id: 5,
        name: "Histoire de la Guinée",
        description: "Récit complet de l'histoire de la Guinée, de l'époque précoloniale à nos jours",
        price: 75000,
        image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 3
      },
      {
        id: 6,
        name: "E-Book - Marketing Digital",
        description: "Édition numérique avec accès immédiat sur tous vos appareils",
        price: 35000,
        image: "https://images.unsplash.com/photo-1586025358612-a02f79a7e59e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 6
      }
    ]
  },
  {
    id: "2",
    name: "Pages d'Afrique",
    coverImage: "https://images.unsplash.com/photo-1526243741027-444d633d7365?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1526243741027-444d633d7365?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    description: "Librairie spécialisée en littérature africaine et internationale, avec une grande sélection de livres rares et de collections limitées.",
    storeType: "Librairie Internationale",
    rating: 4.8,
    reviewCount: 87,
    deliveryTime: "35-50 min",
    deliveryFee: "25,000 GNF",
    address: "Rue Taouyah, Dixinn, Conakry",
    phone: "+224 622 33 44 55",
    openingHours: "09:00 - 18:00",
    categories: [
      { id: 1, name: "Populaires" },
      { id: 2, name: "Littérature africaine" },
      { id: 3, name: "International" },
      { id: 4, name: "Livres rares" },
      { id: 5, name: "Poésie" },
      { id: 6, name: "Essais" }
    ],
    products: [
      {
        id: 1,
        name: "Les Soleils des Indépendances",
        description: "Roman d'Ahmadou Kourouma, oeuvre majeure de la littérature africaine",
        price: 60000,
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 2
      },
      {
        id: 2,
        name: "L'Étranger",
        description: "Chef-d'œuvre d'Albert Camus, édition spéciale annotée",
        price: 50000,
        image: "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 3
      },
      {
        id: 3,
        name: "Anthologie de la poésie guinéenne",
        description: "Collection de poèmes des plus grands poètes guinéens",
        price: 45000,
        image: "https://images.unsplash.com/photo-1533066936446-11f8aa4c4694?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: false,
        categoryId: 5
      },
      {
        id: 4,
        name: "Édition originale - Cahier d'un retour au pays natal",
        description: "Rare première édition du célèbre poème d'Aimé Césaire",
        price: 150000,
        image: "https://images.unsplash.com/photo-1591951425300-149d37cbd80f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 4
      },
      {
        id: 5,
        name: "Dictionnaire des civilisations africaines",
        description: "Ouvrage de référence sur les cultures et l'histoire du continent",
        price: 120000,
        image: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        popular: true,
        categoryId: 6
      }
    ]
  }
];

const BookstorePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart, getCartTotal, cart } = useOrder();
  
  // Find the bookstore by ID
  const bookstore = bookstores.find(store => store.id === id) || bookstores[0];
  
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
      parseInt(bookstore.id), // Convert string ID to number
      bookstore.name
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
          src={bookstore.coverImage} 
          alt={bookstore.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white mr-4">
            <img 
              src={bookstore.logo} 
              alt={`${bookstore.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{bookstore.name}</h1>
            <div className="flex flex-wrap items-center text-sm mt-2">
              <span className="mr-3">{bookstore.storeType}</span>
              <div className="flex items-center mr-3">
                <Star className="h-4 w-4 fill-guinea-yellow text-guinea-yellow mr-1" />
                <span>{bookstore.rating}</span>
                <span className="text-xs ml-1">({bookstore.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{bookstore.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bookstore Info */}
      <div className="container mx-auto px-4 my-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{bookstore.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{bookstore.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">{bookstore.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Ouvert: {bookstore.openingHours}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-guinea-red mr-2" />
              <span className="text-gray-700">Frais de livraison: {bookstore.deliveryFee}</span>
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
        <Tabs defaultValue={bookstore.categories[0].id.toString()} className="w-full">
          <div className="border-b">
            <div className="flex overflow-x-auto hide-scrollbar pb-2">
              <TabsList className="bg-transparent h-auto p-0 rounded-none">
                {bookstore.categories.map(category => (
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
          
          {bookstore.categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookstore.products
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

export default BookstorePage; 